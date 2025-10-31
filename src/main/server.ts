import dotenv from "dotenv";

dotenv.config();

import express from "express";

import {
  securityHeadersDev,
  securityHeadersProd,
} from "../infra/adapters/middlewares";
import { makeGlobalLogger } from "./factories/logger";
import {
  makeExpressCorsMiddleware,
  makeExpressSecurityLoggingMiddleware,
} from "./factories/middlewares";
import routes from "./routes";

// Criar instância do logger para uso no servidor
const logger = makeGlobalLogger();

const app = express();

const isDevelopment = process.env.NODE_ENV === "development";

// Middlewares compostos via factories (Main)
const { corsAuto } = makeExpressCorsMiddleware();
const securityLoggingMiddleware = makeExpressSecurityLoggingMiddleware();

// Middleware de CORS - deve vir antes de outros middlewares
app.use(corsAuto());

// Middleware de segurança - aplica headers de segurança
app.use(isDevelopment ? securityHeadersDev() : securityHeadersProd());

// Middleware de logging de segurança - monitora eventos
app.use(securityLoggingMiddleware);

app.use(express.json());
app.use(routes);

// Seed will be initialized lazily via middleware when needed

if (process.env.NODE_ENV !== "development") {
  const port = Number(process.env.PORT) || 3333;
  const host = process.env.SERVER_HOST || "http://localhost";
  app.listen(port, () => {
    logger.info(`Server is running at ${host}:${port}/api/v1`, {
      port,
      host,
      environment: process.env.NODE_ENV,
    });
  });
}

export default app;
