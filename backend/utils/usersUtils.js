// FONCTION UTILITAIRE - Vérifie si l'utilisateur est l'auteur du clip, sinon renvoie une erreur 403
function isAuthorOr403(clip, userId, res) {
  if (clip.author.toString() !== userId.toString()) {
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
  if (user.status.toString() !== "expert") {
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
  if (clip.editor?.toString() !== userId.toString()) {
    res.status(403).json({
      result: false,
      error: "You are not the editor of this clip",
    });
    return false;
  }
  return true;
}

module.exports = { isAuthorOr403, isExpertOr403, isEditorOr403 };
