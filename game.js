/* ==========================================================================
   GAME CONTROLLER (game.js)
   Controls game states, the 10-second preview timer, screen transitions,
   and final score calculation & sharing.
   ========================================================================== */

// Global game state variables
let currentRoundData = null;
let timerInterval = null;
let timeLeft = 10;

// Run game initialization when the window loads
window.addEventListener('DOMContentLoaded', () => {
    initGame();
});

/**
 * Initializes or restarts a new round of Emoji Recall
 */
function initGame() {
    // Reset timer & UI state
    timeLeft = 10;
    document.getElementById('time-left').innerText = timeLeft;

    // Show preview screen, hide others
    document.getElementById('preview-screen').classList.remove('hidden');
    document.getElementById('workspace-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');

    // 1. Generate a random target emoji layout
    currentRoundData = generateTargetEmoji();

    // 2. Render target emoji onto the preview canvas
    renderEmojiToCanvas('target-canvas', currentRoundData.layers);

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
    // Hide preview, show workspace
    document.getElementById('preview-screen').classList.add('hidden');
    document.getElementById('workspace-screen').classList.remove('hidden');

    // Clear any previous user work from past rounds
    if (typeof resetEditorWorkspace === 'function') {
        resetEditorWorkspace();
    }

    // Initialize the interactive editor with the round's color palette
    initEditor(currentRoundData.palette);

    // Hook up the submit button listener
    const submitBtn = document.getElementById('btn-submit');
    if (submitBtn) {
        // Remove old listeners to avoid stacking duplicates
        submitBtn.replaceWith(submitBtn.cloneNode(true));
        document.getElementById('btn-submit').addEventListener('click', handleSubmission);
    }
}

/**
 * Handles when the player clicks "Submit Reconstruction"
 */
function handleSubmission() {
    // Hide workspace, show results screen
    document.getElementById('workspace-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');

    // 1. Calculate accuracy score using scorer.js
    const score = calculateAccuracyScore(currentRoundData.layers, userLayers);
    
    // Display score percentage
    const scoreSpan = document.getElementById('accuracy-score');
    if (scoreSpan) scoreSpan.innerText = score;

    // 2. Render side-by-side comparison (Expectation vs. Reality)
    renderEmojiToCanvas('final-target', currentRoundData.layers);
    renderEmojiToCanvas('final-creation', userLayers);

    // 3. Setup post-game buttons
    setupResultsButtons();
}

/**
 * Hooks up buttons on the results screen
 */
function setupResultsButtons() {
    // Play Again button
    const playAgainBtn = document.getElementById('btn-play-again');
    if (playAgainBtn) {
        playAgainBtn.replaceWith(playAgainBtn.cloneNode(true));
        document.getElementById('btn-play-again').addEventListener('click', initGame);
    }

    // Social Share button
    const shareBtn = document.getElementById('btn-share');
    if (shareBtn) {
        shareBtn.replaceWith(shareBtn.cloneNode(true));
        document.getElementById('btn-share').addEventListener('click', () => {
            const scoreText = document.getElementById('accuracy-score')?.innerText || '0';
            const shareText = `I scored ${scoreText}% accuracy on Emoji Recall! Can you beat my memory?`;
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareText).then(() => {
                    alert('Score copied to clipboard! Ready to share.');
                });
            } else {
                alert(shareText);
            }
        });
    }
}

