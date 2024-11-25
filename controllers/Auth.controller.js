const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../token/tokenBlacklist');
const UserDao = require('../Dao/UserDao');



class AuthController {
    async login(req, res) {
        const { email, password } = req.body;
        try {
            const User = await UserDao.findByEmail(email);
            if (!User) {
                return res.status(404).json({ message: 'User not found' });
            }
            const isMatch = await bcrypt.compare(password, User.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            const token = jwt.sign(
                { id: User._id, email: User.email, name: User.name, role: User.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            res.status(200).json({ token, User });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }


    async logout(req, res) {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        tokenBlacklist.add(token);
        res.status(200).json({ message: 'Logged out successfully' });
    }


}

module.exports = new AuthController();
