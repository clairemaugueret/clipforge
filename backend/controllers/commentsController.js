const Clips = require("../models/clips");
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
  const validComment = sanitizeCommentText(text);
  if (!validComment) {
    return res.status(400).json({
      result: false,
      error: "Comment must be between 2 and 400 characters",
    });
  }

  try {
    const clip = await findClipOr404(clipId, res);
    if (!clip) return;

    clip.comments.push({
      user: req.user._id,
      text: validComment,
      date: Date.now(),
      views: [req.user._id],
    });

    await clip.save();

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

    const userId = req.user._id;
    let updated = false;

    // Ajouter l'id de l'utilisateur aux vues de chaque commentaire s'il n'est pas déjà présent
    clip.comments.forEach((comment) => {
      if (!comment.views.includes(userId)) {
        comment.views.push(userId);
        updated = true;
      }
    });

    if (updated) await clip.save();

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
