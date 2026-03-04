import LoanPlanInput from "../models/LoanPlanInput.js";
import LoanPlanOutput from "../models/LoanPlanOutput.js";

export async function persistLoanPlanCalculation({ inputs, output, createdBy }) {
  const createdInput = await LoanPlanInput.create({
    simulationId: inputs.simulation_id,
    createdBy: createdBy || undefined,
    rateMode: inputs.rate_mode,
    paymentFrequency: inputs.payment_frequency,
    termMonths: output.term_months,
    totalPeriods: output.total_periods,
    payload: inputs
  });

  try {
    const createdOutput = await LoanPlanOutput.create({
      inputId: createdInput._id,
      payload: output
    });

    return {
      input_id: createdInput._id.toString(),
      output_id: createdOutput._id.toString()
    };
  } catch (err) {
    await LoanPlanInput.findByIdAndDelete(createdInput._id);
    throw err;
  }
}

export async function listLoanPlanInputs() {
  const items = await LoanPlanInput.find().sort({ createdAt: -1 }).lean();
  return items.map((x) => ({
    id: x._id.toString(),
    simulation_id: x.simulationId?.toString?.() ?? String(x.simulationId),
    created_by: x.createdBy?.toString?.() ?? (x.createdBy ? String(x.createdBy) : null),
    rate_mode: x.rateMode,
    payment_frequency: x.paymentFrequency,
    term_months: x.termMonths,
    total_periods: x.totalPeriods,
    created_at: x.createdAt,
    updated_at: x.updatedAt
  }));
}

export async function getLoanPlanOutputByInputId(inputId) {
  const out = await LoanPlanOutput.findOne({ inputId }).lean();
  if (!out) {
    const err = new Error("Output no encontrado para este input");
    err.status = 404;
    throw err;
  }

  return {
    output_id: out._id.toString(),
    input_id: out.inputId.toString(),
    ...out.payload
  };
}

