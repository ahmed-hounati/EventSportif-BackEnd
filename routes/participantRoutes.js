const express = require('express');
const verifyToken = require('../middlewares/auth');
const checkRole = require('../middlewares/role');
const upload = require('../middlewares/upload');
const ParticipantController = require('../controllers/Participant.controller');


const router = express.Router();

router.post('/create', verifyToken, checkRole('Organizer'), upload, (req, res) => ParticipantController.addParticipant(req, res));
router.delete('/delete/:id', verifyToken, checkRole('Organizer'), (req, res) => ParticipantController.deleteParticipant(req, res));
router.get('/all', verifyToken, checkRole('Organizer'), (req, res) => ParticipantController.getAllParticipants(req, res));

module.exports = router;
