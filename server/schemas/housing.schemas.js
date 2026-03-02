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

export const updateHousingSchema = createHousingSchema.partial();