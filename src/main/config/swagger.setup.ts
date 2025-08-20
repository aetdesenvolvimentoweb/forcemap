import { Express } from "express";
import swaggerUi from "swagger-ui-express";

import { swaggerConfig } from "../docs/swagger.config";

export const setupSwagger = (app: Express): void => {
  // Configurações do Swagger UI
  const options: swaggerUi.SwaggerUiOptions = {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "ForceMap API Documentation",
    swaggerOptions: {
      url: "/api-docs/swagger.json", // Adicione esta linha
      persistAuthorization: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      filter: true,
    },
    explorer: true,
  };

  // Rota para servir o JSON do Swagger
  app.get("/api-docs/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerConfig);
  });

  // Setup do Swagger UI
  app.use("/api-docs", swaggerUi.serve);
  app.get("/api-docs", swaggerUi.setup(swaggerConfig, options));
};
