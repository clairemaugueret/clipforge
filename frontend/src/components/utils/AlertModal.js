import { useState } from "react";

// ============================================
// COMPOSANT PRINCIPAL : AlertModal
// ============================================

/**
 * Modal d'alerte réutilisable avec différents types et actions
 * @param {Object} props
 * @param {boolean} props.isOpen - Contrôle l'affichage de la modal
 * @param {function} props.onClose - Callback appelé à la fermeture
 * @param {string} props.title - Titre de la modal
 * @param {string} props.message - Message principal
 * @param {string} props.type - Type d'alerte : 'info', 'success', 'warning', 'error', 'confirm'
 * @param {function} props.onConfirm - Callback pour le bouton de confirmation (optionnel)
 * @param {string} props.confirmText - Texte du bouton de confirmation
 * @param {string} props.cancelText - Texte du bouton d'annulation
 * @param {boolean} props.showCancel - Afficher le bouton annuler
 */
const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  onConfirm,
  confirmText = "OK",
  cancelText = "Annuler",
  showCancel = false,
}) => {
  if (!isOpen) return null;

  // Configuration des couleurs selon le type
  const typeConfig = {
    info: {
      icon: "ℹ️",
      bgColor: "bg-blue-500",
      borderColor: "border-blue-500",
      textColor: "text-blue-600",
      btnColor: "bg-blue-600 hover:bg-blue-700",
    },
    success: {
      icon: "✅",
      bgColor: "bg-green-500",
      borderColor: "border-green-500",
      textColor: "text-green-600",
      btnColor: "bg-green-600 hover:bg-green-700",
    },
    warning: {
      icon: "⚠️",
      bgColor: "bg-yellow-500",
      borderColor: "border-yellow-500",
      textColor: "text-yellow-600",
      btnColor: "bg-yellow-600 hover:bg-yellow-700",
    },
    error: {
      icon: "❌",
      bgColor: "bg-red-500",
      borderColor: "border-red-500",
      textColor: "text-red-600",
      btnColor: "bg-red-600 hover:bg-red-700",
    },
    confirm: {
      icon: "❓",
      bgColor: "bg-indigo-500",
      borderColor: "border-indigo-500",
      textColor: "text-indigo-600",
      btnColor: "bg-indigo-600 hover:bg-indigo-700",
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 border-2 border-gray-700 animate-scale-in">
        {/* Barre de couleur en haut */}
        <div className={`h-2 ${config.bgColor} rounded-t-lg`} />

        {/* Contenu */}
        <div className="p-6">
          {/* Icône et titre */}
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">{config.icon}</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-gray-300 whitespace-pre-line">{message}</p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 justify-end mt-6">
            {showCancel && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 ${config.btnColor} text-white rounded font-medium transition-colors`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

// ============================================
// HOOK PERSONNALISÉ : useAlert
// ============================================

/**
 * Hook pour gérer facilement les alertes dans vos composants
 * @returns {Object} { alert, showAlert, closeAlert }
 */
export const useAlert = () => {
  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
    confirmText: "OK",
    cancelText: "Annuler",
    showCancel: false,
  });

  const showAlert = (config) => {
    setAlert({
      isOpen: true,
      title: config.title || "Information",
      message: config.message || "",
      type: config.type || "info",
      onConfirm: config.onConfirm,
      confirmText: config.confirmText || "OK",
      cancelText: config.cancelText || "Annuler",
      showCancel: config.showCancel || false,
    });
  };

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  return { alert, showAlert, closeAlert };
};

export default AlertModal;
