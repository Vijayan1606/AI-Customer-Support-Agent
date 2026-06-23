import { RequestHandler } from "express";
import { RefundAgent, logDecision } from "../agent/refundAgent";
import type {
  ProcessRefundRequest,
  ProcessRefundResponse,
} from "@shared/api";

export const handleProcessRefund: RequestHandler = (req, res) => {
  const body = req.body as ProcessRefundRequest;

  if (!body.customerId || !body.orderId || !body.amount) {
    res.status(400).json({
      error: "Missing required fields: customerId, orderId, amount",
    });
    return;
  }

  const agent = new RefundAgent();
  const decision = agent.processRefund(body);

  logDecision(
    body.customerId,
    decision.approved ? "approved" : "denied",
    body.amount
  );

  const response: ProcessRefundResponse = {
    approved: decision.approved,
    reason: decision.reason,
    reasoning: decision.reasoning,
    messages: agent.getMessages(),
  };

  res.json(response);
};
