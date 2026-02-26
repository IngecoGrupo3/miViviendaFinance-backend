import { z } from "zod";

export const createUserSchema = z
    .object({
        name: z.string().trim().min(2),
        username: z.string().trim().min(3),
        email: z.string().trim().email()
    })
    .strict();

export const listUsersQuerySchema = z
    .object({
        limit: z.coerce.number().int().min(1).max(100).optional(),
        offset: z.coerce.number().int().min(0).optional(),
        page: z.coerce.number().int().min(1).optional()
    })
    .strict();