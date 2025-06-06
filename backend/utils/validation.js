const Joi = require('joi');

// Common validation schemas
const commonSchemas = {
  id: Joi.number().integer().positive(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('name', 'debut', 'popularity', 'recent', 'alphabetical').default('name'),
  order: Joi.string().valid('asc', 'desc').default('asc'),
  search: Joi.string().min(1).max(100),
  gender: Joi.string().valid('M', 'F', 'male', 'female'),
  country: Joi.string().min(2).max(50),
  active: Joi.boolean(),
  year: Joi.number().integer().min(1990).max(new Date().getFullYear() + 2)
};

// Idol/Artist query validation
const idolQuerySchema = Joi.object({
  page: commonSchemas.page,
  limit: commonSchemas.limit,
  sort: commonSchemas.sort,
  order: commonSchemas.order,
  search: commonSchemas.search,
  gender: commonSchemas.gender,
  country: commonSchemas.country,
  group: Joi.string().max(100),
  birthYear: commonSchemas.year,
  debutYear: commonSchemas.year,
  company: Joi.string().max(100),
  active: commonSchemas.active
});

// Group query validation
const groupQuerySchema = Joi.object({
  page: commonSchemas.page,
  limit: commonSchemas.limit,
  sort: commonSchemas.sort,
  order: commonSchemas.order,
  search: commonSchemas.search,
  type: Joi.string().valid('boyband', 'girlgroup', 'mixed', 'solo'),
  company: Joi.string().max(100),
  debutYear: commonSchemas.year,
  active: commonSchemas.active,
  memberCount: Joi.number().integer().min(1).max(50)
});

// Music Video query validation
const musicVideoQuerySchema = Joi.object({
  page: commonSchemas.page,
  limit: commonSchemas.limit,
  sort: Joi.string().valid('release', 'views', 'title', 'recent').default('recent'),
  order: commonSchemas.order,
  search: commonSchemas.search,
  artist: Joi.string().max(100),
  group: Joi.string().max(100),
  year: commonSchemas.year,
  type: Joi.string().valid('mv', 'dance_practice', 'live', 'teaser')
});

// Date range validation
const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
});

// Validation middleware
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { 
      allowUnknown: false,
      stripUnknown: true 
    });
    
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid query parameters',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.query = value;
    next();
  };
};

// ID parameter validation
const validateId = (req, res, next) => {
  const { error } = commonSchemas.id.validate(req.params.id);
  
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid ID parameter',
      details: error.details[0].message
    });
  }
  
  req.params.id = parseInt(req.params.id);
  next();
};

module.exports = {
  validateQuery,
  validateId,
  schemas: {
    idol: idolQuerySchema,
    group: groupQuerySchema,
    musicVideo: musicVideoQuerySchema,
    dateRange: dateRangeSchema
  }
};