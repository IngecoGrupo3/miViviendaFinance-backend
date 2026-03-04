import { z } from "zod";

export const createClientSchema = z.object({
    firstName: z.string().trim().min(2),
    lastName: z.string().trim().min(2),
    dni: z.string().trim().regex(/^[0-9]{8}$/, { message: "DNI debe tener 8 dígitos" }),
    age: z.number().int().min(18, { message: "El cliente debe ser mayor de edad" }),
    email: z.string().trim().email(),
    phone: z.string().trim().min(6),
    maritalStatus: z.enum(["soltero", "casado", "divorciado", "viudo", "conviviente"], {
        message: "Estado civil inválido"
    }),
    monthlyIncome: z.number().min(0),
    incomeType: z.enum(["dependiente", "independiente", "mixto"], { message: "Tipo de ingreso inválido" }),
    dependentsCount: z.number().int().min(0).default(0),
    employmentTenureMonths: z.number().int().min(0),
    employmentStatus: z.string().trim().min(2)
}).strict();

export const updateClientSchema = createClientSchema.partial();
