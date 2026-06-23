export interface DemoResponse {
  message: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  accountStatus: "active" | "suspended" | "closed";
  registrationDate: string;
  totalSpent: number;
  refundHistory: Array<{
    date: string;
    amount: number;
    approved: boolean;
  }>;
}

export interface RefundRequest {
  customerId: string;
  orderId: string;
  amount: number;
  reason: string;
  daysElapsed: number;
}

export interface AgentDecision {
  approved: boolean;
  reason: string;
  reasoning: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  timestamp: number;
  agentReasoning?: string[];
}

export interface ProcessRefundRequest {
  customerId: string;
  orderId: string;
  amount: number;
  reason: string;
  daysElapsed?: number;
}

export interface ProcessRefundResponse {
  approved: boolean;
  reason: string;
  reasoning: string[];
  messages: ChatMessage[];
}

export interface AdminLogEntry {
  id: string;
  timestamp: number;
  customerId: string;
  customerName: string;
  orderId: string;
  amount: number;
  decision: "approved" | "denied";
  reason: string;
  reasoning: string[];
}
