const Joi = require('joi');

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().default('name'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  filter: Joi.object().default({})
});

function validatePaginationParams(query) {
  const { error, value } = paginationSchema.validate({
    page: parseInt(query.page) || 1,
    limit: parseInt(query.limit) || 20,
    sortBy: query.sortBy || 'name',
    sortOrder: query.sortOrder || 'asc',
    filter: {
      company: query.company,
      status: query.status,
      nationality: query.nationality
    }
  });

  if (error) {
    throw new Error(error.details[0].message);
  }

  // Remove undefined values from filter
  Object.keys(value.filter).forEach(key => {
    if (value.filter[key] === undefined) {
      delete value.filter[key];
    }
  });

  return value;
}

function validateId(id) {
  const schema = Joi.number().integer().min(1).required();
  const { error, value } = schema.validate(parseInt(id));
  
  if (error) {
    throw new Error('Invalid ID parameter');
  }
  
  return value;
}

module.exports = {
  validatePaginationParams,
  validateId
};