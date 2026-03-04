import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
    {
        nombres: {
            type: String,
            required: true,
            trim: true,
            minlength: 2
        },
        apellidos: {
            type: String,
            required: true,
            trim: true,
            minlength: 2
        },
        edad: {
            type: Number,
            required: true,
            min: 18
        },
        dni: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        correo: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        telefono: {
            type: String,
            required: true,
            trim: true
        },
        estadoCivil: {
            type: String,
            required: true,
            enum: ["soltero", "casado", "divorciado", "viudo", "conviviente"]
        },
        ingresosMensuales: {
            type: Number,
            required: true,
            min: 0
        },
        tipoIngreso: {
            type: String,
            required: true,
            enum: ["dependiente", "independiente", "mixto"]
        },
        dependientes: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        antiguedadLaboral: {
            type: Number,
            required: true,
            min: 0
        },
        situacionLaboral: {
            type: String,
            required: true,
            enum: ["estable", "contrato", "independiente", "otro"]
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        assignedHousingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Housing",
            default: null
        }
    },
    {
        timestamps: true,
        strict: "throw"
    }
);

const Client = mongoose.model("Client", clientSchema);
export default Client;