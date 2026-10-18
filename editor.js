/* ==========================================================================
   EDITOR WORKSPACE (editor.js)
   Manages user interaction on the assembly canvas, tray items, selection state,
   and transformation tools (rotation, scaling, color tints, deletion).
   ========================================================================== */

// Workspace State
let userLayers = [];
let selectedLayerIndex = null;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

/**
 * Initializes the editor workspace, populating the tray and event listeners.
 */
function initEditor(palette) {
    setupPartTray();
    setupColorPalette(palette);
    setupCanvasListeners();
    setupToolButtons();
}

/**
 * Populates the Part Tray with items from PART_CATALOG (Real parts + Decoys)
 */
function setupPartTray() {
    const trayContainer = document.getElementById('part-tray');
    if (!trayContainer) return;

    // Clear existing contents except title
    trayContainer.innerHTML = '<h3>Parts Tray</h3>';

    const grid = document.createElement('div');
    grid.className = 'part-grid';

    PART_CATALOG.forEach(part => {
        const item = document.createElement('div');
        item.className = 'part-item';
        item.innerText = part.name;
        
        // Clicking a tray item adds it to the center of the workspace canvas
        item.addEventListener('click', () => {
            addPartToWorkspace(part);
        });

        grid.appendChild(item);
    });

    trayContainer.appendChild(grid);
}

/**
 * Adds a new part instance onto the workspace canvas
 */
function addPartToWorkspace(part) {
    const newLayer = {
        instanceId: Date.now() + Math.random(), // Unique identifier
        id: part.id,
        type: part.type,
        name: part.name,
        color: COLOR_PALETTE[0], // Default to first color
        x: 150, // Center of 300x300 canvas
        y: 150,
        scale: 1.0,
        rotation: 0
    };

    userLayers.push(newLayer);
    selectedLayerIndex = userLayers.length - 1; // Auto-select the newly added part
    redrawWorkspace();
}

/**
 * Populates the color palette selection swatches
 */
function setupColorPalette(palette) {
    const paletteContainer = document.getElementById('color-palette');
    if (!paletteContainer) return;

    paletteContainer.innerHTML = '';

    palette.forEach((hexColor, index) => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = hexColor;
        if (index === 0) swatch.classList.add('active');

        swatch.addEventListener('click', () => {
            // Update active visual state
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');

            // Apply color to selected layer if one is active
            if (selectedLayerIndex !== null && userLayers[selectedLayerIndex]) {
                userLayers[selectedLayerIndex].color = hexColor;
                redrawWorkspace();
            }
        });

        paletteContainer.appendChild(swatch);
    });
}

/**
 * Handles mouse events for selecting and dragging parts on the canvas
 */
function setupCanvasListeners() {
    const canvas = document.getElementById('editor-canvas');
    if (!canvas) return;

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check layers from top-to-bottom (end of array to start)
        selectedLayerIndex = null;
        for (let i = userLayers.length - 1; i >= 0; i--) {
            const layer = userLayers[i];
            // Simple distance check from click to layer center
            const distance = Math.hypot(mouseX - layer.x, mouseY - layer.y);
            if (distance < 50 * layer.scale) {
                selectedLayerIndex = i;
                isDragging = true;
                dragOffsetX = mouseX - layer.x;
                dragOffsetY = mouseY - layer.y;
                break;
            }
        }
        redrawWorkspace();
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging || selectedLayerIndex === null) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        userLayers[selectedLayerIndex].x = mouseX - dragOffsetX;
        userLayers[selectedLayerIndex].y = mouseY - dragOffsetY;
        redrawWorkspace();
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

/**
 * Hooks up transformation buttons (Rotate, Scale, Duplicate, Delete)
 */
function setupToolButtons() {
    // Rotate 45 degrees
    document.getElementById('btn-rotate')?.addEventListener('click', () => {
        if (selectedLayerIndex === null) return;
        let layer = userLayers[selectedLayerIndex];
        layer.rotation = (layer.rotation + 45) % 360;
        redrawWorkspace();
    });

    // Scale Up
    document.getElementById('btn-scale-up')?.addEventListener('click', () => {
        if (selectedLayerIndex === null) return;
        let layer = userLayers[selectedLayerIndex];
        if (layer.scale < 1.8) {
            layer.scale = parseFloat((layer.scale + 0.1).toFixed(1));
            redrawWorkspace();
        }
    });

    // Scale Down
    document.getElementById('btn-scale-down')?.addEventListener('click', () => {
        if (selectedLayerIndex === null) return;
        let layer = userLayers[selectedLayerIndex];
        if (layer.scale > 0.5) {
            layer.scale = parseFloat((layer.scale - 0.1).toFixed(1));
            redrawWorkspace();
        }
    });

    // Duplicate selected part
    document.getElementById('btn-duplicate')?.addEventListener('click', () => {
        if (selectedLayerIndex === null) return;
        const target = userLayers[selectedLayerIndex];
        const clone = {
            ...target,
            instanceId: Date.now() + Math.random(),
            x: target.x + 15,
            y: target.y + 15
        };
        userLayers.push(clone);
        selectedLayerIndex = userLayers.length - 1;
        redrawWorkspace();
    });

    // Delete selected part
    document.getElementById('btn-delete')?.addEventListener('click', () => {
        if (selectedLayerIndex === null) return;
        userLayers.splice(selectedLayerIndex, 1);
        selectedLayerIndex = null;
        redrawWorkspace();
    });
}

/**
 * Redraws the workspace canvas and highlights the currently selected layer
 */
function redrawWorkspace() {
    const canvas = document.getElementById('editor-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all user layers
    userLayers.forEach((layer, index) => {
        ctx.save();
        ctx.translate(layer.x, layer.y);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.scale(layer.scale, layer.scale);

        ctx.fillStyle = layer.color;
        ctx.strokeStyle = "#121214";
        ctx.lineWidth = 4;

        drawPartPath(ctx, layer.id);
        ctx.restore();

        // If this layer is selected, draw a selection bounding ring
        if (index === selectedLayerIndex) {
            ctx.save();
            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(layer.x, layer.y, 55 * layer.scale, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    });
}

/**
     * Clears the editor state (used when starting a new game round)
     */
function resetEditorWorkspace() {
    userLayers = [];
    selectedLayerIndex = null;
    redrawWorkspace();
}

