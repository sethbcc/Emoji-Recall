/**
 * Vector drawing instructions for each part type (Mobile-Safe Version)
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
            ctx.rect(-70, -70, 140, 140);
            ctx.fill();
            ctx.stroke();
            break;
        case 'base_pill':
            ctx.roundRect ? ctx.roundRect(-60, -80, 120, 160, 50) : ctx.rect(-60, -80, 120, 160);
            ctx.fill();
            ctx.stroke();
            break;

        // Eyes
        case 'eyes_dots':
            ctx.arc(-30, -15, 12, 0, Math.PI * 2);
            ctx.arc(30, -15, 12, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'eyes_stars':
            drawStar(ctx, -30, -15, 15);
            drawStar(ctx, 30, -15, 15);
            break;
        case 'eyes_hearts':
            drawHeart(ctx, -30, -15, 15);
            drawHeart(ctx, 30, -15, 15);
            break;
        case 'eyes_lines':
            ctx.rect(-45, -20, 30, 8);
            ctx.rect(15, -20, 30, 8);
            ctx.fill();
            break;

        // Mouths
        case 'mouth_smile':
            ctx.arc(0, 10, 35, 0, Math.PI, false);
            ctx.lineTo(-35, 10);
            ctx.fill();
            ctx.stroke();
            break;
        case 'mouth_open':
            ctx.arc(0, 15, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'mouth_flat':
            ctx.rect(-30, 15, 60, 10);
            ctx.fill();
            break;
        case 'mouth_cat':
            ctx.moveTo(-20, 15);
            ctx.quadraticCurveTo(-10, 30, 0, 15);
            ctx.quadraticCurveTo(10, 30, 20, 15);
            ctx.stroke();
            break;

        // Accessories
        case 'acc_horns':
            ctx.moveTo(-40, -60);
            ctx.lineTo(-60, -100);
            ctx.lineTo(-20, -75);
            ctx.closePath();
            ctx.moveTo(40, -60);
            ctx.lineTo(60, -100);
            ctx.lineTo(20, -75);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'acc_antenna':
            ctx.rect(-4, -110, 8, 40);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, -115, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'acc_halo':
            ctx.ellipse(0, -95, 40, 15, 0, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'acc_ears':
            ctx.moveTo(-50, -60);
            ctx.lineTo(-70, -110);
            ctx.lineTo(-20, -80);
            ctx.closePath();
            ctx.moveTo(50, -60);
            ctx.lineTo(70, -110);
            ctx.lineTo(20, -80);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
    }
}
