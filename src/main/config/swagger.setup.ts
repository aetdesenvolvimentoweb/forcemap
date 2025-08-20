import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { swaggerConfig } from "../docs/swagger.config";

export const setupSwagger = (app: Express): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig));
};
