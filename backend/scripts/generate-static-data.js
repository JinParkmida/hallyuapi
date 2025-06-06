#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const DataService = require('../services/DataService');

// Create output directory
const outputDir = path.join(__dirname, '../../dist/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateStaticFiles() {
  console.log('🚀 Generating static API files...');
  
  try {
    // Load all data
    console.log('📊 Loading data...');
    const artists = DataService.data.artists;
    const groups = DataService.data.groups;
    const actors = DataService.data.actors;
    const companies = DataService.data.companies;

    // Generate individual data files
    console.log('📝 Writing data files...');
    fs.writeFileSync(
      path.join(outputDir, 'artists.json'), 
      JSON.stringify({ success: true, data: artists, total: artists.length }, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'groups.json'), 
      JSON.stringify({ success: true, data: groups, total: groups.length }, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'actors.json'), 
      JSON.stringify({ success: true, data: actors, total: actors.length }, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'companies.json'), 
      JSON.stringify({ success: true, data: companies, total: companies.length }, null, 2)
    );

    // Generate statistics
    const stats = {
      totalArtists: artists.length,
      totalGroups: groups.length,
      totalActors: actors.length,
      totalCompanies: companies.length,
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'stats.json'), 
      JSON.stringify({ success: true, data: stats }, null, 2)
    );

    // Generate search index
    console.log('🔍 Creating search index...');
    const searchIndex = createSearchIndex({ artists, groups, actors, companies });
    fs.writeFileSync(
      path.join(outputDir, 'search-index.json'), 
      JSON.stringify(searchIndex, null, 2)
    );

    // Generate birthday data
    console.log('🎂 Processing birthdays...');
    const birthdayData = generateBirthdayData(artists);
    fs.writeFileSync(
      path.join(outputDir, 'birthdays.json'), 
      JSON.stringify(birthdayData, null, 2)
    );

    // Generate anniversary data
    console.log('🎉 Processing anniversaries...');
    const anniversaryData = generateAnniversaryData(groups);
    fs.writeFileSync(
      path.join(outputDir, 'anniversaries.json'), 
      JSON.stringify(anniversaryData, null, 2)
    );

    // Generate API manifest
    const manifest = {
      version: '2.0.0',
      generated: new Date().toISOString(),
      endpoints: {
        artists: '/data/artists.json',
        groups: '/data/groups.json',
        actors: '/data/actors.json',
        companies: '/data/companies.json',
        stats: '/data/stats.json',
        search: '/data/search-index.json',
        birthdays: '/data/birthdays.json',
        anniversaries: '/data/anniversaries.json'
      },
      statistics: stats
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'manifest.json'), 
      JSON.stringify(manifest, null, 2)
    );

    // Generate client-side API
    generateClientAPI();

    console.log('✅ Static files generated successfully!');
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`📊 Generated ${Object.keys(manifest.endpoints).length} data files`);
    console.log(`🎯 Total records: ${stats.totalArtists + stats.totalGroups + stats.totalActors}`);
    
  } catch (error) {
    console.error('❌ Error generating static files:', error);
    process.exit(1);
  }
}

function createSearchIndex(data) {
  const index = [];
  
  // Index artists
  data.artists.forEach(artist => {
    const searchTerms = [
      artist.StageName,
      artist.FullName,
      artist.KoreanName,
      artist.Company
    ].filter(Boolean).map(term => term.toLowerCase());

    index.push({
      id: artist.Id,
      type: 'artist',
      name: artist.StageName,
      fullName: artist.FullName,
      koreanName: artist.KoreanName,
      company: artist.Company,
      searchTerms: [...new Set(searchTerms)], // Remove duplicates
      relevanceBoost: artist.StageName ? 2 : 1 // Boost if has stage name
    });
  });

  // Index groups
  data.groups.forEach(group => {
    const searchTerms = [
      group.Name,
      group.ShortName,
      group.KoreanName,
      group.Company,
      group.FanbaseName
    ].filter(Boolean).map(term => term.toLowerCase());

    index.push({
      id: group.Id,
      type: 'group',
      name: group.Name,
      shortName: group.ShortName,
      koreanName: group.KoreanName,
      company: group.Company,
      fanbaseName: group.FanbaseName,
      searchTerms: [...new Set(searchTerms)],
      relevanceBoost: group.Name ? 2 : 1
    });
  });

  // Index actors
  data.actors.forEach(actor => {
    const searchTerms = [
      actor.StageName,
      actor.FullName,
      actor.KoreanName
    ].filter(Boolean).map(term => term.toLowerCase());

    index.push({
      id: actor.Id,
      type: 'actor',
      name: actor.StageName,
      fullName: actor.FullName,
      koreanName: actor.KoreanName,
      searchTerms: [...new Set(searchTerms)],
      relevanceBoost: actor.StageName ? 2 : 1
    });
  });

  return index;
}

function generateBirthdayData(artists) {
  const birthdayMap = {};
  
  artists.forEach(artist => {
    if (artist.DateOfBirth) {
      try {
        const date = new Date(artist.DateOfBirth);
        const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        if (!birthdayMap[monthDay]) {
          birthdayMap[monthDay] = [];
        }
        
        birthdayMap[monthDay].push({
          id: artist.Id,
          stageName: artist.StageName,
          fullName: artist.FullName,
          dateOfBirth: artist.DateOfBirth,
          company: artist.Company
        });
      } catch (error) {
        console.warn(`Invalid date for artist ${artist.Id}: ${artist.DateOfBirth}`);
      }
    }
  });

  return birthdayMap;
}

