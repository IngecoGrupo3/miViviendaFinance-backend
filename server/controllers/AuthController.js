import * as authService from "../services/auth.service.js";

class AuthController {
    async register(req, res, next) {
        try {
        const out = await authService.register(req.validated.body);
        res.status(201).json(out);
        } catch (e) {
        next(e);
        }
    }

    async login(req, res, next) {
        try {
            const out = await authService.login(req.validated.body);
            res.json(out);
        } catch (e) {
            next(e);
        }
    }
}

export default new AuthController();