# Ningali 
Ngingali is A web application for managing operational vehicle bookings across the head office, branch office, and 6 mine sites, monitoring fuel consumption, service schedules, and vehicle usage history, with a multi-level approval workflow before any vehicle can be used.

---

## 1. Key Features

| # | Feature | Description |
|---|-------|------------|
| 1 | User Management | 2 roles: **Admin** (fleet pool / vehicle coordinator) and **Approver** (approving party) |
| 2 | Booking Input | Admin creates bookings, assigns driver and approvers |
| 3 | Multi-Level Approval | Minimum 2 approval levels (e.g. direct supervisor → department head) |
| 4 | In-App Approval | Approvers review and approve/reject requests directly in the application |
| 5 | Dashboard | Charts showing vehicle usage (by period, by unit, by region/mine site) |
| 6 | Periodic Reports | Export booking reports to Excel (daily/monthly/custom range) |
| 7 | Vehicle Monitoring | Fuel consumption, service schedule, and usage history per vehicle |
| 8 | Activity Log | Every process (create, approve, reject, update) is logged for audit trail |

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend Framework | **Laravel** | 11.x |
| Language | **PHP** | 8.3 |
| Database | **MySQL** | 8.0 |
| Frontend | **React** (Vite) | 18.x |
| Styling | **Tailwind CSS** | 3.x |
| Charts | Recharts | 2.x |
| Excel Export | maatwebsite/excel | 3.x |
| Auth | Laravel Sanctum (SPA token-based auth) | - |
| API | REST JSON (consumed by React via Axios) | - |

> The backend (Laravel API) and frontend (React SPA) are decoupled for independent development and deployment.

---

## 3. System Architecture

```
                        ┌─────────────────────────┐
                        │   React (Vite + Tailwind)│
                        │   SPA - Browser Client    │
                        └────────────┬─────────────┘
                                     │ REST API (JSON, Sanctum Token)
                                     ▼
                        ┌─────────────────────────┐
                        │      Laravel API          │
                        │  Controllers → Services    │
                        │  → Repositories → Models   │
                        │  Middleware: Auth, Role,    │
                        │  ActivityLog                │
                        └────────────┬─────────────┘
                                     │ Eloquent ORM
                                     ▼
                        ┌─────────────────────────┐
                        │        MySQL 8            │
                        │  (users, vehicles,         │
                        │   bookings, approvals,     │
                        │   fuel_logs, service_logs, │
                        │   activity_logs, regions)  │
                        └─────────────────────────┘
```

### Roles
- **Admin (Fleet Pool / Vehicle Coordinator)** — creates bookings, assigns vehicle & driver, sets level‑1 and level‑2 approvers, views all records, exports reports.
- **Approver (Supervisor)** — logs in, views the list of bookings pending their decision, approves/rejects with a note, and triggers notification to the next level upon approval.

### Multi-Level Approval Flow
```
Admin creates a booking
      │
      ▼
Status: PENDING APPROVAL L1 ──(reject)──► REJECTED (end)
      │ (approve)
      ▼
Status: PENDING APPROVAL L2 ──(reject)──► REJECTED (end)
      │ (approve)
      ▼
Status: APPROVED → vehicle ready for use
      │
      ▼
Status: COMPLETED (after the vehicle returns, driver logs final odometer/fuel)
```

---

## 4. Physical Data Model (summary)

Core tables related to the vehicle booking feature:

**regions** — id, name, type (`head_office`/`branch`/`mine_site`), address

**users** — id, name, email, password, role (`admin`/`approver`), region_id (FK), approval_level (nullable, 1/2), created_at

**vehicles** — id, code, plate_number, type (`passenger`/`goods`), ownership (`owned`/`rented`), rental_company (nullable), region_id (FK), status (`available`/`in_use`/`maintenance`)

**drivers** — id, name, phone, license_number, region_id (FK)

**bookings** — id, booking_no, vehicle_id (FK), driver_id (FK), requested_by (FK users), purpose, destination, region_id (FK), start_date, end_date, status (`pending_l1`/`pending_l2`/`approved`/`rejected`/`completed`), odometer_start, odometer_end, created_at

