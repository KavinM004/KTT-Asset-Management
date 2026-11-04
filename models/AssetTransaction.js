import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AssetTransaction = sequelize.define("AssetTransaction", {
  issueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  returnDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  returnReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default AssetTransaction;
