## Wellmeadows Hospital Management System

## Project Description

Wellmeadows Hospital Management System is a web-based hospital information system built for Wellmeadows Hospital. The system handles patient registration and admission, staff records, ward and bed management, medication tracking, supply requisitions, and staff scheduling. It features role-based access control for Personnel Officers, Charge Nurses, and Medical Directors.

---

## Team Members

| Name | Role | Module |
|------|------|--------|
| CAPURAS, Anthony C. | Project Controller / Developer | Module 3 — Ward & Bed Management |
| ACOBO, Dave Christian R. | Developer | Module 2 — Staff & Department Management |
| JAMISOLA, Alchris June J. | Developer | Module 1 — Patient Management |

---

## Tech Stack

- **Backend:** Laravel 11, PHP
- **Frontend:** React (TypeScript) via Inertia.js
- **Database:** PostgreSQL (Railway)
- **Styling:** Tailwind CSS + shadcn/ui
- **Build Tool:** Vite
- **Version Control:** Git & GitHub
- **Deployment:** Railway

---

## Repository Link

```
https://github.com/iiThN/wellmeadows-hospital
```

---

## Setup Instructions

### Clone Repository

```bash
git clone https://github.com/iiThN/wellmeadows-hospital.git
cd wellmeadows-hospital
```

### Install Dependencies

```bash
composer install
npm install
```

### Configure Environment

```bash
cp .env.example .env
php artisan key:generate
```

Update `.env` with your database credentials:

```env
DB_CONNECTION=pgsql
DB_HOST=
DB_PORT=5432
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
```

### Run Migrations

```bash
php artisan migrate
```

### Start Development Server

Open two terminals:

```bash
# Terminal 1
npm run dev

# Terminal 2
php artisan serve
```

Then open your browser at `http://127.0.0.1:8000`

---

## Default Login Credentials

All accounts use the password: `password`

| Role | Email |
|------|-------|
| Personnel Officer | personnel@wellmeadows.com |
| Charge Nurse | thon@wellmeadows.com |
| Medical Director | adobelexi@gmail.com |

---

## Role-Based Access Control

| Role | Access |
|------|--------|
| `personnel_officer` | Staff Management, Account Management, Ward Management |
| `charge_nurse` | Patient Management, Medication, Requisitions, Staff Rota, Ward Management |
| `medical_director` | Director Dashboard, system-wide overview |

---

## Module Assignment

| Module | Description | Developer |
|--------|-------------|-----------|
| Module 1 | Patient Management | JAMISOLA, Alchris June J. |
| Module 2 | Staff & Department Management | ACOBO, Dave Christian R. |
| Module 3 | Ward & Bed Management | CAPURAS, Anthony C. |

---

## Database Information

### Platform

```
Local:      PostgreSQL
Production: Railway PostgreSQL
```

### Main Tables

| Table | Purpose |
|-------|---------|
| users | Authentication and role management |
| wards | Ward details and bed capacity |
| staff | Staff personal and employment records |
| qualifications | Staff academic qualifications |
| workexperiences | Staff previous work history |
| staff_positions | Staff department and role assignments |
| staffrotas | Staff shift scheduling |
| patients | Patient personal and medical records |
| nextofkins | Patient next-of-kin information |
| localdoctors | Patient referred/local doctor records |
| inpatients | Inpatient admissions and bed assignments |
| outpatients | Outpatient visit records |
| appointments | Patient appointment scheduling |
| patientmedications | Medications prescribed to patients |
| pharmaceuticalsupplies | Drug and pharmaceutical inventory |
| supplies | General ward supply inventory |
| suppliers | Supplier information |
| requisitions | Ward supply requisition orders |
| requisitionitems | Individual line items per requisition |

---

## Deployment Information

### Live URL

```
https://wellmeadows-hospital-production-ed7f.up.railway.app
```

### Hosting Platform

```
Railway — https://railway.app
```

---

## Screenshots

### Login Page

<img width="1364" height="642" alt="preview" src="https://github.com/user-attachments/assets/08e5765d-c9a3-4090-a3a6-4d77c493bea0" />

### Charge Nurse Dashboard
<img width="1359" height="514" alt="preview (4)" src="https://github.com/user-attachments/assets/734d9889-c24d-4631-a42e-a2ff169e7373" />

### Patient Management
<img width="1355" height="639" alt="preview (3)" src="https://github.com/user-attachments/assets/9ccf3fa2-005d-43ab-ae63-6cbe39bc20b8" />


### Staff Management
<img width="1366" height="622" alt="preview (1)" src="https://github.com/user-attachments/assets/0490848e-0de7-4b3b-b449-938637acf8b9" />


### Ward & Bed Management
<img width="1366" height="640" alt="preview (2)" src="https://github.com/user-attachments/assets/627c86fe-b0df-4917-90f8-1dea28e6fe10" />


## Notes

### Important Reminders

1. Make sure PostgreSQL is running before starting the application.
2. Run `npm run dev` and `php artisan serve` in two separate terminals.
3. Always run `php artisan migrate` after pulling new changes that include migrations.
4. The `.env` file is not included in the repository — copy from `.env.example` and configure manually.
5. When deploying to Railway, make sure all environment variables are set correctly in the Railway dashboard.


---

### Known Issues / Limitations

1. Module 4 (Appointment & Treatment) and Module 5 (Billing & Reporting) are not yet implemented in this version.
2. There is no real-time notification system — users must manually refresh to see updates.
3. The system does not currently support password reset via email in the production environment.


