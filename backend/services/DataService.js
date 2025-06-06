const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const moment = require('moment');

class DataService {
  constructor() {
    this.data = {
      artists: [],
      groups: [],
      actors: [],
      companies: []
    };
    this.loadData();
  }

  loadData() {
    try {
      // Load existing data
      this.data.artists = this.loadJsonFile('all_artists.json');
      this.data.groups = this.loadJsonFile('all_groups.json');
      this.data.actors = this.loadJsonFile('all_actors.json');
      
      // Generate companies from existing data
      this.generateCompaniesData();
      
      console.log(`Data loaded: ${this.data.artists.length} artists, ${this.data.groups.length} groups, ${this.data.actors.length} actors, ${this.data.companies.length} companies`);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  loadJsonFile(filename) {
    try {
      const filePath = path.join(__dirname, '../data', filename);
      const rawData = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      return [];
    }
  }

  generateCompaniesData() {
    const companySet = new Set();
    
    // Extract companies from groups and artists
    [...this.data.groups, ...this.data.artists].forEach(item => {
      if (item.company) {
        companySet.add(item.company);
      }
    });

    this.data.companies = Array.from(companySet).map((name, index) => ({
      id: index + 1,
      name: name,
      type: this.getCompanyType(name),
      founded: this.getEstimatedFoundedYear(name),
      artists: this.getArtistsByCompany(name),
      groups: this.getGroupsByCompany(name)
    }));
  }

  getCompanyType(companyName) {
    const majorLabels = ['SM Entertainment', 'YG Entertainment', 'JYP Entertainment', 'HYBE', 'Starship Entertainment'];
    return majorLabels.includes(companyName) ? 'Major Label' : 'Independent';
  }

  getEstimatedFoundedYear(companyName) {
    const knownYears = {
      'SM Entertainment': 1995,
      'YG Entertainment': 1996,
      'JYP Entertainment': 1997,
      'HYBE': 2005,
      'Starship Entertainment': 2008
    };
    return knownYears[companyName] || null;
  }

  getArtistsByCompany(companyName) {
    return this.data.artists.filter(artist => artist.company === companyName);
  }

  getGroupsByCompany(companyName) {
    return this.data.groups.filter(group => group.company === companyName);
  }

  // Search functionality
  search(query, type = 'all', options = {}) {
    const { limit = 20, fuzzy = true } = options;
    let results = [];

    if (type === 'all' || type === 'artists') {
      results.push(...this.searchInData(this.data.artists, query, 'artist', fuzzy));
    }
    if (type === 'all' || type === 'groups') {
      results.push(...this.searchInData(this.data.groups, query, 'group', fuzzy));
    }
    if (type === 'all' || type === 'actors') {
      results.push(...this.searchInData(this.data.actors, query, 'actor', fuzzy));
    }
    if (type === 'all' || type === 'companies') {
      results.push(...this.searchInData(this.data.companies, query, 'company', fuzzy));
    }

    // Sort by relevance and limit results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  searchInData(data, query, type, fuzzy) {
    const queryLower = query.toLowerCase();
    return data.map(item => {
      let relevance = 0;
      const searchFields = this.getSearchFields(item, type);
      
      searchFields.forEach(field => {
        if (field && field.toLowerCase().includes(queryLower)) {
          relevance += field.toLowerCase() === queryLower ? 100 : 50;
        }
      });

      if (fuzzy && relevance === 0) {
        searchFields.forEach(field => {
          if (field && this.fuzzyMatch(field.toLowerCase(), queryLower)) {
            relevance += 25;
          }
        });
      }

      return relevance > 0 ? { ...item, type, relevance } : null;
    }).filter(Boolean);
  }

  getSearchFields(item, type) {
    switch (type) {
      case 'artist':
      case 'actor':
        return [item.StageName, item.FullName, item.KoreanName, item.stageName, item.fullName, item.koreanName];
      case 'group':
        return [item.Name, item.KoreanName, item.name, item.koreanName];
      case 'company':
        return [item.Name, item.name];
      default:
        return [];
    }
  }

  fuzzyMatch(str1, str2) {
    const threshold = 0.7;
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return (maxLength - distance) / maxLength >= threshold;
  }

  levenshteinDistance(str1, str2) {
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
  }

  // Real-time features
  getTodaysBirthdays() {
    const today = moment().format('MM-DD');
    return this.data.artists.filter(artist => {
      if (artist.dateOfBirth) {
        const birthDate = moment(artist.dateOfBirth).format('MM-DD');
        return birthDate === today;
      }
      return false;
    });
  }

  getUpcomingBirthdays(days = 7) {
    const upcoming = [];
    for (let i = 0; i < days; i++) {
      const date = moment().add(i, 'days').format('MM-DD');
      const birthdays = this.data.artists.filter(artist => {
        if (artist.dateOfBirth) {
          const birthDate = moment(artist.dateOfBirth).format('MM-DD');
          return birthDate === date;
        }
        return false;
      });
      if (birthdays.length > 0) {
        upcoming.push({
          date: moment().add(i, 'days').format('YYYY-MM-DD'),
          artists: birthdays
        });
      }
    }
    return upcoming;
  }

  getGroupAnniversaries() {
    const today = moment().format('MM-DD');
    return this.data.groups.filter(group => {
      if (group.debutDate) {
        const debutDate = moment(group.debutDate).format('MM-DD');
        return debutDate === today;
      }
      return false;
    });
  }

  // Statistics
  getOverviewStats() {
    return {
      totalArtists: this.data.artists.length,
      totalGroups: this.data.groups.length,
      totalActors: this.data.actors.length,
      totalCompanies: this.data.companies.length,
      lastUpdated: moment().toISOString()
    };
  }

  getCompanyStats() {
    return this.data.companies.map(company => ({
      name: company.name,
      artistCount: company.artists.length,
      groupCount: company.groups.length,
      totalTalent: company.artists.length + company.groups.length
    })).sort((a, b) => b.totalTalent - a.totalTalent);
  }

  // Data getters with pagination and filtering
  getArtists(options = {}) {
    return this.getPaginatedData(this.data.artists, options);
  }

  getGroups(options = {}) {
    return this.getPaginatedData(this.data.groups, options);
  }

  getActors(options = {}) {
    return this.getPaginatedData(this.data.actors, options);
  }

  getCompanies(options = {}) {
    return this.getPaginatedData(this.data.companies, options);
  }

  getPaginatedData(data, options = {}) {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'name', 
      sortOrder = 'asc',
      filter = {}
    } = options;

    let filteredData = data;

    // Apply filters
    Object.keys(filter).forEach(key => {
      if (filter[key]) {
        filteredData = filteredData.filter(item => 
          item[key] && item[key].toString().toLowerCase().includes(filter[key].toLowerCase())
        );
      }
    });

    // Apply sorting
    filteredData = _.orderBy(filteredData, [sortBy], [sortOrder]);

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredData.length / limit),
        totalItems: filteredData.length,
        itemsPerPage: limit,
        hasNextPage: endIndex < filteredData.length,
        hasPrevPage: page > 1
      }
    };
  }

  // Individual item getters
  getArtistById(id) {
    return this.data.artists.find(artist => artist.id === parseInt(id));
  }

  getGroupById(id) {
    return this.data.groups.find(group => group.id === parseInt(id));
  }

  getActorById(id) {
    return this.data.actors.find(actor => actor.id === parseInt(id));
  }

  getCompanyById(id) {
    return this.data.companies.find(company => company.id === parseInt(id));
  }
}

module.exports = new DataService();