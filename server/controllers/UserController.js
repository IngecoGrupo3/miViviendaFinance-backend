import * as userService from "../services/user.service.js";

class UserController {

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