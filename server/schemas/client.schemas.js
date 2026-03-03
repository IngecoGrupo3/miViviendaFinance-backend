import { z } from "zod";

export const createClientSchema = z.object({
    first_name: z.string().trim().min(2),
    last_name: z.string().trim().min(2),
    age: z.number().int().min(18, { message: "El cliente debe ser mayor de edad" }),
    email: z.string().trim().email(),
    phone: z.string().trim().optional(),
    marital_status: z.enum(["soltero", "casado", "divorciado", "viudo", "conviviente"], { message: "Estado civil inválido" }),
    monthly_income: z.number().min(0),
    income_type: z.enum(["dependiente", "independiente", "mixto"], { message: "Tipo de ingreso inválido" }),
    dependents_count: z.number().int().min(0).default(0),
    employment_tenure_months: z.number().int().min(0),
    employment_status: z.enum(["activo", "desempleado", "jubilado", "independiente"], { message: "Estado laboral inválido" })
}).strict();

export const updateClientSchema = createClientSchema.partial();