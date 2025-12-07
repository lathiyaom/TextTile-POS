# POS Bill Creation System for Textile Industry

A comprehensive, production-ready POS (Point of Sale) Bill Creation System specifically designed for the textile industry with advanced GST handling, flexible rounding, and Zoho-like clean UI.

## 🎯 Features

### ✅ Core Features (Implemented)
- **Settings-Driven Behavior** - All billing logic controlled by global POS settings
- **Textile-Specific GST** - Category-based GST (0%, 5%, 12%, 18%) with intra/inter-state logic
- **Flexible Rounding** - 4 rounding modes (nearest rupee, up, down, nearest ₹0.50)
- **Smart Vendor Selection** - Recent vendors prioritized, balance warnings, auto-fill details
- **Line Items Management** - Inline add/edit/delete with auto-calculations
- **Advance Payments** - Partial payment support with payment mode tracking
- **Generic Notes System** - Reusable notes for vendors and bills (max 3 per bill)
- **Bill Numbering** - Sequential, gapless, per financial year
- **Audit Trail** - Complete tracking of created, modified, printed, cancelled
- **Clean Zoho-like UI** - Professional, business-focused design

### 🚧 Upcoming Features (Phase 3-5)
- Print & PDF generation (frontend-only with watermarks)
- Change log UI for audit trail
- Enhanced validations and error handling
- Vendor balance auto-updates
- E-Way bill integration

---

## 🏗️ Architecture

### Tech Stack
- **Backend**: Go 1.23 + Gin + GORM + MySQL
- **Frontend**: React 18 + TypeScript + Zustand + TailwindCSS
- **Architecture**: Clean layered architecture

### Project Structure
```
pos-go/
├── cmd/
│   └── main.go                 # Application entry point
├── internal/
│   ├── config/                 # Configuration management
│   ├── constants/              # Application constants
│   ├── handler/                # HTTP handlers (controllers)
│   │   ├── middleware/         # Auth, CORS, error handling
│   │   ├── bill_handler.go
│   │   ├── payment_type_handler.go
│   │   ├── pos_settings_handler.go
│   │   └── note_handler.go
│   ├── migrations/             # Database migrations
│   ├── model/                  # Data models
│   │   ├── bill.go
│   │   ├── pos_settings.go
│   │   ├── payment_type.go
│   │   ├── payment_mode.go
│   │   ├── note.go
│   │   └── vendor.go
│   ├── repository/             # Data access layer
│   │   ├── bill_repository.go
│   │   ├── pos_settings_repository.go
│   │   ├── payment_type_repository.go
│   │   └── note_repository.go
│   ├── router/                 # Route definitions
│   ├── service/                # Business logic
│   │   ├── bill_service.go
│   │   ├── pos_settings_service.go
│   │   ├── payment_type_service.go
│   │   └── note_service.go
│   └── utils/                  # Utilities
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/          # Basic UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── SearchableSelect.tsx
│   │   │   └── organisms/      # Complex components
│   │   │       ├── VendorSelector.tsx
│   │   │       ├── BillItemsTable.tsx
│   │   │       ├── NotesModal.tsx
│   │   │       └── ManageGenericPanel.tsx
│   │   ├── hooks/
│   │   │   └── useBillCalculations.ts
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx
│   │   ├── pages/
│   │   │   ├── BillsPage.tsx
│   │   │   ├── BillCreatePage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── VendorsPage.tsx
│   │   ├── routes/
│   │   ├── services/
│   │   │   └── api/
│   │   │       ├── bill.ts
│   │   │       └── vendor.ts
│   │   ├── store/              # Zustand stores
│   │   │   ├── billStore.ts
│   │   │   ├── settingsStore.ts
│   │   │   └── vendorStore.ts
│   │   ├── types/
│   │   │   ├── bill.ts
│   │   │   └── vendor.ts
│   │   └── utils/
│   │       └── formatters.ts
│   └── package.json
└── go.mod
```

---

## 🚀 Getting Started

### Prerequisites
- Go 1.23+
- Node.js 18+
- MySQL 8.0+

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd pos-go
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Install dependencies**
```bash
go mod download
```

4. **Run migrations** (automatic on startup)
```bash
cd cmd
go run main.go
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env if needed (default: http://localhost:8080/api/v1)
```

4. **Start development server**
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## 📊 Database Schema

### Key Tables

#### `pos_settings`
Global POS configuration controlling all billing behavior.

#### `bills`
Bill header with vendor, payment info, totals, and audit fields.

#### `bill_items`
Line items with textile category, quantity, rate, GST.

#### `payment_types`
Master data for payment types (Credit, Cash, etc.)

#### `payment_modes`
Master data for payment modes (Cash, Card, UPI, etc.) with categories.

#### `notes`
Generic notes system (entity_type, entity_id) for vendors and bills.

#### `vendors`
Vendor master with balance tracking.

---

## 🎨 UI/UX Design

