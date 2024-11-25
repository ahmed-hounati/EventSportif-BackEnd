const express = require('express');
const verifyToken = require('../middlewares/auth');
const checkRole = require('../middlewares/role');
const InscriptionController = require('../controllers/Inscription.controller');


const router = express.Router();

router.post('/create/:eventId', verifyToken, checkRole('Organizer'), (req, res) => InscriptionController.addInscription(req, res));
router.post('/delete/:eventId', verifyToken, checkRole('Organizer'), (req, res) => InscriptionController.deleteInscription(req, res));

module.exports = router;
