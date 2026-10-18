/* ==========================================================================
   SCORING ENGINE (scorer.js)
   Compares target emoji layers against user-created layers to calculate 
   an accuracy match percentage score.
   ========================================================================== */

/**
 * Calculates the accuracy match score (%) by comparing target vs user layers.
 * @param {Array} targetLayers - The original generated target parts and metadata.
 * @param {Array} userLayers - The parts the player placed on the canvas.
 * @returns {number} Final calculated accuracy score between 0 and 100.
 */
function calculateAccuracyScore(targetLayers, userLayers) {
    if (!targetLayers || targetLayers.length === 0) return 0;
    if (!userLayers || userLayers.length === 0) return 0;

    let totalPoints = 0;
    let earnedPoints = 0;

    // 1. Part Type Matching (Base, Eyes, Mouth, Accessory)
    // Each category is worth 25 points max (Total 100 points baseline)
    targetLayers.forEach(targetLayer => {
        totalPoints += 25;

        // Find if user placed a matching part ID in roughly the same area
        const matchingUserPart = userLayers.find(userLayer => userLayer.id === targetLayer.id);

        if (matchingUserPart) {
            let categoryScore = 15; // Base points for getting the correct part item

            // Check Color Match (+5 points)
            if (matchingUserPart.color.toLowerCase() === targetLayer.color.toLowerCase()) {
                categoryScore += 5;
            }

            // Check Position & Proximity Match (+5 points if close enough)
            const distance = Math.hypot(matchingUserPart.x - targetLayer.x, matchingUserPart.y - targetLayer.y);
            if (distance < 40) { // Within 40 pixels of target position
                categoryScore += 5;
            }

            earnedPoints += categoryScore;
        }
    });

    // 2. Decoy Penalty Check
    // If the player picked decoy parts (items marked isDecoy in catalog), deduct points
    userLayers.forEach(userLayer => {
        const catalogItem = PART_CATALOG.find(p => p.id === userLayer.id);
        if (catalogItem && catalogItem.isDecoy) {
            earnedPoints -= 10; // Deduct 10 points per decoy trap chosen
        }
    });

    // Ensure final score stays strictly between 0% and 100%
    let finalScore = Math.round((earnedPoints / totalPoints) * 100);
    return Math.max(0, Math.min(100, finalScore));
}

