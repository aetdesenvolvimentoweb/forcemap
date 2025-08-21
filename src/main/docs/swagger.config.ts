import { OpenAPIV3 } from "openapi-types";

import { paths } from "./paths";
import { militaryRankSchemas } from "./schemas/military-ranks.schema";

export const swaggerConfig: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "ForceMap API",
    description:
      "API para gerenciamento de força operacional disponível em Organizações Bombeiros Milita",
    version: "1.0.1",
    contact: {
      name: "André David dos Santos",
      email: "andredavid1@yahoo.com.br",
    },
  },
  servers: [
    {
      url: process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}/api/v1`
        : "/api/v1",
      description: "API Server",
    },
  ],
  paths,
  components: {
    schemas: {
      ...militaryRankSchemas,
    },
  },
};
