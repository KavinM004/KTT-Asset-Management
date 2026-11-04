import express from "express";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import Asset from "../models/Asset.js";
import AssetCategory from "../models/AssetCategory.js";
import AssetHistory from "../models/AssetHistory.js";

import { requireLogin, requireRole } from "../middleware/auth.js";

const router = express.Router();

// View, search, and filter assets
router.get("/", requireLogin, requireRole("ADMIN"), async (req, res) => {
  try {
    const { search = "", categoryId = "" } = req.query;

    const where = {};

    if (search.trim()) {
      where[Op.or] = [
        { make: { [Op.iLike]: `%${search.trim()}%` } },
        { model: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    if (categoryId) {
      where.assetCategoryId = categoryId;
    }

    // Exclude scrapped assets from ordinary pages
    where.status = { [Op.ne]: "Scrapped" };

    const [assets, categories] = await Promise.all([
      Asset.findAll({
        where,
        include: [{ model: AssetCategory }],
        order: [["createdAt", "DESC"]],
      }),
      AssetCategory.findAll({ order: [["categoryName", "ASC"]] }),
    ]);

    res.render("assets", {
      title: "Asset Master",
      assets,
      categories,
      search,
      categoryId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to load assets.");
  }
});

// Show add asset form
router.get("/add", requireLogin, requireRole("ADMIN"), async (req, res) => {
  const categories = await AssetCategory.findAll({
    order: [["categoryName", "ASC"]],
  });

  res.render("addAsset", {
    title: "Add Asset",
    categories,
    user: req.session.user,
    activePage: "assets",
  });
});

// Add asset and record purchase history
router.post("/add", requireLogin, requireRole("ADMIN"), async (req, res) => {
  const {
    assetCode,
    serialNumber,
    make,
    model,
    branch,
    purchaseDate,
    purchaseValue,
    assetCategoryId,
  } = req.body;

  // Validate required fields
  if (
    !assetCode?.trim() ||
    !serialNumber?.trim() ||
    !make?.trim() ||
    !model?.trim() ||
    !branch?.trim() ||
    !purchaseDate ||
    purchaseValue === undefined ||
    purchaseValue === "" ||
    !assetCategoryId
  ) {
    return res.status(400).send("Please complete all required fields.");
  }

  const dbTransaction = await sequelize.transaction();

  try {
    // Create asset
    const asset = await Asset.create(
      {
        assetCode: assetCode.trim(),
        serialNumber: serialNumber.trim(),
        make: make.trim(),
        model: model.trim(),
        branch: branch.trim(),
        purchaseDate,
        purchaseValue,
        assetCategoryId,
      },
      { transaction: dbTransaction }
    );

    // Record purchase in asset history
    await AssetHistory.create(
      {
        assetId: asset.id,
        employeeId: null,
        action: "Purchased",
        actionDate: purchaseDate,
        reason: `Asset purchased and registered. Purchase value: ${purchaseValue}`,
      },
      { transaction: dbTransaction }
    );

    // Commit both operations
    await dbTransaction.commit();

    res.redirect("/assets");
  } catch (error) {
    if (!dbTransaction.finished) {
      await dbTransaction.rollback();
    }

    console.error("Unable to add asset:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .send("Asset code or serial number already exists.");
    }

    res.status(400).send("Unable to add asset. Check the entered details.");
  }
});

// Show edit asset form
router.get(
  "/edit/:id",
  requireLogin,
  requireRole("ADMIN"),
  async (req, res) => {
    const asset = await Asset.findByPk(req.params.id);
    const categories = await AssetCategory.findAll({
      order: [["categoryName", "ASC"]],
    });

    if (!asset || asset.status === "Scrapped") {
      return res.status(404).send("Asset not found.");
    }

    res.render("editAsset", {
      title: "Edit Asset",
      asset,
      categories,
      user: req.session.user,
      activePage: "assets",
    });
  },
);

// Update asset
router.post(
  "/edit/:id",
  requireLogin,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const asset = await Asset.findByPk(req.params.id);

      if (!asset || asset.status === "Scrapped") {
        return res.status(404).send("Asset not found.");
      }

      await asset.update({
        assetCode: req.body.assetCode.trim(),
        serialNumber: req.body.serialNumber.trim(),
        make: req.body.make.trim(),
        model: req.body.model.trim(),
        branch: req.body.branch.trim(),
        purchaseDate: req.body.purchaseDate,
        purchaseValue: req.body.purchaseValue,
        assetCategoryId: req.body.assetCategoryId,
        status: req.body.status,
      });

      res.redirect("/assets");
    } catch (error) {
      console.error(error);

      if (error.name === "SequelizeUniqueConstraintError") {
        return res
          .status(400)
          .send("Asset code or serial number already exists.");
      }

      res
        .status(400)
        .send("Unable to update asset. Check the entered details.");
    }
  },
);

export default router;
