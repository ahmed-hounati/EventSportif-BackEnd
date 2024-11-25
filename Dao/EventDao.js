const Event = require('../models/EventModel');

class EventDAO {
    async findAll() {
        try {
            return await Event.find();
        } catch (error) {
            throw new Error('Error fetching Events');
        }
    }

    async findById(id) {
        try {
            return await Event.findById(id);
        } catch (error) {
            throw new Error('Error finding Event');
        }
    }

    async create(EventData) {
        try {
            const newEvent = new Event(EventData);
            return await newEvent.save();
        } catch (error) {
            throw new Error('Error creating Event');
        }
    }

    async updateById(id, updateData) {
        try {
            return await Event.findByIdAndUpdate(id, updateData, { new: true });
        } catch (error) {
            throw new Error('Error updating Event');
        }
    }

    async deleteById(id) {
        try {
            return await Event.findByIdAndDelete(id);
        } catch (error) {
            throw new Error('Error deleting Event');
        }
    }
}

module.exports = new EventDAO();