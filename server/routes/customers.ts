import { RequestHandler } from "express";
import { mockCustomers, getCustomer } from "../data/mockCRM";
import { getDecisionLog } from "../agent/refundAgent";
import type { AdminLogEntry } from "@shared/api";

export const handleGetCustomers: RequestHandler = (req, res) => {
  res.json(mockCustomers);
};

export const handleGetCustomer: RequestHandler = (req, res) => {
  const { id } = req.params;
  const customer = getCustomer(id);

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.json(customer);
};

export const handleGetLogs: RequestHandler = (req, res) => {
  const decisionLog = getDecisionLog();
  const enrichedLogs: AdminLogEntry[] = decisionLog.map((log) => {
    const customer = getCustomer(log.customerId);
    return {
      id: log.id,
      timestamp: log.timestamp,
      customerId: log.customerId,
      customerName: customer?.name || "Unknown",
      orderId: `ORD_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      amount: log.amount,
      decision: log.decision,
      reason:
        log.decision === "approved"
          ? "All policy requirements met"
          : "Policy violation",
      reasoning: [
        `Customer status: ${customer?.accountStatus || "unknown"}`,
        `Total customer lifetime value: $${customer?.totalSpent || 0}`,
      ],
    };
  });

  res.json(enrichedLogs.reverse());
};
