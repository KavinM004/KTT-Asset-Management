import "dotenv/config";
import bcrypt from "bcrypt";
import sequelize from "./config/database.js";
import User from "./models/User.js";

async function createAdmin() {
  try {
    await sequelize.authenticate();

    const email = "admin@gmail.com";
    const password = "Admin@12345";

    const existingAdmin = await User.findOne({
      where: { email },
    });

    if (existingAdmin) {
      console.log("This account already exists.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      email,
      passwordHash,
      role: "ADMIN",
    });

    console.log("Admin account created successfully.");
    console.log("Email:", email);
    console.log("Password:", password);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
  } finally {
    await sequelize.close();
  }
}

createAdmin();
