export default function EditClaimModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Prendre en charge l’édition</h2>
        <p className="mb-6">
          Souhaitez-vous prendre en charge l'édition de ce clip ?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Je prends !
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
