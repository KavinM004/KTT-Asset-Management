import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();

// Show login page
router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    error: "",
  });
});

// Check login details
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).render("login", {
        title: "Login",
        error: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).render("login", {
        title: "Login",
        error: "Invalid email or password",
      });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    req.session.save((err) => {
      if (err) {
        return res.status(500).send("Unable to create login session");
      }

      if (user.role === "ADMIN") {
        return res.redirect("/admin");
      }

      return res.redirect("/user");
    });
  } catch (err) {
    res.status(500).send("Login error: " + err.message);
  }
});

// Log out
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Unable to log out");
    }

    res.clearCookie("connect.sid");

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    return res.redirect("/login");
  });
});

export default router;