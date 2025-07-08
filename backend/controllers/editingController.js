const Clips = require("../models/clips");
const { checkBody } = require("../utils/checkBody");
const { findClipOr404, populateClipData } = require("../utils/clipsUtils");
const { isEditorOr403 } = require("../utils/usersUtils");

// CONTROLLER - Prendre en charge l'édition d'un clip
async function clipEditingStart(req, res) {
  if (!checkBody(req.body, ["clipId"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { clipId } = req.body;

  try {
    const clip = await findClipOr404(clipId, res);
    if (!clip) return;

    if (!clip.editable) {
      return res
        .status(403)
        .json({ result: false, error: "Editing not allowed for this clip" });
    }

    clip.editor = req.user._id;
    clip.editProgress = "en cours";

    await clip.save();

    // Peupler avant d’envoyer
    await populateClipData(clip);

    //Réponse au frontend
    res
      .status(200)
      .json({ result: true, message: "Clip editing started", clip });
  } catch (err) {
    console.error("Error starting clip editing:", err);
    res.status(500).json({ result: false, error: "Failed to start editing" });
  }
}

// CONTROLLER - Marquer la fin de l'édition d'un clip
async function clipEditingEnd(req, res) {
  if (!checkBody(req.body, ["clipId"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { clipId } = req.body;

  try {
    const clip = await findClipOr404(clipId, res);
    if (!clip) return;

    if (!clip.editable || clip.editProgress !== "en cours") {
      return res.status(400).json({
        result: false,
        error: "This clip is not currently being edited",
      });
    }

    if (!isEditorOr403(clip, req.user._id, res)) return;

    clip.editProgress = "terminé";
    clip.editable = false; // Pour enlever le marque "à éditer" du clip

    await clip.save();

    // Peupler avant d’envoyer
    await populateClipData(clip);

    //Réponse au frontend
    res.status(200).json({ result: true, message: "Clip editing ended", clip });
  } catch (err) {
    console.error("Error ending clip editing:", err);
    res.status(500).json({ result: false, error: "Failed to end editing" });
  }
}

module.exports = {
  clipEditingStart,
  clipEditingEnd,
};
