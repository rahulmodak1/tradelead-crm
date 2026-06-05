# TradeIndia CRM — Frontend

A modern, production-grade CRM dashboard built with React + Vite + Tailwind CSS.

## Tech Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** — utility-first styling
- **React Router DOM v6** — client-side routing
- **Axios** — HTTP client for API calls
- **Lucide React** — icon library
- **date-fns** — date formatting

---

## Folder Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.jsx        # Main layout wrapper
│   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   └── Navbar.jsx        # Top navigation bar
│   ├── leads/
│   │   ├── LeadTable.jsx     # Data table with sort/actions
│   │   ├── SearchFilterBar.jsx # Search + filters
│   │   └── LeadModal.jsx     # Add/Edit lead modal
│   └── ui/
│       ├── StatusBadge.jsx   # Status badge component
│       └── StatCard.jsx      # Dashboard stat cards
├── pages/
│   ├── DashboardPage.jsx     # Overview dashboard
│   ├── LeadsPage.jsx         # Lead management
│   └── PlaceholderPages.jsx  # Future pages
├── hooks/
│   └── useLeads.js           # Lead data state management
├── utils/
│   ├── api.js                # Axios instance config
│   └── leadsService.js       # API service functions
├── data/
│   └── dummyData.js          # Demo lead data
├── App.jsx
├── main.jsx
└── index.css
```

---

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config
cp .env.example .env

# 3. Start development server
npm run dev
```

App runs on: **http://localhost:3000**

---

## Connect to Real Backend

When your Node.js/Express backend is ready:

### Step 1 — Update `.env`
```
VITE_API_URL=http://localhost:5000/api
```

### Step 2 — Switch off dummy data in `src/hooks/useLeads.js`
```js
const USE_DUMMY_DATA = false; // Change from true to false
```

Then uncomment the API call lines:
```js
const data = await leadsService.getLeads();
setLeads(data.leads || data);
```

### Expected API Endpoints

| Method | Endpoint             | Description         |
|--------|----------------------|---------------------|
| GET    | /api/leads           | Get all leads       |
| POST   | /api/leads           | Create a lead       |
| PUT    | /api/leads/:id       | Update a lead       |
| PATCH  | /api/leads/:id/status| Update status only  |
| DELETE | /api/leads/:id       | Delete a lead       |

### Expected Lead Schema (MongoDB)
```json
{
  "_id": "ObjectId",
  "customerName": "String",
  "phone": "String",
  "company": "String",
  "city": "String",
  "inquiry": "String",
  "status": "New | Hot | Follow Up | Closed",
  "followUpDate": "Date",
  "email": "String",
  "notes": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Features

- ✅ Responsive sidebar navigation (mobile drawer + desktop fixed)
- ✅ Top navbar with breadcrumbs and notifications
- ✅ Dashboard with live stats, recent leads, follow-up list
- ✅ Full lead table with sort, search, multi-filter
- ✅ Status badges: New / Hot / Follow Up / Closed
- ✅ WhatsApp deep-link button per lead
- ✅ Add / Edit lead modal with validation
- ✅ Delete lead with confirmation
- ✅ Status change from action menu
- ✅ Today's follow-ups widget
- ✅ Overdue lead detection
- ✅ Mobile-first responsive design
- ✅ Dark premium UI theme

---

## Build for Production

```bash
npm run build
```

Output in `/dist` — deploy to Vercel, Netlify, or serve via Express.
