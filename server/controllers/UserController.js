import * as userService from "../services/user.service.js";

class UserController {
    async create(req, res, next) {
        try {
        const result = await userService.createUser(req.validated.body);
        res.status(201).json(result);
        } catch (err) {
        next(err);
        }
    }

    async list(req, res, next) {
        try {
        const result = await userService.listUsers(req.validated.query);
        res.json(result);
        } catch (err) {
        next(err);
        }
    }
}

export default new UserController();