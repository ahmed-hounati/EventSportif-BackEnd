const minio = require('../minio');
const EventDao = require("../Dao/EventDao");

class EventController {

    async getAllEvents(req, res) {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        try {
            const events = await EventDao.findAll();
            res.status(200).json({ events: events });
        } catch (error) {
            return res.status(400).json({ message: "Cannot get the events" });
        }
    }


    async getOneEvent(req, res) {
        const { id } = req.params;
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        try {
            const event = await EventDao.findById(id);
            res.status(200).json({ event: event });
        } catch (error) {
            return res.status(400).json({ message: "Cannot get the event" });
        }
    }

    async addEvent(req, res) {
        const { name, description, startDate, local } = req.body;
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        try {
            if (!req.files || !req.files.poster) {
                return res.status(400).json({ message: "image files are required" });
            }
            const poster = req.files.poster[0]
            const posterUrl = await this.uploadMoviePoster(poster, 'posters');

            const event = await EventDao.create({
                name: name,
                description: description,
                image: posterUrl,
                local: local,
                startDate: startDate
            });

            res.status(200).json({
                message: "Event created successfully", event: event
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }


    async updateEvent(req, res) {
        const { id } = req.params;
        const { name, description, startDate, status } = req.body;
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        if (!req.files || !req.files.poster) {
            return res.status(400).json({ message: "image files are required" });
        }
        const poster = req.files.poster[0]

        try {
            const posterUrl = await this.uploadMoviePoster(poster, 'posters');

            const updatedEvent = await EventDao.updateById(id, {
                name: name,
                description: description,
                image: posterUrl,
                status: status,
                startDate: startDate
            });

            res.status(200).json({
                message: "Event Updated successfully", updatedEvent: updatedEvent
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }


    async deleteEvent(req, res) {
        const { id } = req.params;
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        try {
            const eve = EventDao.findById(id);
            if (!eve) {
                res.status(400).json({ message: "event not found" });
            } else {
                await EventDao.deleteById(id);
                res.status(200).json({
                    message: "Event deleted successfully"
                });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }


    async uploadMoviePoster(file, folder) {
        const bucketName = 'sportsevent';
        const fileName = `${folder}/${file.originalname}`;

        const exists = await minio.bucketExists(bucketName);
        if (!exists) {
            await minio.makeBucket(bucketName, 'us-east-1');
        }


        await minio.fPutObject(bucketName, fileName, file.path);
        return `http://127.0.0.1:9000/${bucketName}/${fileName}`;
    }

}

module.exports = new EventController();
