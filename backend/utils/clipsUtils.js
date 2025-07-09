const Clips = require("../models/clips");

// FONCTION UTILITAIRE - Appliquer les populates standards pour un clip
function populateClipData(query) {
  return query
    .populate("author", "username avatar_url whitelist status")
    .populate("editor", "username avatar_url whitelist status")
    .populate("comments.user", "username avatar_url whitelist status")
    .populate("comments.views", "username avatar_url whitelist status")
    .populate("votes.user", "username avatar_url whitelist status");
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
  const existingClip = await populateClipData(
    Clips.findOne({ clip_id: clipId })
  );
  return !!existingClip; // NB: '!!' permet convertir en booléen, force la valeur à être soit true soit false
}

// FONCTION UTILITAIRE - Vérifier si un clip existe, sinon renvoyer une erreur 404
async function findClipOr404(clipId, res) {
  const clip = await populateClipData(Clips.findOne({ clip_id: clipId }));
  if (!clip) {
    res.status(404).json({ result: false, error: "Clip not found" });
    return null;
  }
  return clip;
}

module.exports = {
  populateClipData,
  extractClipId,
  isClipAlreadyProposed,
  findClipOr404,
};
