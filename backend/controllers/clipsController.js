const Clips = require("../models/clips");
const { checkBody } = require("../modules/checkBody");
const { fetchTwitchClipData } = require("../services/twitchClips");

// Extraire l'ID d'un clip Twitch à partir d'une URL
function extractClipId(link) {
  try {
    const url = new URL(link);
    if (url.hostname.includes("twitch.tv") && url.pathname.includes("/clip/")) {
      return url.pathname.split("/clip/")[1];
    }
    if (url.searchParams.has("clip")) {
      return url.searchParams.get("clip");
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Vérifier si un clip à déjà été proposé
async function isClipAlreadyProposed(clipId) {
  const existingClip = await Clips.findOne({ clip_id: clipId });
  return !!existingClip; // '!!' permet convertir en booléen, force la valeur à être soit true soit false
}

// Récupérer les infos d’un clip via l’API Twitch
async function getClipInfo(req, res) {
  const clipId = req.params.id;
  const appToken = req.body.token;

  const result = await fetchTwitchClipData(clipId, appToken);

  if (!result.success) {
    return res
      .status(result.status)
      .json({ result: false, error: result.error });
  }

  // Vérifier si le clip existe déjà dans la DB
  if (await isClipAlreadyProposed(clipId)) {
    return res
      .status(409)
      .json({ result: false, error: "Clip already proposed" });
  }

  // Si le clip n'existe pas, on le renvoie au frontend
  return res.status(200).json({ result: true, clipData: result.clip });
}

// Création d'une nouvelle proposition de clip
async function createClip(req, res) {
  if (!checkBody(req.body, ["link, subject, tags"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { link, subject, tags, editable, comments } = req.body;

  const clipId = extractClipId(link);
  if (!clipId) {
    return res
      .status(400)
      .json({ result: false, error: "Invalid Twitch clip URL" });
  }

  // Vérifier si le clip existe déjà dans la DB
  if (await isClipAlreadyProposed(clipId)) {
    return res
      .status(409)
      .json({ result: false, error: "Clip already proposed" });
  }

  const result = await fetchTwitchClipData(clipId);

  if (!result.success) {
    return res
      .status(result.status)
      .json({ result: false, error: result.error });
  }

  const clipData = result.clip;

  try {
    const newClip = new Clips({
      link,
      clip_id: clipId,
      embed_url: clipData.embed_url,
      image: clipData.thumbnail_url,
      author: req.user._id,
      createdAt: Date.now(),
      subject,
      tags,
      editable: editable || false,
      comments: comments || [],
      votes: [{ user: req.user._id, result: "OK" }], // Initialiser avec un vote OK de l'auteur
    });

    await newClip.save();

    res.status(201).json({
      result: true,
      message: "Clip successfully proposed",
      clip: newClip,
    });
  } catch (err) {
    console.error("Error creating clip:", err);
    res.status(500).json({ result: false, error: "Failed to create clip" });
  }
}

module.exports = { getClipInfo, createClip };
