/**
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
      const response = await fetch(`${this.baseURL}/${type}.json`);
      if (!response.ok) throw new Error(`Failed to load ${type}`);
      
      const data = await response.json();
      this.cache.set(type, data);
      return data;
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
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
        const data = await this.loadData(`${result.type}s`);
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
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const todaysBirthdays = birthdays[todayStr] || [];
    return { success: true, data: todaysBirthdays };
  }

  async getAnniversariesToday() {
    const anniversaries = await this.loadData('anniversaries');
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
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
}