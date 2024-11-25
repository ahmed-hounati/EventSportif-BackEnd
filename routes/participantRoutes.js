const express = require('express');
const verifyToken = require('../middlewares/auth');
const checkRole = require('../middlewares/role');
const OrganizerController = require('../controllers/Organizer.controller');
const upload = require('../middlewares/upload');


const router = express.Router();

router.post('/create', verifyToken, checkRole('Organizer'), upload, (req, res) => OrganizerController.addParticipant(req, res));
router.delete('/delete/:id', verifyToken, checkRole('Organizer'), (req, res) => OrganizerController.deleteParticipant(req, res));

module.exports = router;
