const fs = require('fs');
const path = require('path');
const _ = require('lodash');

class DataService {
  constructor() {
    this.data = {};
    this.loadData();
  }

  loadData() {
    try {
      // Load existing data
      this.data.groups = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/all_groups.json'), 'utf8')
      );
      this.data.artists = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/all_artists.json'), 'utf8')
      );
      this.data.actors = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/all_actors.json'), 'utf8')
      );

      // Load enhanced data if available
      this.loadEnhancedData();
      
      console.log(`Loaded ${this.data.groups.length} groups, ${this.data.artists.length} artists, ${this.data.actors.length} actors`);
    } catch (error) {
      console.error('Error loading data:', error);
      this.data = { groups: [], artists: [], actors: [], musicVideos: [], companies: [] };
    }
  }

  loadEnhancedData() {
    // Load additional data files if they exist
    const enhancedFiles = [
      'music_videos.json',
      'companies.json',
      'social_media.json',
      'news.json'
    ];

    enhancedFiles.forEach(file => {
      const filePath = path.join(__dirname, '../data', file);
      const key = file.replace('.json', '').replace('_', '');
      
      if (fs.existsSync(filePath)) {
        try {
          this.data[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
          console.warn(`Could not load ${file}:`, error.message);
          this.data[key] = [];
        }
      } else {
        this.data[key] = [];
      }
    });
  }

  // Groups methods
  getAllGroups() {
    return this.data.groups;
  }

  getGroupById(id) {
    return this.data.groups.find(group => group.Id === id);
  }

  getGroupsByCompany(company) {
    return this.data.groups.filter(group => 
      group.Company && group.Company.toLowerCase().includes(company.toLowerCase())
    );
  }

  getActiveGroups() {
    return this.data.groups.filter(group => 
      group.Active === 'Yes' || group.Active === true
    );
  }

  // Artists methods
  getAllArtists() {
    return this.data.artists;
  }

  getArtistById(id) {
    return this.data.artists.find(artist => artist.Id === id);
  }

  getArtistsByGroup(groupName) {
    return this.data.artists.filter(artist => 
      artist.Group && artist.Group.toLowerCase().includes(groupName.toLowerCase())
    );
  }

  getArtistsByGender(gender) {
    const genderMap = { 'male': 'M', 'female': 'F', 'M': 'M', 'F': 'F' };
    const targetGender = genderMap[gender.toLowerCase()];
    return this.data.artists.filter(artist => artist.Gender === targetGender);
  }

  getArtistsByCountry(country) {
    return this.data.artists.filter(artist => 
      artist.Country && artist.Country.toLowerCase().includes(country.toLowerCase())
    );
  }

  // Actors methods
  getAllActors() {
    return this.data.actors;
  }

  getActorById(id) {
    return this.data.actors.find(actor => actor.Id === id);
  }

  // Music Videos methods
  getAllMusicVideos() {
    return this.data.musicvideos || [];
  }

  getMusicVideoById(id) {
    return (this.data.musicvideos || []).find(mv => mv.Id === id);
  }

  // Companies methods
  getAllCompanies() {
    // Extract unique companies from groups and artists
    const groupCompanies = this.data.groups
      .map(group => group.Company)
      .filter(company => company && company.trim());
    
    const artistCompanies = this.data.artists
      .map(artist => artist.Company)
      .filter(company => company && company.trim());
    
    const allCompanies = [...new Set([...groupCompanies, ...artistCompanies])];
    
    return allCompanies.map((company, index) => ({
      Id: index + 1,
      Name: company,
      Groups: this.getGroupsByCompany(company),
      Artists: this.data.artists.filter(artist => 
        artist.Company && artist.Company.toLowerCase() === company.toLowerCase()
      )
    }));
  }

  getCompanyByName(name) {
    const companies = this.getAllCompanies();
    return companies.find(company => 
      company.Name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Statistics methods
  getGroupStats() {
    const groups = this.data.groups;
    return {
      total: groups.length,
      active: groups.filter(g => g.Active === 'Yes').length,
      inactive: groups.filter(g => g.Active === 'No').length,
      byCompany: _.countBy(groups, 'Company'),
      byDebutYear: _.countBy(groups, g => new Date(g.Debut).getFullYear()),
      averageMemberCount: _.meanBy(groups, 'CurrentMemberCount')
    };
  }

  getArtistStats() {
    const artists = this.data.artists;
    return {
      total: artists.length,
      male: artists.filter(a => a.Gender === 'M').length,
      female: artists.filter(a => a.Gender === 'F').length,
      byCountry: _.countBy(artists, 'Country'),
      byBirthYear: _.countBy(artists, a => new Date(a.DateOfBirth).getFullYear()),
      byGroup: _.countBy(artists, 'Group')
    };
  }

  // Search methods
  globalSearch(query) {
    const results = {
      groups: [],
      artists: [],
      actors: [],
      musicVideos: []
    };

    const searchTerm = query.toLowerCase();

    // Search groups
    results.groups = this.data.groups.filter(group =>
      group.Name.toLowerCase().includes(searchTerm) ||
      group.KoreanName.toLowerCase().includes(searchTerm) ||
      (group.ShortName && group.ShortName.toLowerCase().includes(searchTerm))
    );

    // Search artists
    results.artists = this.data.artists.filter(artist =>
      artist.StageName.toLowerCase().includes(searchTerm) ||
      artist.FullName.toLowerCase().includes(searchTerm) ||
      artist.KoreanName.toLowerCase().includes(searchTerm) ||
      (artist.Group && artist.Group.toLowerCase().includes(searchTerm))
    );

    // Search actors
    results.actors = this.data.actors.filter(actor =>
      actor.FullName.toLowerCase().includes(searchTerm) ||
      actor.KoreanName.toLowerCase().includes(searchTerm)
    );

    // Search music videos if available
    if (this.data.musicvideos) {
      results.musicVideos = this.data.musicvideos.filter(mv =>
        mv.Title.toLowerCase().includes(searchTerm) ||
        mv.Artist.toLowerCase().includes(searchTerm)
      );
    }

    return results;
  }

  // Utility methods
  refreshData() {
    this.loadData();
  }

  getDataSummary() {
    return {
      groups: this.data.groups.length,
      artists: this.data.artists.length,
      actors: this.data.actors.length,
      musicVideos: (this.data.musicvideos || []).length,
      companies: this.getAllCompanies().length,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Singleton instance
const dataService = new DataService();

module.exports = dataService;