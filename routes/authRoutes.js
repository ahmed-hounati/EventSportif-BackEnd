const express = require('express');
const verifyToken = require('../middlewares/auth');
const AuthController = require('../controllers/Auth.controller');


const router = express.Router();


router.post('/auth/login', (req, res) => AuthController.login(req, res));
router.post('/auth/logout', verifyToken, (req, res) => AuthController.logout(req, res));

module.exports = router;
