import twitchLogo from "../images/twitch_logo_white.png";
import { useSelector } from "react-redux";

/**
 * Modale de connexion/déconnexion avec authentification Twitch OAuth 2.0
 *
 * Cette modale gère deux états différents selon si l'utilisateur est connecté ou non :
 * - Si NON connecté : Affiche le bouton de connexion Twitch
 * - Si connecté : Affiche l'option de déconnexion avec confirmation
 *
 * @param {Function} onClose - Callback pour fermer la modale
 * @param {Function} onLogout - Callback pour déconnecter l'utilisateur (vide Redux)
 */
export default function LoginModal({ onClose, onLogout }) {
  // ============================================
  // RÉCUPÉRATION DES DONNÉES REDUX ET CONFIG
  // ============================================

  /**
   * Récupère l'utilisateur connecté depuis le store Redux
   * Structure de user : { token, username, avatar_url }
   * Si user.username existe, l'utilisateur est considéré comme connecté
   */
  const user = useSelector((state) => state.user);

  /**
   * Configuration OAuth Twitch - Variables d'environnement
   * Ces valeurs sont définies dans le fichier .env à la racine du projet
   *
   * CLIENT_ID : Identifiant unique de l'application Twitch
   * REDIRECT_URI : URL vers laquelle Twitch redirigera après autorisation
   * SCOPE : Permissions demandées (ici: lecture de l'email uniquement)
   */
  const CLIENT_ID = process.env.REACT_APP_TWITCH_CLIENT_ID;
  const REDIRECT_URI = process.env.REACT_APP_TWITCH_REDIRECT_URI;
  const SCOPE = "user:read:email editor:manage:clips";

  // ============================================
  // FONCTION : INITIER LA CONNEXION TWITCH
  // ============================================

  /**
   * Lance le processus d'authentification OAuth 2.0 avec Twitch
   *
   * Flux d'authentification - Étape 1 : Authorization Request
   *
   * Cette fonction :
   * 1. Construit l'URL d'autorisation Twitch avec tous les paramètres nécessaires
   * 2. Redirige l'utilisateur vers Twitch (quitte temporairement l'application)
   * 3. L'utilisateur se connecte sur Twitch et autorise l'application
   * 4. Twitch redirige vers REDIRECT_URI avec un code d'autorisation dans l'URL
   * 5. Le code est ensuite traité par le useEffect dans App.js qui :
   *    - L'envoie au backend
   *    - Récupère les données utilisateur
   *    - Les stocke dans Redux
   */
  const handleTwitchLogin = () => {
    // Construction de l'URL d'autorisation OAuth 2.0 selon la spécification Twitch
    // Format : https://id.twitch.tv/oauth2/authorize?param1=value1&param2=value2...
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=${encodeURIComponent(SCOPE)}`;

    // Redirection complète de la page vers l'URL d'autorisation Twitch
    // L'utilisateur quittera temporairement ClipForge
    window.location.href = authUrl;
  };

  // ============================================
  // FONCTION : GÉRER LA DÉCONNEXION
  // ============================================

  /**
   * Déconnecte l'utilisateur et ferme la modale
   *
   * Le processus de déconnexion :
   * 1. Appelle onLogout() qui dispatch l'action logout() Redux
   * 2. Redux vide les données utilisateur (token, username, avatar_url)
   * 3. Redux Persist supprime les données du localStorage
   * 4. Ferme la modale de connexion
   * 5. Affiche une alerte de confirmation (géré dans App.js)
   */
  const handleLogout = () => {
    onLogout(); // Appelle la fonction de déconnexion du parent (App.js)
    onClose(); // Ferme la modale
  };

  // ============================================
  // RENDU DE LA MODALE
  // ============================================

  return (
    // Overlay noir semi-transparent en plein écran (z-50 = au-dessus de tout)
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      {/* Carte blanche centrée avec ombre portée */}
      <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg w-80">
        {/* ============================================
            AFFICHAGE CONDITIONNEL selon l'état de connexion
            ============================================ */}

        {user.username ? (
          /* ============================================
              CAS 1 : UTILISATEUR CONNECTÉ
              Affiche l'interface de déconnexion
              ============================================ */
          <>
            {/* Titre de la section déconnexion */}
            <h2 className="text-lg font-bold mb-4 text-center">Déconnexion</h2>

            {/* Message de confirmation */}
            <p className="text-center text-sm mb-4">
              Voulez-vous vous déconnecter ?
            </p>

            {/* Boutons d'action côte à côte */}
            <div className="flex justify-between">
              {/* Bouton de déconnexion - Rouge pour indiquer une action destructive */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Se déconnecter
              </button>

              {/* Bouton d'annulation - Gris neutre */}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </>
        ) : (
          /* ============================================
              CAS 2 : UTILISATEUR NON CONNECTÉ
              Affiche l'interface de connexion
              ============================================ */
          <>
            {/* Titre de la section connexion */}
            <h2 className="text-lg font-bold mb-4 text-center">
              Connexion avec Twitch
            </h2>

            {/* Bouton de connexion avec logo Twitch - Violet = couleur Twitch */}
            <button
              onClick={handleTwitchLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              {/* Logo Twitch importé depuis les assets */}
              <img src={twitchLogo} alt="Twitch" className="w-6 h-6" />
              Se connecter avec Twitch
            </button>

            {/* Bouton d'annulation centré en dessous */}
            <div className="flex justify-center mt-2">
              <button
                onClick={onClose}
                className="w-24 py-1 bg-gray-300 text-gray-950 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * ============================================
 * NOTES SUR LE FLUX D'AUTHENTIFICATION COMPLET
 * ============================================
 *
 * 1. OUVERTURE DE LA MODALE :
 *    User clique sur l'avatar dans le header → LoginModal s'affiche
 *
 * 2. INITIATION DE LA CONNEXION :
 *    User clique "Se connecter avec Twitch" → handleTwitchLogin()
 *    → Redirection vers https://id.twitch.tv/oauth2/authorize
 *
 * 3. AUTORISATION SUR TWITCH :
 *    User se connecte à Twitch (si nécessaire)
 *    → User autorise l'application ClipForge
 *    → Twitch redirige vers notre app : http://localhost:3000/?code=XXXXXXX
 *
 * 4. TRAITEMENT DU CODE (dans App.js) :
 *    useEffect détecte le code dans l'URL
 *    → POST /clipmanager/users/authtwitch avec le code
 *    → Backend échange le code contre un access token via Twitch API
 *    → Backend renvoie : { token, username, avatar_url }
 *
 * 5. STOCKAGE DES DONNÉES :
 *    dispatch(login(...)) stocke les données dans Redux
 *    → Redux Persist sauvegarde automatiquement dans localStorage
 *    → User reste connecté même après rafraîchissement de la page
 *
 * 6. NETTOYAGE :
 *    window.history.replaceState() enlève le code de l'URL
 *    → URL redevient propre : http://localhost:3000/
 *    → Modale se ferme automatiquement
 *
 * 7. DÉCONNEXION :
 *    User clique sur avatar → Modale s'ouvre (mode déconnexion)
 *    → User clique "Se déconnecter"
 *    → dispatch(logout()) vide Redux
 *    → localStorage est vidé
 *    → Page d'accueil s'affiche
 */
