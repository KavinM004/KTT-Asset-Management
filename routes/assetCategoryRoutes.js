import express from "express";
import AssetCategory from "../models/AssetCategory.js";
import { requireLogin, requireRole } from "../middleware/auth.js";

const router = express.Router();

// View categories
router.get("/", requireLogin, requireRole("ADMIN"), async (req, res) => {
  try {
    const categories = await AssetCategory.findAll({
      order: [["categoryName", "ASC"]],
    });

    res.render("assetCategories", {
      title: "Asset Categories",
      categories,
      error: "",
      user: req.session.user,
      activePage: "categories",
    });
  } catch (err) {
    res.status(500).send("Unable to load categories.");
  }
});

// Add category
router.post("/add", requireLogin, requireRole("ADMIN"), async (req, res) => {
  try {
    const categoryName = req.body.categoryName?.trim();

    if (!categoryName) {
      const categories = await AssetCategory.findAll({
        order: [["categoryName", "ASC"]],
      });

      return res.status(400).render("assetCategories", {
        title: "Asset Categories",
        categories,
        error: "Category name is required.",
      });
    }

    await AssetCategory.create({ categoryName });

    res.redirect("/asset-categories");
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      const categories = await AssetCategory.findAll({
        order: [["categoryName", "ASC"]],
      });

      return res.status(400).render("assetCategories", {
        title: "Asset Categories",
        categories,
        error: "This category already exists.",
      });
    }

    res.status(500).send("Unable to add category.");
  }
});

// Edit category
router.post(
  "/edit/:id",
  requireLogin,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const category = await AssetCategory.findByPk(req.params.id);

      if (!category) {
        return res.status(404).send("Category not found.");
      }

      const categoryName = req.body.categoryName?.trim();

      if (!categoryName) {
        return res.status(400).send("Category name is required.");
      }

      await category.update({ categoryName });

      res.redirect("/asset-categories");
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(400).send("This category already exists.");
      }

      res.status(500).send("Unable to update category.");
    }
  },
);

export default router;
