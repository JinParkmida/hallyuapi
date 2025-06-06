# Hallyu API v2.0 🌟

> The most comprehensive K-pop database API, providing access to extensive Korean Wave data including artists, groups, actors, and entertainment companies.

[![API Version](https://img.shields.io/badge/API-v2.0-blue.svg)](https://github.com/JinParkmida/hallyuapi)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Data Source](https://img.shields.io/badge/data-dbkpop.com-purple.svg)](https://dbkpop.com/)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/JinParkmida/hallyuapi.git
cd hallyuapi/backend

# Install dependencies
npm install

# Start the server
npm start

# Access API documentation
open http://localhost:12000/api/docs
```

## 📊 Database Overview

Our API provides access to:

- **1,428 K-pop Artists** with detailed profiles and birthday tracking
- **352 K-pop Groups** with debut anniversaries and member information  
- **310 Korean Actors** with comprehensive career data
- **Real-time Features** for birthdays and special events
- **Advanced Search** with fuzzy matching and relevance scoring

## 🔗 API Endpoints

### Base URL
```
/api/v2
```

### 🎤 Artists Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v2/artists` | Get all artists with pagination and filtering |
| `GET` | `/api/v2/artists/{id}` | Get specific artist by ID |
| `GET` | `/api/v2/artists/birthdays/today` | Get artists celebrating birthdays today |
| `GET` | `/api/v2/artists/birthdays/upcoming` | Get upcoming artist birthdays |

### 🎵 Groups Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v2/groups` | Get all groups with pagination and filtering |
| `GET` | `/api/v2/groups/{id}` | Get specific group by ID |
| `GET` | `/api/v2/groups/anniversaries/today` | Get groups celebrating debut anniversaries today |

### 🎬 Actors Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v2/actors` | Get all actors with pagination and filtering |
| `GET` | `/api/v2/actors/{id}` | Get specific actor by ID |

### 🏢 Companies Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v2/companies` | Get all companies with pagination and filtering |
| `GET` | `/api/v2/companies/{id}` | Get specific company by ID |

### 🔍 Search Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v2/search` | Advanced search across all data types |
| `GET` | `/api/v2/search/suggestions` | Get search suggestions based on partial query |

### 📊 Statistics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v2/stats/overview` | Get overall database statistics |
| `GET` | `/api/v2/stats/companies` | Get company statistics ranked by talent count |

## 💡 Usage Examples

### Basic Artist Search

```javascript
// Search for BTS
fetch('/api/v2/search?q=BTS')
  .then(response => response.json())
  .then(data => {
    console.log(data.results);
  });
```

### Get Artists with Birthdays Today

```javascript
// Get today's birthday celebrants
fetch('/api/v2/artists/birthdays/today')
  .then(response => response.json())
  .then(data => {
    console.log(`${data.data.length} artists celebrating birthdays today!`);
  });
```

### Advanced Search with Filtering

```bash
# Search for female artists from specific groups
curl "https://your-api-url/api/v2/search?q=IU&type=artists&limit=10&fuzzy=true"
```

### Get Group Information

```javascript
// Get detailed group information
fetch('/api/v2/groups/1466') // BTS ID
  .then(response => response.json())
  .then(data => {
    console.log(`${data.data.Name} debuted on ${data.data.Debut}`);
  });
```

## 📋 Response Format

All API responses follow a consistent structure:

```json
{
  "success": true,
  "data": [
    {
      "Id": 1466,
      "Name": "BTS",
      "ShortName": "Bangtan Boys",
      "KoreanName": "방탄소년단",
      "Debut": "2013-06-13",
      "Company": "Big Hit",
      "CurrentMemberCount": 7,
      "OriginalMemberCount": 7,
      "FanbaseName": "ARMY",
      "Active": "Yes"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 71,
    "totalItems": 352,
    "itemsPerPage": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🔍 Search Features

### Basic Search
```bash
curl "/api/v2/search?q=BLACKPINK"
```

### Search by Type
```bash
# Search only artists
curl "/api/v2/search?q=IU&type=artists"

# Search only groups  
curl "/api/v2/search?q=TWICE&type=groups"

# Search only actors
curl "/api/v2/search?q=Park&type=actors"
```

### Fuzzy Search
```bash
# Enable fuzzy matching for typos
curl "/api/v2/search?q=Blakpink&fuzzy=true"
```

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** v14.0.0 or higher
- **npm** v6.0.0 or higher

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/JinParkmida/hallyuapi.git
   cd hallyuapi/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Access the API**
   - API Base URL: `http://localhost:12000/api/v2`
   - Interactive Documentation: `http://localhost:12000/api/docs`

### Environment Configuration

The API includes several configurable features:

- **Port**: Default `12000` (configurable via `PORT` environment variable)
- **Rate Limiting**: 100 requests per 15 minutes per IP address
- **CORS**: Enabled for all origins in development
- **Security**: Helmet.js security headers enabled

## 📚 Interactive Documentation

Access the full interactive API documentation with live testing capabilities:

**Local**: [http://localhost:12000/api/docs](http://localhost:12000/api/docs)

The Swagger UI documentation includes:
- Complete endpoint documentation
- Request/response examples
- Live API testing interface
- Schema definitions
- Authentication details

## 🔐 Security & Rate Limiting

### Security Features

- **Rate Limiting**: 100 requests per 15-minute window per IP
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Joi-based request validation
- **Security Headers**: Helmet.js for security headers
- **Error Handling**: Comprehensive error responses

### Rate Limiting Details

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## 🎯 Real-time Features

### Birthday Tracking

Get artists celebrating birthdays today:

```javascript
fetch('/api/v2/artists/birthdays/today')
  .then(response => response.json())
  .then(data => {
    data.data.forEach(artist => {
      console.log(`🎂 ${artist.StageName} (${artist.FullName}) is celebrating today!`);
    });
  });
```

### Anniversary Tracking

Get groups celebrating debut anniversaries:

```javascript
fetch('/api/v2/groups/anniversaries/today')
  .then(response => response.json())
  .then(data => {
    data.data.forEach(group => {
      const years = new Date().getFullYear() - new Date(group.Debut).getFullYear();
      console.log(`🎉 ${group.Name} is celebrating ${years} years since debut!`);
    });
  });
```

## 📊 Statistics & Analytics

### Database Overview

```javascript
fetch('/api/v2/stats/overview')
  .then(response => response.json())
  .then(stats => {
    console.log(`Database contains:
    - ${stats.data.totalArtists} artists
    - ${stats.data.totalGroups} groups  
    - ${stats.data.totalActors} actors
    - Last updated: ${stats.data.lastUpdated}`);
  });
```

### Company Statistics

```javascript
fetch('/api/v2/stats/companies')
  .then(response => response.json())
  .then(data => {
    console.log('Top entertainment companies by talent count:', data.data);
  });
```

## 🤝 Contributing

We welcome contributions from the K-pop community! Please read our [Contributing Guide](Contributing.md) for details on:

- Code of conduct
- Development process
- Pull request guidelines
- Issue reporting

### Quick Contribution Steps

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests if applicable**
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

## 🐛 Error Handling

The API uses standard HTTP status codes and provides detailed error messages:

### Success Responses
- `200 OK` - Request successful
- `201 Created` - Resource created successfully

### Error Responses
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "success": false,
  "error": "Resource not found",
  "code": 404,
  "timestamp": "2025-06-06T04:30:00.000Z"
}
```

## 📈 Performance & Caching

- **Response Times**: Average < 100ms for most endpoints
- **Pagination**: Efficient pagination for large datasets
- **Search Optimization**: Indexed search with relevance scoring
- **Memory Usage**: Optimized data structures for fast access

## 🔮 Roadmap

### Upcoming Features

#### v2.1 (Next Release)
- [ ] User authentication and personal favorites
- [ ] Advanced filtering options
- [ ] Bulk data export functionality
- [ ] Webhook notifications for new data

#### v2.2 (Future)
- [ ] GraphQL endpoint
- [ ] Real-time WebSocket connections
- [ ] Mobile SDK (iOS/Android)
- [ ] Advanced analytics dashboard

#### v3.0 (Long-term)
- [ ] Machine learning recommendations
- [ ] Social media integration
- [ ] Chart performance data
- [ ] Concert and event information

### Data Enhancements
- [ ] Company relationship mapping
- [ ] Social media profiles integration
- [ ] Music streaming data
- [ ] Award and achievement tracking

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Data Source**: [dbkpop.com](https://dbkpop.com/) for providing comprehensive K-pop data
- **Community**: The amazing K-pop fan community for inspiration and feedback
- **Contributors**: All developers who have contributed to this project

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/JinParkmida/hallyuapi/issues)
- **Twitter**: [@_elletownsend](https://twitter.com/_elletownsend)
- **Email**: Contact us through GitHub for technical support

## 🌟 Show Your Support

If this API helps your project, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 🤝 Contributing code improvements
- 📢 Sharing with the K-pop developer community

---

**Made with ❤️ for the global K-pop community**

*Bringing Korean Wave data to developers worldwide* 🌊