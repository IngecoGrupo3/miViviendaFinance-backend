import mongoose from "mongoose";
import { ZodError } from "zod";

export function errorHandler(err, _req, res, _next) {
    if (err instanceof ZodError) {
        return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message
        }))
        });
    }

    if (err?.code === 11000) {
        const fields = Object.keys(err.keyValue || {});
        return res.status(409).json({
        message: "Duplicate key",
        details: fields.map((f) => ({ field: f, value: err.keyValue[f] }))
        });
    }

    if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
        message: "Mongoose validation error",
        details: Object.values(err.errors).map((e) => ({
            path: e.path,
            message: e.message
        }))
        });
    }

    if (err?.name === "StrictModeError") {
        return res.status(400).json({
        message: "Unknown fields are not allowed",
        details: [{ message: err.message }]
        });
    }

    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
}