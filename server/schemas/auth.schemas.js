import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().trim().min(2),
    username: z.string().trim().min(3),
    email: z.string().trim().email(),
    password: z.string().min(8)
}).strict();

export const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1)
}).strict();