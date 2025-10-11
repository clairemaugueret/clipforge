import {
  getAvailableStatuses,
  getAvailableEditStatuses,
  getStatusColor,
  getEditStatusColor,
} from "../utils/translations";

function FilterModal({
  allTags,
  selectedTags,
  selectedStatuses,
  selectedEditStatuses,
  selectedVoteStatus,
  onToggleTag,
  onToggleStatus,
  onToggleEditStatus,
  onToggleVoteStatus,
  onClearFilters,
  onClose,
}) {
  // Récupère les statuts et leurs traductions depuis le fichier utils
  const availableStatuses = getAvailableStatuses();
  const availableEditStatuses = getAvailableEditStatuses();

  // Options de filtre de vote
  const voteOptions = [
    { key: "VOTED", label: "Déjà voté" },
    { key: "NOT_VOTED", label: "Pas encore voté" },
  ];

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
            {availableStatuses.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onToggleStatus(key)}
                className={`px-3 py-1 rounded text-sm border transition-colors ${
                  selectedStatuses.includes(key)
                    ? `${getStatusColor(key)} text-white`
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION : FILTRAGE PAR STATUT D'ÉDITION */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">
            Filtrer par édition
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableEditStatuses.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onToggleEditStatus(key)}
                className={`px-3 py-1 rounded text-sm border transition-colors ${
                  selectedEditStatuses.includes(key)
                    ? `${getEditStatusColor(key)} text-white`
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION : FILTRAGE PAR VOTE */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">
            Filtrer par vote
          </h3>
          <div className="flex flex-wrap gap-2">
            {voteOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onToggleVoteStatus(key)}
                className={`px-3 py-1 rounded text-sm border transition-colors ${
                  selectedVoteStatus.includes(key)
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-emerald-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* BOUTONS DE CONTRÔLE */}
        <div className="flex justify-between gap-2 mt-6">
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            🗑️ Effacer les filtres
          </button>
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
