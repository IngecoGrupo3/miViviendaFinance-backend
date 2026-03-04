import Client from "../models/Client.js";

export async function createClient(userId, data) {
  const created = await Client.create({
    nombres: data.nombres,
    apellidos: data.apellidos,
    edad: data.edad,
    dni: data.dni,
    correo: data.correo,
    telefono: data.telefono,
    estadoCivil: data.estadoCivil,
    ingresosMensuales: data.ingresosMensuales,
    tipoIngreso: data.tipoIngreso,
    dependientes: data.dependientes,
    antiguedadLaboral: data.antiguedadLaboral,
    situacionLaboral: data.situacionLaboral,
    userId: userId
  });

  return created;
}

export async function listClients(userId) {
  return await Client.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function getClientById(id, userId) {
  const client = await Client.findOne({ _id: id, userId }).lean();
  if (!client) {
    const err = new Error("Cliente no encontrado o no pertenece a este usuario");
    err.status = 404;
    throw err;
  }
  return client;
}

export async function updateClient(id, userId, data) {
  const client = await Client.findOne({ _id: id, userId });
  if (!client) {
    const err = new Error("Cliente no encontrado o no pertenece a este usuario");
    err.status = 404;
    throw err;
  }

  if (data.nombres) client.nombres = data.nombres;
  if (data.apellidos) client.apellidos = data.apellidos;
  if (data.edad) client.edad = data.edad;
  if (data.dni) client.dni = data.dni;
  if (data.correo) client.correo = data.correo;
  if (data.telefono) client.telefono = data.telefono;
  if (data.estadoCivil) client.estadoCivil = data.estadoCivil;
  if (data.ingresosMensuales) client.ingresosMensuales = data.ingresosMensuales;
  if (data.tipoIngreso) client.tipoIngreso = data.tipoIngreso;
  if (data.dependientes !== undefined) client.dependientes = data.dependientes;
  if (data.antiguedadLaboral !== undefined) client.antiguedadLaboral = data.antiguedadLaboral;
  if (data.situacionLaboral) client.situacionLaboral = data.situacionLaboral;

  await client.save();
  return client;
}

export async function deleteClient(id, userId) {
  const client = await Client.findOneAndDelete({ _id: id, userId });
  if (!client) {
    const err = new Error("Cliente no encontrado o no pertenece a este usuario");
    err.status = 404;
    throw err;
  }
  return { message: "Cliente eliminado correctamente" };
}

export async function assignHousing(clientId, userId, housingId) {
  const client = await Client.findOne({ _id: clientId, userId });
  if (!client) {
    const err = new Error("Cliente no encontrado o no pertenece a este usuario");
    err.status = 404;
    throw err;
  }
  client.assignedHousingId = housingId;
  await client.save();
  return client;
}