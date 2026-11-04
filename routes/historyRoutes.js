import express from "express";
import Asset from "../models/Asset.js";
import AssetHistory from "../models/AssetHistory.js";
import Employee from "../models/Employee.js";

const router = express.Router();

// Display Asset History
router.get("/", async (req, res) => {
  try {
    const assets = await Asset.findAll({
      order: [["assetCode", "ASC"]],
    });

    const histories = await AssetHistory.findAll({
      include: [{ model: Asset }, { model: Employee }],
      order: [
        ["actionDate", "DESC"],
        ["id", "DESC"],
      ],
    });

    // Calculate total investment of all registered assets
    const totalInvestment = await Asset.sum("purchaseValue");

    res.render("assetHistory", {
      assets,
      histories,
      totalInvestment: totalInvestment || 0,
    });
  } catch (err) {
    console.error("Unable to load Asset History:", err);
    res.status(500).send("Unable to load Asset History.");
  }
});

export default router;
