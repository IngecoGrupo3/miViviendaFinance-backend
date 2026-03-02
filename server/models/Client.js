import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2
        },
        age: {
            type: Number,
            required: true,
            min: 18
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        maritalStatus: {
            type: String,
            required: true,
            enum: ["soltero", "casado", "divorciado", "viudo", "conviviente"]
        },
        monthlyIncome: {
            type: Number,
            required: true,
            min: 0
        },
        incomeType: {
            type: String,
            required: true,
            enum: ["dependiente", "independiente", "mixto"]
        },
        dependentsCount: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        employmentTenureMonths: {
            type: Number,
            required: true,
            min: 0
        },
        employmentStatus: {
            type: String,
            required: true,
            enum: ["activo", "desempleado", "jubilado", "independiente"]
        }
    },
    {
        timestamps: true,
        strict: "throw"
    }
);

const Client = mongoose.model("Client", clientSchema);
export default Client;