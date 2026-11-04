# KT Asset Management System

A web-based Asset Management System developed using Node.js, Express.js, PostgreSQL, Sequelize ORM, Jade (Pug), Bootstrap, and CSS.

The application helps organizations manage employees, assets, asset categories, stock, asset issues, returns, scrap records, and asset history.

## Features

- **Employee Master** – Manage employee details.
- **Asset Master** – Add and manage asset information.
- **Asset Category Master** – Manage asset categories.
- **Stock View** – View available asset stock.
- **Issue Asset** – Issue assets to employees.
- **Return Asset** – Record returned assets.
- **Scrap Asset** – Manage scrapped assets.
- **Asset History** – View asset transaction history.
- **Reports** – View asset-related reports.
- **Role-Based Access** – Admin and user access management.

## Technologies Used

### Backend
- Node.js
- Express.js
- Sequelize ORM

### Database
- PostgreSQL

### Frontend
- Jade (Pug)
- Bootstrap
- HTML
- CSS
- JavaScript
- DataTables.net

## Project Structure

```text
KT-Asset-Management/
│
├── config/
│   └── database.js
│
├── middleware/
│
├── models/
│
├── public/
│   ├── css/
│   └── ...
│
├── routes/
│
├── views/
│
├── .env
├── .gitignore
├── app.js
├── createAdmin.js
├── createUserAccount.js.js
├── package.json
├── package-lock.json
└── README.md
```

## Prerequisites

Install the following software before starting:

1. [Node.js](https://nodejs.org/)
2. [PostgreSQL](https://www.postgresql.org/)
3. [pgAdmin 4](https://www.pgadmin.org/)
4. [Visual Studio Code](https://code.visualstudio.com/)
5. Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/KavinM004/KTT-Asset-Management.git
```

### 2. Open the Project Folder

```bash
cd KT-Asset-Management
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Create PostgreSQL Database

Open pgAdmin 4 and create a database.

Example database name:

```text
kt_asset_management
```

### 5. Configure Environment Variables

Create a `.env` file in the root directory.

Add the following configuration:

```env
PORT=5000

DB_NAME=kt_asset_management
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
DB_HOST=localhost
DB_PORT=5432

SESSION_SECRET=your_generated_session_secret

NODE_ENV=development
```

Replace the database username and password with your PostgreSQL credentials.

Generate a secure session secret using:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the generated value into `SESSION_SECRET`.

### 6. Start the Application

For development:

```bash
npm run dev
```

For normal execution:

```bash
npm start
```

### 7. Open the Application

Open your browser and visit:

```text
http://localhost:5000
```

## Environment Variables

| Variable | Description |
|---|---|
| PORT | Application port |
| DB_NAME | PostgreSQL database name |
| DB_USER | PostgreSQL username |
| DB_PASSWORD | PostgreSQL password |
| DB_HOST | Database host |
| DB_PORT | PostgreSQL port |
| SESSION_SECRET | Secret used for session management |
| NODE_ENV | Application environment |

## User Roles

The application supports role-based access:

- **Admin:** Access to authorized management operations.
- **User:** Access to authorized viewing operations.

## Deployment

The application can be deployed using:

- **Render Web Service** – Hosts the Node.js and Express application.
- **Render PostgreSQL** – Hosts the PostgreSQL database.

Configure the required environment variables in the Render dashboard before deploying.

## Security

- Keep `.env` private.
- Do not upload `node_modules` to GitHub.
- Do not expose database credentials or session secrets.
- Use appropriate access permissions for Admin and User accounts.

## Author

**Kavin M**

GitHub: [KavinM004](https://github.com/KavinM004)

---

**KT Asset Management System**