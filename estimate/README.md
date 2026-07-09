# Zuna Tung Viet - Estimate & Quotation Tool

A web-based quotation builder for the **Redesign Tung Viet Website** project. It is used to scope, price and synchronize the 38 features defined in the Request For Proposal (RFP) between the development team and the client.

> **Stack:** React 18 + Vite + Tailwind CSS + React Helmet (SEO) + Quill (rich text) + Framer Motion
> **Live:** https://tungviet.fun/estimate
> **API:** `/api/estimates` (Express + MongoDB, shared with the main `server/` workspace)

---

## Overview

The estimate app is a single-page tool that lets you:

- Browse the 38 features required by the Tung Viet RFP (homepage, products, cart, checkout, admin, etc.)
- For each feature, fill in **Requirement** and **Description** (rich text), pick a **Complexity** (`Low` / `Medium` / `High`), set **Hours**, **Days**, **Hourly Rate** and **Total Cost** (VND)
- Add, edit, delete rows on the fly
- **Auto-save** every change to the server (no manual save needed for individual rows)
- **Bulk save** the whole table at once (Save All Changes button at the bottom)
- **Export** the table to CSV for sharing
- See live totals (rows / cost / days) update in real time

All edits are persisted to MongoDB through the shared backend. The UI is fully in English and SEO-optimized for crawlers and social sharing.

---

## Project Structure

```
estimate/
├── index.html                    # SEO meta tags, Open Graph, Twitter Card
├── vercel.json                   # Vercel SPA rewrites
├── vite.config.js                # Vite config + /api proxy to backend
├── package.json
├── .env.production               # VITE_API_URL for production
└── src/
    ├── main.jsx                  # ReactDOM root + HelmetProvider
    ├── App.jsx                   # Router shell
    ├── index.css                 # Tailwind + design tokens
    ├── pages/
    │   └── EstimateQuotation.jsx # Main page (table, toolbar, stats, save)
    └── components/
        ├── SEO.jsx               # Helmet meta tag component
        ├── Skeleton.jsx          # Loading skeletons (table, stats, RFP)
        ├── EstimateTable.jsx     # Editable / deletable rows table
        └── EstimateFormModal.jsx # Add/Edit modal with rich text editors
```

---

## Quick Start

### 1. Install dependencies

```bash
cd estimate
npm install
```

### 2. Configure environment

Create `.env` (or `.env.production` for builds):

```env
VITE_API_URL=http://localhost:9007
```

For production, point it at the deployed backend (e.g. `https://api.tungviet.fun`).

### 3. Run the dev server

```bash
npm run dev
```

The app opens at `http://localhost:5173` by default. Vite is configured to proxy `/api/*` to the backend in `server/.env`.

### 4. Build for production

```bash
npm run build
```

The static bundle is emitted to `estimate/dist/` and is ready to be deployed to Vercel.

### 5. Preview the production build

```bash
npm run preview
```

---

## 38 Hạng mục báo giá (theo RFP)

Các hạng mục được chia thành **6 giai đoạn**, tổng cộng **38 features** cho dự án redesign website Tung Viet. Dữ liệu chi tiết tiếng Việt nằm trong script seed server:

**[`server/src/seedEstimateVN.js`](../server/src/seedEstimateVN.js)**

Script này chứa mảng `baoGia` với 38 object theo schema của model `Estimate`:

```js
{
  stt: 1,
  feature: 'Khởi động dự án (Kickoff)',
  requirement: '...', // Yêu cầu
  description: '...',  // Mô tả chi tiết
  complexity: 'Low' | 'Medium' | 'High',
  estimatedHours: 8,
  estimatedDays: 1,
  hourlyRate: 450000,  // VND / giờ
  totalCost: 3600000,  // VND
  notes: '',
  product: '',
}
```

**Cách chạy** (xóa dữ liệu cũ, insert lại 38 hạng mục vào MongoDB):

```bash
cd server
npm run seed:estimate:vn
```

Sau khi chạy xong, mở `http://localhost:5173/estimate` để xem bảng báo giá hiển thị.

**Giai đoạn:**
1. **Khảo sát & Thiết kế** (1-5)
2. **Phía khách hàng - Client** (6-20)
3. **Quản trị - Admin / Dashboard** (21-30)
4. **Tích hợp hệ thống** (31-33)
5. **SEO, Hiệu năng & Bảo mật** (34-36)
6. **Kiểm thử, Triển khai & Bàn giao** (37-38)

---

## Data Model

Each row in the estimate table is an **Estimate** document with the following fields:

| Field            | Type     | Notes                                                                 |
| ---------------- | -------- | --------------------------------------------------------------------- |
| `stt`            | Number   | Display order, defaults to 0                                          |
| `feature`        | String   | **Required.** Name of the feature                                      |
| `requirement`    | String   | Rich-text (HTML) - what needs to be built                              |
| `description`    | String   | Rich-text (HTML) - implementation notes                                |
| `complexity`     | String   | Enum: `Low` / `Medium` / `High`, default `Medium`                       |
| `estimatedHours` | Number   | Total dev hours                                                        |
| `estimatedDays`  | Number   | Total working days                                                     |
| `hourlyRate`     | Number   | VND per hour                                                           |
| `totalCost`      | Number   | VND (usually `estimatedHours * hourlyRate`)                            |
| `notes`          | String   | Optional notes                                                         |
| `product`        | String   | Optional product reference                                             |

