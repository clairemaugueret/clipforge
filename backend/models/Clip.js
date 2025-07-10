const { DataTypes, Model } = require("sequelize");
const sequelize = require("./connection");

class Clip extends Model {}
Clip.init(
  {
    clip_id: { type: DataTypes.STRING, primaryKey: true, unique: true },
    link: DataTypes.STRING,
    embed_url: DataTypes.STRING,
    image: DataTypes.STRING,
    subject: DataTypes.STRING,
    tags: { type: DataTypes.JSON, defaultValue: [] },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    authorId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "author_id", // correspondance avec la colonne SQL
      references: {
        model: "clip_manager_users", // nom de la table SQL
        key: "twitch_id", // colonne dans users
      },
    },
    editable: { type: DataTypes.BOOLEAN, defaultValue: false },
    editorId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "editor_id", // correspondance avec la colonne SQL
      references: {
        model: "clip_manager_users", // nom de la table SQL
        key: "twitch_id", // colonne dans users
      },
    },
    edit_progress: {
      type: DataTypes.ENUM("IN_PROGRESS", "TERMINATED"),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "PROPOSED",
        "READY",
        "PUBLISHED",
        "DISCARDED",
        "ARCHIVED"
      ),
      defaultValue: "PROPOSED",
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Nouveau : tableau d'objets comment { userId, userName, userAvatar, text, created_at, views: [twitch_id] }
    comments: { type: DataTypes.JSON, defaultValue: [] },

    // Nouveau : tableau d'objets vote { userId, userName, userAvatar, result }
    votes: { type: DataTypes.JSON, defaultValue: [] },
  },
  {
    sequelize,
    modelName: "clip",
    tableName: "clip_manager_clips",
    timestamps: false,
  }
);

module.exports = Clip;
