const Clip = require("../models/Clip");
const User = require("../models/User");

// FONCTION UTILITAIRE - Charger les relations auteur/éditeur et parser JSON
async function populateClipData(clipOrClips) {
  // Si un seul clip
  if (clipOrClips instanceof Clip) {
    // Parse tags seulement si c'est une string
    if (typeof clipOrClips.tags === "string") {
      try {
        clipOrClips.tags = JSON.parse(clipOrClips.tags);
        if (!Array.isArray(clipOrClips.tags)) {
          clipOrClips.tags = [];
        }
      } catch (err) {
        console.error("Invalid JSON in clip.tags:", err);
        clipOrClips.tags = [];
      }
    }

    // Parse comments seulement si c'est une string
    if (typeof clipOrClips.comments === "string") {
      try {
        clipOrClips.comments = JSON.parse(clipOrClips.comments);
        if (!Array.isArray(clipOrClips.comments)) {
          clipOrClips.comments = [];
        }
      } catch (err) {
        console.error("Invalid JSON in clip.comments:", err);
        clipOrClips.comments = [];
      }
    }

    // Parse votes seulement si c'est une string
    if (typeof clipOrClips.votes === "string") {
      try {
        clipOrClips.votes = JSON.parse(clipOrClips.votes);
        if (!Array.isArray(clipOrClips.votes)) {
          clipOrClips.votes = [];
        }
      } catch (err) {
        console.error("Invalid JSON in clip.votes:", err);
        clipOrClips.votes = [];
      }
    }

    // Charger auteur
    if (typeof clipOrClips.authorId === "string") {
      clipOrClips.authorId = await User.findByPk(clipOrClips.authorId, {
        attributes: [
          "twitch_id",
          "username",
          "avatar_url",
          "whitelist",
          "role",
        ],
      });
    }

    // Charger éditeur
    if (clipOrClips.editorId && typeof clipOrClips.editorId === "string") {
      clipOrClips.editorId = await User.findByPk(clipOrClips.editorId, {
        attributes: [
          "twitch_id",
          "username",
          "avatar_url",
          "whitelist",
          "role",
        ],
      });
    }

    return clipOrClips;
  }

  // Si tableau de clips
  for (const clip of clipOrClips) {
    // Parse tags seulement si c'est une string
    if (typeof clip.tags === "string") {
      try {
        clip.tags = JSON.parse(clip.tags);
        if (!Array.isArray(clip.tags)) {
          clip.tags = [];
        }
      } catch (err) {
        console.error("Invalid JSON in clip.tags:", err);
        clip.tags = [];
      }
    }

    // Parse comments seulement si c'est une string
    if (typeof clip.comments === "string") {
      try {
        clip.comments = JSON.parse(clip.comments);
        if (!Array.isArray(clip.comments)) {
          clip.comments = [];
        }
      } catch (err) {
        console.error("Invalid JSON in clip.comments:", err);
        clip.comments = [];
      }
    }

    // Parse votes seulement si c'est une string
    if (typeof clip.votes === "string") {
      try {
        clip.votes = JSON.parse(clip.votes);
        if (!Array.isArray(clip.votes)) {
          clip.votes = [];
        }
      } catch (err) {
        console.error("Invalid JSON in clip.votes:", err);
        clip.votes = [];
      }
    }

    // Charger auteur
    if (typeof clip.authorId === "string") {
      clip.authorId = await User.findByPk(clip.authorId, {
        attributes: [
          "twitch_id",
          "username",
          "avatar_url",
          "whitelist",
          "role",
        ],
      });
    }

    // Charger éditeur
    if (clip.editorId && typeof clip.editorId === "string") {
      clip.editorId = await User.findByPk(clip.editorId, {
        attributes: [
          "twitch_id",
          "username",
          "avatar_url",
          "whitelist",
          "role",
        ],
      });
    }
  }

  return clipOrClips;
}

// FONCTION UTILITAIRE - Extraire l'ID d'un clip Twitch à partir d'une URL
function extractClipId(link) {
  try {
    const url = new URL(link);
    const host = url.hostname;

    // 1) URL directe de clips.twitch.tv
    //    ex. https://clips.twitch.tv/MonClipUnique
    if (host === "clips.twitch.tv") {
      // url.pathname === "/MonClipUnique"
      return url.pathname.slice(1);
    }

    // 2) URL “in situ” sur twitch.tv
    //    ex. https://www.twitch.tv/Chaîne/clip/MonClipUnique
    if (host.includes("twitch.tv") && url.pathname.includes("/clip/")) {
      // on découpe après "/clip/"
      // et on retire tout ce qui pourrait suivre (query, slash, etc.)
      return url.pathname.split("/clip/")[1].split("/")[0];
    }

    // 3) Cas paramètre ?clip=ID
    if (url.searchParams.has("clip")) {
      return url.searchParams.get("clip");
    }

    return null;
  } catch (err) {
    return null;
  }
}

// FONCTION UTILITAIRE - Vérifier si un clip à déjà été proposé
async function isClipAlreadyProposed(clipId) {
  try {
    const existingClip = await Clip.findOne({
      where: { clip_id: clipId },
    });

    if (existingClip) {
      await populateClipData(existingClip); // Ajout du populate
    }

    return !!existingClip;
  } catch (err) {
    console.error("Erreur Sequelize (isClipAlreadyProposed):", err.message);
    return false; // ✅ On considère que le clip n'existe pas si erreur SQL
  }
}

// FONCTION UTILITAIRE - Vérifier si un clip existe, sinon renvoyer une erreur 404
async function findClipOr404(clipId, res) {
  try {
    const clip = await Clip.findOne({
      where: { clip_id: clipId },
    });

    if (!clip) {
      res.status(404).json({
        result: false,
        error: "Clip not found",
      });
      return null;
    }

    await populateClipData(clip);
    return clip;
  } catch (err) {
    console.error("Erreur Sequelize (findClipOr404):", err.message);
    res.status(500).json({
      result: false,
      error: "Database error while searching for clip",
    });
    return null;
  }
}

// FONCTION UTILITAIRE - Valide et nettoie un commentaire
function sanitizeTitle(title) {
  if (typeof title !== "string") return null;
  const trimmed = title.trim();
  if (trimmed.length >= 2 && trimmed.length <= 100) {
    return trimmed;
  }
  return null;
}

module.exports = {
  populateClipData,
  extractClipId,
  isClipAlreadyProposed,
  findClipOr404,
  sanitizeTitle,
};
