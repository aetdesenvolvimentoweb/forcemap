import dotenv from "dotenv";

dotenv.config();

import express from "express";

import {
  corsAuto,
  securityHeadersDev,
  securityHeadersProd,
  securityLogging,
} from "../infra/adapters/middlewares";
import routes from "./routes";

const app = express();

const isDevelopment = process.env.NODE_ENV === "development";

// Middleware de CORS - deve vir antes de outros middlewares
app.use(corsAuto());

// Middleware de segurança - aplica headers de segurança
app.use(isDevelopment ? securityHeadersDev() : securityHeadersProd());

// Middleware de logging de segurança - monitora eventos
app.use(securityLogging());

app.use(express.json());
app.use(routes);

// Seed will be initialized lazily via middleware when needed

if (process.env.NODE_ENV !== "development") {
  const port = Number(process.env.PORT) || 3333;
  const host = process.env.SERVER_HOST || "http://localhost";
  app.listen(port, () => {
    console.log(`✅ Server is running at ${host}:${port}/api/v1`);
  });
}

export default app;
