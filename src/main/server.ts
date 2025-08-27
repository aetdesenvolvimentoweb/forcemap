import express, { Request, Response, Router } from "express";

const app = express();

app.use(express.json());

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello World" });
});

app.use(router);

if (process.env.NODE_ENV !== "development") {
  const port = 3333;
  const host = "http://localhost";
  app.listen(port, () => {
    console.log(`Server is running at ${host}:${port}`);
  });
}

export default app;
