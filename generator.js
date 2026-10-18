(() => {
  "use strict";

  const EMOJI_POOL = [
    "😀", "😎", "🥹", "🤖", "🐱", "🐸",
    "🦊", "🐼", "🐵", "🐻", "🐰", "🐯",
    "👑", "🎩", "🎀", "🕶️", "⭐", "🌟",
    "💎", "🔥", "🌈", "⚡", "🍀", "🌸",
    "🦋", "🎈", "🍓", "🍉", "🍄", "🪐",
    "🌙", "☀️", "💫", "🎧", "🪽", "🧢",
    "🧁", "🍭", "🛸", "👻", "🎃", "💖",
    "🧿", "🪄", "🥝", "🐝"
  ];

  const TINTS = [
    "#ffffff",
    "#ff718b",
    "#ffc857",
    "#72e6bd",
    "#75a7ff",
    "#c69bff"
  ];

  const rand = max => Math.floor(Math.random() * max);

  const pick = list => list[rand(list.length)];

  const clamp = (n, min, max) =>
    Math.max(min, Math.min(max, n));

  // Creates a random character without using an API.
  function makeDemoDesign() {
    const face = pick([
      "😎", "😀", "🥹", "🤖", "🐱", "🐸",
      "🦊", "🐼", "🐵", "🐻", "🐰", "🐯"
    ]);

    const count = 4 + rand(3);
    const chosen = [face];

    while (chosen.length < count) {
      const next = pick(EMOJI_POOL);

      if (!chosen.includes(next)) {
        chosen.push(next);
      }
    }

    // Percentage-based positions on the canvas.
    const spots = [
      { x: 50, y: 50, size: 1.45 },
      { x: 50, y: 20, size: 0.82 },
      { x: 24, y: 43, size: 0.76 },
      { x: 76, y: 43, size: 0.76 },
      { x: 31, y: 75, size: 0.72 },
      { x: 69, y: 75, size: 0.72 }
    ];

    const items = chosen.map((emoji, i) => ({
      id: `target-${i}`,
      emoji,

      x: spots[i].x + (
        i === 0 ? 0 : rand(13) - 6
      ),

      y: spots[i].y + (
        i === 0 ? 0 : rand(13) - 6
      ),

      size: spots[i].size * (
        i === 0 ? 1 : 0.8 + Math.random() * 0.4
      ),

      rotation: pick([0, 0, 45, 315, 90, 270]),

      tint: pick(TINTS),

      isDecoy: false
    }));

    // Keep the main face in its original color.
    items[0].tint = "#ffffff";

    return {
      items,
      source: "demo"
    };
  }

  // Requests a design from your own backend, if configured.
  async function generateDesign() {
    const endpoint = (
      window.EMOJI_RECALL_AI_ENDPOINT || ""
    ).trim();

    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            task: "Create a fun, balanced emoji collage for a memory puzzle.",

            allowedEmojis: EMOJI_POOL,

            allowedTints: TINTS,

            itemCount: 5 + rand(2)
          })
        });

        if (!response.ok) {
          throw new Error(
            `AI server responded ${response.status}`
          );
        }

        const raw = await response.json();

        const sourceItems = Array.isArray(raw)
          ? raw
          : raw.items;

        if (
          !Array.isArray(sourceItems) ||
          sourceItems.length < 3
        ) {
          throw new Error(
            "AI response did not contain enough items"
          );
        }

        const items = sourceItems.slice(0, 7).map(
          (item, i) => ({
            id: `target-${i}`,

            // Reject emoji outside the approved pool.
            emoji: EMOJI_POOL.includes(item.emoji)
              ? item.emoji
              : pick(EMOJI_POOL),

            x: clamp(Number(item.x) || 50, 8, 92),

            y: clamp(Number(item.y) || 50, 10, 90),

            size: clamp(
              Number(item.size) || 1,
              0.5,
              1.7
            ),

            rotation:
              Math.round(
                (Number(item.rotation) || 0) / 45
              ) * 45,

            tint: TINTS.includes(item.tint)
              ? item.tint
              : "#ffffff",

            isDecoy: false
          })
        );

        return {
          items,
          source: "ai"
        };

      } catch (error) {
        console.warn(
          "AI generation failed; using a local design instead.",
          error
        );

        return {
          ...makeDemoDesign(),
          source: "demo-fallback"
        };
      }
    }

    // No backend configured: use the local generator.
    return makeDemoDesign();
  }

  // Adds fake emoji to the player's tray.
  function makeTray(targetItems) {
    const decoys = [];

    const used = new Set(
      targetItems.map(item => item.emoji)
    );

    while (decoys.length < 7) {
      const emoji = pick(EMOJI_POOL);

      if (!used.has(emoji)) {
        used.add(emoji);

        decoys.push({
          id: `decoy-${decoys.length}`,
          emoji,
          isDecoy: true
        });
      }
    }

    const realPieces = targetItems.map((item, i) => ({
      id: `tray-${i}`,
      emoji: item.emoji,
      isDecoy: false
    }));

    // Mix real pieces and decoys.
    return [
      ...realPieces,
      ...decoys
    ].sort(() => Math.random() - 0.5);
  }

  window.EmojiGenerator = {
    generateDesign,
    makeTray,
    makeDemoDesign,
    EMOJI_POOL,
    TINTS
  };
})();
