const _ = require('lodash');
const moment = require('moment');

/**
 * Pagination helper
 */
const paginate = (data, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const paginatedData = data.slice(offset, offset + limit);
  
  return {
    data: paginatedData,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(data.length / limit),
      totalItems: data.length,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(data.length / limit),
      hasPrevPage: page > 1
    }
  };
};

/**
 * Advanced search function with fuzzy matching
 */
const searchItems = (items, query, searchFields) => {
  if (!query) return items;
  
  const searchTerm = query.toLowerCase().trim();
  
  return items.filter(item => {
    return searchFields.some(field => {
      const fieldValue = _.get(item, field);
      if (!fieldValue) return false;
      
      const value = fieldValue.toString().toLowerCase();
      
      // Exact match gets highest priority
      if (value === searchTerm) return true;
      
      // Contains match
      if (value.includes(searchTerm)) return true;
      
      // Fuzzy match for names (allowing for slight variations)
      if (field.includes('Name') && fuzzyMatch(value, searchTerm)) return true;
      
      return false;
    });
  });
};

/**
 * Simple fuzzy matching for names
 */
const fuzzyMatch = (str1, str2, threshold = 0.8) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length >= threshold;
};

/**
 * Levenshtein distance calculation
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Sort items by specified field and order
 */
const sortItems = (items, sortBy, order = 'asc') => {
  return _.orderBy(items, [sortBy], [order]);
};

/**
 * Filter items by multiple criteria
 */
const filterItems = (items, filters) => {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null) return true;
      
      const itemValue = _.get(item, key);
      if (!itemValue) return false;
      
      // Handle different filter types
      if (typeof value === 'boolean') {
        return itemValue === value || 
               (value === true && (itemValue === 'Yes' || itemValue === true)) ||
               (value === false && (itemValue === 'No' || itemValue === false));
      }
      
      if (typeof value === 'string') {
        return itemValue.toString().toLowerCase().includes(value.toLowerCase());
      }
      
      if (typeof value === 'number') {
        return itemValue === value;
      }
      
      return itemValue === value;
    });
  });
};

/**
 * Calculate age from birth date
 */
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  return moment().diff(moment(birthDate), 'years');
};

/**
 * Get upcoming birthdays within specified days
 */
const getUpcomingBirthdays = (items, days = 30) => {
  const today = moment();
  const endDate = moment().add(days, 'days');
  
  return items.filter(item => {
    if (!item.DateOfBirth) return false;
    
    const birthDate = moment(item.DateOfBirth);
    const thisYearBirthday = birthDate.clone().year(today.year());
    const nextYearBirthday = birthDate.clone().year(today.year() + 1);
    
    return (thisYearBirthday.isBetween(today, endDate, 'day', '[]') ||
            nextYearBirthday.isBetween(today, endDate, 'day', '[]'));
  }).map(item => ({
    ...item,
    age: calculateAge(item.DateOfBirth),
    daysUntilBirthday: getDaysUntilBirthday(item.DateOfBirth)
  }));
};

/**
 * Get days until next birthday
 */
const getDaysUntilBirthday = (birthDate) => {
  if (!birthDate) return null;
  
  const today = moment();
  const birth = moment(birthDate);
  const thisYearBirthday = birth.clone().year(today.year());
  
  if (thisYearBirthday.isBefore(today, 'day')) {
    return birth.clone().year(today.year() + 1).diff(today, 'days');
  }
  
  return thisYearBirthday.diff(today, 'days');
};

/**
 * Get debut anniversaries
 */
const getUpcomingAnniversaries = (groups, days = 30) => {
  const today = moment();
  const endDate = moment().add(days, 'days');
  
  return groups.filter(group => {
    if (!group.Debut) return false;
    
    const debutDate = moment(group.Debut);
    const thisYearAnniversary = debutDate.clone().year(today.year());
    const nextYearAnniversary = debutDate.clone().year(today.year() + 1);
    
    return (thisYearAnniversary.isBetween(today, endDate, 'day', '[]') ||
            nextYearAnniversary.isBetween(today, endDate, 'day', '[]'));
  }).map(group => ({
    ...group,
    yearsActive: moment().diff(moment(group.Debut), 'years'),
    daysUntilAnniversary: getDaysUntilAnniversary(group.Debut)
  }));
};

/**
 * Get days until next anniversary
 */
const getDaysUntilAnniversary = (debutDate) => {
  if (!debutDate) return null;
  
  const today = moment();
  const debut = moment(debutDate);
  const thisYearAnniversary = debut.clone().year(today.year());
  
  if (thisYearAnniversary.isBefore(today, 'day')) {
    return debut.clone().year(today.year() + 1).diff(today, 'days');
  }
  
  return thisYearAnniversary.diff(today, 'days');
};

/**
 * Generate statistics from data
 */
const generateStats = (data, groupBy) => {
  return _.countBy(data, groupBy);
};

/**
 * Standard API response format
 */
const formatResponse = (data, status = 'success', message = null, meta = {}) => {
  const response = {
    status,
    timestamp: new Date().toISOString(),
    ...meta
  };
  
  if (message) response.message = message;
  if (data !== undefined) response.data = data;
  
  return response;
};

/**
 * Error response format
 */
const formatError = (message, details = null, statusCode = 400) => {
  const error = {
    status: 'error',
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };
  
  if (details) error.details = details;
  
  return error;
};

module.exports = {
  paginate,
  searchItems,
  sortItems,
  filterItems,
  calculateAge,
  getUpcomingBirthdays,
  getUpcomingAnniversaries,
  generateStats,
  formatResponse,
  formatError,
  fuzzyMatch
};