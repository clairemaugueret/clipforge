// FONCTION UTILITAIRE - Vérifie si l'utilisateur est l'auteur du clip, sinon renvoie une erreur 403
function isAuthorOr403(clip, userId, res) {
  const authorTwitchId =
    typeof clip.authorId === "object" ? clip.authorId.twitch_id : clip.authorId;

  if (authorTwitchId?.toString() !== userId.toString()) {
    res.status(403).json({
      result: false,
      error: "You are not the author of this clip",
    });
    return false;
  }
  return true;
}

// FONCTION UTILITAIRE - Vérifie si l'utilisateur est expert, sinon renvoie une erreur 403
function isExpertOr403(user, res) {
  if (user.role.toString() !== "EXPERT") {
    res.status(403).json({
      result: false,
      error: "You are not authorized to perform this action",
    });
    return false;
  }
  return true;
}

// FONCTION UTILITAIRE - Vérifie si l'utilisateur est éditeur d'un clip, sinon renvoie une erreur 403
function isEditorOr403(clip, userId, res) {
  const editorTwitchId =
    typeof clip.editorId === "object" ? clip.editorId.twitch_id : clip.editorId;

  if (editorTwitchId?.toString() !== userId.toString()) {
    res.status(403).json({
      result: false,
      error: "You are not the editor of this clip",
    });
    return false;
  }
  return true;
}

module.exports = { isAuthorOr403, isExpertOr403, isEditorOr403 };
