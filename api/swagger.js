import { setupSwagger } from "../dist/src/main/config/swagger.setup.js";
import express from "express";

const app = express();
setupSwagger(app);

export default app;
