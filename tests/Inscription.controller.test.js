const InscriptionController = require('../controllers/Inscription.controller');
const EventDao = require('../Dao/EventDao');

jest.mock('../Dao/EventDao');

describe('InscriptionController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            headers: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('addInscription', () => {
        it('should return 401 if no token is provided', async () => {
            req.headers.authorization = undefined;

            await InscriptionController.addInscription(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
        });

        it('should return 400 if event is not found', async () => {
            req.headers.authorization = 'Bearer validToken';
            req.params.eventId = '1';
            req.body.user = 'user1';

            EventDao.findById.mockResolvedValue(null);

            await InscriptionController.addInscription(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'event not found' });
        });

        it('should return 400 if user is already inscribed', async () => {
            req.headers.authorization = 'Bearer validToken';
            req.params.eventId = '1';
            req.body.user = 'user1';

            const mockEvent = { inscriptions: ['user1'] };
            EventDao.findById.mockResolvedValue(mockEvent);

            await InscriptionController.addInscription(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User is already inscribed' });
        });

        it('should create a new inscription and return 200', async () => {
            req.headers.authorization = 'Bearer validToken';
            req.params.eventId = '1';
            req.body.user = 'user2';

            const mockEvent = { inscriptions: [] };
            EventDao.findById.mockResolvedValue(mockEvent);
            mockEvent.save = jest.fn().mockResolvedValue(mockEvent);

            await InscriptionController.addInscription(req, res);

            expect(mockEvent.inscriptions).toContain('user2');
            expect(mockEvent.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Inscription created successfully', event: mockEvent });
        });

        it('should handle errors during inscription creation', async () => {
            req.headers.authorization = 'Bearer validToken';
            req.params.eventId = '1';
            req.body.user = 'user3';

            EventDao.findById.mockRejectedValue(new Error('DB Error'));

            await InscriptionController.addInscription(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
        });
    });

    describe('deleteInscription', () => {
        it('should return 401 if no token is provided', async () => {
            req.headers.authorization = undefined;

            await InscriptionController.deleteInscription(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
        });

        it('should return 400 if event is not found', async () => {
            req.headers.authorization = 'Bearer validToken';
            req.params.eventId = '1';
            req.body.user = 'user1';

            EventDao.findById.mockResolvedValue(null);

            await InscriptionController.deleteInscription(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'event not found' });
        });

        it('should return 404 if user is not found in inscriptions', async () => {
            req.headers.authorization = 'Bearer validToken';
            req.params.eventId = '1';
            req.body.user = 'user1';

            const mockEvent = { inscriptions: ['user2'] };
            EventDao.findById.mockResolvedValue(mockEvent);

            await InscriptionController.deleteInscription(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found in inscriptions' });
        });

        it('should delete the inscription and return 200', async () => {
            req.headers.authorization = 'Bearer validToken';
            req.params.eventId = '1';
            req.body.user = 'user1';

            const mockEvent = { inscriptions: ['user1', 'user2'] };
            EventDao.findById.mockResolvedValue(mockEvent);
            mockEvent.save = jest.fn().mockResolvedValue(mockEvent);

            await InscriptionController.deleteInscription(req, res);

            expect(mockEvent.inscriptions).not.toContain('user1');
            expect(mockEvent.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Inscription deleted successfully', event: mockEvent });
        });

        it('should handle errors during inscription deletion', async () => {
            req.headers.authorization = 'Bearer validToken';
            req.params.eventId = '1';
            req.body.user = 'user1';

            EventDao.findById.mockRejectedValue(new Error('DB Error'));

            await InscriptionController.deleteInscription(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
        });
    });
});
