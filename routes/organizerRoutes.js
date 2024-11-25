const express = require('express');
const verifyToken = require('../middlewares/auth');
const checkRole = require('../middlewares/role');
const OrganizerController = require('../controllers/Organizer.controller');
const upload = require('../middlewares/upload');


const router = express.Router();

router.post('/create', verifyToken, checkRole('Organizer'), upload, (req, res) => OrganizerController.addParticipant(req, res));

module.exports = router;
