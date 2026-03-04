import swaggerJsdoc from "swagger-jsdoc";

const PORT = process.env.PORT || 3000;
const swaggerServerUrl =
    process.env.SWAGGER_SERVER_URL ||
    process.env.API_BASE_URL ||
    `http://localhost:${PORT}`;

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
    apis: ["./server/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
