const { DataTypes, Model } = require("sequelize");
const sequelize = require("./connection");

class User extends Model {}
User.init(
  {
    twitch_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    username: DataTypes.STRING,
    avatar_url: DataTypes.STRING,
    token: DataTypes.STRING,
    twitch_access_token: DataTypes.STRING,
    twitch_refresh_token: DataTypes.STRING,
    twitch_token_expires_at: DataTypes.DATE,
    whitelist: { type: DataTypes.BOOLEAN, defaultValue: true },
    role: { type: DataTypes.ENUM("user", "expert"), defaultValue: "user" },
  },
  {
    sequelize,
    modelName: "user",
    tableName: "clip_manager_users",
    timestamps: false,
  }
);

module.exports = User;
