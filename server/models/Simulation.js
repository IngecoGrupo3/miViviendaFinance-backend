import mongoose from "mongoose";

const simulationSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true
    },
    housingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Housing",
      required: true,
      index: true
    }
  },
  {
    timestamps: true,
    strict: "throw"
  }
);

const Simulation = mongoose.model("Simulation", simulationSchema);
export default Simulation;

