const Clip = require("../models/Clip");
const User = require("../models/User");
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
    const comments = [];
    const sanitizedText = sanitizeCommentText(text);
    if (sanitizedText) {
      comments.push({
        userId: req.user.twitch_id,
        userName: req.user.username,
        userAvatar: req.user.avatar_url,
        text: sanitizedText,
        createdAt: new Date().toISOString(),
        views: [req.user.twitch_id],
      });
    }

    const votes = [
      {
        userId: req.user.twitch_id,
        userName: req.user.username,
        userAvatar: req.user.avatar_url,
        result: "OK",
      }, // Initialiser avec un vote OK de l'auteur
    ];

    const newClip = await Clip.create({
      link,
      clip_id: clipId,
      embed_url: clipData.embed_url,
      image: clipData.thumbnail_url,
      authorId: req.user.twitch_id,
      subject,
      tags,
      createdAt: new Date().toISOString(),
      editable: editable || false,
      comments,
      votes,
    });

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
    const clips = await Clip.findAll();

    // Peupler avant d’envoyer
    await populateClipData(clips);

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
    if (!isAuthorOr403(clip, req.user.twitch_id, res)) return;

    // Mettre à jour les champs autorisés
    await clip.update({
      subject,
      tags,
      editable: editable ?? clip.editable,
    });

    // Si un nouveau commentaire est fourni avec l'update
    const validComment = sanitizeCommentText(text);
    if (validComment) {
      // Sécurise le parsing des commentaires
      let updatedComments = [];

      if (typeof clip.comments === "string") {
        try {
          updatedComments = JSON.parse(clip.comments);
          if (!Array.isArray(updatedComments)) {
            updatedComments = [];
          }
        } catch (err) {
          console.error("Invalid JSON in clip.comments:", err);
          updatedComments = [];
        }
      } else if (Array.isArray(clip.comments)) {
        updatedComments = clip.comments; // déjà un tableau
      } else {
        updatedComments = [];
      }

      // Ajoute le nouveau commentaire
      updatedComments.push({
        userId: req.user.twitch_id,
        userName: req.user.username,
        userAvatar: req.user.avatar_url,
        text: validComment,
        createdAt: new Date().toISOString(),
        views: [req.user.twitch_id],
      });

      await clip.update({ comments: updatedComments });
    }

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
    await clip.update({ status: "PUBLISHED" });

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

    // Sécurise le parsing des votes
    let updatedVotes = [];

    if (typeof clip.votes === "string") {
      try {
        updatedVotes = JSON.parse(clip.votes);
        if (!Array.isArray(updatedVotes)) {
          updatedVotes = [];
        }
      } catch (err) {
        console.error("Invalid JSON in clip.votes:", err);
        updatedVotes = [];
      }
    } else if (Array.isArray(clip.votes)) {
      updatedVotes = clip.votes; // déjà un tableau
    } else {
      updatedVotes = [];
    }

    // Vérifie si l’utilisateur a déjà voté
    const existingVoteIndex = updatedVotes.findIndex(
      (v) => v.userId === req.user.twitch_id
    );

    if (existingVoteIndex !== -1) {
      // Met à jour le vote existant
      updatedVotes[existingVoteIndex].result = vote;
    } else {
      // Ajoute un nouveau vote
      updatedVotes.push({
        userId: req.user.twitch_id,
        userName: req.user.username,
        userAvatar: req.user.avatar_url,
        result: vote,
      });
    }

    // Vérifie si tous les experts ont voté
    const experts = await User.findAll({ where: { role: "EXPERT" } });
    const expertIds = experts.map((u) => u.twitch_id);

    const votedExpertIds = updatedVotes
      .map((v) => v.userId)
      .filter((id) => expertIds.includes(id));

    const allExpertsVoted = expertIds.every((id) =>
      votedExpertIds.includes(id)
    );

    // Toujours recalculer le statut
    if (allExpertsVoted) {
      const okVotes = updatedVotes.filter((v) => v.result === "OK").length;
      const koVotes = updatedVotes.filter((v) => v.result === "KO").length;

      if (okVotes === expertIds.length && !clip.editable) {
        clip.status = "READY";
      } else if (koVotes >= 2) {
        clip.status = "DISCARDED";
      } else {
        clip.status = "PROPOSED";
      }
    } else {
      clip.status = "PROPOSED"; // Si tous les experts n'ont pas voté
    }

    await clip.update({
      votes: updatedVotes,
      status: clip.status,
    });

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
