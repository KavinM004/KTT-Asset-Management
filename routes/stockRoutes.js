import express from "express";
import Asset from "../models/Asset.js";
import AssetCategory from "../models/AssetCategory.js";

const router = express.Router();

// Display assets currently available in stock
router.get("/", async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: {
        status: "Available",
      },
      include: [
        {
          model: AssetCategory,
          attributes: ["categoryName"],
        },
      ],
      order: [
        ["branch", "ASC"],
        ["assetCode", "ASC"],
      ],
    });

    // Calculate totals for each branch
    const branchTotals = {};

    let totalStockValue = 0;

    for (const asset of assets) {
      const branch = asset.branch;
      const value = Number(asset.purchaseValue);

      if (!branchTotals[branch]) {
        branchTotals[branch] = {
          branch,
          totalAssets: 0,
          totalValue: 0,
        };
      }

      branchTotals[branch].totalAssets += 1;
      branchTotals[branch].totalValue += value;
      totalStockValue += value;
    }

    res.render("stock", {
      title: "Stock View",
      assets,
      branchTotals: Object.values(branchTotals),
      totalStockValue,
    });
  } catch (error) {
    console.error("Stock View error:", error);
    res.status(500).send("Unable to load stock details.");
  }
});

export default router;