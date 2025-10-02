function FilterModal({
  allTags,
  selectedTags,
  selectedStatuses,
  selectedEditStatuses,
  onToggleTag,
  onToggleStatus,
  onToggleEditStatus,
  onClose,
}) {
  // Liste des statuts disponibles (hors ARCHIVED)
  const availableStatuses = ["PROPOSED", "READY", "DISCARDED", "PUBLISHED"];

  // Liste des statuts d'édition disponibles
  const availableEditStatuses = ["EDITABLE", "IN_PROGRESS", "TERMINATED"];

  // Couleurs pour chaque statut
  const statusColors = {
    PROPOSED: "bg-yellow-500 border-yellow-500",
    READY: "bg-green-600 border-green-600",
    DISCARDED: "bg-red-600 border-red-600",
    PUBLISHED: "bg-blue-600 border-blue-600",
  };

  // Couleurs pour chaque statut d'édition
  const editStatusColors = {
    EDITABLE: "bg-orange-500 border-orange-500",
    IN_PROGRESS: "bg-yellow-500 border-yellow-500",
    TERMINATED: "bg-lime-600 border-lime-600",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Filtres</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ✕
          </button>
        </div>

        {/* SECTION : FILTRAGE PAR TAGS */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">
            Filtrer par tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {allTags.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun tag disponible</p>
            ) : (
              allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onToggleTag(tag)}
                  className={`px-3 py-1 rounded text-sm border transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {tag}
                </button>
              ))
            )}
          </div>
        </div>

        {/* SECTION : FILTRAGE PAR STATUT */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">
            Filtrer par statut
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableStatuses.map((status) => (
              <button
                key={status}
                onClick={() => onToggleStatus(status)}
                className={`px-3 py-1 rounded text-sm border transition-colors ${
                  selectedStatuses.includes(status)
                    ? `${statusColors[status]} text-white`
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION : FILTRAGE PAR STATUT D'ÉDITION */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">
            Filtrer par édition
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableEditStatuses.map((editStatus) => (
              <button
                key={editStatus}
                onClick={() => onToggleEditStatus(editStatus)}
                className={`px-3 py-1 rounded text-sm border transition-colors ${
                  selectedEditStatuses.includes(editStatus)
                    ? `${editStatusColors[editStatus]} text-white`
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {editStatus}
              </button>
            ))}
          </div>
        </div>

        {/* BOUTON DE FERMETURE */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;
