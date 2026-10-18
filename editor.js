(() => {
  "use strict";

  const W = 600;
  const H = 420;

  const $ = id => document.getElementById(id);

  let canvas;
  let ctx;
  let items = [];
  let selectedId = null;
  let currentTint = "#ffffff";
  let onChange = () => {};
  let pointerMode = null;
  let lastPointer = null;
  let dropBound = false;

  function fitCanvas(c) {
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();

    c.width = W * ratio;
    c.height = H * ratio;

    const context = c.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    return context;
  }

  function setupCanvas(c) {
    canvas = c;
    ctx = fitCanvas(canvas);

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);

    window.addEventListener("resize", () => {
      if (canvas) draw();
    });

    draw();
  }

  function normalizedPoint(event) {
    const r = canvas.getBoundingClientRect();

    return {
      x: (event.clientX - r.left) / r.width * W,
      y: (event.clientY - r.top) / r.height * H
    };
  }

  function emojiSize(item) {
    return 58 * (item.size || 1);
  }

  function hitTest(point) {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const radius = emojiSize(item) * 0.72;

      const x = item.x / 100 * W;
      const y = item.y / 100 * H;

      if (Math.hypot(point.x - x, point.y - y) < radius) {
        return item;
      }
    }

    return null;
  }

  function handlePointerDown(event) {
    if (!canvas) return;

    const p = normalizedPoint(event);
    const found = hitTest(p);

    canvas.setPointerCapture?.(event.pointerId);

    if (found) {
      selectedId = found.id;
      pointerMode = "move";
      lastPointer = p;

      syncControls();
      draw();
    } else {
      selectedId = null;
      pointerMode = null;

      syncControls();
      draw();
    }
  }

  function handlePointerMove(event) {
    if (
      pointerMode !== "move" ||
      !lastPointer ||
      !selectedId
    ) {
      return;
    }

    const p = normalizedPoint(event);
    const item = items.find(x => x.id === selectedId);

    if (!item) return;

    item.x = Math.max(
      5,
      Math.min(95, item.x + (p.x - lastPointer.x) / W * 100)
    );

    item.y = Math.max(
      7,
      Math.min(93, item.y + (p.y - lastPointer.y) / H * 100)
    );

    lastPointer = p;

    draw();
    onChange(items);
  }

  function handlePointerUp() {
    pointerMode = null;
    lastPointer = null;
  }

  function drawItems(targetCtx, drawItemsList, selection = null) {
    targetCtx.clearRect(0, 0, W, H);

    drawItemsList.forEach(item => {
      const x = item.x / 100 * W;
      const y = item.y / 100 * H;
      const size = emojiSize(item);

      targetCtx.save();

      targetCtx.translate(x, y);
      targetCtx.rotate((item.rotation || 0) * Math.PI / 180);

      targetCtx.font =
        `${size}px "Apple Color Emoji", "Noto Color Emoji", "Segoe UI Emoji", sans-serif`;

      targetCtx.textAlign = "center";
      targetCtx.textBaseline = "middle";

      // Tint overlay behind the emoji.
      if (item.tint && item.tint !== "#ffffff") {
        targetCtx.globalAlpha = 0.18;
        targetCtx.fillStyle = item.tint;

        targetCtx.beginPath();
        targetCtx.arc(0, 0, size * 0.49, 0, Math.PI * 2);
        targetCtx.fill();

        targetCtx.globalAlpha = 1;
      }

      targetCtx.fillText(item.emoji, 0, 0);
      targetCtx.restore();

      // Selection indicator.
      if (selection === item.id) {
        targetCtx.save();

        targetCtx.strokeStyle = "#b4a0ff";
        targetCtx.lineWidth = 2;
        targetCtx.setLineDash([5, 4]);

        targetCtx.beginPath();
        targetCtx.arc(x, y, size * 0.68, 0, Math.PI * 2);
        targetCtx.stroke();

        targetCtx.restore();
      }
    });
  }

  function draw() {
    if (!canvas) return;

    ctx = fitCanvas(canvas);
    drawItems(ctx, items, selectedId);
  }

  function addItem(emoji, isDecoy = false) {
    const item = {
      id: `piece-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      emoji,
      x: 45 + Math.random() * 10,
      y: 43 + Math.random() * 12,
      size: 1,
      rotation: 0,
      tint: currentTint,
      isDecoy
    };

    items.push(item);
    selectedId = item.id;

    syncControls();
    draw();
    onChange(items);
  }

  function syncControls() {
    const item = items.find(x => x.id === selectedId);

    $("size-control").disabled = !item;
    $("rotate-button").disabled = !item;
    $("duplicate-button").disabled = !item;
    $("delete-button").disabled = !item;

    $("selection-hint").textContent = item
      ? `Selected: ${item.emoji}`
      : "Select a piece on the canvas to edit it.";

    $("size-control").value = item ? item.size : 1;

    $("size-value").textContent =
      `${Number(item?.size || 1).toFixed(1)}×`;

    document.querySelectorAll(".swatch").forEach(button => {
      button.classList.toggle(
        "selected",
        button.dataset.tint === (item?.tint || currentTint)
      );
    });
  }

  function setItems(newItems) {
    items = (newItems || []).map((item, i) => ({
      ...item,
      id: item.id || `piece-${i}`,
      x: Number(item.x) || 50,
      y: Number(item.y) || 50,
      size: Number(item.size) || 1,
      rotation: Number(item.rotation) || 0,
      tint: item.tint || "#ffffff"
    }));

    selectedId = null;

    syncControls();
    draw();
    onChange(items);
  }

  function getItems() {
    return items.map(item => ({ ...item }));
  }

  function renderStatic(targetCanvas, list) {
    const targetContext = fitCanvas(targetCanvas);
    drawItems(targetContext, list || []);
  }

  function init(options) {
    onChange = options.onChange || (() => {});

    setupCanvas($("editor-canvas"));

    // Resize selected piece.
    $("size-control").addEventListener("input", event => {
      const item = items.find(x => x.id === selectedId);
      if (!item) return;

      item.size = Number(event.target.value);

      $("size-value").textContent = `${item.size.toFixed(1)}×`;

      draw();
      onChange(items);
    });

    // Rotate selected piece by 45 degrees.
    $("rotate-button").addEventListener("click", () => {
      const item = items.find(x => x.id === selectedId);
      if (!item) return;

      item.rotation = ((item.rotation || 0) + 45) % 360;

      draw();
      onChange(items);
    });

    // Duplicate selected piece.
    $("duplicate-button").addEventListener("click", () => {
      const item = items.find(x => x.id === selectedId);
      if (!item) return;

      const copy = {
        ...item,
        id: `piece-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        x: Math.min(92, item.x + 7),
        y: Math.min(90, item.y + 7)
      };

      items.push(copy);
      selectedId = copy.id;

      syncControls();
      draw();
      onChange(items);
    });

    // Remove selected piece.
    $("delete-button").addEventListener("click", () => {
      items = items.filter(x => x.id !== selectedId);
      selectedId = null;

      syncControls();
      draw();
      onChange(items);
    });

    // Change selected piece tint.
    $("color-palette").addEventListener("click", event => {
      const button = event.target.closest(".swatch");
      if (!button) return;

      currentTint = button.dataset.tint;

      const item = items.find(x => x.id === selectedId);

      if (item) {
        item.tint = currentTint;
      }

      syncControls();
      draw();
      onChange(items);
    });
  }

  function renderTray(tray) {
    const el = $("emoji-tray");
    el.innerHTML = "";

    tray.forEach(entry => {
      const button = document.createElement("button");

      button.className = "tray-item";
      button.type = "button";
      button.draggable = true;
      button.textContent = entry.emoji;

      button.title = entry.isDecoy
        ? "Decoy piece"
        : "Add " + entry.emoji;

      // Tapping an emoji adds it.
      button.addEventListener("click", () => {
        addItem(entry.emoji, entry.isDecoy);
      });

      // Dragging an emoji from the tray.
      button.addEventListener("dragstart", event => {
        event.dataTransfer.setData(
          "text/plain",
          JSON.stringify(entry)
        );

        event.dataTransfer.effectAllowed = "copy";
      });

      const small = document.createElement("small");
      small.textContent = entry.isDecoy ? "?" : "+";

      button.appendChild(small);
      el.appendChild(button);
    });

    // Set up drag-and-drop only once.
    if (!dropBound) {
      canvas.addEventListener("dragover", event => {
        event.preventDefault();
      });

      canvas.addEventListener("drop", event => {
        event.preventDefault();

        try {
          const entry = JSON.parse(
            event.dataTransfer.getData("text/plain")
          );

          if (entry?.emoji) {
            addItem(entry.emoji, entry.isDecoy);
          }
        } catch (_) {
          // Ignore invalid drag data.
        }
      });

      dropBound = true;
    }
  }

  function setMessage(message) {
    $("editor-message").textContent = message || "";
  }

  window.EmojiEditor = {
    init,
    renderTray,
    setItems,
    getItems,
    renderStatic,
    setMessage
  };
})();
