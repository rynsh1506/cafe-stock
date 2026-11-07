import { app } from "@/app";

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOST || "0.0.0.0";

app.listen({ port, hostname }, (server) => {
  console.log("\n========================================================");
  console.log("  ☕ CAFE STOCK - Elysia Backend & Inventory Server");
  console.log("========================================================");
  console.log(`  Local Access:    http://localhost:${server.port}/`);
  console.log(`  Swagger Docs:    http://localhost:${server.port}/swagger`);
  console.log(
    "  Endpoint '/':    Serving built React frontend (dist/index.html)",
  );
  console.log("  Endpoint '/api': Serving REST API endpoints");
  console.log("========================================================\n");
});
