import { z } from "zod";

export const createClientSchema = z.object({
    nombres: z.string().trim().min(2),
    apellidos: z.string().trim().min(2),
    edad: z.number().int().min(18, { message: "El cliente debe ser mayor de edad" }),
    dni: z.string().trim().min(8),
    correo: z.string().trim().email(),
    telefono: z.string().trim(),
    estadoCivil: z.enum(["soltero", "casado", "divorciado", "viudo", "conviviente"], { message: "Estado civil inválido" }),
    ingresosMensuales: z.number().min(0),
    tipoIngreso: z.enum(["dependiente", "independiente", "mixto"], { message: "Tipo de ingreso inválido" }),
    dependientes: z.number().int().min(0).default(0),
    antiguedadLaboral: z.number().int().min(0),
    situacionLaboral: z.enum(["estable", "contrato", "independiente", "otro"], { message: "Estado laboral inválido" })
}).strict();

export const updateClientSchema = createClientSchema.partial();