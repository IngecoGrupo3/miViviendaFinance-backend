import Client from "../models/Client.js";
import Housing from "../models/Housing.js";
import Simulation from "../models/Simulation.js";

function ensureClientAccess(client, userId) {
  if (!client) {
    const err = new Error("Cliente no encontrado o no pertenece a este usuario");
    err.status = 404;
    throw err;
  }

  if (client.createdBy && client.createdBy.toString() !== userId) {
    const err = new Error("Cliente no encontrado o no pertenece a este usuario");
    err.status = 404;
    throw err;
  }
}

export async function createClient(userId, data) {
  const created = await Client.create({
    firstName: data.firstName,
    lastName: data.lastName,
    dni: data.dni,
    age: data.age,
    email: data.email,
    phone: data.phone,
    maritalStatus: data.maritalStatus,
    monthlyIncome: data.monthlyIncome,
    incomeType: data.incomeType,
    dependentsCount: data.dependentsCount,
    employmentTenureMonths: data.employmentTenureMonths,
    employmentStatus: data.employmentStatus,
    createdBy: userId
  });

  return created;
}

export async function listClients() {
  return await Client.find({})
    .sort({ createdAt: -1 })
    .lean();
}

export async function getClientById(id, userId) {
  const client = await Client.findById(id).lean();
  ensureClientAccess(client, userId);
  return client;
}

export async function updateClient(id, userId, data) {
  const client = await Client.findById(id);
  ensureClientAccess(client, userId);
  if (!client.createdBy) client.createdBy = userId;

  if (data.firstName) client.firstName = data.firstName;
  if (data.lastName) client.lastName = data.lastName;
  if (data.dni) client.dni = data.dni;
  if (data.age !== undefined) client.age = data.age;
  if (data.email) client.email = data.email;
  if (data.phone) client.phone = data.phone;
  if (data.maritalStatus) client.maritalStatus = data.maritalStatus;
  if (data.monthlyIncome !== undefined) client.monthlyIncome = data.monthlyIncome;
  if (data.incomeType) client.incomeType = data.incomeType;
  if (data.dependentsCount !== undefined) client.dependentsCount = data.dependentsCount;
  if (data.employmentTenureMonths !== undefined) client.employmentTenureMonths = data.employmentTenureMonths;
  if (data.employmentStatus) client.employmentStatus = data.employmentStatus;

  await client.save();
  return client;
}

export async function deleteClient(id, userId) {
  const client = await Client.findById(id);
  ensureClientAccess(client, userId);
  await client.deleteOne();
  return { message: "Cliente eliminado correctamente" };
}

export async function assignHousing(clientId, userId, housingId) {
  const client = await Client.findById(clientId).lean();
  ensureClientAccess(client, userId);

  const housing = await Housing.findById(housingId).lean();
  if (!housing) {
    const err = new Error("Vivienda no encontrada");
    err.status = 404;
    throw err;
  }

  const created = await Simulation.create({
    clientId,
    housingId
  });

  return created;
}
