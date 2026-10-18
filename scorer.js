(() => {
  "use strict";

  function distance(a, b) {
    return Math.hypot(
      (a.x || 0) - (b.x || 0),
      (a.y || 0) - (b.y || 0)
    );
  }

  function angleDiff(a, b) {
    let d = Math.abs(((a || 0) - (b || 0)) % 360);
    return Math.min(d, 360 - d);
  }

  function tintDiff(a, b) {
    return a === b ? 1 : 0.25;
  }

  function score(targetItems, playerItems) {
    if (!targetItems?.length) {
      return {
        accuracy: 0,
        matched: 0,
        total: 0,
        details: "No target was generated."
      };
    }

    // Each player piece can match only one target piece.
    const unused = new Set(playerItems.map((_, i) => i));

    let total = 0;
    let matched = 0;
    let positionSum = 0;
    let sizeSum = 0;
    let rotationSum = 0;
    let tintSum = 0;

    targetItems.forEach(target => {
      total++;

      let bestIndex = -1;
      let bestScore = -1;

      // Find the closest matching emoji.
      for (const i of unused) {
        const candidate = playerItems[i];

        if (candidate.emoji !== target.emoji) {
          continue;
        }

        const pos = Math.max(
          0,
          1 - distance(target, candidate) / 65
        );

        const size = Math.max(
          0,
          1 - Math.abs(
            (target.size || 1) - (candidate.size || 1)
          ) / 1.5
        );

        const rotation = Math.max(
          0,
          1 - angleDiff(
            target.rotation,
            candidate.rotation
          ) / 180
        );

        const tint = tintDiff(
          target.tint || "#ffffff",
          candidate.tint || "#ffffff"
        );

        const value =
          pos * 0.5 +
          size * 0.2 +
          rotation * 0.15 +
          tint * 0.15;

        if (value > bestScore) {
          bestScore = value;
          bestIndex = i;
        }
      }

      if (bestIndex >= 0) {
        unused.delete(bestIndex);
        matched++;

        const candidate = playerItems[bestIndex];

        positionSum += Math.max(
          0,
          1 - distance(target, candidate) / 65
        );

        sizeSum += Math.max(
          0,
          1 - Math.abs(
            (target.size || 1) - (candidate.size || 1)
          ) / 1.5
        );

        rotationSum += Math.max(
          0,
          1 - angleDiff(
            target.rotation,
            candidate.rotation
          ) / 180
        );

        tintSum += tintDiff(
          target.tint || "#ffffff",
          candidate.tint || "#ffffff"
        );
      }
    });

    const matchRate = matched / total;
    const position = matched ? positionSum / matched : 0;
    const size = matched ? sizeSum / matched : 0;
    const rotation = matched ? rotationSum / matched : 0;
    const tint = matched ? tintSum / matched : 0;

    // Extra pieces reduce accuracy.
    const extraPenalty = Math.max(
      0,
      playerItems.length - targetItems.length
    ) * 0.025;

    const accuracy = Math.round(
      Math.max(
        0,
        Math.min(
          100,
          100 * (
            matchRate * (
              0.48 +
              0.24 * position +
              0.12 * size +
              0.08 * rotation +
              0.08 * tint
            ) - extraPenalty
          )
        )
      )
    );

    return {
      accuracy,
      matched,
      total,
      position: Math.round(position * 100),
      size: Math.round(size * 100),
      rotation: Math.round(rotation * 100),
      tint: Math.round(tint * 100),

      details:
        `${matched} of ${total} target emoji matched · ` +
        `Position ${Math.round(position * 100)}% · ` +
        `Size ${Math.round(size * 100)}% · ` +
        `Rotation ${Math.round(rotation * 100)}% · ` +
        `Tint ${Math.round(tint * 100)}%`
    };
  }

  window.EmojiScorer = { score };
})();
