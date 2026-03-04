import swaggerJsdoc from "swagger-jsdoc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = process.env.PORT || 5000;
const swaggerServerUrl =
    process.env.SWAGGER_SERVER_URL ||
    process.env.API_BASE_URL ||
    `http://localhost:${PORT}`;

const swaggerRoutesGlob = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "routes",
    "*.js"
);

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Yanashpa Courier API",
            version: "1.0.0",
            description: "Documentación del backend MERN"
        },
        servers: [
            {
                url: swaggerServerUrl
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: [swaggerRoutesGlob]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
