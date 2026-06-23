import { getCustomer, REFUND_POLICY } from "../data/mockCRM";
import type {
  AgentDecision,
  ProcessRefundRequest,
  ChatMessage,
} from "@shared/api";

export class RefundAgent {
  private reasoning: string[] = [];
  private messages: ChatMessage[] = [];
  private messageCounter = 0;

  private addMessage(role: "user" | "agent" | "system", content: string) {
    this.messages.push({
      id: `msg_${++this.messageCounter}`,
      role,
      content,
      timestamp: Date.now(),
      agentReasoning: role === "agent" ? [...this.reasoning] : undefined,
    });
  }

  private log(message: string) {
    this.reasoning.push(message);
    console.log(`[AGENT] ${message}`);
  }

  processRefund(request: ProcessRefundRequest): AgentDecision {
    this.reasoning = [];
    this.messages = [];
    this.messageCounter = 0;

    this.addMessage(
      "user",
      `Processing refund request for customer ${request.customerId}: Order ${request.orderId}, Amount: $${request.amount}, Reason: ${request.reason}`
    );

    this.log("=== Starting Refund Agent ===");
    this.log(`Customer ID: ${request.customerId}`);
    this.log(`Order ID: ${request.orderId}`);
    this.log(`Amount: $${request.amount}`);
    this.log(`Reason: ${request.reason}`);

    // Step 1: Validate customer
    const customer = getCustomer(request.customerId);
    if (!customer) {
      this.log("❌ FAIL: Customer not found");
      this.addMessage(
        "agent",
        "I was unable to locate the customer record. Please verify the customer ID."
      );
      return {
        approved: false,
        reason: "Customer not found",
        reasoning: this.reasoning,
      };
    }

    this.log(`✓ Customer found: ${customer.name}`);
    this.log(`  Account Status: ${customer.accountStatus}`);
    this.log(`  Total Spent: $${customer.totalSpent}`);

    // Step 2: Check account status
    if (customer.accountStatus !== "active") {
      this.log(`❌ FAIL: Account status is ${customer.accountStatus}`);
      this.addMessage(
        "agent",
        `The customer account is currently ${customer.accountStatus} and is not eligible for refunds.`
      );
      return {
        approved: false,
        reason: `Account status is ${customer.accountStatus}`,
        reasoning: this.reasoning,
      };
    }

    this.log("✓ Account status is active");

    // Step 3: Check minimum amount
    if (request.amount < 5) {
      this.log(`❌ FAIL: Amount $${request.amount} is below minimum $5`);
      this.addMessage(
        "agent",
        "The refund amount is below our minimum of $5. We cannot process this request."
      );
      return {
        approved: false,
        reason: "Amount below minimum threshold",
        reasoning: this.reasoning,
      };
    }

    this.log("✓ Amount meets minimum requirement");

    // Step 4: Calculate days elapsed (assume from order date in request)
    const daysElapsed = request.daysElapsed || 10; // Default for demo
    this.log(`  Days since purchase: ${daysElapsed}`);

    let maxReturnDays = 30;
    const daysSinceRegistration = Math.floor(
      (Date.now() - new Date(customer.registrationDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // VIP check (spent > $10k)
    if (customer.totalSpent > 10000) {
      maxReturnDays = 45;
      this.log("✓ VIP customer (spent > $10k) - Extended 45 day window");
    }

    // New customer check (< 30 days old)
    if (daysSinceRegistration < 30) {
      maxReturnDays = 30;
      this.log("✓ New customer - Standard 30 day window applies");
    }

    if (daysElapsed > maxReturnDays) {
      this.log(
        `❌ FAIL: ${daysElapsed} days > ${maxReturnDays} day return window`
      );
      this.addMessage(
        "agent",
        `The return window has expired. The refund request was made ${daysElapsed} days after purchase, exceeding our ${maxReturnDays}-day return window.`
      );
      return {
        approved: false,
        reason: "Return window expired",
        reasoning: this.reasoning,
      };
    }

    this.log(`✓ Within return window (${daysElapsed}/${maxReturnDays} days)`);

    // Step 5: Check restocking fee
    let restockingFeeApplies = false;
    if (daysElapsed > 14) {
      restockingFeeApplies = true;
      const fee = request.amount * 0.15;
      this.log(
        `⚠ Restocking fee applies (15% after 14 days): $${fee.toFixed(2)}`
      );
    } else {
      this.log("✓ No restocking fee (within 14 days)");
    }

    // Step 6: Check refund history
    const recentRefunds = customer.refundHistory.filter((r) => {
      const refundDate = new Date(r.date).getTime();
      const sixMonthsAgo = Date.now() - 6 * 30 * 24 * 60 * 60 * 1000;
      return refundDate > sixMonthsAgo && r.approved;
    });

    this.log(`  Recent approved refunds (6 months): ${recentRefunds.length}`);

    if (recentRefunds.length > 5) {
      this.log(
        `⚠ WARNING: More than 5 refunds in 6 months - Requires manager approval`
      );
      // In a real system, this would flag for manual review
    } else {
      this.log("✓ Refund history within acceptable limits");
    }

    // Step 7: Calculate return rate
    const totalRefunded = customer.refundHistory.length;
    const returnRate =
      totalRefunded > 0
        ? (customer.refundHistory.filter((r) => r.approved).length /
            totalRefunded) *
          100
        : 0;

    this.log(`  Return rate: ${returnRate.toFixed(1)}%`);

    if (returnRate > 50 && customer.refundHistory.length >= 3) {
      this.log("❌ FAIL: Return rate exceeds 50%");
      this.addMessage(
        "agent",
        "The customer has an unusually high return rate. The account is restricted from further refunds."
      );
      return {
        approved: false,
        reason: "Return rate too high",
        reasoning: this.reasoning,
      };
    }

    this.log("✓ Return rate acceptable");

    // Step 8: Final approval decision
    this.log("✓ ALL CHECKS PASSED - REFUND APPROVED");
    this.addMessage(
      "agent",
      `Refund approved! The customer is eligible for a $${request.amount} refund for order ${request.orderId}.${restockingFeeApplies ? " Please note a 15% restocking fee applies due to the timing of the request." : ""}`
    );

    return {
      approved: true,
      reason: "All policy requirements met",
      reasoning: this.reasoning,
    };
  }

  getMessages(): ChatMessage[] {
    return this.messages;
  }

  getReasoning(): string[] {
    return this.reasoning;
  }
}

// Simulated admin log for tracking decisions
let decisionLog: Array<{
  id: string;
  customerId: string;
  decision: "approved" | "denied";
  amount: number;
  timestamp: number;
}> = [];

export function logDecision(
  customerId: string,
  decision: "approved" | "denied",
  amount: number
) {
  decisionLog.push({
    id: `log_${Date.now()}_${Math.random()}`,
    customerId,
    decision,
    amount,
    timestamp: Date.now(),
  });
}

export function getDecisionLog() {
  return decisionLog;
}
