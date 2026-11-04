import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  role: {
    type: DataTypes.ENUM("ADMIN", "USER"),
    allowNull: false,
    defaultValue: "USER",
  },

  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true,
  },
});

export default User;
