(() => {
  "use strict";

  const $ = id => document.getElementById(id);

  const screens = [
    "home-screen",
    "preview-screen",
    "editor-screen",
    "results-screen"
  ];

  let target = [];
  let tray = [];
  let timerId = null;
  let previewLeft = 10;
  let gameLeft = 60;
  let roundFinished = false;

  function showScreen(id) {
    screens.forEach(screen => {
      $(screen).classList.toggle("hidden", screen !== id);
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function stopTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function updateTimer() {
    $("game-timer").textContent = gameLeft;
  }

  // Ten-second memorization countdown.
  function startPreviewTimer() {
    previewLeft = 10;
    $("preview-timer").textContent = previewLeft;

    stopTimer();

    timerId = setInterval(() => {
      previewLeft--;
      $("preview-timer").textContent = previewLeft;

      if (previewLeft <= 0) {
        stopTimer();
        startEditor();
      }
    }, 1000);
  }

  // Sixty-second assembly countdown.
  function startGameTimer() {
    gameLeft = 60;
    roundFinished = false;

    updateTimer();
    stopTimer();

    timerId = setInterval(() => {
      gameLeft--;
      updateTimer();

      if (gameLeft <= 0) {
        stopTimer();
        finishRound("Time is up!");
      }
    }, 1000);
  }

  async function startRound() {
    stopTimer();
    roundFinished = false;

    $("play-button").disabled = true;
    $("play-button").textContent = "Creating character…";

    try {
      const design = await window.EmojiGenerator.generateDesign();

      target = design.items;
      tray = window.EmojiGenerator.makeTray(target);

      window.EmojiEditor.setItems([]);

      window.EmojiEditor.renderStatic(
        $("target-canvas"),
        target
      );

      window.EmojiEditor.renderTray(tray);

      $("play-button").textContent = "Play now →";
      $("play-button").disabled = false;

      showScreen("preview-screen");
      startPreviewTimer();

    } catch (error) {
      console.error(error);

      $("play-button").disabled = false;
      $("play-button").textContent = "Play now →";

      alert("Could not start the round. Please try again.");
    }
  }

  function startEditor() {
    showScreen("editor-screen");

    window.EmojiEditor.setItems([]);

    window.EmojiEditor.setMessage(
      "Select an emoji from the tray to begin."
    );

    startGameTimer();
  }

  function finishRound(reason) {
    // Prevent submitting twice or finishing twice.
    if (roundFinished) return;

    roundFinished = true;
    stopTimer();

    const player = window.EmojiEditor.getItems();

    const result = window.EmojiScorer.score(
      target,
      player
    );

    window.EmojiEditor.renderStatic(
      $("result-target-canvas"),
      target
    );

    window.EmojiEditor.renderStatic(
      $("result-player-canvas"),
      player
    );

    $("score-value").textContent = `${result.accuracy}%`;

    $("score-ring").style.setProperty(
      "--score",
      `${result.accuracy}%`
    );

    if (result.accuracy >= 85) {
      $("result-title").textContent = "Memory master!";
    } else if (result.accuracy >= 60) {
      $("result-title").textContent = "Nice reconstruction!";
    } else if (result.accuracy >= 35) {
      $("result-title").textContent = "Good effort!";
    } else {
      $("result-title").textContent = "Practice makes progress!";
    }

    $("result-subtitle").textContent = reason;
    $("score-breakdown").textContent = result.details;

    showScreen("results-screen");
  }

  function backToMenu() {
    stopTimer();
    showScreen("home-screen");
  }

  function init() {
    window.EmojiEditor.init({
      onChange: items => {
        $("piece-count").textContent =
          `${items.length} piece${items.length === 1 ? "" : "s"}`;
      }
    });

    $("play-button").addEventListener("click", startRound);

    $("submit-button").addEventListener("click", () => {
      finishRound("You submitted your build.");
    });

    $("again-button").addEventListener("click", startRound);

    $("menu-button").addEventListener("click", backToMenu);

    $("brand-home").addEventListener("click", event => {
      event.preventDefault();
      backToMenu();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