### Design Principles
- **Zoho-like Clean UI** - Professional, business-focused
- **Good Spacing** - Ample whitespace, clear sections
- **Responsive** - Works on desktop and tablets
- **Accessible** - Keyboard navigation, screen reader friendly

### Key Screens

#### 1. Settings Page
Centralized configuration with sections:
- Bill Rounding Settings
- Vendor & Payment Behavior
- GST & Business Settings
- Financial Year & Bill Numbering
- E-Way Bill Settings

#### 2. Bills List
- Search and filter by payment status
- Pagination
- Quick actions (view, print)
- Slide-over detail panel

#### 3. Bill Creation Form
- Smart vendor selector with warnings
- Inline line items table
- Real-time calculation summary (sticky)
- Discount and advance payment sections
- Validation and error handling

---

## 💡 Key Business Logic

### GST Calculation
```typescript
// Intra-state (same state)
CGST = (Taxable Amount × GST%) / 2
SGST = (Taxable Amount × GST%) / 2
IGST = 0

// Inter-state (different state)
IGST = Taxable Amount × GST%
CGST = 0
SGST = 0
```

### Rounding Logic
```typescript
// Nearest Rupee (default)
Grand Total = Math.round(Raw Grand Total)

// Round Up
Grand Total = Math.ceil(Raw Grand Total)

// Round Down
Grand Total = Math.floor(Raw Grand Total)

// Nearest ₹0.50
Grand Total = Math.round(Raw Grand Total * 2) / 2

Round-Off Amount = Grand Total - Raw Grand Total
```

### Payment Status
```typescript
if (Amount Due === 0) → Paid
else if (Advance Paid > 0) → Partially Paid
else → Unpaid
```

### Bill Number Generation
```
Format: {Prefix}{Sequential Number}
Example: BNO-00001, BNO-00002, ...

- Sequential per financial year
- No gaps
- Configurable prefix and length
```

---

## 🔧 Configuration

### POS Settings (Default Values)

```json
{
  "enable_bill_round_off": true,
  "round_off_mode": "nearest_rupee",
  "round_off_decimal_precision": 2,
  "allow_per_bill_round_off_override": false,
  "recent_vendor_days": 30,
  "vendor_payment_warning_days": 90,
  "default_payment_terms_days": 30,
  "business_registered_state": "",
  "financial_year_start_date": "04-01",
  "bill_number_prefix": "BNO-",
  "bill_number_length": 5,
  "eway_bill_threshold_amount": 50000
}
```

### Textile GST Categories

| Category | GST % |
|----------|-------|
| Raw Cotton, Silk Yarn, Khadi | 0% |
| Fabrics, Garments, Made-ups, Job Work | 5% |
| Textile Products, Embroidery Threads | 12% |
| Synthetic Threads, Accessories, Dyes | 18% |

---

## 🧪 Testing

### Backend Tests
```bash
go test ./...
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 📝 API Documentation

### Base URL
```
http://localhost:8080/api/v1
```

### Key Endpoints

#### POS Settings
- `GET /pos-settings` - Get settings
- `PUT /pos-settings` - Update settings

#### Bills
- `GET /bills` - List bills (with pagination, filters)
- `POST /bills` - Create bill
- `GET /bills/:id` - Get bill details
- `PUT /bills/:id` - Update bill
- `DELETE /bills/:id` - Delete bill
- `POST /bills/:id/cancel` - Cancel bill
- `POST /bills/:id/print` - Record print
- `GET /bills/:id/changelog` - Get change log

#### Payment Types
- `GET /payment-types` - List payment types
- `POST /payment-types` - Create payment type
- `PUT /payment-types/:id` - Update payment type
- `DELETE /payment-types/:id` - Delete payment type

#### Notes
- `GET /:entityType/:entityId/notes` - Get notes
- `POST /:entityType/:entityId/notes` - Create note
- `PUT /:entityType/:entityId/notes/:noteId` - Update note
- `DELETE /:entityType/:entityId/notes/:noteId` - Delete note

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 👥 Team

- **Backend**: Go + Gin + GORM
- **Frontend**: React + TypeScript + Zustand
- **UI/UX**: Zoho-inspired clean design

---

## 📞 Support

For support, email support@example.com or open an issue in the repository.

---

## 🗺️ Roadmap

### Phase 3 (Next)
- [ ] Vendor balance auto-updates on bill save
- [ ] Round-off override UI (when enabled)
- [ ] Payment warning display
- [ ] Next payment due date auto-calculation

### Phase 4
- [ ] Change log UI component
- [ ] Enhanced validations
- [ ] Duplicate bill number handling
- [ ] GST number validation for inter-state

### Phase 5
- [ ] Print template component
- [ ] PDF generation (jsPDF)
- [ ] Watermark logic (ORIGINAL/DUPLICATE)
- [ ] Export to CSV/Excel

---

**Built with ❤️ for the Textile Industry**
