const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { findHospitalByFilter } = require('../controllers/hospitalFilterController')
const { getAllHospitalNames } = require('../controllers/reviewController')

const router = express.Router()

// require auth for all emcon routes
// router.use(requireAuth) //necessary for all routes or it will be possible to make changes without authorization

router.get("/filter", findHospitalByFilter);
router.get("/names", getAllHospitalNames);

module.exports = router