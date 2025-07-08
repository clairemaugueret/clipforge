// FONCTION UTILITAIRE - Valide et nettoie un commentaire
function sanitizeCommentText(text) {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  if (trimmed.length >= 2 && trimmed.length <= 400) {
    return trimmed;
  }
  return null;
}

module.exports = { sanitizeCommentText };
