# ✨ Hallyu API v2.0

The comprehensive K-pop database API based on [dbkpop.com](https://dbkpop.com/) data. This API provides extensive information about K-pop idols, groups, companies, and entertainment industry statistics with advanced search, filtering, and analytics capabilities.

## 🚀 What's New in v2.0

- **Complete API Redesign**: Built from the ground up with modern REST principles
- **Advanced Search & Filtering**: Multi-field search with relevance scoring and fuzzy matching
- **Comprehensive Statistics**: Detailed analytics and demographic insights
- **Real-time Features**: Upcoming birthdays, anniversaries, and trending content
- **Company Data**: Entertainment company profiles with artist/group relationships
- **Enhanced Documentation**: Interactive Swagger/OpenAPI documentation
- **Performance Optimized**: Pagination, caching, and rate limiting
- **Security Features**: Helmet.js security headers and input validation

## 📊 Data Overview

- **1,428 K-pop Idols/Artists** with detailed profiles
- **352 K-pop Groups** with member relationships
- **310 Korean Actors** from the entertainment industry
- **232 Entertainment Companies** with comprehensive data
- **Music Videos** with metadata and statistics
- **Real-time Events** tracking birthdays and anniversaries

## 🔗 Quick Start

### Base URL
```
https://work-1-lgtbczawlfwgsakw.prod-runtime.all-hands.dev/api/v2
```

### Example Requests

```bash
# Get API information
curl "https://work-1-lgtbczawlfwgsakw.prod-runtime.all-hands.dev/api/v2"

# Search for BTS
curl "https://work-1-lgtbczawlfwgsakw.prod-runtime.all-hands.dev/api/v2/search/global?q=BTS"

# Get female idols from SM Entertainment
curl "https://work-1-lgtbczawlfwgsakw.prod-runtime.all-hands.dev/api/v2/idols?gender=F&company=SM"

# Get upcoming birthdays
curl "https://work-1-lgtbczawlfwgsakw.prod-runtime.all-hands.dev/api/v2/idols/birthdays?days=7"

# Get group statistics
curl "https://work-1-lgtbczawlfwgsakw.prod-runtime.all-hands.dev/api/v2/stats/overview"
```

## 📚 API Documentation

Interactive documentation is available at:
```
https://work-1-lgtbczawlfwgsakw.prod-runtime.all-hands.dev/api/docs
```

## 🎯 Core Endpoints

### Idols/Artists
- `GET /api/v2/idols` - List all idols with filtering
- `GET /api/v2/idols/{id}` - Get idol details
- `GET /api/v2/idols/search` - Search idols
- `GET /api/v2/idols/birthdays` - Upcoming birthdays
- `GET /api/v2/idols/trending` - Trending idols
- `GET /api/v2/idols/gender/{gender}` - Filter by gender

### Groups
- `GET /api/v2/groups` - List all groups with filtering
- `GET /api/v2/groups/{id}` - Get group details
- `GET /api/v2/groups/{id}/members` - Get group members
- `GET /api/v2/groups/search` - Search groups
- `GET /api/v2/groups/anniversaries` - Upcoming anniversaries
- `GET /api/v2/groups/type/{type}` - Filter by type (boyband/girlgroup)

### Companies
- `GET /api/v2/companies` - List all companies
- `GET /api/v2/companies/{name}` - Get company details
- `GET /api/v2/companies/{name}/artists` - Company artists
- `GET /api/v2/companies/{name}/groups` - Company groups

### Statistics
- `GET /api/v2/stats/overview` - General statistics
- `GET /api/v2/stats/demographics` - Demographic breakdowns
- `GET /api/v2/stats/trends` - Industry trends

### Search
- `GET /api/v2/search/global` - Global search across all entities
- `GET /api/v2/search/suggestions` - Search suggestions
- `GET /api/v2/search/advanced` - Advanced search with filters

## 🔍 Advanced Features

### Filtering & Pagination
All list endpoints support:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field (varies by endpoint)
- `order` - Sort order (asc/desc)
- `search` - Text search across relevant fields

### Search Capabilities
- **Fuzzy Matching**: Handles typos and variations
- **Relevance Scoring**: Results ranked by relevance
- **Multi-field Search**: Searches across names, companies, etc.
- **Auto-suggestions**: Real-time search suggestions

### Real-time Data
- **Upcoming Birthdays**: Next 30 days by default
- **Group Anniversaries**: Debut date tracking
- **Age Calculations**: Dynamic age computation
- **Activity Status**: Active/inactive group tracking

## 📈 Response Format

All API responses follow a consistent format:

```json
{
  "status": "success",
  "timestamp": "2025-06-06T03:54:06.734Z",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 200,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🛡️ Rate Limiting & Security

- **Rate Limit**: 1000 requests per 15 minutes per IP
- **Security Headers**: Helmet.js protection
- **Input Validation**: Joi schema validation
- **CORS Enabled**: Cross-origin requests supported

## 🏥 Health & Monitoring

- `GET /health` - API health status
- `GET /api/v2/health` - Detailed health check

## 🔄 Migration from v1

The v1 API remains available for backward compatibility:
- v1 endpoints: `/api/v1/*`
- v2 endpoints: `/api/v2/*` (recommended)

Key differences:
- Enhanced data structure with calculated fields
- Consistent response format
- Advanced filtering and search
- Comprehensive error handling

## 🎨 Example Use Cases

### Find all female idols from JYP Entertainment
```bash
curl "https://work-1-lgtbczawlfwgsakw.prod-runtime.all-hands.dev/api/v2/idols?gender=F&company=JYP&limit=10"
```

### Get BTS member details
```bash
curl "https://work-1-lgtbczawlfwgsakw.prod-runtime.all-hands.dev/api/v2/search/global?q=BTS&type=artist"
```

### Find groups debuting in 2020
```bash
curl "https://work-1-lgtbczawlfwgsakw.prod-runtime.all-hands.dev/api/v2/groups?debutYear=2020"
```

### Get upcoming K-pop birthdays this week
```bash
curl "https://work-1-lgtbczawlfwgsakw.prod-runtime.all-hands.dev/api/v2/idols/birthdays?days=7"
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](Contributing.md) for details.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Credits

- Data sourced from [dbkpop.com](https://dbkpop.com/)
- Built with Express.js, Node.js, and modern web technologies
- API documentation powered by Swagger/OpenAPI

## 📞 Support

- 📧 Email: contact@hallyuapi.com
- 🐛 Issues: [GitHub Issues](https://github.com/JinParkmida/hallyuapi/issues)
- 📖 Documentation: [API Docs](https://work-1-lgtbczawlfwgsakw.prod-runtime.all-hands.dev/api/docs)

---

**Made with ❤️ for the K-pop community**
