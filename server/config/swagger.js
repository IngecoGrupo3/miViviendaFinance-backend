import swaggerJsdoc from "swagger-jsdoc";

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
                url: "http://localhost:3000"
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