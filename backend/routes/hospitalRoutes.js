const express = require('express');
const {
  getHospitals,
  getHospital,
  filterHospitals,
  getHospitalsByNames
} = require('../controllers/hospitalController');

const router = express.Router();

// GET all hospitals
router.get('/', getHospitals);

// GET hospitals by names (for dropdown)
router.get('/names', getHospitalsByNames);

// GET filtered hospitals
router.get('/filter', filterHospitals);

// GET single hospital
router.get('/:id', getHospital);

module.exports = router;