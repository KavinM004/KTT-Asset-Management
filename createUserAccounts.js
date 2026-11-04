import "dotenv/config";
import bcrypt from "bcrypt";
import sequelize from "./config/database.js";
import User from "./models/User.js";
import Employee from "./models/Employee.js";

async function createUserAccounts() {
  try {
    await sequelize.authenticate();

    console.log("Database connected successfully.");

    const employees = [
      {
        id: 1,
        email: "karthickkavin004@gmail.com",
      },
      {
        id: 6,
        email: "kavikavi7@gmail.com",
      },
    ];

    for (const employeeData of employees) {
      const employee = await Employee.findByPk(employeeData.id);

      if (!employee) {
        console.log(
          `Employee ID ${employeeData.id} not found. Skipping.`
        );
        continue;
      }

      if (
        employee.email.toLowerCase() !==
        employeeData.email.toLowerCase()
      ) {
        console.log(
          `Email mismatch for employee ID ${employeeData.id}. Skipping.`
        );
        continue;
      }

      const existingAccount = await User.findOne({
        where: { employeeId: employee.id },
      });

      if (existingAccount) {
        console.log(
          `Employee ID ${employee.id} already has a linked account. Skipping.`
        );
        continue;
      }

      const existingEmail = await User.findOne({
        where: { email: employee.email },
      });

      if (existingEmail) {
        console.log(
          `An account already exists for ${employee.email}. No changes made.`
        );
        continue;
      }

      const password = await promptPassword(
        `Enter a password for ${employee.email}: `
      );

      if (password.length < 8) {
        console.log("Password must contain at least 8 characters.");
        continue;
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await User.create({
        email: employee.email,
        passwordHash,
        role: "USER",
        employeeId: employee.id,
      });

      console.log(
        `User account created and linked to employee ID ${employee.id}.`
      );
    }

    console.log("Account setup finished.");
  } catch (error) {
    console.error("Account setup failed:", error.message);
  } finally {
    await sequelize.close();
  }
}

async function promptPassword(message) {
  const readline = await import("node:readline/promises");
  const { stdin, stdout } = await import("node:process");

  const terminal = readline.createInterface({
    input: stdin,
    output: stdout,
  });

  try {
    const password = await terminal.question(message);
    return password;
  } finally {
    terminal.close();
  }
}

createUserAccounts();