const dataService = require('../../services/dataService');
const { 
  paginate, 
  searchItems, 
  sortItems, 
  formatResponse, 
  formatError 
} = require('../../utils/helpers');

/**
 * Get all companies
 */
const getAllCompanies = (req, res) => {
  try {
    let companies = dataService.getAllCompanies();
    
    // Apply search
    if (req.query.search) {
      const searchFields = ['Name'];
      companies = searchItems(companies, req.query.search, searchFields);
    }
    
    // Apply sorting
    let sortField = 'Name';
    switch (req.query.sort) {
      case 'name':
        sortField = 'Name';
        break;
      case 'groups':
        companies = companies.sort((a, b) => b.Groups.length - a.Groups.length);
        break;
      case 'artists':
        companies = companies.sort((a, b) => b.Artists.length - a.Artists.length);
        break;
      default:
        companies = sortItems(companies, 'Name', req.query.order);
    }
    
    if (req.query.sort !== 'groups' && req.query.sort !== 'artists') {
      companies = sortItems(companies, sortField, req.query.order);
    }
    
    // Add statistics
    companies = companies.map(company => ({
      ...company,
      totalGroups: company.Groups.length,
      totalArtists: company.Artists.length,
      activeGroups: company.Groups.filter(g => g.Active === 'Yes').length,
      profileUrl: `/api/v2/companies/${encodeURIComponent(company.Name)}`
    }));
    
    // Apply pagination
    const paginatedResult = paginate(companies, req.query.page || 1, req.query.limit || 20);
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      null,
      {
        pagination: paginatedResult.pagination,
        totalResults: companies.length
      }
    ));
  } catch (error) {
    console.error('Error in getAllCompanies:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Get company by name
 */
const getCompanyByName = (req, res) => {
  try {
    const companyName = decodeURIComponent(req.params.name);
    const company = dataService.getCompanyByName(companyName);
    
    if (!company) {
      return res.status(404).json(formatError('Company not found', null, 404));
    }
    
    // Enhance company data
    const enhancedCompany = {
      ...company,
      totalGroups: company.Groups.length,
      totalArtists: company.Artists.length,
      activeGroups: company.Groups.filter(g => g.Active === 'Yes').length,
      inactiveGroups: company.Groups.filter(g => g.Active === 'No').length,
      maleArtists: company.Artists.filter(a => a.Gender === 'M').length,
      femaleArtists: company.Artists.filter(a => a.Gender === 'F').length,
      debutYears: [...new Set(company.Groups.map(g => new Date(g.Debut).getFullYear()))].sort(),
      statistics: {
        averageGroupSize: company.Groups.length > 0 ? 
          company.Groups.reduce((sum, g) => sum + g.CurrentMemberCount, 0) / company.Groups.length : 0,
        oldestGroup: company.Groups.reduce((oldest, group) => 
          !oldest || new Date(group.Debut) < new Date(oldest.Debut) ? group : oldest, null),
        newestGroup: company.Groups.reduce((newest, group) => 
          !newest || new Date(group.Debut) > new Date(newest.Debut) ? group : newest, null)
      }
    };
    
    res.status(200).json(formatResponse(enhancedCompany));
  } catch (error) {
    console.error('Error in getCompanyByName:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Get company artists
 */
const getCompanyArtists = (req, res) => {
  try {
    const companyName = decodeURIComponent(req.params.name);
    const company = dataService.getCompanyByName(companyName);
    
    if (!company) {
      return res.status(404).json(formatError('Company not found', null, 404));
    }
    
    let artists = company.Artists;
    
    // Apply filters
    if (req.query.gender) {
      const targetGender = req.query.gender.toUpperCase();
      artists = artists.filter(artist => artist.Gender === targetGender);
    }
    
    if (req.query.group) {
      artists = artists.filter(artist => 
        artist.Group && artist.Group.toLowerCase().includes(req.query.group.toLowerCase())
      );
    }
    
    // Apply sorting
    let sortField = 'StageName';
    switch (req.query.sort) {
      case 'name':
        sortField = 'StageName';
        break;
      case 'birth':
        sortField = 'DateOfBirth';
        break;
      default:
        sortField = 'StageName';
    }
    
    artists = sortItems(artists, sortField, req.query.order);
    
    const paginatedResult = paginate(artists, req.query.page || 1, req.query.limit || 20);
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      null,
      {
        pagination: paginatedResult.pagination,
        companyInfo: {
          name: company.Name,
          totalArtists: company.Artists.length
        }
      }
    ));
  } catch (error) {
    console.error('Error in getCompanyArtists:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Get company groups
 */
const getCompanyGroups = (req, res) => {
  try {
    const companyName = decodeURIComponent(req.params.name);
    const company = dataService.getCompanyByName(companyName);
    
    if (!company) {
      return res.status(404).json(formatError('Company not found', null, 404));
    }
    
    let groups = company.Groups;
    
    // Apply filters
    if (req.query.active !== undefined) {
      const isActive = req.query.active === 'true';
      groups = groups.filter(group => 
        (isActive && group.Active === 'Yes') || (!isActive && group.Active === 'No')
      );
    }
    
    // Apply sorting
    let sortField = 'Name';
    switch (req.query.sort) {
      case 'name':
        sortField = 'Name';
        break;
      case 'debut':
        sortField = 'Debut';
        break;
      case 'members':
        groups = groups.sort((a, b) => b.CurrentMemberCount - a.CurrentMemberCount);
        break;
      default:
        groups = sortItems(groups, 'Name', req.query.order);
    }
    
    if (req.query.sort !== 'members') {
      groups = sortItems(groups, sortField, req.query.order);
    }
    
    const paginatedResult = paginate(groups, req.query.page || 1, req.query.limit || 20);
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      null,
      {
        pagination: paginatedResult.pagination,
        companyInfo: {
          name: company.Name,
          totalGroups: company.Groups.length
        }
      }
    ));
  } catch (error) {
    console.error('Error in getCompanyGroups:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Search companies
 */
const searchCompanies = (req, res) => {
  try {
    if (!req.query.q) {
      return res.status(400).json(formatError('Search query is required'));
    }
    
    const searchFields = ['Name'];
    let companies = searchItems(dataService.getAllCompanies(), req.query.q, searchFields);
    
    // Add relevance scoring
    companies = companies.map(company => {
      let relevanceScore = 0;
      const query = req.query.q.toLowerCase();
      
      if (company.Name.toLowerCase() === query) relevanceScore += 10;
      else if (company.Name.toLowerCase().includes(query)) relevanceScore += 5;
      
      return { ...company, relevanceScore };
    });
    
    // Sort by relevance
    companies = companies.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    const paginatedResult = paginate(companies, req.query.page || 1, req.query.limit || 20);
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      null,
      {
        pagination: paginatedResult.pagination,
        searchQuery: req.query.q,
        totalResults: companies.length
      }
    ));
  } catch (error) {
    console.error('Error in searchCompanies:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

module.exports = {
  getAllCompanies,
  getCompanyByName,
  getCompanyArtists,
  getCompanyGroups,
  searchCompanies
};