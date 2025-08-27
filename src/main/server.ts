import express from "express";

import routes from "./routes";

const app = express();

app.use(express.json());
app.use(routes);

if (process.env.NODE_ENV !== "development") {
  const port = 3333;
  const host = "http://localhost";
  app.listen(port, () => {
    console.log(`Server is running at ${host}:${port}`);
  });
}

export default app;
