const EventModel = require("../models/EventModel");
const minio = require('../minio');



class EventController {

    async addEvent(req, res) {
        const { name, description, startDate, status } = req.body;
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

            const event = new EventModel({
                name: name,
                description: description,
                image: posterUrl,
                status: status,
                startDate: startDate
            });
            await event.save();

            res.status(200).json({
                message: "Event created successfully", event: event
            });
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
