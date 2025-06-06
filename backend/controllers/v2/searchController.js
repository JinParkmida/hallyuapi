const dataService = require('../../services/dataService');
const { 
  paginate, 
  searchItems, 
  formatResponse, 
  formatError,
  fuzzyMatch 
} = require('../../utils/helpers');

/**
 * Global search across all entities
 */
const globalSearch = (req, res) => {
  try {
    if (!req.query.q) {
      return res.status(400).json(formatError('Search query is required'));
    }
    
    const query = req.query.q;
    const results = dataService.globalSearch(query);
    
    // Add relevance scoring and metadata
    const enhancedResults = {
      groups: results.groups.map(group => ({
        ...group,
        type: 'group',
        relevanceScore: calculateRelevance(query, group, ['Name', 'KoreanName', 'ShortName']),
        url: `/api/v2/groups/${group.Id}`
      })),
      artists: results.artists.map(artist => ({
        ...artist,
        type: 'artist',
        relevanceScore: calculateRelevance(query, artist, ['StageName', 'FullName', 'KoreanName']),
        url: `/api/v2/idols/${artist.Id}`
      })),
      actors: results.actors.map(actor => ({
        ...actor,
        type: 'actor',
        relevanceScore: calculateRelevance(query, actor, ['FullName', 'KoreanName']),
        url: `/api/v2/actors/${actor.Id}`
      })),
      musicVideos: results.musicVideos.map(mv => ({
        ...mv,
        type: 'music_video',
        relevanceScore: calculateRelevance(query, mv, ['Title', 'Artist']),
        url: `/api/v2/music-videos/${mv.Id}`
      }))
    };
    
    // Combine all results and sort by relevance
    const allResults = [
      ...enhancedResults.groups,
      ...enhancedResults.artists,
      ...enhancedResults.actors,
      ...enhancedResults.musicVideos
    ].sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Apply pagination to combined results
    const paginatedResult = paginate(allResults, req.query.page || 1, req.query.limit || 20);
    
    // Prepare summary
    const summary = {
      totalResults: allResults.length,
      resultsByType: {
        groups: enhancedResults.groups.length,
        artists: enhancedResults.artists.length,
        actors: enhancedResults.actors.length,
        musicVideos: enhancedResults.musicVideos.length
      }
    };
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      null,
      {
        pagination: paginatedResult.pagination,
        searchQuery: query,
        summary,
        searchType: 'global'
      }
    ));
  } catch (error) {
    console.error('Error in globalSearch:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Get search suggestions
 */
const getSearchSuggestions = (req, res) => {
  try {
    if (!req.query.q || req.query.q.length < 2) {
      return res.status(400).json(formatError('Query must be at least 2 characters long'));
    }
    
    const query = req.query.q.toLowerCase();
    const limit = parseInt(req.query.limit) || 10;
    
    const suggestions = [];
    
    // Get group suggestions
    const groups = dataService.getAllGroups();
    groups.forEach(group => {
      if (suggestions.length >= limit) return;
      
      if (group.Name.toLowerCase().startsWith(query) ||
          (group.KoreanName && group.KoreanName.toLowerCase().includes(query)) ||
          (group.ShortName && group.ShortName.toLowerCase().startsWith(query))) {
        suggestions.push({
          text: group.Name,
          type: 'group',
          id: group.Id,
          subtitle: group.KoreanName || group.Company,
          url: `/api/v2/groups/${group.Id}`
        });
      }
    });
    
    // Get artist suggestions
    const artists = dataService.getAllArtists();
    artists.forEach(artist => {
      if (suggestions.length >= limit) return;
      
      if (artist.StageName.toLowerCase().startsWith(query) ||
          artist.FullName.toLowerCase().startsWith(query) ||
          (artist.KoreanName && artist.KoreanName.toLowerCase().includes(query))) {
        suggestions.push({
          text: artist.StageName || artist.FullName,
          type: 'artist',
          id: artist.Id,
          subtitle: artist.Group || artist.FullName,
          url: `/api/v2/idols/${artist.Id}`
        });
      }
    });
    
    // Get company suggestions
    const companies = dataService.getAllCompanies();
    companies.forEach(company => {
      if (suggestions.length >= limit) return;
      
      if (company.Name.toLowerCase().startsWith(query)) {
        suggestions.push({
          text: company.Name,
          type: 'company',
          id: company.Id,
          subtitle: `${company.Groups.length} groups, ${company.Artists.length} artists`,
          url: `/api/v2/companies/${encodeURIComponent(company.Name)}`
        });
      }
    });
    
    // Sort suggestions by relevance and remove duplicates
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text === suggestion.text && s.type === suggestion.type))
      .slice(0, limit);
    
    res.status(200).json(formatResponse(
      uniqueSuggestions,
      'success',
      null,
      {
        query,
        totalSuggestions: uniqueSuggestions.length
      }
    ));
  } catch (error) {
    console.error('Error in getSearchSuggestions:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Advanced search with filters
 */
const advancedSearch = (req, res) => {
  try {
    if (!req.query.q) {
      return res.status(400).json(formatError('Search query is required'));
    }
    
    const query = req.query.q;
    const filters = {
      type: req.query.type, // 'group', 'artist', 'actor', 'company'
      gender: req.query.gender,
      country: req.query.country,
      company: req.query.company,
      active: req.query.active,
      debutYear: req.query.debutYear,
      birthYear: req.query.birthYear
    };
    
    let results = [];
    
    // Search based on type filter
    if (!filters.type || filters.type === 'group') {
      const groupResults = searchGroups(query, filters);
      results.push(...groupResults);
    }
    
    if (!filters.type || filters.type === 'artist') {
      const artistResults = searchArtists(query, filters);
      results.push(...artistResults);
    }
    
    if (!filters.type || filters.type === 'actor') {
      const actorResults = searchActors(query, filters);
      results.push(...actorResults);
    }
    
    if (!filters.type || filters.type === 'company') {
      const companyResults = searchCompanies(query, filters);
      results.push(...companyResults);
    }
    
    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    const paginatedResult = paginate(results, req.query.page || 1, req.query.limit || 20);
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      null,
      {
        pagination: paginatedResult.pagination,
        searchQuery: query,
        filters: Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined)),
        totalResults: results.length,
        searchType: 'advanced'
      }
    ));
  } catch (error) {
    console.error('Error in advancedSearch:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

// Helper functions
const calculateRelevance = (query, item, searchFields) => {
  let score = 0;
  const queryLower = query.toLowerCase();
  
  searchFields.forEach((field, index) => {
    const value = item[field];
    if (!value) return;
    
    const valueLower = value.toString().toLowerCase();
    const fieldWeight = searchFields.length - index; // Earlier fields have higher weight
    
    // Exact match
    if (valueLower === queryLower) {
      score += 10 * fieldWeight;
    }
    // Starts with query
    else if (valueLower.startsWith(queryLower)) {
      score += 7 * fieldWeight;
    }
    // Contains query
    else if (valueLower.includes(queryLower)) {
      score += 5 * fieldWeight;
    }
    // Fuzzy match
    else if (fuzzyMatch(valueLower, queryLower, 0.7)) {
      score += 3 * fieldWeight;
    }
  });
  
  return score;
};

const searchGroups = (query, filters) => {
  let groups = dataService.getAllGroups();
  
  // Apply filters
  if (filters.company) {
    groups = groups.filter(g => g.Company && g.Company.toLowerCase().includes(filters.company.toLowerCase()));
  }
  if (filters.active !== undefined) {
    const isActive = filters.active === 'true';
    groups = groups.filter(g => (isActive && g.Active === 'Yes') || (!isActive && g.Active === 'No'));
  }
  if (filters.debutYear) {
    groups = groups.filter(g => g.Debut && new Date(g.Debut).getFullYear() === parseInt(filters.debutYear));
  }
  
  // Search
  const searchFields = ['Name', 'KoreanName', 'ShortName', 'Company', 'FanbaseName'];
  groups = searchItems(groups, query, searchFields);
  
  return groups.map(group => ({
    ...group,
    type: 'group',
    relevanceScore: calculateRelevance(query, group, searchFields),
    url: `/api/v2/groups/${group.Id}`
  }));
};

const searchArtists = (query, filters) => {
  let artists = dataService.getAllArtists();
  
  // Apply filters
  if (filters.gender) {
    artists = artists.filter(a => a.Gender === filters.gender.toUpperCase());
  }
  if (filters.country) {
    artists = artists.filter(a => a.Country && a.Country.toLowerCase().includes(filters.country.toLowerCase()));
  }
  if (filters.company) {
    artists = artists.filter(a => a.Company && a.Company.toLowerCase().includes(filters.company.toLowerCase()));
  }
  if (filters.birthYear) {
    artists = artists.filter(a => a.DateOfBirth && new Date(a.DateOfBirth).getFullYear() === parseInt(filters.birthYear));
  }
  
  // Search
  const searchFields = ['StageName', 'FullName', 'KoreanName', 'KoreanStageName', 'Group'];
  artists = searchItems(artists, query, searchFields);
  
  return artists.map(artist => ({
    ...artist,
    type: 'artist',
    relevanceScore: calculateRelevance(query, artist, searchFields),
    url: `/api/v2/idols/${artist.Id}`
  }));
};

const searchActors = (query, filters) => {
  let actors = dataService.getAllActors();
  
  // Apply filters
  if (filters.gender) {
    actors = actors.filter(a => a.Gender === filters.gender.toUpperCase());
  }
  if (filters.country) {
    actors = actors.filter(a => a.Country && a.Country.toLowerCase().includes(filters.country.toLowerCase()));
  }
  if (filters.birthYear) {
    actors = actors.filter(a => a.DateOfBirth && new Date(a.DateOfBirth).getFullYear() === parseInt(filters.birthYear));
  }
  
  // Search
  const searchFields = ['FullName', 'KoreanName'];
  actors = searchItems(actors, query, searchFields);
  
  return actors.map(actor => ({
    ...actor,
    type: 'actor',
    relevanceScore: calculateRelevance(query, actor, searchFields),
    url: `/api/v2/actors/${actor.Id}`
  }));
};

const searchCompanies = (query, filters) => {
  let companies = dataService.getAllCompanies();
  
  // Search
  const searchFields = ['Name'];
  companies = searchItems(companies, query, searchFields);
  
  return companies.map(company => ({
    ...company,
    type: 'company',
    relevanceScore: calculateRelevance(query, company, searchFields),
    url: `/api/v2/companies/${encodeURIComponent(company.Name)}`
  }));
};

module.exports = {
  globalSearch,
  getSearchSuggestions,
  advancedSearch
};