import { z } from "zod";

export const registerSchema = z.object({
    full_name: z.string().trim().min(2),
    identity_document: z.string().trim().min(1),
    email: z.string().trim().email(),
    phone: z.string().trim().optional(),
    password: z.string().min(8)
}).strict();

export const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1)
}).strict();