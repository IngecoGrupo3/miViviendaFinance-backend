import User from "../models/User.js";

export async function createUser(data) {
    const created = await User.create(data);

    return {
        id: created._id.toString(),
        name: created.name,
        username: created.username,
        email: created.email,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt
    };
}

export async function listUsers({ limit = 30, offset = 0 } = {}) {
    const users = await User.find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();

    return users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        username: u.username,
        email: u.email,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
    }));
}