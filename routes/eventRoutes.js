const express = require('express');
const verifyToken = require('../middlewares/auth');
const checkRole = require('../middlewares/role');
const EventController = require('../controllers/Event.controller');
const upload = require('../middlewares/upload');


const router = express.Router();

router.post('/create', verifyToken, checkRole('Organizer'), upload, (req, res) => EventController.addEvent(req, res));
router.put('/update/:id', verifyToken, checkRole('Organizer'), upload, (req, res) => EventController.updateEvent(req, res));
router.delete('/delete/:id', verifyToken, checkRole('Organizer'), (req, res) => EventController.deleteEvent(req, res));

module.exports = router;
