import User from "../models/User.js";

export async function listUsers(params = {}) {
    const { limit: rawLimit, offset: rawOffset, page } = params;

    const limit = rawLimit ?? 30;
    let offset = rawOffset ?? 0;

    if (page != null && rawOffset == null) {
        offset = (page - 1) * limit;
    }

    const users = await User.find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();

    return users.map((u) => ({
        id: u._id.toString(),
        full_name: u.fullName,
        identity_document: u.identityDocument,
        email: u.email,
        phone: u.phone,
        created_at: u.createdAt,
        updated_at: u.updatedAt
    }));
}