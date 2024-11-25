const bcrypt = require('bcryptjs');
const UserDao = require('../Dao/UserDao');
const UserModel = require('../models/UserModel');
const { uploadMoviePoster } = require('./Event.controller');



class OrganizerController {

    async addParticipant(req, res) {
        const { email, password, name } = req.body;
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        if (!req.files || !req.files.poster) {
            return res.status(400).json({ message: "image files are required" });
        }
        const poster = req.files.poster[0]
        const posterUrl = await uploadMoviePoster(poster, 'posters');
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
                role: 'Participant',
                image: posterUrl
            });
            await newUser.save();
            res.status(201).json('User created successfully');
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteParticipant(req, res) {
        const { id } = req.params;
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        try {
            const deletedParticipant = await UserDao.deleteById(id);
            if (!deletedParticipant) {
                res.status(400).json({ message: "user not found" });
            }
            return res.status(200).json({ message: 'user deleted successfully' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

}

module.exports = new OrganizerController();
