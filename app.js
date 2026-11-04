import express from "express";
import "dotenv/config";
import session from "express-session";
import connectSessionSequelize from "connect-session-sequelize";

import sequelize from "./config/database.js";

import Employee from "./models/Employee.js";
import User from "./models/User.js";
import Asset from "./models/Asset.js";
import AssetCategory from "./models/AssetCategory.js";
import AssetTransaction from "./models/AssetTransaction.js";
import AssetHistory from "./models/AssetHistory.js";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import assetCategoryRoutes from "./routes/assetCategoryRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

import { requireLogin, requireRole } from "./middleware/auth.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// Prevent browsers from caching
app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private, max-age=0"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  next();
});

const SequelizeStore = connectSessionSequelize(session.Store);

const sessionStore = new SequelizeStore({
  db: sequelize,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);

app.set("view engine", "jade");
app.set("views", "./views");

app.use(express.static("public"));

app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;

  const path = req.path;

  if (path === "/admin") {
    res.locals.activePage = "dashboard";
  } else if (path.startsWith("/employees")) {
    res.locals.activePage = "employees";
  } else if (path.startsWith("/assets")) {
    res.locals.activePage = "assets";
  } else if (path.startsWith("/asset-categories")) {
    res.locals.activePage = "categories";
  } else if (path.startsWith("/stock")) {
    res.locals.activePage = "stock";
  } else if (path.startsWith("/transactions/issue")) {
    res.locals.activePage = "issue";
  } else if (path.startsWith("/transactions/return")) {
    res.locals.activePage = "return";
  } else if (path.startsWith("/transactions/scrap")) {
    res.locals.activePage = "scrap";
  } else if (path.startsWith("/history")) {
    res.locals.activePage = "history";
  } else if (path.startsWith("/reports")) {
    res.locals.activePage = "reports";
  } else {
    res.locals.activePage = "";
  }

  next();
});

// Asset Category relationship
AssetCategory.hasMany(Asset, {
  foreignKey: {
    name: "assetCategoryId",
    allowNull: false,
  },
});

Asset.belongsTo(AssetCategory, {
  foreignKey: {
    name: "assetCategoryId",
    allowNull: false,
  },
});

// Asset and AssetTransaction relationship
Asset.hasMany(AssetTransaction, {
  foreignKey: {
    name: "assetId",
    allowNull: false,
  },
  onDelete: "RESTRICT",
});

AssetTransaction.belongsTo(Asset, {
  foreignKey: {
    name: "assetId",
    allowNull: false,
  },
});

// Employee and AssetTransaction relationship
Employee.hasMany(AssetTransaction, {
  foreignKey: {
    name: "employeeId",
    allowNull: false,
  },
  onDelete: "RESTRICT",
});

AssetTransaction.belongsTo(Employee, {
  foreignKey: {
    name: "employeeId",
    allowNull: false,
  },
});

// Asset and AssetHistory relationship
Asset.hasMany(AssetHistory, {
  foreignKey: {
    name: "assetId",
    allowNull: false,
  },
  onDelete: "RESTRICT",
});

AssetHistory.belongsTo(Asset, {
  foreignKey: {
    name: "assetId",
    allowNull: false,
  },
});

// Employee and AssetHistory relationship
Employee.hasMany(AssetHistory, {
  foreignKey: {
    name: "employeeId",
    allowNull: true,
  },
  onDelete: "RESTRICT",
});

AssetHistory.belongsTo(Employee, {
  foreignKey: {
    name: "employeeId",
    allowNull: true,
  },
});

// Connect each user account to an employee
User.belongsTo(Employee, {
  foreignKey: {
    name: "employeeId",
    allowNull: true,
    unique: true,
  },
  onDelete: "RESTRICT",
});

Employee.hasOne(User, {
  foreignKey: {
    name: "employeeId",
    allowNull: true,
    unique: true,
  },
  onDelete: "RESTRICT",
});

app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/asset-categories", assetCategoryRoutes);
app.use("/employees", requireLogin, requireRole("ADMIN"), employeeRoutes);
app.use("/assets", requireLogin, requireRole("ADMIN"), assetRoutes);
app.use("/stock", requireLogin, requireRole("ADMIN"), stockRoutes);
app.use("/transactions", requireLogin, requireRole("ADMIN"), transactionRoutes);
app.use("/history", requireLogin, requireRole("ADMIN"), historyRoutes);
app.use("/reports", requireLogin, requireRole("ADMIN"), reportRoutes);

app.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  if (req.session.user.role === "ADMIN") {
    return res.redirect("/admin");
  }

  return res.redirect("/user");
});

try {
  await sequelize.authenticate();
  console.log("Database Connected Successfully.");

  await sequelize.sync();
  await sessionStore.sync();
  console.log("Database tables are ready.");

  app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`);
  });
} catch (err) {
  console.error("Unable to connect to the database:", err);
}
