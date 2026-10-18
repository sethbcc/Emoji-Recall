/* ==========================================================================
   EMOJI GENERATOR (generator.js)
   Handles creating random multi-layered target emojis, defining part catalogs,
   assigning random transformations, and rendering them onto canvases.
   ========================================================================== */

// 1. Preset Color Palette (5-6 colors as requested)
const COLOR_PALETTE = [
    "#ffcc00", // Bright Yellow
    "#ff4757", // Coral Red
    "#3b82f6", // Electric Blue
    "#10b981", // Emerald Green
    "#a855f7", // Purple
    "#f97316"  // Orange
];

// 2. Master Part Catalog (Contains both "Real" target parts and "Decoys")
const PART_CATALOG = [
    // --- BASES (Head shapes) ---
    { id: "base_circle", type: "base", name: "Circle Base", isDecoy: false },
    { id: "base_square", type: "base", name: "Square Base", isDecoy: false },
    { id: "base_pill", type: "base", name: "Pill Base", isDecoy: true },

    // --- EYES ---
    { id: "eyes_dots", type: "eyes", name: "Dot Eyes", isDecoy: false },
    { id: "eyes_stars", type: "eyes", name: "Star Eyes", isDecoy: false },
    { id: "eyes_hearts", type: "eyes", name: "Heart Eyes", isDecoy: true },
    { id: "eyes_lines", type: "eyes", name: "Sleepy Eyes", isDecoy: true },

    // --- MOUTHS ---
    { id: "mouth_smile", type: "mouth", name: "Big Smile", isDecoy: false },
    { id: "mouth_open", type: "mouth", name: "Open O", isDecoy: false },
    { id: "mouth_flat", type: "mouth", name: "Flat Line", isDecoy: true },
    { id: "mouth_cat", type: "mouth", name: "Cat Mouth", isDecoy: true },

    // --- ACCESSORIES ---
    { id: "acc_horns", type: "accessory", name: "Little Horns", isDecoy: false },
    { id: "acc_antenna", type: "accessory", name: "Robot Antenna", isDecoy: false },
    { id: "acc_halo", type: "accessory", name: "Angel Halo", isDecoy: true },
    { id: "acc_ears", type: "accessory", name: "Cat Ears", isDecoy: true }
];

/**
 * Generates a random target emoji configuration.
 * Selects a base, eyes, mouth, and accessory, assigns random colors, 
 * positions, scale, and 45-degree snap rotations.
 */
function generateTargetEmoji() {
    // Filter out real parts vs decoys
    const realParts = PART_CATALOG.filter(part => !part.isDecoy);
    
    // Group real parts by type
    const bases = realParts.filter(p => p.type === 'base');
    const eyes = realParts.filter(p => p.type === 'eyes');
    const mouths = realParts.filter(p => p.type === 'mouth');
    const accessories = realParts.filter(p => p.type === 'accessory');

    // Pick one random item from each category for the target
    const chosenBase = getRandomItem(bases);
    const chosenEyes = getRandomItem(eyes);
    const chosenMouth = getRandomItem(mouths);
    const chosenAcc = getRandomItem(accessories);

    const targetLayers = [
        createLayerConfig(chosenBase, 150, 150, 1.0, 0),
        createLayerConfig(chosenEyes, 150, 130, 0.9, 0),
        createLayerConfig(chosenMouth, 150, 190, 0.8, 0),
        createLayerConfig(chosenAcc, 150, 70, 1.0, getRandomRotation())
    ];

    return {
        layers: targetLayers,
        // Send ALL catalog parts (real + decoys) to populate the Tray
        availableTrayParts: PART_CATALOG,
        palette: COLOR_PALETTE
    };
}

/**
 * Helper to create a randomized property object for a layer
 */
function createLayerConfig(part, x, y, scale, rotation) {
    return {
        id: part.id,
        type: part.type,
        name: part.name,
        color: getRandomItem(COLOR_PALETTE),
        x: x,
        y: y,
        scale: scale,
        rotation: rotation // in degrees (0, 45, 90, 135, etc.)
    };
}

/**
 * Returns a random rotation snapped to 45-degree increments (0 to 315)
 */
function getRandomRotation() {
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    return getRandomItem(angles);
}

/**
 * Utility helper to pick a random item from an array
 */
function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Renders a set of emoji layers onto any specified HTML5 Canvas
 */
function renderEmojiToCanvas(canvasId, layers) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each layer according to its metadata
    layers.forEach(layer => {
        ctx.save();
        
        // Move to layer position, apply scaling and rotation
        ctx.translate(layer.x, layer.y);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.scale(layer.scale, layer.scale);

        // Set color tint
        ctx.fillStyle = layer.color;
        ctx.strokeStyle = "#121214";
        ctx.lineWidth = 4;

        // Draw shape based on part ID
        drawPartPath(ctx, layer.id);

        ctx.restore();
    });
}

/**
 * Vector drawing instructions for each part type
 */
function drawPartPath(ctx, partId) {
    ctx.beginPath();

    switch (partId) {
        // Bases
        case 'base_circle':
            ctx.arc(0, 0, 80, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'base_square':
            ctx.roundRect(-70, -70, 140, 140, 25);
            ctx.fill();
            ctx.stroke();
            break;
        case 'base_pill':
            ctx.roundRect(-60, -80, 120, 160, 50);
            ctx.fill();
            ctx.stroke();
            break;

        // Eyes
        case 'eyes_dots':
            ctx.arc(-30, -15, 12, 0, Math.PI * 2);
            ctx.arc(30, -15, 12,
      