Live totals (`Total estimate rows`, `Estimated total cost`, `Estimated total days`) are computed client-side with `useMemo`.

---

## API Reference

The estimate app talks to the shared backend through these endpoints (all under `/api/estimates`).

| Method   | Endpoint                       | Description                                       |
| -------- | ------------------------------ | ------------------------------------------------- |
| `GET`    | `/api/estimates`               | List all estimate rows (sorted by `stt`)          |
| `POST`   | `/api/estimates`               | **Bulk save** - delete-all + insert-all (admin override) |
| `POST`   | `/api/estimates/item`          | Create a single row                                |
| `PUT`    | `/api/estimates/item/:id`      | Update a single row                                |
| `DELETE` | `/api/estimates/item/:id`      | Delete a single row                                |

### Bulk save behavior

`POST /api/estimates` is the legacy "save everything" endpoint. It runs `Estimate.deleteMany({})` followed by `Estimate.insertMany(items)`. Use the **Save All Changes** button only when you intentionally want to replace the entire table.

For day-to-day work, prefer the per-row endpoints - they are wired automatically when you:

- click **Add Row** → modal → `POST /api/estimates/item`
- click **Edit** → modal → **Save Changes** → `PUT /api/estimates/item/:id`
- click **Delete** (trash icon) → `DELETE /api/estimates/item/:id`

---

## UI Walkthrough

### Toolbar (top header)

| Button              | Action                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------- |
| **Add Row**         | Open the modal in "create" mode                                                          |
| **Export CSV**      | Download the current table as `estimate-quotation.csv` (BOM-prefixed UTF-8 for Excel)   |
| **Load from Server**| Re-fetch the table from `/api/estimates`                                                |
| **Clear All**       | Empty the table (no server call - destructive, used for quick reset)                     |

### Table

Columns: `STT`, `Feature`, `Requirement`, `Description`, `Complexity`, `Hours`, `Days`, `Total Cost`, `Actions` (edit / delete).

### Stats cards (below the table)

Three live cards: `Total estimate rows`, `Estimated total cost` (VND, `vi-VN` locale), `Estimated total days`.

### Bottom action bar

A single primary button - **Save All Changes** - that triggers the bulk `POST /api/estimates`. Used when you want to replace the whole table on the server (e.g. after a big import).

### Status message

A small line under the toolbar shows feedback after each save / delete (e.g. `Updated successfully`, `Saved successfully`, `Failed to save on server`).

---

## SEO & Social Sharing

All SEO is handled by the `SEO` component in `src/components/SEO.jsx` using `react-helmet-async`.

| Tag              | Value                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| `html lang`      | `en`                                                                          |
| `og:locale`      | `en_US`                                                                       |
| `og:site_name`   | `Zuna Estimate`                                                               |
| `og:url`         | `https://tungviet.fun/estimate`                                              |
| Default title    | `Project Estimate & Quote - Tung Viet Website RFP \| Zuna`                  |
| Default description | `Professional cost and timeline estimation tool for Tung Viet website development project.` |
| Default keywords | `estimate, quote, website, Tung Viet, RFP, project cost, web development, budget, timeline` |
| Twitter card     | `summary_large_image`                                                         |

The static `index.html` also ships the same meta tags so the page is crawlable even before React hydrates.

---

## Deployment (Vercel)

`estimate/vercel.json` ships with SPA-friendly rewrites:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

Deployment steps:

1. Push the `estimate/` folder (or the whole monorepo) to GitHub.
2. Import the project in Vercel.
3. Set the **Root Directory** to `estimate`.
4. Add the env var `VITE_API_URL` pointing at the production API.
5. Vercel auto-builds with `npm run build` and serves the SPA from `dist/`.

---

## Tech Stack

| Concern               | Library                                  |
| --------------------- | ---------------------------------------- |
| UI framework          | React 18                                 |
| Build tool            | Vite 5                                   |
| Routing               | react-router-dom 6                       |
| Styling               | Tailwind CSS 3                           |
| Animations            | framer-motion                            |
| Icons                 | react-icons (Feather)                    |
| Rich-text editor      | react-quill                               |
| SEO                   | react-helmet-async                        |

---

## Conventions

- All UI strings are in **English** to match the public Tung Viet website.
- VND amounts are formatted with `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })` (e.g. `20.000.000 ₫`).
- The hex color palette is shared with the main app (`primary`, `primary-dark`, `primary-50`).
- Server ids are MongoDB ObjectIds (`/^[a-f0-9]{24}$/i`). The client checks for this pattern before issuing `PUT` / `DELETE` requests, so legacy rows without an id are skipped safely.
- All API errors are caught and rolled back locally - the UI never diverges from the server.

---

## Related Docs

- [Root README](../README.md) - full project overview (client / admin / server)
- [RFP spreadsheet](../Tung_Viet_Website_RFP.xlsx) - source of the 38 features
- [Server estimate controller](../server/src/controllers/estimate.controller.js)
- [Server estimate routes](../server/src/routes/estimate.routes.js)
