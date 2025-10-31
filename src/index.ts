import "dotenv/config";

import { VercelRequest, VercelResponse } from "@vercel/node";

import app from "./main/server";

export default (req: VercelRequest, res: VercelResponse) => {
  app(req, res);
};
