import { Express } from "express";
import swaggerUi from "swagger-ui-express";

import { swaggerConfig } from "../docs/swagger.config";

export const setupSwagger = (app: Express): void => {
  // Configurações do Swagger UI
  const options: swaggerUi.SwaggerUiOptions = {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "ForceMap API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      filter: true,
    },
    explorer: true,
  };

  // Setup do Swagger UI
  app.use("/api-docs", swaggerUi.serve);
  app.use("/api-docs", swaggerUi.setup(swaggerConfig, options));
};
