const Clip = require("../models/Clip");
const User = require("../models/User");
const dayjs = require("dayjs"); // dayjs pour les dates
const { checkBody } = require("../utils/checkBody");
const {
  fetchTwitchClipData,
  fetchTwitchClipDownloadUrl,
} = require("../services/twitchClips");
const { extractClipId, isClipAlreadyProposed } = require("../utils/clipsUtils");
const {
  findClipOr404,
  populateClipData,
  sanitizeTitle,
} = require("../utils/clipsUtils");
const { isAuthorOr403, isExpertOr403 } = require("../utils/usersUtils");
const { sanitizeCommentText } = require("../utils/commentsUtils");
const { Op } = require("sequelize");

// CONTROLLER - Récupérer les infos d'un clip via l'API Twitch
async function getClipInfo(req, res) {
  // Le token est déjà vérifié par le middleware checkAuth
  // On récupère le lien depuis les query parameters
  const { link } = req.query;

  if (!link) {
    return res
      .status(400)
      .json({ result: false, error: "Missing link parameter" });
  }

  const clipId = extractClipId(link);

  if (!clipId) {
    return res
      .status(400)
      .json({ result: false, error: "Invalid Twitch clip URL" });
  }

  // Le token de l'app est stocké dans req.token par le middleware checkAuth
  const appToken = req.token;

  const result = await fetchTwitchClipData(clipId, appToken);

  if (!result.success) {
    return res
      .status(result.status)
      .json({ result: false, error: result.error });
  }

  // Vérifier si le clip existe déjà dans la DB
  if (await isClipAlreadyProposed(clipId)) {
    return res
      .status(409)
      .json({ result: false, error: "Clip already proposed" });
  }

  // Si le clip n'existe pas, on le renvoie au frontend
  return res.status(200).json({ result: true, clipData: result.clip });
}

