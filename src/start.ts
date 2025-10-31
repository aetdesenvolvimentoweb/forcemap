import "dotenv/config";

import { makeGlobalLogger } from "./main/factories/logger";
import app from "./main/server";

const logger = makeGlobalLogger();

const port = Number(process.env.PORT) || 3333;
const host = process.env.SERVER_HOST || "http://localhost";

app.listen(port, () => {
  logger.info(`Server is running at ${host}:${port}/api/v1`, {
    port,
    host,
    environment: process.env.NODE_ENV || "production",
  });
});
