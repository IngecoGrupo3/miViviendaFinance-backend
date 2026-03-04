import Housing from "../models/Housing.js";
import mongoose from "mongoose";

/**
 * CREATE
 */
export async function createHousing(data, userId) {
  // Agregar el userId al crear
  data.createdBy = userId;
  
  // Crear instancia primero para obtener _id
  const housing = new Housing(data);

  // Generar parte única usando ObjectId
  const uniquePart = housing._id.toString().slice(-5).toUpperCase();

  // Primera letra del tipo
  const typeInitial = data.propertyType[0].toUpperCase();

  // Construcción del código
  housing.code = `${typeInitial}${data.bedrooms}${data.floors}${uniquePart}`;

  await housing.save();

  return housing;
}

/**
 * LIST
 */
export async function listHousing() {
  return await Housing.find({}).sort({ createdAt: -1 });
}

/**
 * GET BY ID
 */
export async function getHousingById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("ID inválido");
  }

  const housing = await Housing.findById(id);

  if (!housing) {
    throw new Error("Vivienda no encontrada");
  }

  return housing;
}

/**
 * UPDATE
 */
export async function updateHousing(id, data, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("ID inválido");
  }

  // Evitar que se edite el código manualmente
  delete data.code;

  // Verificar que la vivienda pertenece al usuario
  const housing = await Housing.findOne({ _id: id, createdBy: userId });
  
  if (!housing) {
    const err = new Error("Vivienda no encontrada o no tienes permisos para editarla");
    err.status = 403;
    throw err;
  }

  // Actualizar
  const updatedHousing = await Housing.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  );

  return updatedHousing;
}

/**
 * DELETE
 */
export async function deleteHousing(id, userId) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("ID inválido");
  }

  // Verificar que la vivienda pertenece al usuario
  const housing = await Housing.findOne({ _id: id, createdBy: userId });
  
  if (!housing) {
    const err = new Error("Vivienda no encontrada o no tienes permisos para eliminarla");
    err.status = 403;
    throw err;
  }

  await Housing.findByIdAndDelete(id);

  return { message: "Vivienda eliminada correctamente" };
}