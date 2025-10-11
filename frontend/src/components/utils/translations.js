// Fichier utilitaire pour la traduction des statuts

/**
 * Traduit les statuts des clips en français
 */
export const translateStatus = (status) => {
  const translations = {
    PROPOSED: "Proposé",
    DISCARDED: "Refusé",
    READY: "Prêt à publier",
    PUBLISHED: "Publié",
    ARCHIVED_PUBLISHED: "Archivé (publié)",
    ARCHIVED_DISCARDED: "Archivé (refusé)",
  };

  return translations[status] || status;
};

/**
 * Retourne la couleur Tailwind associée à un statut
 */
export const getStatusColor = (status) => {
  const colors = {
    PROPOSED: "bg-yellow-500 border-yellow-500",
    READY: "bg-green-600 border-green-600",
    DISCARDED: "bg-red-600 border-red-600",
    PUBLISHED: "bg-blue-600 border-blue-600",
    ARCHIVED_PUBLISHED: "bg-gray-600 border-gray-600",
    ARCHIVED_DISCARDED: "bg-red-800/60 border-red-800/60",
  };

  return colors[status] || "bg-gray-500 border-gray-500";
};

/**
 * Traduit les statuts d'édition en français
 * Prend en compte editable et edit_progress
 */
export const translateEditStatus = (clip) => {
  if (clip.editable && !clip.edit_progress) {
    return "À éditer";
  }

  if (clip.edit_progress === "IN_PROGRESS") {
    return "Édition en cours";
  }

  if (clip.edit_progress === "TERMINATED") {
    return "Édition terminée";
  }

  return null;
};

/**
 * Retourne tous les statuts traduits disponibles pour le filtrage
 * Note : ARCHIVED n'est pas inclus car les clips archivés sont gérés séparément
 */
export const getAvailableStatuses = () => [
  { key: "PROPOSED", label: "Proposé" },
  { key: "READY", label: "Prêt à publier" },
  { key: "DISCARDED", label: "Refusé" },
  { key: "PUBLISHED", label: "Publié" },
];

/**
 * Retourne tous les statuts d'édition traduits disponibles pour le filtrage
 */
export const getAvailableEditStatuses = () => [
  { key: "EDITABLE", label: "À éditer" },
  { key: "IN_PROGRESS", label: "Édition en cours" },
  { key: "TERMINATED", label: "Édition terminée" },
];

/**
 * Retourne la couleur Tailwind associée à un statut d'édition
 */
export const getEditStatusColor = (editStatusKey) => {
  const colors = {
    EDITABLE: "bg-orange-500 border-orange-500",
    IN_PROGRESS: "bg-yellow-500 border-yellow-500",
    TERMINATED: "bg-lime-600 border-lime-600",
  };

  return colors[editStatusKey] || "bg-gray-500 border-gray-500";
};
