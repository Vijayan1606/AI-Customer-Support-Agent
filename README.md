# AI Customer Support Agent - Refund Processing System

A fully functional web application for an AI-powered customer support agent that intelligently processes e-commerce refunds using policy validation and real-time decision reasoning.

## 🚀 Features

### Core Capabilities
- **Intelligent Refund Agent**: AI-powered policy validation engine that processes refund requests
- **Real-Time Reasoning Logs**: Transparent decision-making with step-by-step policy validation
- **Mock CRM Database**: 15 customer profiles with detailed account history
- **Dynamic Policy Validation**: Enforces complex refund policies with multiple conditions
- **Customer Support Chat Interface**: Interactive UI for submitting refund requests
- **Admin Dashboard**: Real-time analytics and decision logs for monitoring

### Policy Validation Rules
The system automatically validates:
- ✅ 30-day standard return window (45 days for VIP customers)
- ✅ Account status verification
- ✅ Minimum refund amount ($5)
- ✅ Restocking fees (15% after 14 days)
- ✅ Customer refund history limits
- ✅ Return rate restrictions (>50% blocks refunds)
- ✅ High-frequency refund flagging (5+ in 6 months)
- ✅ Customer lifetime value recognition

## 🏗️ Architecture

### Frontend
```
client/
├── pages/
│   ├── Index.tsx          # Beautiful homepage with feature showcase
│   ├── CustomerSupport.tsx # Chat interface for refund submissions
│   └── AdminDashboard.tsx  # Analytics and decision logs
├── components/ui/         # Pre-built UI components
├── global.css             # Modern theme with gradient accents
└── App.tsx                # Route configuration
```

### Backend
```
server/
├── agent/
│   └── refundAgent.ts     # Core AI logic for policy validation
├── routes/
│   ├── refund.ts          # POST /api/refund/process
│   └── customers.ts       # GET /api/customers, /api/logs
├── data/
│   └── mockCRM.ts         # 15 customer profiles + policy document
└── index.ts               # Express server configuration
```

### Shared
```
shared/
└── api.ts                 # TypeScript interfaces for frontend/backend
```

## 🎯 How It Works

### Refund Processing Flow
1. **Customer Submission**: User selects customer ID and enters refund details
2. **Agent Validation**: RefundAgent runs through policy checks:
   - Customer lookup and account verification
   - Time window validation
   - Amount validation
   - Return rate calculation
   - Refund history analysis
3. **Decision**: Returns approved/denied with detailed reasoning
4. **Logging**: Decisions automatically logged for admin review
5. **Real-Time Display**: Chat interface shows agent reasoning steps

### Admin Dashboard
- Automatic log refresh (2-second intervals)
- Real-time statistics (approval rate, total value, average amount)
- Expandable decision details with full reasoning
- Filter and search capabilities

## 📊 Demo Data

### Mock Customers (15 total)
- **VIP Customers**: High lifetime value (>$10k) get extended return windows
- **New Customers**: Special first-purchase policies
- **Problem Accounts**: Suspended/closed accounts for policy testing
- **High-Return Customers**: Trigger frequency limits

### Refund Policy
Comprehensive multi-condition policy document enforcing:
- Time-based eligibility
- Customer status checks
- Historical rate limits
- Amount thresholds
- Special exceptions

## 🛠️ Technology Stack

- **Frontend**: React 18 + React Router 6 + Vite
- **Backend**: Express.js with TypeScript
- **Styling**: Tailwind CSS 3 with custom theme
- **Icons**: Lucide React
- **State Management**: React Query
- **Validation**: Zod
- **Build**: Vite with HMR
- **Testing**: Vitest

## 🚀 Getting Started

### Installation
```bash
pnpm install
```

### Development
```bash
pnpm dev
```
Server runs on `http://localhost:8080`

### Building
```bash
pnpm build
```

### Type Checking
```bash
pnpm typecheck
```

## 📱 Routes

- `/` - Homepage with feature showcase and policy overview
- `/support` - Customer support chat interface
- `/admin` - Admin dashboard with decision logs

## 🔌 API Endpoints

### Refund Processing
```
POST /api/refund/process
Content-Type: application/json

{
  "customerId": "cust_001",
  "orderId": "ORD_20240315",
  "amount": 89.99,
  "reason": "Product does not match description",
  "daysElapsed": 10
}

Response:
{
  "approved": true,
  "reason": "All policy requirements met",
  "reasoning": ["Step 1 log", "Step 2 log", ...],
  "messages": [...]
}
```

### Fetch Customers
```
GET /api/customers
GET /api/customers/:id
```

### Fetch Decision Logs
```
GET /api/logs

Response: Array<AdminLogEntry>
```

## 🎨 Design System

### Color Scheme
- **Primary**: Vibrant purple (#6366f1 / `hsl(260 95% 55%)`)
- **Secondary**: Bright blue (`hsl(200 100% 50%)`)
- **Background**: Clean white with subtle gradients
- **Dark Mode**: Slate-based palette with purple accents

### Components
- Clean, modern card-based layouts
- Responsive grid systems
- Smooth transitions and animations
- Accessible form controls

## 📈 Extensibility

### Adding Policy Rules
Edit `server/agent/refundAgent.ts` in the `processRefund` method to add new validation steps.

### Adding Customers
Extend the `mockCustomers` array in `server/data/mockCRM.ts`.

### Custom UI Components
Pre-built Radix UI components available in `client/components/ui/`.

## 🔐 Security Considerations

- Input validation on all API endpoints
- TypeScript type safety throughout
- No sensitive data exposed in logs (customer IDs only)
- CORS configured for safe cross-origin requests

## 📝 Mock Data Details

### Customer Types
1. **VIP Customers**: $10k+ lifetime value
2. **Regular Customers**: Standard policy applies
3. **New Customers**: <30 days, special first-purchase terms
4. **Problem Accounts**: Suspended/closed for testing edge cases

### Refund History Examples
- Different approval rates
- Recent vs. historical refunds
- Frequency patterns
- Edge cases (high-return customers)

## 🎯 Future Enhancements

Potential additions:
- Voice pipeline integration (OpenAI Realtime API, ElevenLabs, LiveKit)
- Database persistence (Drizzle ORM ready)
- Email notifications
- Advanced analytics and reporting
- Machine learning for policy optimization
- Multi-language support

## 📄 License

Built with React, Express, and Tailwind CSS.

---

**Start processing refunds intelligently today!**
