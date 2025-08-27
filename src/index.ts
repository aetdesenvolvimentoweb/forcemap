import "module-alias/register";

import { createServer } from "http";

import app from "./main/server";

const server = createServer(app);

export default server;
