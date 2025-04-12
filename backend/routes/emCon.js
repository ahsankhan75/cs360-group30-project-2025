const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { findHospitalByFilter } = require('../controllers/hospitalFilterController');
const { getHospitalsByNames, getHospital } = require('../controllers/hospitalController');

const router = express.Router();

// Public routes - specific routes first
router.get("/filter", findHospitalByFilter);
router.get("/names", getHospitalsByNames);

// Parameter routes last
router.get("/:id", getHospital);

module.exports = router;