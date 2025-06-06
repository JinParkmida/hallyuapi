const express = require('express');
const CompanyController = require('../../controllers/v2/companyController');

const router = express.Router();

router.get('/', CompanyController.getAllCompanies);
router.get('/:id', CompanyController.getCompanyById);

module.exports = router;