**booking_approvals** — id, booking_id (FK), approver_id (FK users), level (1/2), status (`pending`/`approved`/`rejected`), note, decided_at

**fuel_logs** — id, vehicle_id (FK), booking_id (FK, nullable), liters, cost, odometer, filled_at

**service_logs** — id, vehicle_id (FK), service_type, description, cost, service_date, next_service_due

**activity_logs** — id, user_id (FK), action, module, description, ip_address, created_at

> Key relationships: `bookings` 1—N `booking_approvals` (2 rows per booking for level 1 & 2), `vehicles` 1—N `fuel_logs` & `service_logs`, `users` 1—N `bookings` (as requester) and 1—N `booking_approvals` (as approver).
>
> A visual ERD (`.png`/`.drawio`) is provided separately in the `docs/erd` folder.

---

## 5. Activity Diagram — Vehicle Booking Feature

```
[Admin logs in]
     │
     ▼
[Enter booking data: vehicle, driver, destination, dates, L1 & L2 approvers]
     │
     ▼
[System saves booking → status: pending_l1] ──► [Log: booking_created]
     │
     ▼
[Notification sent to Approver L1]
     │
     ▼
<Approver L1 logs in & opens approval list>
     │
     ├── Reject ──► [Status: rejected] ──► [Log: rejected_l1] ──► End
     │
     └── Approve ──► [Status: pending_l2] ──► [Log: approved_l1] ──► Notification sent to Approver L2
                                                                          │
                                                              <Approver L2 logs in>
                                                                          │
                                              ┌───────────────────────────┴───────────────────────────┐
                                              │                                                         │
                                          Reject                                                    Approve
                                              │                                                         │
                                    [Status: rejected]                                     [Status: approved]
                                    [Log: rejected_l2]                                    [Log: approved_l2]
                                              │                                                         │
                                              ▼                                                         ▼
                                             End                                       [Vehicle status: in_use]
                                                                                                          │
                                                                                                          ▼
                                                                                    [Driver uses the vehicle]
                                                                                                          │
                                                                                                          ▼
                                                                                [Log final odometer & fuel]
                                                                                                          │
                                                                                                          ▼
                                                                                       [Status: completed]
                                                                                       [Log: booking_completed]
```

> A visual diagram (`.png`/`.drawio`, standard UML activity diagram notation) is provided separately in the `docs/activity-diagram` folder.

---

## 6. Project Folder Structure

```
fleet-app/
├── backend/                  # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Http/Middleware/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/api.php
│   └── .env.example
│
├── frontend/                 # React (Vite + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── booking/
│   │   │   ├── approval/
│   │   │   └── reports/
│   │   ├── services/api.js
│   │   └── App.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── docs/
    ├── erd/                  # Physical Data Model
    └── activity-diagram/
```

---

## 7. Default Username & Password

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@mail.co` | `Admin#12345` | Fleet pool / vehicle coordinator, head office |
| Approver Level 1 | `admin_approv@mail.com` | `Approve#123` | Direct supervisor (e.g. Site Supervisor) |
| Approver Level 2 | `manager@mail.com` | `Approve#456` | Department Head / Manager |

> ⚠️ Change all default passwords before using the application in a production environment.

---

## 8. Installation

