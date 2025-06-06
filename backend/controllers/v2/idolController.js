const dataService = require('../../services/dataService');
const { 
  paginate, 
  searchItems, 
  sortItems, 
  filterItems, 
  formatResponse, 
  formatError,
  getUpcomingBirthdays,
  calculateAge 
} = require('../../utils/helpers');

/**
 * Get all idols with advanced filtering and pagination
 */
const getAllIdols = (req, res) => {
  try {
    let idols = dataService.getAllArtists();
    
    // Apply filters
    const filters = {};
    if (req.query.gender) filters.Gender = req.query.gender.toUpperCase();
    if (req.query.country) filters.Country = req.query.country;
    if (req.query.group) filters.Group = req.query.group;
    if (req.query.company) filters.Company = req.query.company;
    
    if (Object.keys(filters).length > 0) {
      idols = filterItems(idols, filters);
    }
    
    // Apply birth year filter
    if (req.query.birthYear) {
      idols = idols.filter(idol => {
        if (!idol.DateOfBirth) return false;
        return new Date(idol.DateOfBirth).getFullYear() === req.query.birthYear;
      });
    }
    
    // Apply search
    if (req.query.search) {
      const searchFields = ['StageName', 'FullName', 'KoreanName', 'KoreanStageName', 'Group'];
      idols = searchItems(idols, req.query.search, searchFields);
    }
    
    // Apply sorting
    let sortField = 'StageName';
    switch (req.query.sort) {
      case 'name':
        sortField = 'StageName';
        break;
      case 'debut':
        sortField = 'DateOfBirth';
        break;
      case 'alphabetical':
        sortField = 'StageName';
        break;
      default:
        sortField = 'StageName';
    }
    
    idols = sortItems(idols, sortField, req.query.order);
    
    // Add calculated fields
    idols = idols.map(idol => ({
      ...idol,
      age: calculateAge(idol.DateOfBirth),
      profileUrl: `/api/v2/idols/${idol.Id}`
    }));
    
    // Apply pagination
    const paginatedResult = paginate(idols, req.query.page, req.query.limit);
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      null,
      {
        pagination: paginatedResult.pagination,
        filters: req.query,
        totalResults: idols.length
      }
    ));
  } catch (error) {
    console.error('Error in getAllIdols:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Get idol by ID
 */
const getIdolById = (req, res) => {
  try {
    const idol = dataService.getArtistById(req.params.id);
    
    if (!idol) {
      return res.status(404).json(formatError('Idol not found', null, 404));
    }
    
    // Enhance idol data
    const enhancedIdol = {
      ...idol,
      age: calculateAge(idol.DateOfBirth),
      groupMembers: idol.Group ? dataService.getArtistsByGroup(idol.Group) : [],
      relatedIdols: dataService.getArtistsByGroup(idol.Group).filter(a => a.Id !== idol.Id)
    };
    
    res.status(200).json(formatResponse(enhancedIdol));
  } catch (error) {
    console.error('Error in getIdolById:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Search idols
 */
const searchIdols = (req, res) => {
  try {
    if (!req.query.q) {
      return res.status(400).json(formatError('Search query is required'));
    }
    
    const searchFields = ['StageName', 'FullName', 'KoreanName', 'KoreanStageName', 'Group'];
    let idols = searchItems(dataService.getAllArtists(), req.query.q, searchFields);
    
    // Add relevance scoring (simple implementation)
    idols = idols.map(idol => {
      let relevanceScore = 0;
      const query = req.query.q.toLowerCase();
      
      if (idol.StageName.toLowerCase() === query) relevanceScore += 10;
      else if (idol.StageName.toLowerCase().includes(query)) relevanceScore += 5;
      
      if (idol.FullName.toLowerCase() === query) relevanceScore += 8;
      else if (idol.FullName.toLowerCase().includes(query)) relevanceScore += 3;
      
      if (idol.Group && idol.Group.toLowerCase().includes(query)) relevanceScore += 2;
      
      return { ...idol, relevanceScore };
    });
    
    // Sort by relevance
    idols = idols.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    const paginatedResult = paginate(idols, req.query.page || 1, req.query.limit || 20);
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      null,
      {
        pagination: paginatedResult.pagination,
        searchQuery: req.query.q,
        totalResults: idols.length
      }
    ));
  } catch (error) {
    console.error('Error in searchIdols:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Get upcoming idol birthdays
 */
const getUpcomingIdolBirthdays = (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const idols = dataService.getAllArtists();
    const upcomingBirthdays = getUpcomingBirthdays(idols, days);
    
    // Sort by days until birthday
    upcomingBirthdays.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
    
    const paginatedResult = paginate(upcomingBirthdays, req.query.page || 1, req.query.limit || 20);
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      null,
      {
        pagination: paginatedResult.pagination,
        daysAhead: days,
        totalUpcoming: upcomingBirthdays.length
      }
    ));
  } catch (error) {
    console.error('Error in getUpcomingIdolBirthdays:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Get trending idols (placeholder - would need view/popularity data)
 */
const getTrendingIdols = (req, res) => {
  try {
    // For now, return recent debuts or popular groups
    let idols = dataService.getAllArtists();
    
    // Filter to recent debuts (last 2 years)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    idols = idols.filter(idol => {
      if (!idol.DateOfBirth) return false;
      return new Date(idol.DateOfBirth) >= twoYearsAgo;
    });
    
    // Sort by most recent
    idols = sortItems(idols, 'DateOfBirth', 'desc');
    
    const paginatedResult = paginate(idols, req.query.page || 1, req.query.limit || 20);
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      'Showing recent debuts as trending (placeholder)',
      {
        pagination: paginatedResult.pagination,
        note: 'Trending algorithm would require popularity/view data'
      }
    ));
  } catch (error) {
    console.error('Error in getTrendingIdols:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Get idols by gender
 */
const getIdolsByGender = (req, res) => {
  try {
    const gender = req.params.gender.toLowerCase();
    if (!['male', 'female', 'm', 'f'].includes(gender)) {
      return res.status(400).json(formatError('Invalid gender. Use: male, female, M, or F'));
    }
    
    const idols = dataService.getArtistsByGender(gender);
    const paginatedResult = paginate(idols, req.query.page || 1, req.query.limit || 20);
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      null,
      {
        pagination: paginatedResult.pagination,
        gender: gender,
        totalResults: idols.length
      }
    ));
  } catch (error) {
    console.error('Error in getIdolsByGender:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

module.exports = {
  getAllIdols,
  getIdolById,
  searchIdols,
  getUpcomingIdolBirthdays,
  getTrendingIdols,
  getIdolsByGender
};