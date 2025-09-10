import express from "express";

import { makeDatabaseSeed } from "./factories/seed/database.seed.factory";
import routes from "./routes";

const app = express();

app.use(express.json());
app.use(routes);

// Initialize database seed
const databaseSeed = makeDatabaseSeed();
databaseSeed.run().catch(console.error);

if (process.env.NODE_ENV !== "development") {
  const port = 3333;
  const host = "http://localhost";
  app.listen(port, () => {
    console.log(`Server is running at ${host}:${port}/api/v1`);
  });
}

export default app;