// CONTROLLER - Création d'une nouvelle proposition de clip
async function createClip(req, res) {
  if (!checkBody(req.body, ["link", "subject", "tags"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { token, link, subject, tags, editable, text } = req.body;

  const clipId = extractClipId(link);
  if (!clipId) {
    return res
      .status(400)
      .json({ result: false, error: "Invalid Twitch clip URL" });
  }

  // Vérifier si le clip existe déjà dans la DB
  if (await isClipAlreadyProposed(clipId)) {
    return res
      .status(409)
      .json({ result: false, error: "Clip already proposed" });
  }

  const result = await fetchTwitchClipData(clipId, token);

  if (!result.success) {
    return res
      .status(result.status)
      .json({ result: false, error: result.error });
  }

  const clipData = result.clip;

  const sanitizedTitle = sanitizeTitle(subject);
  if (!sanitizedTitle) {
    return res.status(400).json({ result: false, error: "Invalid Title" });
  }

  try {
    const comments = [];
    const sanitizedText = sanitizeCommentText(text);
    if (sanitizedText) {
      comments.push({
        userId: req.user.twitch_id,
        userName: req.user.username,
        userAvatar: req.user.avatar_url,
        text: sanitizedText,
        createdAt: new Date().toISOString(),
        views: [req.user.twitch_id],
      });
    }

    let resultVote;

    if (editable) {
      resultVote = "toReview";
    } else {
      resultVote = "OK";
    }

    const votes = [
      {
        userId: req.user.twitch_id,
        userName: req.user.username,
        userAvatar: req.user.avatar_url,
        result: resultVote,
      }, // Initialiser avec vote de l'auteur
    ];

    const newClip = await Clip.create({
      link,
      clip_id: clipId,
      embed_url: clipData.embed_url,
      image: clipData.thumbnail_url,
      authorId: req.user.twitch_id,
      subject,
      tags,
      createdAt: new Date().toISOString(),
      editable: editable || false,
      comments,
      votes,
    });

    // Peupler avant d’envoyer
    await populateClipData(newClip);

    res.status(201).json({
      result: true,
      message: "Clip successfully proposed",
      clip: newClip,
    });
  } catch (err) {
    console.error("Error creating clip:", err);
    res.status(500).json({ result: false, error: "Failed to create clip" });
  }
}

// CONTROLLER -  Récupérer tous les clips de la DB
async function getAllClips(req, res) {
  try {
    const clips = await Clip.findAll({
      where: {
        status: {
          [Op.notIn]: ["ARCHIVED_PUBLISHED", "ARCHIVED_DISCARDED"],
        },
      },
      order: [["createdAt", "DESC"]], // Trie du plus récent au plus ancien
    });

    // Peupler avant d’envoyer
    await populateClipData(clips);

    if (!clips || clips.length === 0) {
      return res.status(404).json({
        result: false,
        error: "No clips found",
      });
    }

    res.status(200).json({
      result: true,
      count: clips.length,
      clips,
    });
  } catch (err) {
    console.error("Error fetching all clips:", err);
    res.status(500).json({
      result: false,
      error: "Internal server error",
    });
  }
}

// CONTROLLER - Modifier une proposition de clip (par l'auteur uniquement)
async function updateClip(req, res) {
  if (!checkBody(req.body, ["clipId", "subject", "tags"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { clipId, subject, tags, editable, text } = req.body;

  try {
    const clip = await findClipOr404(clipId, res);
    if (!clip) return; // La fonction a déjà renvoyé l'erreur 404 donc ici on stoppe juste l'exécution

    // Vérifier que l'utilisateur courant est bien l'auteur
    if (!isAuthorOr403(clip, req.user.twitch_id, res)) return;

    // Mettre à jour les champs autorisés
    await clip.update({
      subject,
      tags,
      editable: editable ?? clip.editable,
    });

    // Si un nouveau commentaire est fourni avec l'update
    const validComment = sanitizeCommentText(text);
    if (validComment) {
      // Sécurise le parsing des commentaires
      let updatedComments = [];

      if (typeof clip.comments === "string") {
        try {
          updatedComments = JSON.parse(clip.comments);
          if (!Array.isArray(updatedComments)) {
            updatedComments = [];
          }
        } catch (err) {
          console.error("Invalid JSON in clip.comments:", err);
          updatedComments = [];
        }
      } else if (Array.isArray(clip.comments)) {
        updatedComments = clip.comments; // déjà un tableau
      } else {
        updatedComments = [];
      }

      // Ajoute le nouveau commentaire
      updatedComments.push({
        userId: req.user.twitch_id,
        userName: req.user.username,
        userAvatar: req.user.avatar_url,
        text: validComment,
        createdAt: new Date().toISOString(),
        views: [req.user.twitch_id],
      });

      await clip.update({ comments: updatedComments });
    }

    // Peupler avant d’envoyer
    await populateClipData(clip);

    res.status(200).json({
      result: true,
      message: "Clip successfully updated",
      clip,
    });
  } catch (err) {
    console.error("Error updating clip:", err);
    res.status(500).json({ result: false, error: "Failed to update clip" });
  }
}

// CONTROLLER - Mettre à jour le statut d'un clip après publication
async function clipPublished(req, res) {
  if (!checkBody(req.body, ["clipId"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { clipId } = req.body;

  try {
    const clip = await findClipOr404(clipId, res);
    if (!clip) return;

    // Vérifier que l'utilisateur courant est bien l'auteur
    if (!isExpertOr403(req.user, res)) return;

    // Mettre à jour le statut du clip
    await clip.update({
      status: "PUBLISHED",
      published_at: new Date(),
    });

    // Peupler avant d’envoyer
    await populateClipData(clip);

    res.status(200).json({
      result: true,
      message: "Clip published",
      clip,
    });
  } catch (err) {
    console.error("Error publishing clip:", err);
    res.status(500).json({ result: false, error: "Failed to publish clip" });
  }
}

// CONTROLLER - Ajouter un vote à un clip et mise à jour du statut, si appicable (selon conditions)
async function addVoteToClip(req, res) {
  // Validation des champs requis
  if (!checkBody(req.body, ["clipId", "vote"])) {
    return res
      .status(400)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const { clipId, vote } = req.body;

  // Validation du format du vote
  const validVotes = ["OK", "KO", "toReview"];
  if (!validVotes.includes(vote)) {
    return res.status(400).json({
      result: false,
      error: "Invalid vote value. Must be OK, KO, or toReview",
    });
  }

  try {
    // Vérifier que le clip existe
    const clip = await findClipOr404(clipId, res);
    if (!clip) return;

    // Empêcher le vote si le clip est "archivé (publié)""
    if (clip.status === "ARCHIVED_PUBLISHED") {
      return res
        .status(403)
        .json({ result: false, error: "Archived clips cannot be voted on" });
    }

    // Sécurise le parsing des votes existants
    let updatedVotes = [];

    if (typeof clip.votes === "string") {
      try {
        updatedVotes = JSON.parse(clip.votes);
        if (!Array.isArray(updatedVotes)) {
          updatedVotes = [];
        }
      } catch (err) {
        console.error("Invalid JSON in clip.votes:", err);
        updatedVotes = [];
      }
    } else if (Array.isArray(clip.votes)) {
      updatedVotes = clip.votes; // déjà un tableau
    } else {
      updatedVotes = [];
    }

    // Vérifie si l'utilisateur a déjà voté
    const existingVoteIndex = updatedVotes.findIndex(
      (v) => v.userId === req.user.twitch_id
    );

    if (existingVoteIndex !== -1) {
      // Met à jour le vote existant
      updatedVotes[existingVoteIndex].result = vote;
    } else {
      // Ajoute un nouveau vote avec le rôle de l'utilisateur
      updatedVotes.push({
        userId: req.user.twitch_id,
        userName: req.user.username,
        userAvatar: req.user.avatar_url,
        userRole: req.user.role, // 🆕 Ajout du rôle (EXPERT ou USER)
        result: vote,
      });
    }

    // Vérifie si tous les experts ont voté (seuls les votes des EXPERT comptent pour le statut)
    const experts = await User.findAll({ where: { role: "EXPERT" } });
    const expertIds = experts.map((u) => u.twitch_id);

    const votedExpertIds = updatedVotes
      .map((v) => v.userId)
      .filter((id) => expertIds.includes(id));

    const allExpertsVoted = expertIds.every((id) =>
      votedExpertIds.includes(id)
    );

    // Recalcule le statut du clip selon les règles (votes des EXPERTS uniquement)
    // Filtre uniquement les votes des experts
    const expertVotes = updatedVotes.filter((v) =>
      expertIds.includes(v.userId)
    );
    const okVotes = expertVotes.filter((v) => v.result === "OK").length;
    const koVotes = expertVotes.filter((v) => v.result === "KO").length;

    const totalExperts = expertIds.length;
    const majorityThreshold = Math.floor(totalExperts / 2) + 1; // majorité stricte > 50%

    // Règle READY : tous les experts ont voté, clip non éditable, et majorité de OK
    if (allExpertsVoted && !clip.editable && okVotes >= majorityThreshold) {
      clip.status = "READY";
    }
    // Règle DISCARDED : dès que la majorité (sur le total d'experts) a voté KO
    else if (koVotes >= majorityThreshold) {
      clip.status = "DISCARDED";
    }
    // Sinon : PROPOSED
    else {
      clip.status = "PROPOSED";
    }

    // Met à jour le clip avec les nouveaux votes et le statut
    await clip.update({
      votes: updatedVotes,
      status: clip.status,
    });

    // Peupler les données avant d'envoyer (pour inclure les infos complètes des users)
    await populateClipData(clip);

    res.status(200).json({
      result: true,
      message: "Vote successfully saved",
      clip,
    });
  } catch (err) {
    console.error("Error saving vote:", err);
    res.status(500).json({ result: false, error: "Failed to save vote" });
  }
}

// CONTROLLER - Archiver les clips publiés il y a plus de 2 semaines
async function archiveOldClips(req, res) {
  try {
    const oneWeeksAgo = dayjs().subtract(7, "day").toDate();
    const twoWeeksAgo = dayjs().subtract(14, "day").toDate();

    // Archiver les clips PUBLISHED depuis plus de 2 semaines (basé sur published_at)
    const publishedResult = await Clip.update(
      { status: "ARCHIVED_PUBLISHED" },
      {
        where: {
          status: "PUBLISHED",
          published_at: { [Op.lt]: twoWeeksAgo },
        },
      }
    );

    // Archiver les clips DISCARDED créés il y a plus de 2 semaines (basé sur createdAt)
    const discardedResult = await Clip.update(
      { status: "ARCHIVED_DISCARDED" },
      {
        where: {
          status: "DISCARDED",
          createdAt: { [Op.lt]: oneWeeksAgo },
        },
      }
    );

    const totalArchived = publishedResult[0] + discardedResult[0];

    res.status(200).json({
      result: true,
      message: `${totalArchived} clip(s) archived (${publishedResult[0]} published, ${discardedResult[0]} discarded)`,
      details: {
        published: publishedResult[0],
        discarded: discardedResult[0],
        total: totalArchived,
      },
    });
  } catch (error) {
    console.error("Error archiving clips:", error);
    res.status(500).json({
      result: false,
      error: "Server error while archiving clips",
    });
  }
}

// CONTROLLER - Recherche de tous les clips archivés
async function getArchivedClips(req, res) {
  try {
    const archivedClips = await Clip.findAll({
      where: {
        status: {
          [Op.in]: ["ARCHIVED_PUBLISHED", "ARCHIVED_DISCARDED"],
        },
      },
      order: [["createdAt", "DESC"]], // Trie du plus récent au plus ancien
    });

    // Harmonise les données comme pour /all
    await populateClipData(archivedClips);

    // Ceinture + bretelles : s'assurer que votes/comments sont des tableaux
    const normalized = archivedClips.map((c) => {
      const plain = typeof c.toJSON === "function" ? c.toJSON() : c;
      return {
        ...plain,
        votes: Array.isArray(plain.votes) ? plain.votes : [],
        comments: Array.isArray(plain.comments) ? plain.comments : [],
      };
    });

    res.status(200).json({
      result: true,
      count: normalized.length,
      clips: normalized,
    });
  } catch (error) {
    console.error("Error fetching archived clips:", error);
    res
      .status(500)
      .json({ error: "Server error while fetching archived clips" });
  }
}

// CONTROLLER - Obtenir l'URL de téléchargement d'un clip
async function getClipDownloadUrl(req, res) {
  const { clipId } = req.query;

  if (!clipId) {
    return res
      .status(400)
      .json({ result: false, error: "Missing clipId parameter" });
  }

  try {
    // 1. Récupérer les infos du clip depuis l'API Twitch pour obtenir broadcaster_id
    const clipDataResult = await fetchTwitchClipData(clipId, req.token);

    if (!clipDataResult.success) {
      return res.status(clipDataResult.status).json({
        result: false,
        error: clipDataResult.error,
      });
    }

    const broadcasterId = clipDataResult.clip.broadcaster_id;

    // 2. Récupérer l'editor_id depuis la DB (utilisateur "Boubou_")
    const editorUser = await User.findOne({
      where: { username: "Boubou_" },
    });

    if (!editorUser) {
      return res.status(404).json({
        result: false,
        error: "Editor user 'Boubou_' not found in database",
      });
    }

    const editorId = editorUser.twitch_id;

    // 3. Vérifier que l'utilisateur a un token Twitch valide
    const userTwitchToken = req.user.twitch_access_token;

    if (!userTwitchToken) {
      return res.status(401).json({
        result: false,
        error: "User not authenticated with Twitch",
      });
    }

    // 4. Appeler l'API Twitch pour obtenir l'URL de téléchargement
    const result = await fetchTwitchClipDownloadUrl(
      clipId,
      broadcasterId,
      editorId,
      userTwitchToken
    );

    if (!result.success) {
      console.error("Download failed:", result.error);

      return res.status(result.status).json({
        result: false,
        error: result.error?.message || "Failed to get download URL",
      });
    }

    return res.status(200).json({
      result: true,
      downloadUrl: result.downloadData.url,
      expiresAt: result.downloadData.expires_at,
    });
  } catch (err) {
    console.error("Error getting clip download URL:", err);
    return res.status(500).json({
      result: false,
      error: "Server error while getting download URL",
    });
  }
}

// CONTROLLER - Supprimer un clip (par l'auteur ou un expert)
async function deleteClip(req, res) {
  const clipId = req.query.clipId;

  if (!clipId) {
    return res
      .status(400)
      .json({ result: false, error: "Missing clipId parameter" });
  }

  try {
    // Récupère le clip ou renvoie 404 via la util
    const clip = await findClipOr404(clipId, res);
    if (!clip) return; // findClipOr404 a déjà renvoyé la réponse 404

    // Empêche la suppression des clips archivés
    if (
      clip.status === "ARCHIVED_PUBLISHED" ||
      clip.status === "ARCHIVED_DISCARDED"
    ) {
      return res
        .status(403)
        .json({ result: false, error: "Archived clips cannot be deleted" });
    }

    // Autorisation : soit l'auteur, soit un expert
    // Si l'utilisateur n'est pas l'auteur, isAuthorOr403 renverra 403 et on s'arrête.
    if (!isAuthorOr403(clip, req.user.twitch_id, res)) {
      // Pas auteur -> vérifier s'il est expert (isExpertOr403 renvoie 403 si non)
      if (!isExpertOr403(req.user, res)) {
        return; // isExpertOr403 a renvoyé 403
      }
      // Si on arrive ici : c'est un expert autorisé
    }

    await clip.destroy();

    res.status(200).json({
      result: true,
      message: "Clip successfully deleted",
      clipId,
    });
  } catch (err) {
    console.error("Error deleting clip:", err);
    res.status(500).json({ result: false, error: "Failed to delete clip" });
  }
}

module.exports = {
  getClipInfo,
  createClip,
  getAllClips,
  updateClip,
  clipPublished,
  addVoteToClip,
  archiveOldClips,
  getArchivedClips,
  getClipDownloadUrl,
  deleteClip,
};
