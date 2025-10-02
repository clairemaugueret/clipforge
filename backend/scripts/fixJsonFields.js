const Clip = require("../models/Clip");

async function fixJsonFields() {
  try {
    const clips = await Clip.findAll({ raw: true });

    let fixedCount = 0;

    for (const clip of clips) {
      const updates = {};

      if (!clip.tags || clip.tags === "" || clip.tags === null) {
        updates.tags = [];
      }
      if (!clip.comments || clip.comments === "" || clip.comments === null) {
        updates.comments = [];
      }
      if (!clip.votes || clip.votes === "" || clip.votes === null) {
        updates.votes = [];
      }

      if (Object.keys(updates).length > 0) {
        await Clip.update(updates, { where: { clip_id: clip.clip_id } });
        fixedCount++;
      }
    }

    console.log(`✅ ${fixedCount} clip(s) fixed!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing clips:", error);
    process.exit(1);
  }
}

fixJsonFields();
