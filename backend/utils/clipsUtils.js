const Clip = require("../models/Clip");
const User = require("../models/User");

// FONCTION UTILITAIRE - Charger les relations auteur/éditeur et parser JSON
async function populateClipData(clipOrClips) {
  const parseJsonField = (field) => {
    // Gérer null, undefined, ou chaîne vide
    if (!field || field === "") return [];

    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        console.error("Invalid JSON:", err);
        return [];
      }
    }

    return Array.isArray(field) ? field : [];
  };

  const processClip = async (clip) => {
    // Parse les champs JSON
    clip.tags = parseJsonField(clip.tags);
    clip.comments = parseJsonField(clip.comments);
    clip.votes = parseJsonField(clip.votes);

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
  };

  // Si un seul clip
  if (clipOrClips instanceof Clip) {
    await processClip(clipOrClips);
    return clipOrClips;
  }

  // Si tableau de clips
  for (const clip of clipOrClips) {
    await processClip(clip);
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
