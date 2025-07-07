const Clips = require("../models/clips");
const { checkBody } = require("../modules/checkBody");
const { fetchTwitchClipData } = require("../services/twitchClips");

// FUNCTION UTILITAIRE - Extraire l'ID d'un clip Twitch à partir d'une URL
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

// FUNCTION UTILITAIRE - Vérifier si un clip à déjà été proposé
async function isClipAlreadyProposed(clipId) {
  const existingClip = await Clips.findOne({ clip_id: clipId });
  return !!existingClip; // '!!' permet convertir en booléen, force la valeur à être soit true soit false
}

// CONTROLLER - Récupérer les infos d’un clip via l’API Twitch
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

// CONTROLLER - Création d'une nouvelle proposition de clip
async function createClip(req, res) {
  if (!checkBody(req.body, ["link, subject, tags"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { link, subject, tags, editable, text } = req.body;

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
      comments:
        text && text.trim().length >= 2 && text.length <= 400
          ? [
              {
                user: req.user._id,
                text,
                date: Date.now(),
                views: [req.user._id],
              },
            ]
          : [], // Ajouter un commentaire initial si le texte est fourni
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

// CONTROLLER -  Récupérer tous les clips de la DB
async function getAllClips(req, res) {
  try {
    const clips = await Clips.find();

    if (!clips || clips.length === 0) {
      return res.status(404).json({
        result: false,
        error: "No clips found",
      });
    }

    res.status(200).json({
      result: true,
      count: clips.length,
      clips,
    });
  } catch (err) {
    console.error("Error fetching all clips:", err);
    res.status(500).json({
      result: false,
      error: "Internal server error",
    });
  }
}

// CONTROLLER - Prendre en charge l'édition d'un clip
async function clipEditingStart(req, res) {
  if (!checkBody(req.body, ["clipId"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { clipId } = req.body;

  try {
    const clip = await Clips.findOne({ clip_id: clipId });

    if (!clip) {
      return res.status(404).json({ result: false, error: "Clip not found" });
    }

    clip.editor = req.user._id;
    clip.editProgress = "en cours";

    await clip.save();

    //Réponse au frontend
    res
      .status(200)
      .json({ result: true, message: "Clip editing started", clip });
  } catch (err) {
    console.error("Error starting clip editing:", err);
    res.status(500).json({ result: false, error: "Failed to start editing" });
  }
}

// CONTROLLER - Prendre en charge l'édition d'un clip
async function clipEditingEnd(req, res) {
  if (!checkBody(req.body, ["clipId"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { clipId } = req.body;

  try {
    const clip = await Clips.findOne({ clip_id: clipId });

    if (!clip) {
      return res.status(404).json({ result: false, error: "Clip not found" });
    }

    if (!clip.editable || clip.editProgress !== "en cours") {
      return res
        .status(400)
        .json({ result: false, error: "Clip is not currently editable" });
    }

    if (clip.editor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ result: false, error: "You are not the editor of this clip" });
    }

    clip.editProgress = "terminé";
    clip.editable = false; // Pour enlever le marque "à éditer" du clip

    await clip.save();

    //Réponse au frontend
    res.status(200).json({ result: true, message: "Clip editing ended", clip });
  } catch (err) {
    console.error("Error ending clip editing:", err);
    res.status(500).json({ result: false, error: "Failed to end editing" });
  }
}

// CONTROLLER - Ajouter un commentaire à un clip
async function addNewCommentToClip(req, res) {
  if (!checkBody(req.body, ["clipId", "text"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { clipId, text } = req.body;

  // Validation du contenu
  if (typeof text !== "string" || text.trim().length < 2 || text.length > 400) {
    return res.status(400).json({
      result: false,
      error: "Comment must be between 2 and 400 characters",
    });
  }

  try {
    const clip = await Clips.findOne({ clip_id: clipId });

    if (!clip) {
      return res.status(404).json({ result: false, error: "Clip not found" });
    }

    clip.comments.push({
      user: req.user._id,
      text,
      date: Date.now(),
      views: [req.user._id],
    });

    await clip.save();

    // Réponse au frontend
    res.status(200).json({ result: true, message: "Comment added", clip });
  } catch (err) {
    console.error("Error adding comment to clip:", err);
    res.status(500).json({ result: false, error: "Failed to add comment" });
  }
}

// CONTROLLER - Modifier une proposition de clip (par l'auteur uniquement)
async function updateClip(req, res) {
  if (!checkBody(req.body, ["clipId", "subject", "tags"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { clipId, subject, tags, editable, text } = req.body;

  try {
    const clip = await Clips.findOne({ clip_id: clipId });

    if (!clip) {
      return res.status(404).json({ result: false, error: "Clip not found" });
    }

    // Vérifier que l'utilisateur courant est bien l'auteur
    if (clip.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        result: false,
        error: "You are not the author of this clip",
      });
    }

    // Mettre à jour les champs autorisés
    clip.subject = subject;
    clip.tags = tags;
    if (typeof editable !== "undefined") {
      clip.editable = editable;
    }

    // Si un nouveau commentaire est fourni avec l'update
    if (text && text.trim().length >= 2 && text.length <= 400) {
      clip.comments.push({
        user: req.user._id,
        text,
        date: Date.now(),
        views: [req.user._id],
      });
    }

    await clip.save();

    res.status(200).json({
      result: true,
      message: "Clip successfully updated",
      clip,
    });
  } catch (err) {
    console.error("Error updating clip:", err);
    res.status(500).json({ result: false, error: "Failed to update clip" });
  }
}

// CONTROLLER - Mettre à jour le statut d'un clip après publication
async function clipPublished(req, res) {
  if (!checkBody(req.body, ["clipId"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { clipId } = req.body;

  try {
    const clip = await Clips.findOne({ clip_id: clipId });

    if (!clip) {
      return res.status(404).json({ result: false, error: "Clip not found" });
    }

    // Vérifier que l'utilisateur courant est bien l'auteur
    if (req.user.status.toString() !== "expert") {
      return res.status(403).json({
        result: false,
        error: "You are not authorized to publish this clip",
      });
    }

    // Mettre à jour le statut du clip
    clip.status = "publié";

    await clip.save();

    res.status(200).json({
      result: true,
      message: "Clip published",
      clip,
    });
  } catch (err) {
    console.error("Error publishing clip:", err);
    res.status(500).json({ result: false, error: "Failed to publish clip" });
  }
}

module.exports = {
  getClipInfo,
  createClip,
  getAllClips,
  clipEditingStart,
  clipEditingEnd,
  addNewCommentToClip,
  updateClip,
  clipPublished,
};
