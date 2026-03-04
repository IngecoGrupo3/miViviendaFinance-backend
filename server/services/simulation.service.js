import Simulation from "../models/Simulation.js";

export async function getSimulationIdsById(simulationId) {
  const simulation = await Simulation.findById(simulationId).lean();
  if (!simulation) {
    const err = new Error("Simulación no encontrada");
    err.status = 404;
    throw err;
  }

  return {
    simulation_id: simulation._id?.toString?.() ?? String(simulation._id),
    clientId: simulation.clientId?.toString?.() ?? String(simulation.clientId),
    housingId: simulation.housingId?.toString?.() ?? String(simulation.housingId)
  };
}