### Prerequisites
- PHP >= 8.3, Composer
- Node.js >= 18, npm
- MySQL >= 8.0 (or SQLite — see troubleshooting below if you don't want to install MySQL locally)

### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# set DB_DATABASE, DB_USERNAME, DB_PASSWORD in .env
php artisan migrate --seed
php artisan serve
# API runs at http://localhost:8000
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
cp .env.example .env
# set VITE_API_URL=http://localhost:8000/api
npm run dev
# App runs at http://localhost:5173
```

---

## 9. Troubleshooting (Backend)

Common errors when setting up the Laravel backend locally, and how to fix each one.

### `composer: command not found`
Composer itself isn't installed on your machine. Install it globally first:
```bash
# Linux/macOS
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Windows
# Download and run Composer-Setup.exe from https://getcomposer.org/download/
```
Verify with `composer --version`, then re-run `composer install` inside `backend/`.

### `php: command not found`
PHP itself isn't installed. Install PHP 8.3+ (with common extensions: `mbstring`, `xml`, `curl`, `pdo_mysql`, `sqlite3`, `zip`, `gd`) for your OS, e.g.:
```bash
# Ubuntu/Debian
sudo apt install php8.3 php8.3-cli php8.3-mbstring php8.3-xml php8.3-curl php8.3-mysql php8.3-sqlite3 php8.3-zip

# macOS (Homebrew)
brew install php
```
Verify with `php -v`.

### `Class "..." not found` / `vendor/autoload.php` missing
The Composer dependencies haven't been installed (or `vendor/` was deleted/not included when copying the project). Run:
```bash
cd backend
composer install
```

### `SQLSTATE[HY000] [2002] Connection refused` (running `php artisan migrate`, `serve`, or any login)
Laravel can't reach MySQL. This means either MySQL isn't running, or the `.env` credentials don't match. Two ways to fix:

**Option A — use MySQL:**
1. Make sure the MySQL service is actually running:
   ```bash
   sudo systemctl status mysql   # Linux
   sudo systemctl start mysql
   # or start MySQL from XAMPP/Laragon if you use those
   ```
2. Create the database if it doesn't exist yet:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS fleet_app;"
   ```
3. Double-check `backend/.env` matches your local MySQL setup:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=fleet_app
   DB_USERNAME=root
   DB_PASSWORD=your_mysql_password
   ```

**Option B — skip MySQL entirely, use SQLite (simplest for local dev):**
```env
# in backend/.env
DB_CONNECTION=sqlite
```
```bash
cd backend
touch database/database.sqlite
php artisan migrate --seed
php artisan serve
```

### `.env` file missing / `APP_KEY` empty errors
The `.env` file isn't committed to the repo on purpose — copy it from the example and generate a fresh app key:
```bash
cd backend
cp .env.example .env
php artisan key:generate
```

### `SQLSTATE[HY000] [1049] Unknown database`
The database named in `DB_DATABASE` doesn't exist yet. Create it (see Option A step 2 above), or switch to SQLite (Option B).

### `Base table or view not found` when logging in or loading data
Migrations haven't been run yet (or ran without seeding demo accounts):
```bash
php artisan migrate --seed
```

### CORS error in the browser console (`has been blocked by CORS policy`)
The frontend's origin isn't in the backend's allow-list. Check `backend/.env`:
```env
CORS_ALLOWED_ORIGINS=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173,127.0.0.1
```
Make sure the port matches whatever `npm run dev` actually prints (Vite may pick a different port if 5173 is taken).

### Login succeeds but every other request returns 401 Unauthorized
Check `frontend/.env` — `VITE_API_URL` must point at your running Laravel server (default `http://localhost:8000/api`), and the frontend dev server must be restarted after changing `.env` (Vite only reads env files on startup).

---

## 10. User Guide

### As Admin
1. Log in with an admin account.
2. Go to **Bookings → New Booking**.
3. Select the vehicle, driver, destination, and usage dates.
4. Assign **Approver Level 1** and **Approver Level 2**.
5. Save — the booking status automatically becomes *Pending Approval L1*.
6. Track the status in the **Booking List** menu.
7. View the **Dashboard** for usage charts by period/region.
8. Open the **Reports** menu, select a date range, and click **Export Excel** to download the periodic report.

### As Approver
1. Log in with an approver account.
2. Go to **My Approvals** — shows the list of bookings pending your decision.
3. Click a booking to view the vehicle, driver, destination, and requester details.
4. Click **Approve** or **Reject** (a note is required when rejecting).
5. If approved and you are the level-1 approver, the booking automatically moves to the level-2 approver.

### Activity Log
Every action (booking creation, approval, rejection, vehicle update, etc.) is automatically recorded in the `activity_logs` table and can be viewed by admins via the **Activity Log** menu.
