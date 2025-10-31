import "dotenv/config";

import app from "./main/server";

const port = 3333;
const host = "http://localhost";

console.log(
  "🔍 CORS Mode: NODE_ENV=" +
    process.env.NODE_ENV +
    ", isDevelopment=" +
    (process.env.NODE_ENV === "development"),
);
console.log("🚀 Starting server in development mode...");

app.listen(port, () => {
  console.log(`✅ Server is running at ${host}:${port}/api/v1`);
});
