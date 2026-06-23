import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleProcessRefund } from "./routes/refund";
import {
  handleGetCustomers,
  handleGetCustomer,
  handleGetLogs,
} from "./routes/customers";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Refund agent API
  app.post("/api/refund/process", handleProcessRefund);
  app.get("/api/customers", handleGetCustomers);
  app.get("/api/customers/:id", handleGetCustomer);
  app.get("/api/logs", handleGetLogs);

  return app;
}
