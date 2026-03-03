import { z } from "zod";

export const listUsersQuerySchema = z
    .object({
        limit: z.coerce
            .number({ message: "limit debe ser un número" })
            .int({ message: "limit debe ser un entero" })
            .min(1, { message: "limit debe ser al menos 1" })
            .max(100, { message: "limit no puede ser mayor a 100" })
            .optional(),
        offset: z.coerce
            .number({ message: "offset debe ser un número" })
            .int({ message: "offset debe ser un entero" })
            .min(0, { message: "offset no puede ser negativo" })
            .optional(),
        page: z.coerce
            .number({ message: "page debe ser un número" })
            .int({ message: "page debe ser un entero" })
            .min(1, { message: "page debe ser al menos 1" })
            .optional()
    })
    .strict();