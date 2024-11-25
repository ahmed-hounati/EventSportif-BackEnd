const EventController = require('../controllers/Event.controller');
const EventDao = require('../Dao/EventDao');
const minio = require('../minio');

jest.mock('../Dao/EventDao');
jest.mock('../minio');

describe('EventController', () => {
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

    describe('addEvent', () => {
        it('should return 401 if no token is provided', async () => {
            req.headers.authorization = undefined;

            await EventController.addEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
        });

        it('should return 400 if no image file is provided', async () => {
            req.headers.authorization = 'Bearer validToken';
            req.files = {};

            await EventController.addEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'image files are required' });
        });

        it('should create a new event and return 200', async () => {
            req.headers.authorization = 'Bearer validToken';
            req.files.poster = [{ originalname: 'poster.jpg', path: '/path/to/file' }];
            req.body = { name: 'Event 1', description: 'Event 1 Description', startDate: '2024-12-01', status: 'active' };

            minio.fPutObject.mockResolvedValue(undefined);
            EventDao.create.mockResolvedValue({ ...req.body, id: '1', image: 'posterUrl' });

            await EventController.addEvent(req, res);

            expect(EventDao.create).toHaveBeenCalledWith({
                name: 'Event 1',
                description: 'Event 1 Description',
                image: 'http://127.0.0.1:9000/sportsevent/posters/poster.jpg',
                status: 'active',
                startDate: '2024-12-01'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Event created successfully',
                event: { ...req.body, id: '1', image: 'posterUrl' }
            });
        });

        it('should handle errors during event creation', async () => {
            req.headers.authorization = 'Bearer validToken';
            req.files.poster = [{ originalname: 'poster.jpg', path: '/path/to/file' }];
            req.body = { name: 'Event 1', description: 'Event 1 Description', startDate: '2024-12-01', status: 'active' };

            minio.fPutObject.mockRejectedValue(new Error('Minio error'));

            await EventController.addEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Minio error' });
        });
    });

    describe('updateEvent', () => {
        it('should return 401 if no token is provided', async () => {
            req.headers.authorization = undefined;

            await EventController.updateEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
        });

        it('should return 400 if no image file is provided', async () => {
            req.headers.authorization = 'Bearer validToken';
            req.files = {};

            await EventController.updateEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'image files are required' });
        });

        it('should update the event and return 200', async () => {
            req.headers.authorization = 'Bearer validToken';
            req.files.poster = [{ originalname: 'updatedPoster.jpg', path: '/path/to/updatedFile' }];
            req.body = { name: 'Updated Event', description: 'Updated Description', startDate: '2024-12-02', status: 'active' };
            req.params.id = '1';

            minio.fPutObject.mockResolvedValue(undefined);
            EventDao.updateById.mockResolvedValue({ ...req.body, id: '1', image: 'updatedPosterUrl' });

            await EventController.updateEvent(req, res);

            expect(EventDao.updateById).toHaveBeenCalledWith('1', {
                name: 'Updated Event',
                description: 'Updated Description',
                image: 'http://127.0.0.1:9000/sportsevent/posters/updatedPoster.jpg',
                status: 'active',
                startDate: '2024-12-02'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Event Updated successfully',
                updatedEvent: { ...req.body, id: '1', image: 'updatedPosterUrl' }
            });
        });

        it('should handle errors during event update', async () => {
            req.headers.authorization = 'Bearer validToken';
            req.files.poster = [{ originalname: 'updatedPoster.jpg', path: '/path/to/updatedFile' }];
            req.body = { name: 'Updated Event', description: 'Updated Description', startDate: '2024-12-02', status: 'active' };
            req.params.id = '1';

            minio.fPutObject.mockRejectedValue(new Error('Minio error'));

            await EventController.updateEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Minio error' });
        });
    });

    describe('deleteEvent', () => {
        it('should return 401 if no token is provided', async () => {
            req.headers.authorization = undefined;

            await EventController.deleteEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
        });


        it('should delete the event and return 200', async () => {
            req.headers.authorization = 'Bearer validToken';
            req.params.id = '1';

            const mockEvent = { id: '1', name: 'Event 1' };
            EventDao.findById.mockResolvedValue(mockEvent);
            EventDao.deleteById.mockResolvedValue(true);

            await EventController.deleteEvent(req, res);

            expect(EventDao.deleteById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Event deleted successfully'
            });
        });

    });
});
