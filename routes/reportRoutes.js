import express from "express";
import { Op, fn, col, literal } from "sequelize";

import Asset from "../models/Asset.js";
import Employee from "../models/Employee.js";
import AssetHistory from "../models/AssetHistory.js";
import AssetTransaction from "../models/AssetTransaction.js";

const router = express.Router();

// Display Reports page
router.get("/", async (req, res) => {
  try {
    // Asset counts grouped by status
    const statusCounts = await Asset.findAll({
      attributes: [
        "status",
        [fn("COUNT", col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    // Asset quantity and purchase value grouped by branch
    const branchReports = await Asset.findAll({
      attributes: [
        "branch",
        [fn("COUNT", col("id")), "totalAssets"],
        [
          fn("SUM", col("purchaseValue")),
          "totalPurchaseValue",
        ],
      ],
      where: {
        status: { [Op.ne]: "Scrapped" },
      },
      group: ["branch"],
      order: [["branch", "ASC"]],
      raw: true,
    });

    // Scrapped assets and their scrap history
    const scrapReports = await AssetHistory.findAll({
      where: { action: "Scrapped" },
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

    // Currently issued assets and employee details
    const employeeAssetReports = await AssetTransaction.findAll({
      where: { returnDate: null },
      include: [
        {
          model: Asset,
          required: true,
          where: { status: "Issued" },
        },
        {
          model: Employee,
          required: true,
        },
      ],
      order: [["issueDate", "DESC"]],
    });

    res.render("reports", {
      statusCounts,
      branchReports,
      scrapReports,
      employeeAssetReports,
    });
  } catch (err) {
    console.error("Unable to load Reports page:", err);
    res.status(500).send(
      "Unable to load Reports page. Please check the server logs."
    );
  }
});

export default router;
