const ParticipantController = require('../controllers/Participant.controller');
const UserDao = require('../Dao/UserDao');
const UserModel = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const { uploadMoviePoster } = require('../controllers/Event.controller');

jest.mock('../Dao/UserDao');
jest.mock('bcryptjs');
jest.mock('../controllers/Event.controller');

describe('ParticipantController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            headers: {},
            params: {},
            files: { poster: [{}] },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('addParticipant', () => {
        it('should return 401 if no token is provided', async () => {
            req.headers.authorization = undefined;

            await ParticipantController.addParticipant(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
        });

        it('should return 400 if no image file is provided', async () => {
            req.headers.authorization = 'Bearer someValidToken';
            req.files = null;

            await ParticipantController.addParticipant(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'image files are required' });
        });

        it('should return 404 if email is already used', async () => {
            req.body = { email: 'test@example.com', password: 'password', name: 'John' };
            req.headers.authorization = 'Bearer someValidToken';
            UserDao.findByEmail.mockResolvedValue({ email: 'test@example.com' });

            await ParticipantController.addParticipant(req, res);

            expect(UserDao.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'email already used' });
        });

        it('should create a  participant and return 201', async () => {

            req.body = { email: 'test@example.com', password: 'password', name: 'John' };
            req.headers.authorization = 'Bearer someValidToken';
            UserDao.findByEmail.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedPassword');
            uploadMoviePoster.mockResolvedValue('http://example.com/poster.jpg');
            UserModel.prototype.save = jest.fn().mockResolvedValue();

            await ParticipantController.addParticipant(req, res);

            expect(UserDao.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.hash).toHaveBeenCalledWith('password', 8);
            expect(uploadMoviePoster).toHaveBeenCalledWith(req.files.poster[0], 'posters');
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith('User created successfully');
        });

        it('should handle errors during participant creation', async () => {
            req.body = { email: 'test@example.com', password: 'password', name: 'John' };
            req.headers.authorization = 'Bearer someValidToken';
            UserDao.findByEmail.mockImplementation(() => {
                throw Error('Database error');
            });

            await ParticipantController.addParticipant(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
        });
    });

    describe('deleteParticipant', () => {
        it('should return 401 if no token is provided', async () => {
            req.headers.authorization = undefined;

            await ParticipantController.deleteParticipant(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
        });

        it('should return 400 if user is not found', async () => {
            req.params.id = '1';
            req.headers.authorization = 'Bearer someValidToken';
            UserDao.deleteById.mockResolvedValue(null);

            await ParticipantController.deleteParticipant(req, res);

            expect(UserDao.deleteById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'user not found' });
        });

        it('should delete the participant successfully and return 200', async () => {
            req.params.id = '1';
            req.headers.authorization = 'Bearer someValidToken';
            UserDao.deleteById.mockResolvedValue(true);

            await ParticipantController.deleteParticipant(req, res);

            expect(UserDao.deleteById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'user deleted successfully' });
        });

        it('should handle errors during participant deletion', async () => {
            req.params.id = '1';
            req.headers.authorization = 'Bearer someValidToken';
            UserDao.deleteById.mockImplementation(() => {
                throw Error('Deletion error');
            });

            await ParticipantController.deleteParticipant(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Deletion error' });
        });
    });
});
