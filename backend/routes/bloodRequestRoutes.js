const express = require('express');
const router = express.Router();
const bloodRequestController = require('../controllers/bloodRequestController');
const { getSingleBloodRequest } = require('../controllers/bloodRequestController');
const { deleteBloodRequest } = require('../controllers/bloodRequestController');
const { acceptBloodRequest } = require('../controllers/bloodRequestController');
const requireAuth = require("../middleware/requireAuth");


// Route to get all blood requests
router.get('/', bloodRequestController.getAllBloodRequests);

// Route to create a new blood request
router.post('/', bloodRequestController.createBloodRequest);

router.get('/:requestId', getSingleBloodRequest);

const { addMultipleBloodRequests } = require('../controllers/bloodRequestController');

router.post("/multiple", requireAuth, addMultipleBloodRequests);



router.delete('/:requestId', deleteBloodRequest);

router.patch('/:requestId/accept', acceptBloodRequest);

router.get("/mine", requireAuth, async (req, res) => {
    try {
      const userEmail = req.user.email;
      const requests = await BloodRequest.find({ email: userEmail });
      res.json(requests);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });



module.exports = router;