import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Asset = sequelize.define("Asset", {
  assetCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  serialNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  make: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  branch: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  purchaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  purchaseValue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("Available", "Issued", "Under Repair", "Scrapped"),
    allowNull: false,
    defaultValue: "Available",
  },
});

export default Asset;