function generateAnniversaryData(groups) {
  const anniversaryMap = {};
  
  groups.forEach(group => {
    if (group.Debut) {
      try {
        const date = new Date(group.Debut);
        const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        if (!anniversaryMap[monthDay]) {
          anniversaryMap[monthDay] = [];
        }
        
        anniversaryMap[monthDay].push({
          id: group.Id,
          name: group.Name,
          debut: group.Debut,
          company: group.Company,
          yearsActive: new Date().getFullYear() - date.getFullYear()
        });
      } catch (error) {
        console.warn(`Invalid debut date for group ${group.Id}: ${group.Debut}`);
      }
    }
  });

  return anniversaryMap;
}

function generateClientAPI() {
  const clientAPICode = `/**
 * Hallyu API Client-Side Implementation
 * Provides full API functionality using static JSON files
 */
class HallyuStaticAPI {
  constructor(baseURL = './data') {
    this.baseURL = baseURL;
    this.cache = new Map();
  }

  async loadData(type) {
    if (this.cache.has(type)) {
      return this.cache.get(type);
    }

    try {
      const response = await fetch(\`\${this.baseURL}/\${type}.json\`);
      if (!response.ok) throw new Error(\`Failed to load \${type}\`);
      
      const data = await response.json();
      this.cache.set(type, data);
      return data;
    } catch (error) {
      console.error(\`Error loading \${type}:\`, error);
      return { success: false, data: [], error: error.message };
    }
  }

  async search(query, options = {}) {
    const { type = 'all', limit = 10, fuzzy = false } = options;
    
    const searchIndex = await this.loadData('search-index');
    if (!searchIndex || !Array.isArray(searchIndex)) {
      return { success: false, data: [], error: 'Search index not available' };
    }

    const queryLower = query.toLowerCase();
    let results = searchIndex.filter(item => {
      if (type !== 'all' && item.type !== type) return false;
      
      return item.searchTerms.some(term => {
        if (fuzzy) {
          return this.fuzzyMatch(term, queryLower);
        }
        return term.includes(queryLower);
      });
    });

    // Calculate relevance scores
    results = results.map(item => {
      let relevance = 0;
      
      item.searchTerms.forEach(term => {
        if (term === queryLower) relevance += 100 * item.relevanceBoost;
        else if (term.startsWith(queryLower)) relevance += 50 * item.relevanceBoost;
        else if (term.includes(queryLower)) relevance += 25 * item.relevanceBoost;
      });
      
      return { ...item, relevance };
    });

    // Sort by relevance and limit
    results.sort((a, b) => b.relevance - a.relevance);
    results = results.slice(0, limit);

    // Load full data for results
    const fullResults = await Promise.all(
      results.map(async result => {
        const data = await this.loadData(\`\${result.type}s\`);
        const fullItem = data.data.find(item => item.Id === result.id);
        return { ...fullItem, relevance: result.relevance };
      })
    );

    return {
      success: true,
      data: fullResults.filter(Boolean),
      pagination: {
        currentPage: 1,
        totalItems: fullResults.length,
        itemsPerPage: fullResults.length,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }

  fuzzyMatch(text, pattern) {
    const textLen = text.length;
    const patternLen = pattern.length;
    
    if (patternLen === 0) return true;
    if (textLen === 0) return false;
    
    let textIdx = 0;
    let patternIdx = 0;
    
    while (textIdx < textLen && patternIdx < patternLen) {
      if (text[textIdx] === pattern[patternIdx]) {
        patternIdx++;
      }
      textIdx++;
    }
    
    return patternIdx === patternLen;
  }

  async getArtist(id) {
    const artists = await this.loadData('artists');
    const artist = artists.data.find(a => a.Id === parseInt(id));
    return { success: true, data: artist || null };
  }

  async getGroup(id) {
    const groups = await this.loadData('groups');
    const group = groups.data.find(g => g.Id === parseInt(id));
    return { success: true, data: group || null };
  }

  async getActor(id) {
    const actors = await this.loadData('actors');
    const actor = actors.data.find(a => a.Id === parseInt(id));
    return { success: true, data: actor || null };
  }

  async getBirthdaysToday() {
    const birthdays = await this.loadData('birthdays');
    const today = new Date();
    const todayStr = \`\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;
    
    const todaysBirthdays = birthdays[todayStr] || [];
    return { success: true, data: todaysBirthdays };
  }

  async getAnniversariesToday() {
    const anniversaries = await this.loadData('anniversaries');
    const today = new Date();
    const todayStr = \`\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;
    
    const todaysAnniversaries = anniversaries[todayStr] || [];
    return { success: true, data: todaysAnniversaries };
  }

  async getStats() {
    return await this.loadData('stats');
  }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HallyuStaticAPI;
} else if (typeof window !== 'undefined') {
  window.HallyuStaticAPI = HallyuStaticAPI;
}`;

  fs.writeFileSync(
    path.join(outputDir, '../hallyu-static-api.js'), 
    clientAPICode
  );
}

// Run the generator
if (require.main === module) {
  generateStaticFiles();
}

module.exports = { generateStaticFiles };