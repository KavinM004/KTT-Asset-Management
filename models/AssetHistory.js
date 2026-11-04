import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AssetHistory = sequelize.define("AssetHistory", {
  action: {
    type: DataTypes.ENUM("Purchased", "Issued", "Returned", "Scrapped"),
    allowNull: false,
  },
  actionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default AssetHistory;
