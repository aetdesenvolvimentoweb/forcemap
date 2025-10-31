import express from "express";

import {
  securityHeadersDev,
  securityHeadersProd,
} from "../infra/adapters/middlewares";
import {
  makeExpressCorsMiddleware,
  makeExpressSecurityLoggingMiddleware,
} from "./factories/middlewares";
import routes from "./routes";

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

export default app;
