import type { Customer } from "@shared/api";

export const REFUND_POLICY = `
# E-Commerce Refund Policy

## Standard Refund Rules

1. **Time Window**: Products can be returned within 30 days of purchase
2. **Condition Requirement**: Items must be unused and in original packaging
3. **Restocking Fee**: 15% restocking fee applies after 14 days
4. **Non-returnable Items**: Digital goods, custom items, and sale items are final sale
5. **Account Status**: Only active accounts in good standing are eligible
6. **Return Rate**: Customers with more than 50% return rate may be restricted
7. **Refund History**: Customers with more than 5 approved refunds in 6 months require manager approval
8. **Minimum Amount**: Minimum refund amount is $5

## Special Conditions

- New customers (< 30 days old) get 30-day window for first purchase only
- VIP customers (spent > $10,000) get 45-day window
- Defective items qualify for return regardless of condition
- Exceptions require manager approval
`;

export const mockCustomers: Customer[] = [
  {
    id: "cust_001",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    accountStatus: "active",
    registrationDate: "2022-01-15",
    totalSpent: 12500,
    refundHistory: [
      { date: "2024-01-10", amount: 49.99, approved: true },
      { date: "2024-02-20", amount: 89.99, approved: true },
    ],
  },
  {
    id: "cust_002",
    name: "Michael Chen",
    email: "m.chen@example.com",
    accountStatus: "active",
    registrationDate: "2021-06-22",
    totalSpent: 8750,
    refundHistory: [
      { date: "2024-01-05", amount: 199.99, approved: true },
    ],
  },
  {
    id: "cust_003",
    name: "Emma Williams",
    email: "emma.w@example.com",
    accountStatus: "active",
    registrationDate: "2024-01-10",
    totalSpent: 150,
    refundHistory: [],
  },
  {
    id: "cust_004",
    name: "James Rodriguez",
    email: "j.rodriguez@example.com",
    accountStatus: "suspended",
    registrationDate: "2020-05-18",
    totalSpent: 3200,
    refundHistory: [
      { date: "2023-11-01", amount: 50, approved: true },
      { date: "2023-12-15", amount: 75, approved: false },
      { date: "2024-01-20", amount: 120, approved: true },
    ],
  },
  {
    id: "cust_005",
    name: "Lisa Anderson",
    email: "lisa.a@example.com",
    accountStatus: "active",
    registrationDate: "2023-03-30",
    totalSpent: 5600,
    refundHistory: [
      { date: "2024-01-15", amount: 89.99, approved: true },
      { date: "2024-02-10", amount: 45.50, approved: true },
      { date: "2024-03-05", amount: 120, approved: true },
      { date: "2024-03-20", amount: 35.99, approved: false },
    ],
  },
  {
    id: "cust_006",
    name: "David Park",
    email: "d.park@example.com",
    accountStatus: "active",
    registrationDate: "2022-09-12",
    totalSpent: 9200,
    refundHistory: [
      { date: "2024-01-01", amount: 199.99, approved: true },
    ],
  },
  {
    id: "cust_007",
    name: "Jessica Brown",
    email: "j.brown@example.com",
    accountStatus: "active",
    registrationDate: "2024-02-01",
    totalSpent: 250,
    refundHistory: [],
  },
  {
    id: "cust_008",
    name: "Robert Taylor",
    email: "r.taylor@example.com",
    accountStatus: "active",
    registrationDate: "2021-11-20",
    totalSpent: 15800,
    refundHistory: [
      { date: "2024-02-14", amount: 299.99, approved: true },
    ],
  },
  {
    id: "cust_009",
    name: "Nicole Davis",
    email: "n.davis@example.com",
    accountStatus: "active",
    registrationDate: "2023-07-08",
    totalSpent: 4500,
    refundHistory: [
      { date: "2024-01-25", amount: 99.99, approved: true },
      { date: "2024-02-28", amount: 75, approved: true },
      { date: "2024-03-15", amount: 120, approved: true },
      { date: "2024-03-25", amount: 45, approved: true },
      { date: "2024-04-05", amount: 60, approved: true },
      { date: "2024-04-20", amount: 80, approved: false },
    ],
  },
  {
    id: "cust_010",
    name: "Christopher Moore",
    email: "c.moore@example.com",
    accountStatus: "closed",
    registrationDate: "2019-04-03",
    totalSpent: 6700,
    refundHistory: [
      { date: "2023-12-01", amount: 150, approved: true },
    ],
  },
  {
    id: "cust_011",
    name: "Amanda Martinez",
    email: "a.martinez@example.com",
    accountStatus: "active",
    registrationDate: "2022-08-14",
    totalSpent: 7200,
    refundHistory: [
      { date: "2024-02-01", amount: 89.99, approved: true },
    ],
  },
  {
    id: "cust_012",
    name: "Kevin Thompson",
    email: "k.thompson@example.com",
    accountStatus: "active",
    registrationDate: "2023-01-20",
    totalSpent: 3400,
    refundHistory: [],
  },
  {
    id: "cust_013",
    name: "Rachel White",
    email: "r.white@example.com",
    accountStatus: "active",
    registrationDate: "2021-03-10",
    totalSpent: 11200,
    refundHistory: [
      { date: "2024-01-30", amount: 199.99, approved: true },
    ],
  },
  {
    id: "cust_014",
    name: "Matthew Harris",
    email: "m.harris@example.com",
    accountStatus: "active",
    registrationDate: "2022-12-05",
    totalSpent: 5900,
    refundHistory: [
      { date: "2024-03-10", amount: 75, approved: true },
      { date: "2024-03-18", amount: 50, approved: true },
    ],
  },
  {
    id: "cust_015",
    name: "Victoria Garcia",
    email: "v.garcia@example.com",
    accountStatus: "active",
    registrationDate: "2023-05-22",
    totalSpent: 6800,
    refundHistory: [
      { date: "2024-02-05", amount: 120, approved: true },
    ],
  },
];

export function getCustomer(customerId: string): Customer | undefined {
  return mockCustomers.find((c) => c.id === customerId);
}
