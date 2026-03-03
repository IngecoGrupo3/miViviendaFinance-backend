import mongoose from "mongoose";
import { ZodError } from "zod";

export function errorHandler(err, _req, res, _next) {
    if (err instanceof ZodError) {
        const issues = Array.isArray(err.issues)
            ? err.issues
            : Array.isArray(err.errors)
            ? err.errors
            : [];
        return res.status(400).json({
        message: "Validation error",
        details: issues.map((e) => ({
            path: Array.isArray(e.path) ? e.path.join(".") : String(e.path || ""),
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
        const mongooseErrors = err && err.errors ? Object.values(err.errors) : [];
        return res.status(400).json({
        message: "Mongoose validation error",
        details: mongooseErrors.map((e) => ({
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

    if (typeof err?.status === "number" && err.status >= 400 && err.status < 600) {
        return res.status(err.status).json({
        message: err.message || "Error",
        ...(err.details && { details: err.details })
        });
    }

    console.error(err);
    const isDev = process.env.NODE_ENV !== "production";
    return res.status(500).json({
        message: "Internal Server Error",
        ...(isDev && {
            error: {
                name: err?.name,
                message: err?.message,
                stack: err?.stack
            }
        })
    });
}