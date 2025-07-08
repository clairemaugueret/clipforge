const Clips = require("../models/clips");
const User = require("../models/users");
const { checkBody } = require("../utils/checkBody");
const { fetchTwitchClipData } = require("../services/twitchClips");
const { extractClipId, isClipAlreadyProposed } = require("../utils/clipsUtils");
const { findClipOr404, populateClipData } = require("../utils/clipsUtils");
const { isAuthorOr403, isExpertOr403 } = require("../utils/usersUtils");
const { sanitizeCommentText } = require("../utils/commentsUtils");

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
  if (!checkBody(req.body, ["link", "subject", "tags"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { token, link, subject, tags, editable, text } = req.body;

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

  const result = await fetchTwitchClipData(clipId, token);

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
      comments: sanitizeCommentText(text)
        ? [
            {
              user: req.user._id,
              text: sanitizeCommentText(text),
              date: Date.now(),
              views: [req.user._id],
            },
          ]
        : [], // Ajouter un commentaire initial si le texte est fourni et valide
      votes: [{ user: req.user._id, result: "OK" }], // Initialiser avec un vote OK de l'auteur
    });

    await newClip.save();

    // Peupler avant d’envoyer
    await populateClipData(newClip);

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
    const clips = await populateClipData(Clips.find());

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

// CONTROLLER - Modifier une proposition de clip (par l'auteur uniquement)
async function updateClip(req, res) {
  if (!checkBody(req.body, ["clipId", "subject", "tags"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { clipId, subject, tags, editable, text } = req.body;

  try {
    const clip = await findClipOr404(clipId, res);
    if (!clip) return; // La fonction a déjà renvoyé l'erreur 404 donc ici on stoppe juste l'exécution

    // Vérifier que l'utilisateur courant est bien l'auteur
    if (!isAuthorOr403(clip, req.user._id, res)) return;

    // Mettre à jour les champs autorisés
    clip.subject = subject;
    clip.tags = tags;
    if (typeof editable !== "undefined") {
      clip.editable = editable;
    }

    // Si un nouveau commentaire est fourni avec l'update
    const validComment = sanitizeCommentText(text);
    if (validComment) {
      clip.comments.push({
        user: req.user._id,
        text: validComment,
        date: Date.now(),
        views: [req.user._id],
      });
    }

    await clip.save();

    // Peupler avant d’envoyer
    await populateClipData(clip);

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
    const clip = await findClipOr404(clipId, res);
    if (!clip) return;

    // Vérifier que l'utilisateur courant est bien l'auteur
    if (!isExpertOr403(req.user, res)) return;

    // Mettre à jour le statut du clip
    clip.status = "publié";

    await clip.save();

    // Peupler avant d’envoyer
    await populateClipData(clip);

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

// CONTROLLER - Ajouter un vote à un clip et mise à jour du statut, si appicable (selon conditions)
async function addVoteToClip(req, res) {
  if (!checkBody(req.body, ["clipId", "vote"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { clipId, vote } = req.body;

  try {
    const clip = await findClipOr404(clipId, res);
    if (!clip) return;

    // Vérifie si l’utilisateur a déjà voté
    const existingVoteIndex = clip.votes.findIndex(
      (vote) => vote.user.toString() === req.user._id.toString()
    );

    if (existingVoteIndex !== -1) {
      // Met à jour le vote existant
      clip.votes[existingVoteIndex].result = vote;
    } else {
      // Ajoute un nouveau vote
      clip.votes.push({ user: req.user._id, result: vote });
    }

    // Vérifier si tous les experts ont voté
    const experts = await User.find({ status: "expert" }).select("_id");
    const expertIds = experts.map((user) => user._id.toString());
    const votedExpertIds = clip.votes
      .map((vote) => vote.user.toString())
      .filter((id) => expertIds.includes(id));

    let allExpertsVoted = false;
    if (
      expertIds.length > 0 &&
      expertIds.every((id) => votedExpertIds.includes(id))
    ) {
      allExpertsVoted = true;
    }

    // Statut selon les votes des experts
    if (allExpertsVoted) {
      const okVotes = clip.votes.filter((vote) => vote.result === "OK").length;
      const koVotes = clip.votes.filter((vote) => vote.result === "KO").length;

      if (okVotes === expertIds.length && !clip.editable) {
        clip.status = "prêt à publier";
      } else if (koVotes >= 2) {
        clip.status = "écarté";
      }
      // Sinon, ne rien changer (statut reste inchangé)
    }

    await clip.save();

    // Peupler avant d’envoyer
    await populateClipData(clip);

    res.status(200).json({
      result: true,
      message: "Vote successfully saved",
      clip,
    });
  } catch (err) {
    console.error("Error saving vote:", err);
    res.status(500).json({ result: false, error: "Failed to save vote" });
  }
}

module.exports = {
  getClipInfo,
  createClip,
  getAllClips,
  updateClip,
  clipPublished,
  addVoteToClip,
};
