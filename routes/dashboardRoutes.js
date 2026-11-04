import express from "express";
import { requireLogin, requireRole } from "../middleware/auth.js";

import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Asset from "../models/Asset.js";
import AssetCategory from "../models/AssetCategory.js";
import AssetTransaction from "../models/AssetTransaction.js";
import AssetHistory from "../models/AssetHistory.js";

const router = express.Router();

// Admin Dashboard
router.get("/admin", requireLogin, requireRole("ADMIN"), (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");

  res.render("adminDashboard", {
    title: "Admin Dashboard",
    user: req.session.user,
  });
});

// User Dashboard
router.get("/user", requireLogin, requireRole("USER"), async (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");

  try {
    // Find the logged-in account and its linked employee
    const account = await User.findByPk(req.session.user.id, {
      include: [
        {
          model: Employee,
        },
      ],
    });

    // If the account does not exist
    if (!account) {
      return res.status(404).send("User account not found.");
    }

    // Get the employee linked to this user account
    const employee = account.Employee;

    // If this account is not linked to an employee
    if (!employee) {
      return res.render("userDashboard", {
        title: "User Dashboard",
        user: req.session.user,
        employee: null,
        issuedAssets: [],
        assetHistory: [],
        message:
          "Your account is not linked to an employee record. Please contact the administrator.",
      });
    }

    // Get assets currently issued to this employee
    const issuedAssets = await AssetTransaction.findAll({
      where: {
        employeeId: employee.id,
        returnDate: null,
      },
      include: [
        {
          model: Asset,
          required: true,
          include: [
            {
              model: AssetCategory,
              required: false,
            },
          ],
        },
      ],
      order: [["issueDate", "DESC"]],
    });

    // Get the employee's recorded asset history
    const assetHistory = await AssetHistory.findAll({
      where: {
        employeeId: employee.id,
      },
      include: [
        {
          model: Asset,
          required: true,
        },
      ],
      order: [
        ["actionDate", "DESC"],
        ["id", "DESC"],
      ],
    });

    // Render the User Dashboard with database records
    return res.render("userDashboard", {
      title: "User Dashboard",
      user: req.session.user,
      employee,
      issuedAssets,
      assetHistory,
      message: null,
    });
  } catch (err) {
    console.error("User Dashboard error:", err);

    return res.status(500).send(
      "Unable to load the User Dashboard. Please try again later."
    );
  }
});

export default router;