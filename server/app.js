import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import routes from "./routes/index.routes.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;


