const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { findHospitalByFilter } = require('../controllers/hospitalFilterController')
const { getAllHospitalNames } = require('../controllers/reviewController')
const { getHospitalDetails } = require('../controllers/hospitalController')

const router = express.Router()

// Public routes
router.get("/filter", findHospitalByFilter);
router.get("/names", getAllHospitalNames);
router.get("/:id", getHospitalDetails);

// Protected routes
// Add any routes that need authentication here
// router.post("/...", requireAuth, ...);

module.exports = router