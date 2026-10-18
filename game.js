/* ==========================================================================
   GAME CONTROLLER (game.js)
   Controls game states, the 10-second preview timer, screen transitions,
   and final score calculation & sharing.
   ========================================================================== */

let currentRoundData = null;
let timerInterval = null;
let timeLeft = 10;

// Ensure script runs safely after DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

/**
 * Initializes or restarts a new round of Emoji Recall
 */
function initGame() {
    timeLeft = 10;
    const timerDisplay = document.getElementById('time-left');
    if (timerDisplay) timerDisplay.innerText = timeLeft;

    // Show preview screen, hide others
    document.getElementById('preview-screen')?.classList.remove('hidden');
    document.getElementById('workspace-screen')?.classList.add('hidden');
    document.getElementById('results-screen')?.classList.add('hidden');

    // 1. Generate a random target emoji layout
    if (typeof generateTargetEmoji === 'function') {
        currentRoundData = generateTargetEmoji();
        // 2. Render target emoji onto the preview canvas
        renderEmojiToCanvas('target-canvas', currentRoundData.layers);
    } else {
        console.error("generator.js functions not loaded yet!");
    }

    // 3. Start the 10-second memorization countdown
    startPreviewTimer();
}

/**
 * Manages the 10-second countdown timer on the preview screen
 */
function startPreviewTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        const timerDisplay = document.getElementById('time-left');
        if (timerDisplay) timerDisplay.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            transitionToWorkspace();
        }
    }, 1000);
}

/**
 * Switches from the preview screen to the assembly workspace
 */
function transitionToWorkspace() {
    document.getElementById('preview-screen')?.classList.add('hidden');
    document.getElementById('workspace-screen')?.classList.remove('hidden');

    if (typeof resetEditorWorkspace === 'function') {
        resetEditorWorkspace();
    }

    if (currentRoundData && typeof initEditor === 'function') {
        initEditor(currentRoundData.palette);
    }

    const submitBtn = document.getElementById('btn-submit');
    if (submitBtn) {
        const newBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newBtn, submitBtn);
        newBtn.addEventListener('click', handleSubmission);
    }
}

/**
 * Handles when the player clicks "Submit Reconstruction"
 */
function handleSubmission() {
    document.getElementById('workspace-screen')?.classList.add('hidden');
    document.getElementById('results-screen')?.classList.remove('hidden');

    let score = 0;
    if (currentRoundData && typeof calculateAccuracyScore === 'function' && typeof userLayers !== 'undefined') {
        score = calculateAccuracyScore(currentRoundData.layers, userLayers);
    }
    
    const scoreSpan = document.getElementById('accuracy-score');
    if (scoreSpan) scoreSpan.innerText = score;

    if (currentRoundData && typeof renderEmojiToCanvas === 'function') {
        renderEmojiToCanvas('final-target', currentRoundData.layers);
        renderEmojiToCanvas('final-creation', userLayers);
    }

    setupResultsButtons();
}

/**
 * Hooks up buttons on the results screen
 */
function setupResultsButtons() {
    const playAgainBtn = document.getElementById('btn-play-again');
    if (playAgainBtn) {
        const newBtn = playAgainBtn.cloneNode(true);
        playAgainBtn.parentNode.replaceChild(newBtn, playAgainBtn);
        newBtn.addEventListener('click', initGame);
    }

    const shareBtn = document.getElementById('btn-share');
    if (shareBtn) {
        const newBtn = shareBtn.cloneNode(true);
        shareBtn.parentNode.replaceChild(newBtn, shareBtn);
        newBtn.addEventListener('click', () => {
            const scoreText = document.getElementById('accuracy-score')?.innerText || '0';
            const shareText = `I scored ${scoreText}% accuracy on Emoji Recall! Can you beat my memory?`;
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareText).then(() => {
                    alert('Score copied to clipboard!');
                });
            } else {
                alert(shareText);
            }
        });
    }
}
