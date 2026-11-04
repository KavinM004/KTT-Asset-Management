
# KT Asset Management System

A web-based Asset Management System developed to manage company employees, assets, stock, asset transactions, and asset history.

## Live Demo

**Deployed URL:** https://YOUR-DEPLOYED-URL

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- Jade (Pug)
- Bootstrap
- HTML
- CSS
- JavaScript
- DataTables.net

## Features

### 1. Employee Master
- Add and manage employee details.
- View and search employee records.

### 2. Asset Category Master
- Create and manage asset categories.

### 3. Asset Master
- Add, update, and manage company assets.
- Store asset purchase date and purchase value.

### 4. Stock View
- View available asset stock.

### 5. Issue Asset
- Assign assets to employees.
- Record issue details.

### 6. Return Asset
- Record returned assets.
- Maintain return history.

### 7. Scrap Asset
- Mark obsolete or damaged assets as scrapped.
- Keep scrapped assets available in reports and history.

### 8. Asset History
- Track asset activities from purchase to scrapping.
- View purchase values and asset transaction history.

### 9. Reports
- View asset reports.
- Review branch-wise stock and purchase values.

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the project folder

```bash
cd KT-Asset-Management
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file and configure your PostgreSQL database credentials.

```env
PORT=5000
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432
SESSION_SECRET=your_session_secret
```

### 5. Start the application

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

## Database

PostgreSQL is used as the database, and Sequelize ORM handles database operations.

## Author

Developed as a KT Asset Management project.
