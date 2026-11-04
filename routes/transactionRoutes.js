import express from "express";
import { Op } from "sequelize";

import sequelize from "../config/database.js";
import Asset from "../models/Asset.js";
import Employee from "../models/Employee.js";
import AssetTransaction from "../models/AssetTransaction.js";
import AssetHistory from "../models/AssetHistory.js";

const router = express.Router();

// Display Issue Asset page
router.get("/issue", async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: { status: "Available" },
      order: [["assetCode", "ASC"]],
    });

    const employees = await Employee.findAll({
      where: { status: "Active" },
      order: [["employeeCode", "ASC"]],
    });

    res.render("issueAsset", { assets, employees });
  } catch (err) {
    console.error("Unable to load Issue Asset page:", err);
    res.status(500).send("Unable to load Issue Asset page.");
  }
});

// Issue an asset to an employee
router.post("/issue", async (req, res) => {
  const { assetId, employeeId, issueDate } = req.body;

  if (!assetId || !employeeId || !issueDate) {
    return res.status(400).send("Please complete all required fields.");
  }

  const transaction = await sequelize.transaction();

  try {
    const asset = await Asset.findByPk(assetId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!asset || asset.status !== "Available") {
      await transaction.rollback();
      return res.status(400).send("This asset is not available for issue.");
    }

    const employee = await Employee.findByPk(employeeId, { transaction });

    if (!employee || employee.status !== "Active") {
      await transaction.rollback();
      return res.status(400).send("Please select an active employee.");
    }

    const assetTransaction = await AssetTransaction.create(
      {
        assetId: asset.id,
        employeeId: employee.id,
        issueDate,
      },
      { transaction },
    );

    await asset.update({ status: "Issued" }, { transaction });

    await AssetHistory.create(
      {
        assetId: asset.id,
        employeeId: employee.id,
        action: "Issued",
        actionDate: issueDate,
        reason: `Issued to employee ${employee.employeeCode}`,
      },
      { transaction },
    );

    await transaction.commit();

    res.redirect("/transactions/issue?success=1");
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Unable to issue asset:", err);
    res.status(500).send("Unable to issue asset. Please check the server logs.");
  }
});

// Display Return Asset page
router.get("/return", async (req, res) => {
  try {
    const transactions = await AssetTransaction.findAll({
      where: { returnDate: null },
      include: [
        { model: Asset },
        { model: Employee },
      ],
      order: [["issueDate", "DESC"]],
    });

    res.render("returnAsset", {
      transactions,
      success: req.query.success === "1",
    });
  } catch (err) {
    console.error("Unable to load Return Asset page:", err);
    res.status(500).send("Unable to load Return Asset page.");
  }
});

// Process asset return
router.post("/return", async (req, res) => {
  const { transactionId, returnDate, returnReason } = req.body;

  if (!transactionId || !returnDate || !returnReason) {
    return res.status(400).send("Please complete all required fields.");
  }

  const transaction = await sequelize.transaction();

  try {
    const assetTransaction = await AssetTransaction.findByPk(transactionId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!assetTransaction || assetTransaction.returnDate) {
      await transaction.rollback();
      return res.status(400).send("This transaction has already been returned or does not exist.");
    }

    const asset = await Asset.findByPk(assetTransaction.assetId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const employee = await Employee.findByPk(
      assetTransaction.employeeId,
      { transaction }
    );

    if (!asset || asset.status !== "Issued") {
      await transaction.rollback();
      return res.status(400).send("This asset is not currently issued.");
    }

    // Repair returns remain unavailable; other returns become available.
    const newStatus =
      returnReason === "Repair" ? "Under Repair" : "Available";

    await assetTransaction.update(
      {
        returnDate,
        returnReason,
      },
      { transaction }
    );

    await asset.update(
      { status: newStatus },
      { transaction }
    );

    await AssetHistory.create(
      {
        assetId: asset.id,
        employeeId: employee?.id ?? null,
        action: "Returned",
        actionDate: returnDate,
        reason: `Returned by employee ${employee?.employeeCode ?? "Unknown"}: ${returnReason}`,
      },
      { transaction }
    );

    await transaction.commit();

    res.redirect("/transactions/return?success=1");
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Unable to return asset:", err);
    res.status(500).send("Unable to return asset. Please check the server logs.");
  }
});

// Display Scrap Asset page
router.get("/scrap", async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: {
        status: {
          [Op.in]: ["Available", "Under Repair"],
        },
      },
      order: [["assetCode", "ASC"]],
    });

    res.render("scrapAsset", {
      assets,
      success: req.query.success === "1",
    });
  } catch (err) {
    console.error("Unable to load Scrap Asset page:", err);
    res.status(500).send("Unable to load Scrap Asset page.");
  }
});

// Process asset scrapping
router.post("/scrap", async (req, res) => {
  const { assetId, scrapDate, scrapReason } = req.body;

  if (!assetId || !scrapDate || !scrapReason?.trim()) {
    return res.status(400).send("Please complete all required fields.");
  }

  const transaction = await sequelize.transaction();

  try {
    const asset = await Asset.findByPk(assetId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (
      !asset ||
      !["Available", "Under Repair"].includes(asset.status)
    ) {
      await transaction.rollback();
      return res.status(400).send(
        "Only Available or Under Repair assets can be scrapped."
      );
    }

    await asset.update(
      { status: "Scrapped" },
      { transaction }
    );

    await AssetHistory.create(
      {
        assetId: asset.id,
        employeeId: null,
        action: "Scrapped",
        actionDate: scrapDate,
        reason: scrapReason.trim(),
      },
      { transaction }
    );

    await transaction.commit();

    res.redirect("/transactions/scrap?success=1");
  } catch (err) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Unable to scrap asset:", err);
    res.status(500).send(
      "Unable to scrap asset. Please check the server logs."
    );
  }
});

export default router;