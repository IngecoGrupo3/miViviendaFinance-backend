import mongoose from "mongoose";

const housingSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true
    },

    area: {
      type: Number,
      required: true,
      min: 0
    },

    bedrooms: {
      type: Number,
      required: true,
      min: 0
    },

    bathrooms: {
      type: Number,
      required: true,
      min: 0
    },

    parkingSpaces: {
      type: Number,
      required: true,
      min: 0
    },

    floors: {
      type: Number,
      required: true,
      min: 1
    },

    priceInSoles: {
      type: Number,
      required: true,
      min: 0
    },

    priceInDollars: {
      type: Number,
      required: true,
      min: 0
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10
    },

    realEstateProject: {
      type: String,
      required: true,
      trim: true
    },

    propertyType: {
      type: String,
      required: true,
      enum: ["Departamento", "Casa", "Dúplex", "Minidepartamento"]
    },

    department: {
      type: String,
      required: true,
      trim: true
    },

    province: {
      type: String,
      required: true,
      trim: true
    },

    district: {
      type: String,
      required: true,
      trim: true
    },

    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 5
    },

    imageUrl: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: ["Disponible", "Reservado", "Vendido"],
      default: "Disponible"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true,
    strict: "throw",
    versionKey: false
  }
);

housingSchema.index({ code: 1 }, { unique: true });

const Housing = mongoose.model("Housing", housingSchema);

export default Housing;