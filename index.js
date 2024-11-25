const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Organizer = require('./models/UserModel')
const authRoutes = require('./routes/authRoutes');
const organizerRoutes = require('./routes/organizerRoutes');
require('dotenv').config();
const app = express();
app.use(express.json());


mongoose.connect(process.env.MONGO_URI, {})
    .then(() => {
        console.log('Connected to MongoDB');
        initializeOrganizer();
    }).catch(
        (err) => console.error('Error connecting to MongoDB:', err)
    );



app.use('/api/auth', authRoutes);
app.use('/api/organizer', organizerRoutes);



async function initializeOrganizer() {
    try {
        const organizer = await Organizer.findOne({ email: process.env.EMAIL });
        if (!organizer) {
            const hashedPassword = bcrypt.hash(process.env.PASSWORD, 8);

            const newOrganizer = new Organizer({
                name: process.env.NAME,
                email: process.env.EMAIL,
                password: hashedPassword,
                role: 'Organizer'
            });
            await newOrganizer.save();
            console.log('Organizer created successfully');
        } else {
        }
    } catch (error) {
        console.error('Error initializing Organizer:', error);
    }
}

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});