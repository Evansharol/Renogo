# Fleet Management Application

A role-based fleet order management system that streamlines vehicle requests from dealers through production, finance approval, and delivery.

## Features

- Secure Login & Role-Based Access
- Admin Dashboard
- Dealer Order Management
- Production Planning & Approval
- Finance Validation
- Delivery Scheduling
- Notifications & Alerts
- Reports and Audit Tracking

## Workflow

1. Admin creates dealer accounts.
2. Dealer submits vehicle order requests.
3. Production team validates inventory and capacity.
4. Finance team verifies advance payments.
5. Production and Finance approve quantities and delivery plans.
6. Dealer receives status updates and delivery notifications.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Redux Toolkit (RTK Query) and React-Redux
- CSS

## Order Data

RTK Query is the shared client cache for server-owned orders, statuses, and workflow history. Dealer screens use `GET /orders?dealerId=...`; other role dashboards use `GET /orders`. Order creation and workflow updates use the existing `POST /orders` and `PUT /orders/:id` operations. Successful mutations invalidate order cache tags so subscribed screens refresh from the server. Filters, selections, and modal state remain local to their screens.

There is no separate workflow, approval, or rejection endpoint. Workflow transitions are persisted as updates to the corresponding order record.

## Installation

```bash
npm install
npm run dev
```
