import mongoose from "mongoose";

const loanPlanOutputSchema = new mongoose.Schema(
  {
    inputId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanPlanInput",
      required: true,
      unique: true,
      index: true
    },
    payload: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true, strict: "throw" }
);

const LoanPlanOutput = mongoose.model("LoanPlanOutput", loanPlanOutputSchema);
export default LoanPlanOutput;

