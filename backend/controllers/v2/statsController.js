const dataService = require('../../services/dataService');
const { formatResponse, formatError, generateStats } = require('../../utils/helpers');
const moment = require('moment');

/**
 * Get overview statistics
 */
const getOverviewStats = (req, res) => {
  try {
    const groups = dataService.getAllGroups();
    const artists = dataService.getAllArtists();
    const actors = dataService.getAllActors();
    const companies = dataService.getAllCompanies();
    
    const stats = {
      totals: {
        groups: groups.length,
        artists: artists.length,
        actors: actors.length,
        companies: companies.length,
        activeGroups: groups.filter(g => g.Active === 'Yes').length,
        inactiveGroups: groups.filter(g => g.Active === 'No').length
      },
      demographics: {
        maleArtists: artists.filter(a => a.Gender === 'M').length,
        femaleArtists: artists.filter(a => a.Gender === 'F').length,
        maleActors: actors.filter(a => a.Gender === 'M').length,
        femaleActors: actors.filter(a => a.Gender === 'F').length
      },
      groupTypes: getGroupTypeStats(groups),
      topCompanies: getTopCompanies(companies, 10),
      debutTrends: getDebutTrends(groups),
      averages: {
        groupMemberCount: groups.length > 0 ? 
          groups.reduce((sum, g) => sum + (g.CurrentMemberCount || 0), 0) / groups.length : 0,
        groupAge: getAverageGroupAge(groups),
        artistAge: getAverageArtistAge(artists)
      },
      recentActivity: {
        recentDebuts: getRecentDebuts(groups, 365), // Last year
        upcomingBirthdays: getUpcomingCount(artists, 'DateOfBirth', 30),
        upcomingAnniversaries: getUpcomingCount(groups, 'Debut', 30)
      }
    };
    
    res.status(200).json(formatResponse(stats, 'success', null, {
      generatedAt: new Date().toISOString(),
      dataVersion: '2.0'
    }));
  } catch (error) {
    console.error('Error in getOverviewStats:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Get demographic statistics
 */
const getDemographicStats = (req, res) => {
  try {
    const artists = dataService.getAllArtists();
    const actors = dataService.getAllActors();
    
    const stats = {
      artists: {
        byGender: generateStats(artists, 'Gender'),
        byCountry: generateStats(artists, 'Country'),
        byBirthYear: generateStats(artists.filter(a => a.DateOfBirth), a => 
          new Date(a.DateOfBirth).getFullYear()),
        byBirthDecade: generateStats(artists.filter(a => a.DateOfBirth), a => 
          Math.floor(new Date(a.DateOfBirth).getFullYear() / 10) * 10),
        ageDistribution: getAgeDistribution(artists)
      },
      actors: {
        byGender: generateStats(actors, 'Gender'),
        byCountry: generateStats(actors, 'Country'),
        byBirthYear: generateStats(actors.filter(a => a.DateOfBirth), a => 
          new Date(a.DateOfBirth).getFullYear()),
        ageDistribution: getAgeDistribution(actors)
      },
      combined: {
        totalByGender: {
          M: artists.filter(a => a.Gender === 'M').length + actors.filter(a => a.Gender === 'M').length,
          F: artists.filter(a => a.Gender === 'F').length + actors.filter(a => a.Gender === 'F').length
        },
        totalByCountry: combineCountryStats(artists, actors)
      }
    };
    
    res.status(200).json(formatResponse(stats));
  } catch (error) {
    console.error('Error in getDemographicStats:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

/**
 * Get trend statistics
 */
const getTrendStats = (req, res) => {
  try {
    const groups = dataService.getAllGroups();
    const artists = dataService.getAllArtists();
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 10}, (_, i) => currentYear - 9 + i);
    
    const stats = {
      debutTrends: {
        byYear: years.map(year => ({
          year,
          groups: groups.filter(g => g.Debut && new Date(g.Debut).getFullYear() === year).length,
          artists: artists.filter(a => a.DateOfBirth && new Date(a.DateOfBirth).getFullYear() === year).length
        })),
        byDecade: getDebutsByDecade(groups),
        recentGrowth: getRecentGrowthStats(groups)
      },
      companyTrends: getCompanyTrends(groups),
      memberCountTrends: getMemberCountTrends(groups),
      popularNames: {
        artistNames: getPopularNames(artists, 'StageName'),
        groupNames: getPopularNames(groups, 'Name')
      }
    };
    
    res.status(200).json(formatResponse(stats));
  } catch (error) {
    console.error('Error in getTrendStats:', error);
    res.status(500).json(formatError('Internal server error', error.message, 500));
  }
};

// Helper functions
const getGroupTypeStats = (groups) => {
  const typeStats = { boyband: 0, girlgroup: 0, mixed: 0, solo: 0, unknown: 0 };
  
  groups.forEach(group => {
    const members = dataService.getArtistsByGroup(group.Name);
    if (members.length === 0) {
      typeStats.unknown++;
      return;
    }
    
    if (members.length === 1) {
      typeStats.solo++;
      return;
    }
    
    const genders = [...new Set(members.map(m => m.Gender))];
    if (genders.length === 1) {
      if (genders[0] === 'M') typeStats.boyband++;
      else typeStats.girlgroup++;
    } else {
      typeStats.mixed++;
    }
  });
  
  return typeStats;
};

const getTopCompanies = (companies, limit = 10) => {
  return companies
    .sort((a, b) => (b.Groups.length + b.Artists.length) - (a.Groups.length + a.Artists.length))
    .slice(0, limit)
    .map(company => ({
      name: company.Name,
      totalGroups: company.Groups.length,
      totalArtists: company.Artists.length,
      activeGroups: company.Groups.filter(g => g.Active === 'Yes').length
    }));
};

const getDebutTrends = (groups) => {
  const debutsByYear = generateStats(groups.filter(g => g.Debut), g => 
    new Date(g.Debut).getFullYear());
  
  return Object.entries(debutsByYear)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);
};

const getAverageGroupAge = (groups) => {
  const groupsWithDebut = groups.filter(g => g.Debut);
  if (groupsWithDebut.length === 0) return 0;
  
  const totalAge = groupsWithDebut.reduce((sum, group) => {
    return sum + moment().diff(moment(group.Debut), 'years');
  }, 0);
  
  return totalAge / groupsWithDebut.length;
};

const getAverageArtistAge = (artists) => {
  const artistsWithBirth = artists.filter(a => a.DateOfBirth);
  if (artistsWithBirth.length === 0) return 0;
  
  const totalAge = artistsWithBirth.reduce((sum, artist) => {
    return sum + moment().diff(moment(artist.DateOfBirth), 'years');
  }, 0);
  
  return totalAge / artistsWithBirth.length;
};

const getRecentDebuts = (groups, days) => {
  const cutoffDate = moment().subtract(days, 'days');
  return groups.filter(g => g.Debut && moment(g.Debut).isAfter(cutoffDate)).length;
};

const getUpcomingCount = (items, dateField, days) => {
  const endDate = moment().add(days, 'days');
  return items.filter(item => {
    if (!item[dateField]) return false;
    const date = moment(item[dateField]);
    const thisYearDate = date.clone().year(moment().year());
    const nextYearDate = date.clone().year(moment().year() + 1);
    
    return thisYearDate.isBetween(moment(), endDate, 'day', '[]') ||
           nextYearDate.isBetween(moment(), endDate, 'day', '[]');
  }).length;
};

const getAgeDistribution = (people) => {
  const ageRanges = {
    'Under 20': 0,
    '20-24': 0,
    '25-29': 0,
    '30-34': 0,
    '35-39': 0,
    '40+': 0
  };
  
  people.forEach(person => {
    if (!person.DateOfBirth) return;
    
    const age = moment().diff(moment(person.DateOfBirth), 'years');
    
    if (age < 20) ageRanges['Under 20']++;
    else if (age < 25) ageRanges['20-24']++;
    else if (age < 30) ageRanges['25-29']++;
    else if (age < 35) ageRanges['30-34']++;
    else if (age < 40) ageRanges['35-39']++;
    else ageRanges['40+']++;
  });
  
  return ageRanges;
};

const combineCountryStats = (artists, actors) => {
  const combined = {};
  
  [...artists, ...actors].forEach(person => {
    if (person.Country) {
      combined[person.Country] = (combined[person.Country] || 0) + 1;
    }
  });
  
  return combined;
};

const getDebutsByDecade = (groups) => {
  const decades = {};
  
  groups.forEach(group => {
    if (!group.Debut) return;
    const decade = Math.floor(new Date(group.Debut).getFullYear() / 10) * 10;
    decades[decade] = (decades[decade] || 0) + 1;
  });
  
  return decades;
};

const getRecentGrowthStats = (groups) => {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  const twoYearsAgo = currentYear - 2;
  
  const thisYear = groups.filter(g => g.Debut && new Date(g.Debut).getFullYear() === currentYear).length;
  const lastYearCount = groups.filter(g => g.Debut && new Date(g.Debut).getFullYear() === lastYear).length;
  const twoYearsAgoCount = groups.filter(g => g.Debut && new Date(g.Debut).getFullYear() === twoYearsAgo).length;
  
  return {
    thisYear,
    lastYear: lastYearCount,
    twoYearsAgo: twoYearsAgoCount,
    yearOverYearGrowth: lastYearCount > 0 ? ((thisYear - lastYearCount) / lastYearCount * 100) : 0
  };
};

const getCompanyTrends = (groups) => {
  const companyDebuts = {};
  
  groups.forEach(group => {
    if (!group.Company || !group.Debut) return;
    
    const year = new Date(group.Debut).getFullYear();
    if (!companyDebuts[group.Company]) companyDebuts[group.Company] = {};
    companyDebuts[group.Company][year] = (companyDebuts[group.Company][year] || 0) + 1;
  });
  
  return companyDebuts;
};

const getMemberCountTrends = (groups) => {
  const memberCounts = generateStats(groups.filter(g => g.CurrentMemberCount), 'CurrentMemberCount');
  
  return Object.entries(memberCounts)
    .map(([count, frequency]) => ({ memberCount: parseInt(count), frequency }))
    .sort((a, b) => a.memberCount - b.memberCount);
};

const getPopularNames = (items, field, limit = 10) => {
  const names = {};
  
  items.forEach(item => {
    if (!item[field]) return;
    
    const name = item[field].toLowerCase();
    names[name] = (names[name] || 0) + 1;
  });
  
  return Object.entries(names)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
};

module.exports = {
  getOverviewStats,
  getDemographicStats,
  getTrendStats
};