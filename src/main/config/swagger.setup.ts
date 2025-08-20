import { Express } from "express";
import swaggerUi from "swagger-ui-express";

import { swaggerConfig } from "../docs/swagger.config";

export const setupSwagger = (app: Express): void => {
  // Configurações adicionais para o Swagger UI
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

  app.use("/api-docs", swaggerUi.serve);
  app.get("/api-docs", swaggerUi.setup(swaggerConfig, options));
};
