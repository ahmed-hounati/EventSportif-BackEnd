const express = require('express');
const verifyToken = require('../middlewares/auth');
const AuthController = require('../controllers/Auth.controller');
const checkRole = require('../middlewares/role');
const OrganizerController = require('../controllers/Organizer.controller');


const router = express.Router();

router.post('/create', verifyToken, checkRole('Organizer'), (req, res) => OrganizerController.addParticipant(req, res));

module.exports = router;
