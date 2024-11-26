const EventDao = require("../Dao/EventDao");
const UserDao = require("../Dao/UserDao");



class InscriptionController {


    async getAllInscription(req, res) {
        const { eventId } = req.params;
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        try {
            let users = [];
            const event = await EventDao.findById(eventId);
            const ids = event.inscriptions;
            for (const id of ids) {
                const user = await UserDao.findById(id);
                users.push(user);
            }
            res.status(200).json({ Inscriptions: users });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async addInscription(req, res) {
        const { eventId } = req.params;
        const { user } = req.body;
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        try {
            const event = await EventDao.findById(eventId);
            if (!event) {
                res.status(400).json({ message: "event not found" });
            }
            const inscriptions = event.inscriptions;

            const isAlreadyInscribed = inscriptions.some(
                inscription => inscription == user
            );

            if (isAlreadyInscribed) {
                return res.status(400).json({ message: "User is already inscribed" });
            }
            inscriptions.push(user);
            await event.save();

            res.status(200).json({
                message: "Inscription created successfully", event: event
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }


    async deleteInscription(req, res) {
        const { eventId } = req.params;
        const { user } = req.body;
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        try {
            const event = await EventDao.findById(eventId);
            if (!event) {
                res.status(400).json({ message: "event not found" });
            }
            const userExists = event.inscriptions.includes(user);
            if (!userExists) {
                return res.status(404).json({ message: "User not found in inscriptions" });
            }
            event.inscriptions = event.inscriptions.filter(inscription => inscription != user);
            await event.save();

            res.status(200).json({
                message: "Inscription deleted successfully", event: event
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

}

module.exports = new InscriptionController();
