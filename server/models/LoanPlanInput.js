import mongoose from "mongoose";

const loanPlanInputSchema = new mongoose.Schema(
  {
    simulationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: false, index: true },
    rateMode: { type: String, required: true, enum: ["CONSTANT", "VARIABLE"], index: true },
    paymentFrequency: {
      type: String,
      required: true,
      enum: ["ANNUAL", "SEMIANNUAL", "QUARTERLY", "BIMONTHLY", "MONTHLY", "BIWEEKLY", "DAILY"],
      index: true
    },
    termMonths: { type: Number, required: true },
    totalPeriods: { type: Number, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true, strict: "throw" }
);

const LoanPlanInput = mongoose.model("LoanPlanInput", loanPlanInputSchema);
export default LoanPlanInput;

