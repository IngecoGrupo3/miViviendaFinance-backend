import Simulation from "../models/Simulation.js";
import Client from "../models/Client.js";
import Housing from "../models/Housing.js";

export async function getSimulationIdsById(simulationId) {
  const simulation = await Simulation.findById(simulationId).lean();
  if (!simulation) {
    const err = new Error("Simulación no encontrada");
    err.status = 404;
    throw err;
  }

  const [client, housing] = await Promise.all([
    Client.findById(simulation.clientId).select({ firstName: 1, lastName: 1 }).lean(),
    Housing.findById(simulation.housingId).select({ code: 1 }).lean()
  ]);

  return {
    simulation_id: simulation._id?.toString?.() ?? String(simulation._id),
    clientId: simulation.clientId?.toString?.() ?? String(simulation.clientId),
    housingId: simulation.housingId?.toString?.() ?? String(simulation.housingId),
    client_firstName: client?.firstName ?? null,
    client_lastName: client?.lastName ?? null,
    housing_code: housing?.code ?? null
  };
}
