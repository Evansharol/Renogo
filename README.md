# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # Fleet Application

  The Fleet Application manages large vehicle orders from dealer request through production approval, finance validation, and final delivery. It gives each team a role-specific dashboard and keeps the complete order history auditable.

  ## Task 1: Fleet Order Management

  An administrator logs in first and creates dealer accounts with the appropriate permissions. A dealer can then log in and request 100 or more vehicles. The request is routed to the plant production team, which checks available inventory and production capacity. The finance team validates the dealer's advance payment and confirms how many vehicles can be produced within the available funds. Production and finance then coordinate the delivery date and location, and the dealer receives updates through the dashboard and notifications.

  ## Functional Flow

  1. **Admin login:** The admin authenticates and gains access to the system.
  2. **Dealer management:** The admin creates dealer accounts and assigns permissions.
  3. **Dealer request:** The dealer submits a vehicle order, such as an order for 100+ vehicles.
  4. **Production check:** The plant production team reviews inventory and production capacity.
  5. **Finance validation:** The finance team verifies the advance payment and approves the number of vehicles that can be produced.
  6. **Delivery planning:** Production and finance agree on the delivery date and location.
  7. **Dealer notification:** The dealer receives approval, rejection, and delivery updates through the dashboard, email, SMS, or in-app notifications.

  ## Functional Components

  - **Authentication:** Login and role-based access control.
  - **Admin Dashboard:** Manage users, dealers, and permissions.
  - **Dealer Dashboard:** Place orders and track request status.
  - **Production Dashboard:** Review requests, inventory, and production capacity.
  - **Finance Dashboard:** Validate advance payments and approve production quantities.
  - **Delivery Module:** Schedule, track, and manage vehicle deliveries.
  - **Notification System:** Send email, SMS, and in-app alerts.
  - **Reports and Analytics:** Show order volumes, production capacity, and financial health.

  ## Non-Functional Requirements

  - **Scalability:** Support thousands of vehicles and orders.
  - **Security:** Protect data with authentication, authorization, and encryption.
  - **Performance:** Provide fast responses for large datasets.
  - **Reliability:** Handle failures and maintain high availability.
  - **Usability:** Provide intuitive dashboards for non-technical users.
  - **Auditability:** Log who approved each action and when it occurred.

  ## Architecture

  The application uses a **microservice architecture**. The system is divided into small, independent services that communicate over a network. This approach allows each business capability, such as authentication, orders, production, finance, delivery, and notifications, to be developed, deployed, scaled, and maintained independently.

  The key design priorities are:

  - Role-based access so each team sees only the information it needs.
  - Automated workflow from dealer request to production, finance, and delivery.
  - Shared data between production and finance for consistent decisions.
  - Immediate notifications for approvals, rejections, and delivery schedules.
  - Centralized audit logs and reporting for administrators and managers.

  ## Local Development

  Install dependencies and start the Vite development server:

  ```bash
  npm install
  npm run dev
  ```

  Run the production build or lint checks:

  ```bash
  npm run build
  npm run lint
  ```

  The application is built with React, TypeScript, Vite, and React Router.
