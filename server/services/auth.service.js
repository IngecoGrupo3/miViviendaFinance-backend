import User from "../models/User.js";
import { hashPassword, verifyPassword } from "./password.service.js";
import { signAccessToken } from "./jwt.service.js";

export async function register(data) {
    const passwordHash = await hashPassword(data.password);

    const created = await User.create({
        fullName: data.full_name,
        identityDocument: data.identity_document,
        email: data.email,
        phone: data.phone,
        passwordHash
    });

    return {
        id: created._id.toString(),
        full_name: created.fullName,
        identity_document: created.identityDocument,
        email: created.email,
        phone: created.phone
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
            full_name: user.fullName,
            identity_document: user.identityDocument,
            email: user.email,
            phone: user.phone
        }
    };
}