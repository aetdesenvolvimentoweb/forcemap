import cors from "cors";
import express from "express";

import { makeHttpLoggingMiddleware } from "@main/factories";

import type { Express } from "express";

export const setupMiddlewares = (app: Express): void => {
  // Body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // CORS
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") ?? "*",
      credentials: true,
    }),
  );

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });

  // HTTP Request logging with Pino
  app.use(makeHttpLoggingMiddleware().handle);
};
