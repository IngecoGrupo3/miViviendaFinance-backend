import { verifyAccessToken } from "../services/jwt.service.js";

export function requireAuth(req, _res, next) {
    try {
        const header = req.headers.authorization || "";
        const [type, token] = header.split(" ");

        if (type !== "Bearer" || !token) {
        const err = new Error("Token requerido");
        err.status = 401;
        throw err;
        }

        const payload = verifyAccessToken(token);
        req.auth = payload;

        next();
    } catch (err) {
        err.status = 401;
        next(err);
    }
}