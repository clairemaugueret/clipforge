const Clip = require("../models/Clip");
const { checkBody } = require("../utils/checkBody");
const { findClipOr404, populateClipData } = require("../utils/clipsUtils");
const { sanitizeCommentText } = require("../utils/commentsUtils");

// CONTROLLER - Ajouter un commentaire à un clip
async function addNewCommentToClip(req, res) {
  if (!checkBody(req.body, ["clipId", "text"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { clipId, text } = req.body;

  // Validation du contenu
  const sanitizedText = sanitizeCommentText(text);
  if (!sanitizedText) {
    return res.status(400).json({
      result: false,
      error: "Comment must be between 2 and 400 characters",
    });
  }

  try {
    const clip = await findClipOr404(clipId, res);
    if (!clip) return;

    // On s'assure que comments est bien un tableau
    let updatedComments = [];
    try {
      updatedComments = JSON.parse(clip.comments);
      if (!Array.isArray(updatedComments)) {
        updatedComments = [];
      }
    } catch (err) {
      console.error("Invalid JSON in clip.comments:", err);
      updatedComments = [];
    }

    // Ajouter le nouveau commentaire
    updatedComments.push({
      userId: req.user.twitch_id,
      userName: req.user.username,
      userAvatar: req.user.avatar_url,
      text: sanitizedText,
      createdAt: new Date().toISOString(),
      views: [req.user.twitch_id],
    });

    // Mettre à jour la colonne JSON dans la DB
    await clip.update({ comments: updatedComments });

    // Peupler avant d’envoyer
    await populateClipData(clip);

    // Réponse au frontend
    res.status(200).json({ result: true, message: "Comment added", clip });
  } catch (err) {
    console.error("Error adding comment to clip:", err);
    res.status(500).json({ result: false, error: "Failed to add comment" });
  }
}

// CONTROLLER - Ajouter une vue à tous les commentaires d'un clip
async function addNewViewToAllComments(req, res) {
  if (!checkBody(req.body, ["clipId"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { clipId } = req.body;

  try {
    const clip = await findClipOr404(clipId, res);
    if (!clip) return;

    const userId = req.user.twitch_id;
    let updated = false;

    // Ajouter l'id de l'utilisateur aux vues de chaque commentaire s'il n'est pas déjà présent
    const updatedComments = (clip.comments || []).map((comment) => {
      if (!comment.views.includes(userId)) {
        comment.views.push(userId);
        updated = true;
      }
      return comment;
    });

    if (updated) {
      await clip.update({ comments: updatedComments });
    }

    // Peupler avant d’envoyer
    await populateClipData(clip);

    // Réponse au frontend
    res.status(200).json({
      result: true,
      message: "All comments from this clip viewed by the user",
      clip,
    });
  } catch (err) {
    console.error("Error adding view to all comments:", err);
    res
      .status(500)
      .json({ result: false, error: "Failed to add view to comments" });
  }
}

module.exports = {
  addNewCommentToClip,
  addNewViewToAllComments,
};
