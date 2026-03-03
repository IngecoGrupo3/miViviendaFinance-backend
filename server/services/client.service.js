import Client from "../models/Client.js";

export async function createClient(data) {
  const created = await Client.create({
    firstName: data.first_name,
    lastName: data.last_name,
    age: data.age,
    email: data.email,
    phone: data.phone,
    maritalStatus: data.marital_status,
    monthlyIncome: data.monthly_income,
    incomeType: data.income_type,
    dependentsCount: data.dependents_count,
    employmentTenureMonths: data.employment_tenure_months,
    employmentStatus: data.employment_status
  });
  
  return {
    id: created._id.toString(),
    first_name: created.firstName,
    last_name: created.lastName,
    age: created.age,
    email: created.email,
    phone: created.phone ?? null,
    marital_status: created.maritalStatus,
    monthly_income: created.monthlyIncome,
    income_type: created.incomeType,
    dependents_count: created.dependentsCount,
    employment_tenure_months: created.employmentTenureMonths,
    employment_status: created.employmentStatus,
    created_at: created.createdAt,
    updated_at: created.updatedAt
  };
}

export async function listClients() {
  const clients = await Client.find().sort({ createdAt: -1 }).lean();
  
  return clients.map((c) => ({
    id: c._id.toString(),
    first_name: c.firstName,
    last_name: c.lastName,
    age: c.age,
    email: c.email,
    phone: c.phone ?? null,
    marital_status: c.maritalStatus,
    monthly_income: c.monthlyIncome,
    income_type: c.incomeType,
    dependents_count: c.dependentsCount,
    employment_tenure_months: c.employmentTenureMonths,
    employment_status: c.employmentStatus,
    created_at: c.createdAt,
    updated_at: c.updatedAt
  }));
}

export async function updateClient(id, data) {
  const client = await Client.findById(id);
  if (!client) {
    const err = new Error("Cliente no encontrado");
    err.status = 404;
    throw err;
  }

  if (data.first_name) client.firstName = data.first_name;
  if (data.last_name) client.lastName = data.last_name;
  if (data.age) client.age = data.age;
  if (data.email) client.email = data.email;
  if (data.phone) client.phone = data.phone;
  if (data.marital_status) client.maritalStatus = data.marital_status;
  if (data.monthly_income) client.monthlyIncome = data.monthly_income;
  if (data.income_type) client.incomeType = data.income_type;
  if (data.dependents_count !== undefined) client.dependentsCount = data.dependents_count;
  if (data.employment_tenure_months) client.employmentTenureMonths = data.employment_tenure_months;
  if (data.employment_status) client.employmentStatus = data.employment_status;

  await client.save();

  return {
    id: client._id.toString(),
    first_name: client.firstName,
    last_name: client.lastName,
    age: client.age,
    email: client.email,
    phone: client.phone ?? null,
    marital_status: client.maritalStatus,
    monthly_income: client.monthlyIncome,
    income_type: client.incomeType,
    dependents_count: client.dependentsCount,
    employment_tenure_months: client.employmentTenureMonths,
    employment_status: client.employmentStatus,
    created_at: client.createdAt,
    updated_at: client.updatedAt
  };
}

export async function deleteClient(id) {
  const client = await Client.findByIdAndDelete(id);
  if (!client) {
    const err = new Error("Cliente no encontrado");
    err.status = 404;
    throw err;
  }
  return { message: "Cliente eliminado correctamente" };
}