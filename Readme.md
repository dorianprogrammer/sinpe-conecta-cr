# SINPEConectaCR

**AI-powered payment tracking for Costa Rican small businesses via WhatsApp**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Claude AI](https://img.shields.io/badge/Claude_API-191919?style=flat&logo=anthropic&logoColor=white)](https://www.anthropic.com/)

---

## Overview

A WhatsApp-integrated payment tracking system that automates SINPE Móvil receipt processing for Costa Rican businesses. Send a payment screenshot via WhatsApp, and the system automatically extracts payment details, links them to customers, and tracks everything in real-time.

Built to solve a real problem: helping small business owners (pulperías, gyms, subscription services) manage customer payments without manual data entry.

## Key Features

- **AI-Powered OCR**: Claude API extracts payment data from SINPE screenshots automatically
- **Multi-Tenant Architecture**: One platform, unlimited businesses per user
- **Smart Payment Validation**: Duplicate detection, amount verification, grace period tracking
- **Two Business Models**: Product sales (one-time) and membership subscriptions (recurring)
- **Real-Time Notifications**: Dashboard alerts for payment issues requiring attention
- **WhatsApp Integration**: Customers send receipts directly via WhatsApp
- **Automated Metrics**: Customer loyalty tracking, payment status monitoring, scheduled jobs

## Tech Stack

**Backend**
- Node.js + Express
- PostgreSQL (multi-tenant data isolation)
- Claude API (Anthropic) for image-to-text extraction
- Twilio/Meta Cloud API for WhatsApp integration
- JWT authentication

**Frontend**
- React 18 with hooks
- Tailwind CSS
- Context API for state management
- Responsive dashboard UI

**Infrastructure**
- Cloudinary/AWS S3 for image storage
- Cron jobs for scheduled tasks (payment status updates, metrics calculation)

## Architecture Highlights

### Payment Processing Flow
```
WhatsApp Screenshot → Webhook → Claude API → Extract Data →
Duplicate Check → Customer Matching → Validation Rules →
Database Update → Notifications → Metrics Calculation
```

### Database Design
- **Users** → **Businesses** (1:N relationship)
- Each business isolated: separate customers, payments, analytics
- Optimized for multi-tenant queries with business_id indexing

### Business Logic Examples

**Membership Grace Period**
```javascript
// 5-day grace period after due date
Day 1-4:     "upcoming"
Day 5-10:    "pending" (grace period)
Day 11+:     "overdue" (if unpaid)
```

**Smart Validation**
- Duplicate SINPE reference → Flag + notification + WhatsApp error
- Amount mismatch (membership) → Record payment + alert owner
- New customer → Auto-create + mark as unverified

## Project Structure

```
├── backend/
│   ├── config/          # Database, WhatsApp, Claude API configs
│   ├── routes/          # RESTful API endpoints
│   ├── controllers/     # Business logic layer
│   ├── services/        # AI integration, scheduled jobs
│   ├── middleware/      # Auth, business access control
│   └── models/          # Database models
│
├── frontend/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route-level pages
│   ├── context/         # Auth & business state
│   └── services/        # API client
│
└── database/
    └── migrations/      # SQL schema definitions
```

## Setup & Installation

### Prerequisites
```bash
Node.js 18+
PostgreSQL 14+
Anthropic API key
Twilio/Meta WhatsApp Business account
```

### Environment Variables
```bash
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
ANTHROPIC_API_KEY=sk-ant-...
WHATSAPP_API_KEY=...
CLOUDINARY_URL=...

# Frontend
REACT_APP_API_URL=http://localhost:3000/api
```

### Quick Start
```bash
# Clone repository
git clone https://github.com/yourusername/sinpe-conecta-cr.git

# Backend setup
cd backend
npm install
npm run migrate
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

## API Endpoints

### Core Resources
```
POST   /api/auth/register          # User registration
POST   /api/auth/login             # JWT authentication
GET    /api/businesses             # List user's businesses
POST   /api/businesses             # Create new business
GET    /api/payments/:businessId   # Get business payments
POST   /api/webhook/whatsapp       # WhatsApp incoming messages
GET    /api/notifications          # Unread notifications
```

## Real-World Use Cases

**Scenario 1: Gym Membership**
- Member sends monthly SINPE payment via WhatsApp
- System auto-links to customer profile
- Validates amount matches ₡25,000 monthly fee
- Updates payment status from "pending" to "paid"
- Increments on-time payment counter

**Scenario 2: Pulpería (Corner Store)**
- Customer sends ₡15,000 SINPE for groceries
- System creates new customer record if first purchase
- Owner receives notification about new customer
- Tracks total purchases and identifies frequent buyers (3+ in 30 days)

**Scenario 3: Duplicate Detection**
- Customer accidentally sends same screenshot twice
- System flags duplicate SINPE reference
- Sets status to "pending" (requires manual review)
- Sends WhatsApp error: "Este pago ya fue registrado"

## Security Features

- JWT token-based authentication (7-day expiry)
- Bcrypt password hashing (10+ rounds)
- Business-level access control middleware
- WhatsApp webhook signature verification
- SQL injection prevention (parameterized queries)
- Rate limiting on auth endpoints
- HTTPS-only in production

## Scheduled Jobs

**Daily at 00:00** - Membership Status Update
```javascript
// Checks all membership customers
// Marks as overdue if payment_due_day + 5 passed
// Creates notifications for business owners
```

**Daily at 01:00** - Customer Metrics Calculation
```javascript
// Updates frequent_buyer_flag (product sales)
// Updates good_standing_flag (memberships)
```

## Roadmap

**Phase 1 (Current)** - Core MVP
- ✅ Multi-tenant backend + PostgreSQL
- ✅ WhatsApp + Claude API integration
- ✅ Payment validation & notifications
- ✅ React dashboard

**Phase 2** - Enhancements
- [ ] CSV/Excel export functionality
- [ ] Email notifications
- [ ] Automated payment reminders via WhatsApp
- [ ] Invoice generation

**Phase 3** - Advanced Features
- [ ] Customer portal (payment history access)
- [ ] Multi-currency support
- [ ] Accounting software integration (QuickBooks, Xero)
- [ ] React Native mobile app

## Contributing

This is a personal project, but I'm open to feedback and suggestions. Feel free to:
- Open issues for bug reports or feature ideas
- Fork and experiment with the codebase
- Reach out with questions about architecture decisions

## Technical Decisions & Learnings

**Why Claude API?**
Superior accuracy for Spanish text extraction from Costa Rican SINPE screenshots compared to traditional OCR solutions (Tesseract, Google Vision). Handles varied image quality and formats reliably.

**Why PostgreSQL over MongoDB?**
ACID compliance critical for financial transactions. Multi-tenant architecture requires strict data isolation. Complex relational queries for customer metrics and payment tracking.

**Why Scheduled Jobs Instead of Real-Time?**
Payment status calculations don't need millisecond precision. Reduces database load. Allows batch processing optimizations. Easier debugging and error recovery.

## License

MIT License - See LICENSE file for details

---

**Made in Costa Rica** 🇨🇷

*Solving real problems for local businesses with modern technology*