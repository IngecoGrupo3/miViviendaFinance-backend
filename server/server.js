import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Error iniciando servidor:", err.message);
  process.exit(1);
});
