import { app } from "./config/app.config";

const port = process.env.PORT || 3333;

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

export default app;
