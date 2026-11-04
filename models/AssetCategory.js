import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AssetCategory = sequelize.define("AssetCategory", {
  categoryName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

export default AssetCategory;