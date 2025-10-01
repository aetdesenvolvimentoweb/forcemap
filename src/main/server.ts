import express from "express";

import {
  securityHeadersDev,
  securityHeadersProd,
} from "../infra/adapters/middlewares";
import routes from "./routes";

const app = express();

// Middleware de segurança - aplica headers de segurança
const isDevelopment = process.env.NODE_ENV === "development";
app.use(isDevelopment ? securityHeadersDev() : securityHeadersProd());

app.use(express.json());
app.use(routes);

// Seed will be initialized lazily via middleware when needed

if (process.env.NODE_ENV !== "development") {
  const port = 3333;
  const host = "http://localhost";
  app.listen(port, () => {
    console.log(`✅ Server is running at ${host}:${port}/api/v1`);
  });
}

export default app;
