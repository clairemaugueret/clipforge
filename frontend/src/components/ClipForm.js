import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const BACK_URL = process.env.REACT_APP_BACK_URL;

/**
 * Composant formulaire pour créer ou éditer un clip
 * Récupère automatiquement les infos Twitch dès que l'URL est ajoutée (SAUF en mode édition)
 */
function ClipForm({
  allTags,
  onSubmit,
  onAddTag,
  onCancel,
  onChange,
  initialData,
}) {
  // États locaux du formulaire
  const [title, setTitle] = useState(initialData?.subject || "");
  const [link, setLink] = useState(initialData?.link || "");
  const [comment, setComment] = useState(initialData?.comment || "");
  const [tags, setTags] = useState(initialData?.tags || []);
  const [editable, setEditable] = useState(initialData?.editable || false);
  const [newTag, setNewTag] = useState("");

  // Nouveaux états pour gérer le chargement des infos Twitch
  const [isLoadingTwitchInfo, setIsLoadingTwitchInfo] = useState(false);
  const [twitchInfoError, setTwitchInfoError] = useState(null);
  const [clipImage, setClipImage] = useState(initialData?.image || "");

  const user = useSelector((state) => state.user);

  // Détermine si on est en mode édition ou création
  const isEditMode = initialData?.originalClipId !== undefined;

  // ============================================
  // EFFET : AUTO-REMPLISSAGE DES INFOS TWITCH
  // ============================================
  useEffect(() => {
    // Ne déclenche la récupération que si :
    // 1. Un lien est présent
    // 2. Ce n'est pas un clip existant en cours de modification
    if (!link || !link.trim()) {
      return;
    }

    // Si c'est une MODIFICATION d'un clip existant (présence de originalClipId)
    // on ne récupère PAS les infos Twitch pour éviter l'erreur "clip déjà proposé"
    if (initialData?.originalClipId) {
      return;
    }

    // Si c'est un clip existant (pas un draft de création), on ne récupère pas les infos
    if (initialData?.clip_id && initialData.clip_id !== "draft") {
      return;
    }

    // Fonction pour récupérer les infos Twitch
    const fetchTwitchInfo = async () => {
      setIsLoadingTwitchInfo(true);
      setTwitchInfoError(null);

      try {
        // Encode l'URL du clip pour la passer en query parameter
        const encodedLink = encodeURIComponent(link);

        const response = await fetch(
          `${BACK_URL}/clipmanager/clips/twitchinfo?link=${encodedLink}`,
          {
            method: "GET",
            headers: {
              Authorization: user.token,
            },
          }
        );

        const data = await response.json();

        if (data.result && data.clipData) {
          // Pré-remplit le titre si vide
          if (!title || title === "Nouveau clip") {
            setTitle(data.clipData.title);
          }

          // Sauvegarde l'image du clip
          if (data.clipData.thumbnail_url) {
            setClipImage(data.clipData.thumbnail_url);
          }

          // Émet les changements pour mettre à jour le brouillon
          if (onChange) {
            onChange({
              ...initialData,
              subject: data.clipData.title,
              link,
              tags,
              editable,
              draft: true,
              image: data.clipData.thumbnail_url,
              embed_url: data.clipData.embed_url,
            });
          }
        } else {
          // Gestion des erreurs
          if (response.status === 409) {
            setTwitchInfoError("Ce clip a déjà été proposé");
          } else {
            setTwitchInfoError(
              data.error || "Impossible de récupérer les infos du clip"
            );
          }
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des infos Twitch:", err);
        setTwitchInfoError("Erreur de connexion au serveur");
      } finally {
        setIsLoadingTwitchInfo(false);
      }
    };

    // Délai avant de déclencher la requête (debounce)
    const timeoutId = setTimeout(() => {
      // Vérifie que l'URL ressemble à un lien Twitch valide
      if (link.includes("twitch.tv")) {
        fetchTwitchInfo();
      }
    }, 500); // Attend 500ms après la dernière modification

    return () => clearTimeout(timeoutId);
  }, [link]); // Se déclenche uniquement quand le lien change

  // ============================================
  // GESTION DES CHANGEMENTS EN TEMPS RÉEL
  // ============================================
  const emitChange = () => {
    if (onChange) {
      onChange({
        ...initialData,
        subject: title,
        link,
        tags,
        editable,
        draft: true,
        image: clipImage,
      });
    }
  };

  // ============================================
  // GESTION DES TAGS
  // ============================================
  const toggleTag = (tag) => {
    setTags((prev) => {
      const updated = prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag];
      setTimeout(emitChange, 0);
      return updated;
    });
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !allTags.includes(trimmed)) {
      onAddTag(trimmed);
      setTags((prev) => {
        const updated = [...prev, trimmed];
        setTimeout(emitChange, 0);
        return updated;
      });
    }
    setNewTag("");
  };

  // ============================================
  // EXTRACTION DE L'ID DU CLIP
  // ============================================
  function extractClipId(link) {
    try {
      const url = new URL(link);
      const host = url.hostname;

      if (host === "clips.twitch.tv") {
        return url.pathname.slice(1);
      }

      if (host.includes("twitch.tv") && url.pathname.includes("/clip/")) {
        return url.pathname.split("/clip/")[1].split("/")[0];
      }

      if (url.searchParams.has("clip")) {
        return url.searchParams.get("clip");
      }

      return null;
    } catch (err) {
      return null;
    }
  }

  // ============================================
  // SOUMISSION DU FORMULAIRE
  // ============================================
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...initialData,
      clip_id: extractClipId(link),
      subject: title,
      link,
      tags,
      editable,
      draft: false,
      authorId: { username: user.username },
      image: clipImage,
      comment, // Ajout du commentaire pour modification
    });
  };

  // ============================================
  // RENDU DU FORMULAIRE
  // ============================================
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 w-full max-w-xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <h2 className="text-lg sm:text-xl font-bold text-gray-100">
        {isEditMode ? "Modifier le clip" : "Proposer un clip"}
      </h2>

      {/* CHAMP : URL DU CLIP */}
      <div>
        <label className="block mb-1 text-xs sm:text-sm text-gray-100 font-medium">
          Lien du clip
        </label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onBlur={emitChange}
          required
          disabled={isEditMode} // ⭐ Désactive en mode édition
          className={`w-full p-2 text-sm sm:text-base border rounded ${
            isEditMode ? "bg-gray-600 cursor-not-allowed" : ""
          }`}
          placeholder="https://clips.twitch.tv/...   OU  https://www.twitch.tv/evoxia/clip/..."
        />

        {/* Indicateur en mode édition */}
        {isEditMode && (
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            ℹ️ Le lien ne peut pas être modifié
          </p>
        )}

        {/* Indicateur de chargement (uniquement en mode création) */}
        {!isEditMode && isLoadingTwitchInfo && (
          <p className="text-xs sm:text-sm text-blue-400 mt-1">
            🔄 Récupération des infos du clip...
          </p>
        )}

        {/* Affichage des erreurs (uniquement en mode création) */}
        {!isEditMode && twitchInfoError && (
          <p className="text-xs sm:text-sm text-red-400 mt-1">
            ⚠️ {twitchInfoError}
          </p>
        )}

        {/* Confirmation du chargement réussi (uniquement en mode création) */}
        {!isEditMode &&
          !isLoadingTwitchInfo &&
          !twitchInfoError &&
          clipImage && (
            <p className="text-xs sm:text-sm text-green-400 mt-1">
              ✅ Infos du clip récupérées automatiquement
            </p>
          )}
      </div>

      {/* CHAMP : TITRE DU CLIP */}
      <div>
        <label className="block mb-1 text-xs sm:text-sm text-gray-100 font-medium">
          Titre
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={emitChange}
          required
          className="w-full p-2 text-sm sm:text-base border rounded"
          placeholder={
            isEditMode
              ? "Modifier le titre"
              : "Le titre sera rempli automatiquement"
          }
        />
      </div>

      {/* SECTION : SÉLECTION DES TAGS */}
      <div>
        <label className="block mb-1 text-xs sm:text-sm text-gray-100 font-medium">
          Tags
        </label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
          {allTags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2 py-1 rounded text-xs sm:text-sm border ${
                tags.includes(tag)
                  ? "bg-indigo-800 text-white border-indigo-500"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Nouveau tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1 p-2 text-sm sm:text-base border rounded"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-3 py-2 text-sm sm:text-base bg-indigo-500 text-white rounded hover:bg-indigo-700 whitespace-nowrap"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* CHECKBOX : À ÉDITER */}
      <div className="flex items-center text-gray-100 gap-2">
        <input
          id="editable"
          type="checkbox"
          checked={editable}
          onChange={(e) => {
            const newValue = e.target.checked;
            setEditable(newValue);
            emitChange();
          }}
          className="w-4 h-4"
        />
        <label htmlFor="editable" className="text-xs sm:text-sm">
          À éditer
        </label>
      </div>

      {/* CHAMP : COMMENTAIRE */}
      <div>
        <label className="block mb-1 text-xs sm:text-sm text-gray-100 font-medium">
          Commentaire {isEditMode && "(optionnel)"}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={emitChange}
          rows="3"
          className="w-full p-2 text-sm sm:text-base border rounded"
          placeholder={
            isEditMode
              ? "Ajouter un commentaire sur cette modification..."
              : "Ajouter un commentaire..."
          }
        />
      </div>

      {/* BOUTONS D'ACTION */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="submit"
          disabled={!isEditMode && isLoadingTwitchInfo}
          className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {!isEditMode && isLoadingTwitchInfo
            ? "Chargement..."
            : isEditMode
              ? "Enregistrer les modifications"
              : "Soumettre"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export default ClipForm;
