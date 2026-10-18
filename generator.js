
(function () {
  const EMOJI_POOL = [
    "🐼", "🐱", "🐶", "🐸", "🐻", "🐰",
    "🦊", "🐵", "🐯", "🐨", "🐷", "🤖",
    "🕶️", "👑", "🎩", "🎀", "🌸", "🌼",
    "⭐", "✨", "❤️", "💎", "🔥", "⚡",
    "🍓", "🍀", "🌙", "☀️", "🎧", "👓",
    "🦋", "🌈", "🎈", "🍄", "🧢", "🥽"
  ];

  const TINTS = [
    "#ffffff",
    "#ff6b6b",
    "#ffd166",
    "#06d6a0",
    "#4cc9f0",
    "#c77dff"
  ];

  function makeDemoDesign() {
    const designs = [
      [
        { emoji: "🐼", x: 300, y: 210, size: 150, rotation: 0, tint: "#ffffff" },
        { emoji: "🕶️", x: 300, y: 195, size: 65, rotation: 0, tint: "#ffffff" },
        { emoji: "✨", x: 220, y: 150, size: 38, rotation: 0, tint: "#ffd166" },
        { emoji: "✨", x: 380, y: 150, size: 38, rotation: 45, tint: "#ffd166" }
      ],
      [
        { emoji: "🐱", x: 300, y: 225, size: 145, rotation: 0, tint: "#ffffff" },
        { emoji: "👑", x: 300, y: 140, size: 65, rotation: 0, tint: "#ffd166" },
        { emoji: "✨", x: 220, y: 160, size: 35, rotation: 0, tint: "#ffd166" },
        { emoji: "✨", x: 380, y: 160, size: 35, rotation: 0, tint: "#ffd166" }
      ],
      [
        { emoji: "🐸", x: 300, y: 220, size: 145, rotation: 0, tint: "#ffffff" },
        { emoji: "🌸", x: 360, y: 155, size: 55, rotation: 0, tint: "#ffffff" },
        { emoji: "✨", x: 220, y: 155, size: 35, rotation: 0, tint: "#ffd166" },
        { emoji: "✨", x: 385, y: 230, size: 35, rotation: 0, tint: "#ffd166" }
      ],
      [
        { emoji: "🐻", x: 300, y: 215, size: 150, rotation: 0, tint: "#ffffff" },
        { emoji: "🎩", x: 300, y: 145, size: 65, rotation: 0, tint: "#ffffff" },
        { emoji: "🎀", x: 350, y: 235, size: 42, rotation: 0, tint: "#ff6b6b" },
        { emoji: "⭐", x: 220, y: 160, size: 38, rotation: 0, tint: "#ffd166" }
      ]
    ];

    const chosen = designs[
      Math.floor(Math.random() * designs.length)
    ];

    return {
      items: chosen.map(item => ({ ...item }))
    };
  }

  async function generateDesign() {
    const endpoint = window.EMOJI_RECALL_AI_ENDPOINT;

    if (!endpoint) {
      return makeDemoDesign();
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          task: "Create one coherent custom emoji character",
          allowedEmojis: EMOJI_POOL,
          allowedTints: TINTS,
          itemCount: 4
        })
      });

      if (!response.ok) {
        throw new Error("AI request failed: " + response.status);
      }

      const data = await response.json();

      if (!Array.isArray(data.items) || data.items.length === 0) {
        throw new Error("AI returned an invalid design");
      }

      const items = data.items
        .slice(0, 6)
        .filter(item =>
          item &&
          EMOJI_POOL.includes(item.emoji)
        )
        .map(item => ({
          emoji: item.emoji,
          x: Math.max(40, Math.min(560, Number(item.x) || 300)),
          y: Math.max(40, Math.min(380, Number(item.y) || 210)),
          size: Math.max(36, Math.min(160, Number(item.size) || 80)),
          rotation: Math.round((Number(item.rotation) || 0) / 45) * 45,
          tint: TINTS.includes(item.tint) ? item.tint : "#ffffff"
        }));

      if (items.length === 0) {
        throw new Error("AI returned no usable emoji parts");
      }

      return { items };

    } catch (error) {
      console.warn("AI generation failed; using a demo design.", error);
      return makeDemoDesign();
    }
  }

  function makeTray(targetItems) {
    const targetEmojis = targetItems.map(item => item.emoji);

    const decoys = EMOJI_POOL
      .filter(emoji => !targetEmojis.includes(emoji))
      .sort(() => Math.random() - 0.5)
      .slice(0, 7);

    return [...new Set([...targetEmojis, ...decoys])]
      .sort(() => Math.random() - 0.5);
  }

  window.EmojiGenerator = {
    generateDesign,
    makeDemoDesign,
    makeTray,
    EMOJI_POOL,
    TINTS
  };
})();
