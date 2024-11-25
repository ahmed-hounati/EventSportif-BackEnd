const bcrypt = require('bcryptjs');
const UserDao = require('../Dao/UserDao');
const UserModel = require('../models/UserModel');



class OrganizerController {

    async addParticipant(req, res) {
        const { email, password, name } = req.body;
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        try {
            const User = await UserDao.findByEmail(email);
            if (User) {
                return res.status(404).json({ message: 'email already used' });
            }
            const hashedPassword = await bcrypt.hash(password, 8);
            const newUser = new UserModel({
                name: name,
                email: email,
                password: hashedPassword,
                role: 'Participant'
            });
            await newUser.save();
            res.status(201).json('User created successfully');
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

}

module.exports = new OrganizerController();
