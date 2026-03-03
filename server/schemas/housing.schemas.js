import { z } from "zod";

export const createHousingSchema = z.object({
  area: z.number().min(0),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  parkingSpaces: z.number().int().min(0),
  floors: z.number().int().min(1),
  priceInSoles: z.number().min(0),
  priceInDollars: z.number().min(0),
  description: z.string().trim().min(10),
  realEstateProject: z.string().trim().min(2),
  propertyType: z.enum([
    "Departamento",
    "Casa",
    "Dúplex",
    "Minidepartamento"
  ]),
  department: z.string().trim().min(2),
  province: z.string().trim().min(2),
  district: z.string().trim().min(2),
  address: z.string().trim().min(5),
  imageUrl: z.string().url()
}).strict();

export const updateHousingSchema = z.object({
  propertyType: z.enum(["Departamento", "Casa", "Dúplex", "Minidepartamento"]).optional(),
  department: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  area: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  parkingSpaces: z.number().optional(),
  floors: z.number().optional(),
  priceInSoles: z.number().optional(),
  priceInDollars: z.number().optional(),
  realEstateProject: z.string().optional(),
  address: z.string().optional(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["Disponible", "Reservado", "Vendido"]).optional()
}).strict();