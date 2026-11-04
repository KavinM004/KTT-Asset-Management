import express from "express";
import Employee from "../models/Employee.js";
import { Op } from "sequelize";

const router = express.Router();

// Display Employee Master with search and status filters
router.get("/", async (req, res) => {
  try {
    const { search = "", status = "" } = req.query;

    const where = {};

    if (status === "Active" || status === "Inactive") {
      where.status = status;
    }

    if (search.trim()) {
      const searchTerm = search.trim();

      where[Op.or] = [
        { employeeCode: { [Op.iLike]: `%${searchTerm}%` } },
        { firstName: { [Op.iLike]: `%${searchTerm}%` } },
        { lastName: { [Op.iLike]: `%${searchTerm}%` } },
        { email: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    const employees = await Employee.findAll({ where });

    res.render("employees", {
      title: "Employee Master",
      employees,
      search,
      status,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error loading employees:", err);
    res.status(500).send("Error loading employees.");
  }
});

// Display Add Employee form
router.get("/add", (req, res) => {
  res.render("addEmployee", {
    title: "Add Employee",
    user: req.session.user,
  });
});

// Save a new employee
router.post("/add", async (req, res) => {
  try {
    const { employeeCode, firstName, lastName, email, department, status } =
      req.body;

    await Employee.create({
      employeeCode,
      firstName,
      lastName,
      email,
      department,
      status,
    });

    res.redirect("/employees");
  } catch (err) {
    console.error("Error adding employee:", err);
    res
      .status(400)
      .send("Unable to add employee. Please check the submitted details.");
  }
});

// Display Edit Employee form
router.get("/edit/:id", async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).send("Employee not found.");
    }

    res.render("editEmployee", {
      title: "Edit Employee",
      employee,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error loading employee:", err);
    res.status(500).send("Error loading employee.");
  }
});

// Update employee details
router.post("/edit/:id", async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).send("Employee not found.");
    }

    employee.employeeCode = req.body.employeeCode;
    employee.firstName = req.body.firstName;
    employee.lastName = req.body.lastName;
    employee.email = req.body.email;
    employee.department = req.body.department;
    employee.status = req.body.status;

    await employee.save();

    res.redirect("/employees");
  } catch (err) {
    console.error("Error updating employee:", err);
    res
      .status(400)
      .send("Unable to update employee. Please check the submitted details.");
  }
});

// Deactivate an employee
router.post("/deactivate/:id", async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).send("Employee not found.");
    }

    employee.status = "Inactive";

    await employee.save();

    res.redirect("/employees");
  } catch (err) {
    console.error("Error deactivating employee:", err);
    res.status(500).send("Error deactivating employee.");
  }
});

export default router;
