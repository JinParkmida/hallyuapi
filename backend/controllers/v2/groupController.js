const dataService = require('../../services/dataService');
const { 
  paginate, 
  searchItems, 
  sortItems, 
  filterItems, 
  formatResponse, 
  formatError,
  getUpcomingAnniversaries,
  calculateAge 
} = require('../../utils/helpers');
const moment = require('moment');

/**
 * Get all groups with advanced filtering and pagination
 */
const getAllGroups = (req, res) => {
  try {
    let groups = dataService.getAllGroups();
    
    // Apply filters
    const filters = {};
    if (req.query.company) filters.Company = req.query.company;
    if (req.query.active !== undefined) {
      filters.Active = req.query.active === 'true' ? 'Yes' : 'No';
    }
    
    if (Object.keys(filters).length > 0) {
      groups = filterItems(groups, filters);
    }
    
    // Apply debut year filter
    if (req.query.debutYear) {
      groups = groups.filter(group => {
        if (!group.Debut) return false;
        return new Date(group.Debut).getFullYear() === req.query.debutYear;
      });
    }
    
    // Apply member count filter
    if (req.query.memberCount) {
      groups = groups.filter(group => 
        group.CurrentMemberCount === req.query.memberCount
      );
    }
    
    // Apply type filter (boyband/girlgroup)
    if (req.query.type) {
      groups = groups.filter(group => {
        const members = dataService.getArtistsByGroup(group.Name);
        if (members.length === 0) return false;
        
        const genders = [...new Set(members.map(m => m.Gender))];
        
        switch (req.query.type.toLowerCase()) {
          case 'boyband':
            return genders.length === 1 && genders[0] === 'M';
          case 'girlgroup':
            return genders.length === 1 && genders[0] === 'F';
          case 'mixed':
            return genders.length > 1;
          case 'solo':
            return members.length === 1;
          default:
            return true;
        }
      });
    }
    
    // Apply search
    if (req.query.search) {
      const searchFields = ['Name', 'KoreanName', 'ShortName', 'Company', 'FanbaseName'];
      groups = searchItems(groups, req.query.search, searchFields);
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
      case 'popularity':
        sortField = 'CurrentMemberCount'; // Placeholder for popularity
        break;
      case 'recent':
        sortField = 'Debut';
        break;
      default:
        sortField = 'Name';
    }
    
    groups = sortItems(groups, sortField, req.query.order);
    
    // Add calculated fields
    groups = groups.map(group => ({
      ...group,
      yearsActive: group.Debut ? moment().diff(moment(group.Debut), 'years') : null,
      members: dataService.getArtistsByGroup(group.Name),
      memberCount: dataService.getArtistsByGroup(group.Name).length,
      profileUrl: `/api/v2/groups/${group.Id}`,
      type: getGroupType(group, dataService.getArtistsByGroup(group.Name))
    }));
    
    // Apply pagination
    const paginatedResult = paginate(groups, req.query.page, req.query.limit);
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      null,
      {
        pagination: paginatedResult.pagination,
        filters: req.query,
        totalResults: groups.length
      }
    ));
  } catch (error) {
    console.error('Error in getAllGroups:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Get group by ID
 */
const getGroupById = (req, res) => {
  try {
    const group = dataService.getGroupById(req.params.id);
    
    if (!group) {
      return res.status(404).json(formatError('Group not found', null, 404));
    }
    
    const members = dataService.getArtistsByGroup(group.Name);
    
    // Enhance group data
    const enhancedGroup = {
      ...group,
      yearsActive: group.Debut ? moment().diff(moment(group.Debut), 'years') : null,
      members: members.map(member => ({
        ...member,
        age: calculateAge(member.DateOfBirth)
      })),
      memberCount: members.length,
      type: getGroupType(group, members),
      relatedGroups: dataService.getGroupsByCompany(group.Company).filter(g => g.Id !== group.Id),
      averageMemberAge: members.length > 0 ? 
        members.reduce((sum, member) => sum + (calculateAge(member.DateOfBirth) || 0), 0) / members.length : null
    };
    
    res.status(200).json(formatResponse(enhancedGroup));
  } catch (error) {
    console.error('Error in getGroupById:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Get group members
 */
const getGroupMembers = (req, res) => {
  try {
    const group = dataService.getGroupById(req.params.id);
    
    if (!group) {
      return res.status(404).json(formatError('Group not found', null, 404));
    }
    
    let members = dataService.getArtistsByGroup(group.Name);
    
    // Add calculated fields
    members = members.map(member => ({
      ...member,
      age: calculateAge(member.DateOfBirth),
      profileUrl: `/api/v2/idols/${member.Id}`
    }));
    
    // Apply sorting if requested
    if (req.query.sort) {
      let sortField = 'StageName';
      switch (req.query.sort) {
        case 'age':
          members = members.sort((a, b) => (b.age || 0) - (a.age || 0));
          break;
        case 'name':
          sortField = 'StageName';
          members = sortItems(members, sortField, req.query.order);
          break;
        case 'birth':
          sortField = 'DateOfBirth';
          members = sortItems(members, sortField, req.query.order);
          break;
        default:
          members = sortItems(members, 'StageName', 'asc');
      }
    }
    
    const paginatedResult = paginate(members, req.query.page || 1, req.query.limit || 20);
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      null,
      {
        pagination: paginatedResult.pagination,
        groupInfo: {
          id: group.Id,
          name: group.Name,
          totalMembers: members.length
        }
      }
    ));
  } catch (error) {
    console.error('Error in getGroupMembers:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Search groups
 */
const searchGroups = (req, res) => {
  try {
    if (!req.query.q) {
      return res.status(400).json(formatError('Search query is required'));
    }
    
    const searchFields = ['Name', 'KoreanName', 'ShortName', 'Company', 'FanbaseName'];
    let groups = searchItems(dataService.getAllGroups(), req.query.q, searchFields);
    
    // Add relevance scoring
    groups = groups.map(group => {
      let relevanceScore = 0;
      const query = req.query.q.toLowerCase();
      
      if (group.Name.toLowerCase() === query) relevanceScore += 10;
      else if (group.Name.toLowerCase().includes(query)) relevanceScore += 5;
      
      if (group.KoreanName && group.KoreanName.toLowerCase() === query) relevanceScore += 8;
      else if (group.KoreanName && group.KoreanName.toLowerCase().includes(query)) relevanceScore += 3;
      
      if (group.Company && group.Company.toLowerCase().includes(query)) relevanceScore += 2;
      
      return { ...group, relevanceScore };
    });
    
    // Sort by relevance
    groups = groups.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    const paginatedResult = paginate(groups, req.query.page || 1, req.query.limit || 20);
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      null,
      {
        pagination: paginatedResult.pagination,
        searchQuery: req.query.q,
        totalResults: groups.length
      }
    ));
  } catch (error) {
    console.error('Error in searchGroups:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Get upcoming group anniversaries
 */
const getUpcomingGroupAnniversaries = (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const groups = dataService.getAllGroups();
    const upcomingAnniversaries = getUpcomingAnniversaries(groups, days);
    
    // Sort by days until anniversary
    upcomingAnniversaries.sort((a, b) => a.daysUntilAnniversary - b.daysUntilAnniversary);
    
    const paginatedResult = paginate(upcomingAnniversaries, req.query.page || 1, req.query.limit || 20);
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      null,
      {
        pagination: paginatedResult.pagination,
        daysAhead: days,
        totalUpcoming: upcomingAnniversaries.length
      }
    ));
  } catch (error) {
    console.error('Error in getUpcomingAnniversaries:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Get groups by type (boyband/girlgroup)
 */
const getGroupsByType = (req, res) => {
  try {
    const type = req.params.type.toLowerCase();
    if (!['boyband', 'girlgroup', 'mixed', 'solo'].includes(type)) {
      return res.status(400).json(formatError('Invalid type. Use: boyband, girlgroup, mixed, or solo'));
    }
    
    let groups = dataService.getAllGroups();
    
    // Filter by type
    groups = groups.filter(group => {
      const members = dataService.getArtistsByGroup(group.Name);
      if (members.length === 0) return false;
      
      const genders = [...new Set(members.map(m => m.Gender))];
      
      switch (type) {
        case 'boyband':
          return genders.length === 1 && genders[0] === 'M';
        case 'girlgroup':
          return genders.length === 1 && genders[0] === 'F';
        case 'mixed':
          return genders.length > 1;
        case 'solo':
          return members.length === 1;
        default:
          return true;
      }
    });
    
    const paginatedResult = paginate(groups, req.query.page || 1, req.query.limit || 20);
    
    res.status(200).json(formatResponse(
      paginatedResult.data,
      'success',
      null,
      {
        pagination: paginatedResult.pagination,
        type: type,
        totalResults: groups.length
      }
    ));
  } catch (error) {
    console.error('Error in getGroupsByType:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Helper function to determine group type
 */
const getGroupType = (group, members) => {
  if (members.length === 0) return 'unknown';
  if (members.length === 1) return 'solo';
  
  const genders = [...new Set(members.map(m => m.Gender))];
  
  if (genders.length === 1) {
    return genders[0] === 'M' ? 'boyband' : 'girlgroup';
  }
  
  return 'mixed';
};

module.exports = {
  getAllGroups,
  getGroupById,
  getGroupMembers,
  searchGroups,
  getUpcomingAnniversaries: getUpcomingGroupAnniversaries,
  getGroupsByType
};