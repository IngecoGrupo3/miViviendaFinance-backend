import User from "../models/User.js";
import { hashPassword, verifyPassword } from "./password.service.js";
import { signAccessToken } from "./jwt.service.js";

export async function register(data) {
    const passwordHash = await hashPassword(data.password);

    const created = await User.create({
        name: data.name,
        username: data.username,
        email: data.email,
        passwordHash
    });

    return {
        id: created._id.toString(),
        name: created.name,
        username: created.username,
        email: created.email
    };
}

export async function login({ email, password }) {
    const user = await User.findOne({ email }).select("+passwordHash").lean();
    if (!user) {
        const err = new Error("Credenciales inválidas");
        err.status = 401;
        throw err;
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
        const err = new Error("Credenciales inválidas");
        err.status = 401;
        throw err;
    }

    const accessToken = signAccessToken({
        sub: user._id.toString()
    });

    return {
        accessToken,
        user: {
            id: user._id.toString(),
            name: user.name,
            username: user.username,
            email: user.email
        }
    };
}