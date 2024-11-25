const AuthController = require('../controllers/Auth.controller');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../token/tokenBlacklist');
const UserDao = require('../Dao/UserDao');

jest.mock('../Dao/UserDao');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../token/tokenBlacklist', () => {
    const mockAdd = jest.fn();
    return {
        add: mockAdd,
    };
});

describe('AuthController', () => {
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

    describe('login', () => {
        it('should return 404 if user is not found', async () => {
            req.body = { email: 'user@example.com', password: 'password' };
            UserDao.findByEmail.mockResolvedValue(null);

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('should return 400 if password is incorrect', async () => {
            req.body = { email: 'user@example.com', password: 'wrongpassword' };
            UserDao.findByEmail.mockResolvedValue({ _id: '1', email: 'user@example.com', password: 'hashedpassword' });
            bcrypt.compare.mockResolvedValue(false);

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
        });

        it('should return 200 with token if credentials are correct', async () => {
            req.body = { email: 'user@example.com', password: 'password' };
            const mockUser = { _id: '1', email: 'user@example.com', password: 'hashedpassword', name: 'User', role: 'admin' };
            UserDao.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('jwtToken');

            await AuthController.login(req, res);

            expect(jwt.sign).toHaveBeenCalledWith(
                { id: mockUser._id, email: mockUser.email, name: mockUser.name, role: mockUser.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ token: 'jwtToken', User: mockUser });
        });

        it('should handle errors during login', async () => {
            req.body = { email: 'user@example.com', password: 'password' };
            UserDao.findByEmail.mockRejectedValue(new Error('Database error'));

            await AuthController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
        });
    });

});
