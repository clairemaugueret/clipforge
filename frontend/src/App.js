import { useState, useEffect } from "react";
import ClipList from "./components/ClipList";
import ClipViewer from "./components/ClipViewer";
import ClipForm from "./components/ClipForm";
import FilterModal from "./components/utils/FilterModal";
import LoginModal from "./components/utils/LoginModal";
import default_user from "./components/images/default_user.png";
// Import des hooks Redux pour la gestion de l'état global de l'utilisateur
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "./reducers/userSlice";

const BACK_URL = process.env.REACT_APP_BACK_URL;

function App() {
  // ============================================
  // REDUX - Gestion de l'état utilisateur global
  // ============================================

  // Récupère l'utilisateur connecté depuis le store Redux (persisté dans localStorage)
  const user = useSelector((state) => state.user);
  // Dispatcher pour déclencher des actions Redux (login/logout)
  const dispatch = useDispatch();

  // ============================================
  // ÉTATS LOCAUX DU COMPOSANT
  // ============================================

  // Liste complète des users récupérés depuis le backend
  const [users, setUsers] = useState([]);

  // Liste complète des clips récupérés depuis le backend
  const [clips, setClips] = useState([]);

  // ID du clip actuellement sélectionné (affiché dans ClipViewer)
  const [selectedClipId, setSelectedClipId] = useState(null);

  // Tags sélectionnés pour filtrer la liste des clips
  const [selectedTags, setSelectedTags] = useState([]);

  // Statuts sélectionnés pour filtrer la liste des clips
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  // Statuts d'édition sélectionnés pour filtrer la liste des clips
  const [selectedEditStatuses, setSelectedEditStatuses] = useState([]);

  // Affichage de la modale de filtrage par tags et statuts
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Affichage de la modale de connexion/déconnexion
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Affichage du formulaire de création/édition de clip
  const [showForm, setShowForm] = useState(false);

  // Liste de tous les tags disponibles dans l'application
  const [allTags, setAllTags] = useState([]);

  // Indique si on affiche les clips archivés ou les clips actifs
  const [showArchived, setShowArchived] = useState(false);

  // ============================================
  // VARIABLES DÉRIVÉES
  // ============================================

  // Récupère le clip complet correspondant à l'ID sélectionné
  const selectedClip = clips.find((c) => c.clip_id === selectedClipId);

  // ============================================
  // FONCTIONS DE GESTION DES FILTRES
  // ============================================

  /**
   * Ajoute ou retire un tag de la sélection pour le filtrage
   */
  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  /**
   * Ajoute ou retire un statut de la sélection pour le filtrage
   */
  const toggleStatus = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  /**
   * Ajoute ou retire un statut d'édition de la sélection pour le filtrage
   */
  const toggleEditStatus = (editStatus) => {
    setSelectedEditStatuses((prev) =>
      prev.includes(editStatus)
        ? prev.filter((e) => e !== editStatus)
        : [...prev, editStatus]
    );
  };

  /**
   * Ajoute un nouveau tag à la liste globale des tags
   */
  const addNewTag = (newTag) => {
    if (!allTags.includes(newTag)) {
      setAllTags((prev) => [...prev, newTag]);
    }
  };

  // ============================================
  // GESTION DE LA CRÉATION DE CLIP (BROUILLON)
  // ============================================

  /**
   * Crée un nouveau clip en mode brouillon et l'ajoute à la liste
   * Le brouillon a un ID spécial "draft" et est placé en tête de liste
   */
  const handleProposeClick = () => {
    const newDraft = {
      clip_id: "draft",
      subject: "Nouveau clip",
      tags: [],
      editable: false,
      draft: true,
      authorId: { username: user.username },
      createdAt: new Date(),
    };

    // Retire l'ancien brouillon s'il existe et ajoute le nouveau en tête
    setClips((prev) => {
      const withoutOldDraft = prev.filter((clip) => clip.clip_id !== "draft");
      return [newDraft, ...withoutOldDraft];
    });

    // Sélectionne automatiquement le brouillon et affiche le formulaire
    setSelectedClipId("draft");
    setShowForm(true);
  };

  // ============================================
  // GESTION DE LA SUPPRESSION DE CLIP
  // ============================================

  /**
   * Supprime un clip de la liste
   * Si le clip supprimé était sélectionné, désélectionne
   */
  const handleDeleteClip = (clipId) => {
    setClips((prev) => prev.filter((clip) => clip.clip_id !== clipId));

    if (selectedClipId === clipId) {
      setSelectedClipId(null);
    }
  };

  // ============================================
  // GESTION DE L'ANNULATION DU FORMULAIRE
  // ============================================

  /**
   * Annule la création/édition d'un clip
   * Si c'est un brouillon, demande confirmation avant suppression
   */
  const handleCancelForm = () => {
    // Si on annule un brouillon, on demande confirmation
    if (selectedClip?.draft) {
      const confirmDelete = window.confirm(
        "Annuler va supprimer ce brouillon. Continuer ?"
      );
      if (!confirmDelete) return;

      // Supprime le brouillon de la liste
      setClips((prev) => prev.filter((clip) => clip.clip_id !== "draft"));
    }

    setShowForm(false);
    setSelectedClipId(null);
  };

  // ============================================
  // MISE À JOUR DU BROUILLON
  // ============================================

  /**
   * Met à jour le brouillon en cours d'édition (changements en temps réel)
   */
  const handleDraftUpdate = (updatedClip) => {
    const updated = { ...updatedClip, draft: true };

    // Met à jour le brouillon dans la liste des clips
    setClips((prev) =>
      prev.map((clip) => (clip.clip_id === "draft" ? updated : clip))
    );

    setSelectedClipId("draft");
  };

  // ============================================
  // SÉLECTION D'UN CLIP
  // ============================================

  /**
   * Sélectionne un clip pour l'afficher dans le viewer
   * Si c'est un brouillon, affiche le formulaire au lieu du viewer
   */
  const handleSelectClip = (clipId) => {
    const freshClip = clips.find((c) => c.clip_id === clipId);
    setSelectedClipId(clipId);
    // Affiche le formulaire uniquement si c'est un brouillon
    setShowForm(freshClip?.clip_id === "draft");
  };

  // ============================================
  // MODIFICATION DES INFOS D'UN CLIP EXISTANT
  // ============================================

  /**
   * Convertit un clip proposé en brouillon pour le modifier
   * Crée une copie avec l'ID "draft" pour ne pas modifier l'original
   */
  const handleModifyClip = () => {
    if (!selectedClipId) return;

    const clipToEdit = clips.find((c) => c.clip_id === selectedClipId);
    if (!clipToEdit) return;

    // Crée un brouillon basé sur le clip à éditer
    const draftClip = {
      ...clipToEdit,
      draft: true,
      clip_id: "draft",
      originalClipId: clipToEdit.clip_id, // Conserve l'ID original
    };

    // Ajoute le brouillon à la liste
    setClips((prev) => [
      ...prev.filter((c) => c.clip_id !== "draft"),
      draftClip,
    ]);

    setSelectedClipId("draft");
    setShowForm(true);
  };

  /**
   * Envoie les modifications du clip en brouillon pour le modifier vers le backend
   */
  const updateExistingClip = async (clip) => {
    try {
      // 1. Mettre à jour le clip via la route PUT
      const response = await fetch(`${BACK_URL}/clipmanager/clips/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: user.token,
          clipId: clip.originalClipId, // ID du clip original
          subject: clip.subject,
          tags: clip.tags,
          editable: clip.editable,
          text: clip.comment,
        }),
      });

      const data = await response.json();

      if (data.result) {
        // 2. Re-fetch TOUTE la liste des clips depuis la DB
        const clipsResponse = await fetch(`${BACK_URL}/clipmanager/clips/all`);
        const clipsData = await clipsResponse.json();

        if (clipsData.result) {
          // 3. Mettre à jour l'état avec la liste fraîche
          setClips(clipsData.clips);

          // 4. Sélectionner le clip modifié
          setSelectedClipId(data.clip.clip_id);

          // 5. Nettoyer le formulaire
          setShowForm(false);
        }
      } else {
        console.error("Erreur:", data.error);
        alert(`Erreur : ${data.error}`);
      }
    } catch (err) {
      console.error("Erreur backend :", err);
      alert("Erreur lors de la modification du clip");
    }
  };

  /**
   * Crée un nouveau clip à partir du brouillon
   */
  const addNewClip = async (clip) => {
    try {
      // 1. Créer le clip via la route POST
      const response = await fetch(`${BACK_URL}/clipmanager/clips/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: user.token,
          link: clip.link,
          subject: clip.subject,
          tags: clip.tags,
          editable: clip.editable,
          text: clip.comment,
        }),
      });

      const data = await response.json();

      if (data.result) {
        // 2. Re-fetch TOUTE la liste des clips depuis la DB
        const clipsResponse = await fetch(`${BACK_URL}/clipmanager/clips/all`);
        const clipsData = await clipsResponse.json();

        if (clipsData.result) {
          // 3. Mettre à jour l'état avec la liste fraîche
          setClips(clipsData.clips);

          // 4. Sélectionner le nouveau clip créé
          setSelectedClipId(data.clip.clip_id);

          // 5. Nettoyer le formulaire
          setShowForm(false);
        }
      } else {
        console.error("Erreur:", data.error);
        alert(`Erreur : ${data.error}`);
      }
    } catch (err) {
      console.error("Erreur backend :", err);
      alert("Erreur lors de la création du clip");
    }
  };

  // ============================================
  // FILTRAGE DES CLIPS
  // ============================================

  /**
   * Filtre les clips selon les tags, les statuts ET les statuts d'édition sélectionnés
   * - Si aucun tag sélectionné, ignore le filtre par tag
   * - Si aucun statut sélectionné, ignore le filtre par statut
   * - Si aucun statut d'édition sélectionné, ignore le filtre par édition
   * - Si des tags sont sélectionnés, n'affiche que les clips qui ont TOUS les tags
   * - Si des statuts sont sélectionnés, n'affiche que les clips avec l'un de ces statuts
   * - Si des statuts d'édition sont sélectionnés, applique la logique appropriée
   */
  const filteredClips = clips.filter((clip) => {
    // Filtre par tags
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => clip.tags.includes(tag));

    // Filtre par statuts
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(clip.status);

    // Filtre par statuts d'édition
    let matchesEditStatus = true;
    if (selectedEditStatuses.length > 0) {
      matchesEditStatus = selectedEditStatuses.some((editStatus) => {
        if (editStatus === "EDITABLE") {
          return clip.editable === true && !clip.edit_progress;
        } else if (editStatus === "IN_PROGRESS") {
          return clip.edit_progress === "IN_PROGRESS";
        } else if (editStatus === "TERMINATED") {
          return clip.edit_progress === "TERMINATED";
        }
        return false;
      });
    }

    // Le clip doit correspondre aux trois filtres
    return matchesTags && matchesStatus && matchesEditStatus;
  });

  // ============================================
  // GESTION DES CLIPS ARCHIVÉS
  // ============================================

  /**
   * Charge les clips archivés depuis le backend
   */
  const loadArchivedClips = async () => {
    try {
      const response = await fetch(`${BACK_URL}/clipmanager/clips/archives`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: user.token,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur réseau");
      }

      const data = await response.json();

      if (data.result) {
        const normalized = data.clips.map((c) => ({
          ...c,
          votes: Array.isArray(c.votes) ? c.votes : [],
          comments: Array.isArray(c.comments) ? c.comments : [],
        }));
        setClips(normalized);
        setShowArchived(true);
        setSelectedClipId(null); // Réinitialise la sélection
      } else {
        alert("Erreur lors du chargement des clips archivés");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des clips archivés :", error);
      alert("Erreur de connexion au serveur");
    }
  };

  /**
   * Recharge les clips actifs depuis le backend
   */
  const loadActiveClips = async () => {
    try {
      const response = await fetch(`${BACK_URL}/clipmanager/clips/all`);

      if (!response.ok) {
        throw new Error("Erreur réseau");
      }

      const data = await response.json();
      setClips(data.clips);
      setShowArchived(false);
      setSelectedClipId(null); // Réinitialise la sélection

      // EXTRACTION AUTOMATIQUE DES TAGS UNIQUES
      const uniqueTags = [
        ...new Set(data.clips.flatMap((clip) => clip.tags || [])),
      ];
      setAllTags(uniqueTags);
    } catch (error) {
      console.error("Erreur lors du chargement des clips :", error);
      alert("Erreur de connexion au serveur");
    }
  };

  /**
   * Bascule entre les clips actifs et les archives
   */
  const toggleArchiveView = () => {
    if (showArchived) {
      loadActiveClips();
    } else {
      loadArchivedClips();
    }
  };

  /**
   * Déconnecte l'utilisateur en vidant les données Redux
   */
  const userLogout = () => {
    if (user.username) {
      dispatch(logout());
      alert("✅ Déconnexion réussie !");
    }
  };

  // ============================================
  // GESTION DE L'EDITION D'UN CLIP À EDITER
  // ============================================

  /**
   * Met à jour un clip dans la liste après modification
   * Utilisé notamment après la prise en charge de l'édition ou après un vote
   */
  const handleClipUpdate = (updatedClip) => {
    setClips((prevClips) =>
      prevClips.map((clip) =>
        clip.clip_id === updatedClip.clip_id ? updatedClip : clip
      )
    );
  };

  // ============================================
  // EFFET : AUTHENTIFICATION TWITCH
  // ============================================

  /**
   * Gère le retour de l'authentification Twitch
   * Récupère le code dans l'URL et l'envoie au backend pour obtenir les infos utilisateur
   * S'exécute au montage du composant
   *
   * Flux OAuth 2.0 complet :
   * 1. User clique sur "Se connecter" dans LoginModal
   * 2. Redirection vers Twitch pour autorisation
   * 3. Twitch redirige vers notre app avec un code dans l'URL
   * 4. Ce useEffect détecte le code et l'échange contre un token via le backend
   * 5. Les données utilisateur sont stockées dans Redux
   * 6. L'URL est nettoyée pour enlever le code
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    // Rien à faire si pas de code
    if (!code) return;

    // ✅ Anti-double-montage (React 18 StrictMode) :
    // si ce "code" a déjà été traité dans cette session, on sort.
    const handledKey = `twitch_oauth_code_${code}`;
    if (sessionStorage.getItem(handledKey)) {
      return;
    }
    sessionStorage.setItem(handledKey, "1");

    // (Optionnel) si déjà connecté, inutile d'appeler l'API
    if (user?.username) {
      // On nettoie l'URL pour enlever le code et on sort
      window.history.replaceState({}, document.title, "/");
      return;
    }

    fetch(`${BACK_URL}/clipmanager/users/authtwitch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          dispatch(
            login({
              token: data.user.token,
              username: data.user.username,
              avatar_url: data.user.avatar_url,
            })
          );
          // Nettoie l'URL IMMÉDIATEMENT après succès
          window.history.replaceState({}, document.title, "/");
          alert("✅ Connexion réussie !");
        } else {
          // Si le code a déjà été consommé, on évite d’alerter si on est déjà connecté
          if (!user?.username) {
            alert(`❌ Échec de la connexion. ${data.error || "Réessayez."}`);
          }
        }
      })
      .catch(() => {
        if (!user?.username) {
          alert("❌ Erreur de connexion");
        }
      });
  }, [dispatch, user?.username]);

  // ============================================
  // EFFET : CHARGEMENT DE LA LISTE DES USERS DE LA BASE DE DONNÉES
  // ============================================

  /**
   * Charge tous les users depuis le backend au montage du composant
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${BACK_URL}/clipmanager/users/all`);
        if (!response.ok) {
          throw new Error("Erreur réseau");
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Erreur lors du chargement des users :", error);
      }
    };

    fetchUsers();
  }, []);

  // ============================================
  // EFFET : CHARGEMENT DES CLIPS DE LA BASE DE DONNÉES
  // ============================================

  /**
   * Charge tous les clips depuis le backend au montage du composant
   * 1. D'abord lance l'archivage automatique des vieux clips
   * 2. Ensuite charge tous les clips actifs
   */
  useEffect(() => {
    const fetchClips = async () => {
      try {
        // 1. ARCHIVAGE AUTOMATIQUE
        const archiveResponse = await fetch(
          `${BACK_URL}/clipmanager/clips/archiving`,
          {
            method: "PUT",
          }
        );

        if (archiveResponse.ok) {
          const archiveData = await archiveResponse.json();

          // Afficher une alerte si des clips ont été archivés
          if (archiveData.result && archiveData.details.total > 0) {
            alert(
              `${archiveData.details.total} clip(s) ont été automatiquement archivés :\n` +
                `- ${archiveData.details.published} clip(s) publiés\n` +
                `- ${archiveData.details.discarded} clip(s) refusés`
            );
          }
        }

        // 2. CHARGEMENT DES CLIPS ACTIFS
        const response = await fetch(`${BACK_URL}/clipmanager/clips/all`);
        if (!response.ok) {
          throw new Error("Erreur réseau");
        }
        const data = await response.json();
        setClips(data.clips);

        // EXTRACTION AUTOMATIQUE DES TAGS UNIQUES
        const uniqueTags = [
          ...new Set(data.clips.flatMap((clip) => clip.tags || [])),
        ];
        setAllTags(uniqueTags);
      } catch (error) {
        console.error("Erreur lors du chargement des clips :", error);
      }
    };

    fetchClips();
  }, []);

  // ============================================
  // PLAYER TWITCH
  // ============================================

  // Construit l'URL d'embed Twitch avec le paramètre ?parent= requis
  const getTwitchEmbedSrc = (embedUrl) => {
    if (!embedUrl) return null;
    const parent = window.location.hostname; // ex: "localhost"
    try {
      const url = new URL(embedUrl);
      const parents = url.searchParams.getAll("parent");
      if (!parents.includes(parent)) {
        url.searchParams.append("parent", parent);
      }
      return url.toString();
    } catch {
      // Fallback si embedUrl n'est pas parfaitement formée
      const sep = embedUrl.includes("?") ? "&" : "?";
      return `${embedUrl}${sep}parent=${parent}`;
    }
  };

  // ============================================
  // DOWNLOAD CLIP
  // ============================================

  const handleDownloadClip = async (clipId, clipTitle) => {
    try {
      const response = await fetch(
        `${BACK_URL}/clipmanager/clips/download?clipId=${clipId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await response.json();

      if (data.result && data.downloadUrl) {
        // Crée un lien temporaire pour télécharger le fichier
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = `${clipTitle || "clip"}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(`Erreur : ${data.error || "Impossible de télécharger le clip"}`);
      }
    } catch (err) {
      console.error("Erreur lors du téléchargement:", err);
      alert("Erreur lors du téléchargement du clip");
    }
  };

  // ============================================
  // RENDU DU COMPOSANT
  // ============================================

  return (
    <div className="h-screen flex flex-col">
      {/* ============================================
          HEADER : Titre et bouton de connexion
          ============================================ */}
      <header className="bg-indigo-950 p-4 shadow-md flex justify-between items-center">
        <h1
          onClick={() => (window.location.href = "/")}
          className="text-xl font-bold text-white cursor-pointer hover:text-indigo-900 transition-colors"
          title="Retour à l'accueil"
        >
          🎬 Clips Manager{" "}
          <span className="text-base text-indigo-500 opacity-50">
            • TikTok @evoxia.clips
          </span>
        </h1>
        {/* Avatar cliquable pour ouvrir la modale de connexion/déconnexion */}

        <div className="flex justify-between items-center">
          {user.username ? (
            <p className="text-indigo-400 opacity-40 text-sm mr-4 font-medium italic">
              Connecté en tant que{" "}
              <span className="font-bold not-italic">{user.username}</span>
            </p>
          ) : (
            <p className="text-indigo-400 opacity-70 text-sm mr-4 font-medium">
              Se connecter
            </p>
          )}
          <img
            src={user.avatar_url || default_user}
            alt="Avatar"
            onClick={() => setShowLoginModal(true)}
            className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity "
            title={
              user.username
                ? `Connecté en tant que ${user.username}`
                : "Se connecter"
            }
          />
        </div>
      </header>

      {/* ============================================
          CONTENU PRINCIPAL : 3 colonnes
          ============================================ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ============================================
            COLONNE GAUCHE : Liste des clips
            ============================================ */}
        <aside className="w-80 bg-gray-800 flex flex-col overflow-hidden">
          {/* Barre d'actions : Proposer et Filtrer */}
          <div className="p-2 flex flex-col gap-2 bg-gray-800 border-b">
            <div className="flex gap-2">
              <button
                onClick={handleProposeClick}
                disabled={!user.username}
                className={`flex-1 px-3 py-2 rounded font-medium ${
                  user.username
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                }`}
                title={
                  user.username
                    ? "Proposer un nouveau clip"
                    : "Connecte-toi pour proposer un clip"
                }
              >
                📝 Proposer un clip
              </button>

              <button
                onClick={() => setShowFilterModal(true)}
                className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
              >
                🔎 Filtrer
              </button>
            </div>
          </div>

          {/* Liste des clips filtrés */}
          {!user.username ? (
            <div className="flex-1 overflow-y-auto"></div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <ClipList
                clips={filteredClips}
                onSelect={handleSelectClip}
                selectedClipId={selectedClipId}
                users={users}
              />
            </div>
          )}

          {/* Bouton pour basculer entre clips actifs et archives */}
          <div className="p-2 bg-gray-800 border-t">
            <button
              onClick={toggleArchiveView}
              disabled={!user.username}
              className={`w-full px-3 py-2 rounded font-medium ${
                user.username
                  ? showArchived
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
              title={
                user.username
                  ? showArchived
                    ? "Retour aux clips actifs"
                    : "Voir les archives"
                  : "Connecte-toi pour voir les archives"
              }
            >
              {showArchived ? "📂 Clips actifs" : "📦 Archives"}
            </button>
          </div>
        </aside>

        {/* ============================================
            COLONNE CENTRALE : Viewer ou Form
            ============================================ */}
        <main className="flex-1 bg-gray-700 p-4 overflow-auto">
          {!user.username ? (
            <div></div>
          ) : (
            <>
              {/* Affiche le formulaire si showForm est true, sinon le viewer */}
              {showForm && selectedClip ? (
                <ClipForm
                  allTags={allTags}
                  onSubmit={
                    selectedClip.originalClipId
                      ? updateExistingClip // Modification d'un clip existant
                      : addNewClip // Création d'un nouveau clip
                  }
                  onAddTag={addNewTag}
                  onCancel={handleCancelForm}
                  onChange={handleDraftUpdate}
                  initialData={selectedClip}
                />
              ) : (
                selectedClip && (
                  <ClipViewer
                    clip={selectedClip}
                    users={users}
                    user={user}
                    onModifyClip={handleModifyClip}
                    onDeleteClip={handleDeleteClip}
                    onClipUpdate={handleClipUpdate}
                  />
                )
              )}
            </>
          )}
        </main>

        {/* ============================================
            COLONNE DROITE : Image et lien Twitch du clip
            ============================================ */}
        <div className="w-[700px] bg-gray-700 p-4 flex flex-col items-end gap-4">
          {!user.username ? (
            <div></div>
          ) : (
            <>
              {selectedClip && (
                <>
                  {/* Vidéo Twitch si embed_url existe, sinon image */}
                  {selectedClip.embed_url ? (
                    <div className="w-full aspect-video rounded-lg shadow-lg overflow-hidden">
                      <iframe
                        src={getTwitchEmbedSrc(selectedClip.embed_url)}
                        title="Twitch clip"
                        allowFullScreen
                        frameBorder="0"
                        scrolling="no"
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <img // Sinon image d'illustration du clip (ou bannière par défaut)
                      src={
                        selectedClip.image?.trim()
                          ? selectedClip.image
                          : "offline-screen_socials.png"
                      }
                      alt="Illustration du clip"
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  )}

                  {/* Lien vers Twitch (on le garde au cas où) */}
                  {selectedClip.link && (
                    <div className="flex flex-row gap-3">
                      <a
                        href={selectedClip.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
                      >
                        🎥 Voir sur Twitch
                      </a>
                      <button
                        onClick={() =>
                          handleDownloadClip(
                            selectedClip.clip_id,
                            selectedClip.subject
                          )
                        }
                        className="text-sm px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 font-medium"
                      >
                        📥 Télécharger
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* ============================================
          MODALES : Affichées conditionnellement
          ============================================ */}

      {/* Modale de filtrage par tags, statuts et édition */}
      {showFilterModal && (
        <FilterModal
          allTags={allTags}
          selectedTags={selectedTags}
          selectedStatuses={selectedStatuses}
          selectedEditStatuses={selectedEditStatuses}
          onToggleTag={toggleTag}
          onToggleStatus={toggleStatus}
          onToggleEditStatus={toggleEditStatus}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {/* Modale de connexion/déconnexion */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogout={userLogout}
        />
      )}
    </div>
  );
}

export default App;
