// ========================================
// BIOHAZARD RENI - Stage Backgrounds (Canvas)
// ========================================
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';

// Base class
class StageBase {
  constructor() { this.time = 0; }
  update(dt) { this.time += dt; }
  render(ctx) {}
}

// ----------------------------------------
// 1. Mansion (洋館)
// ----------------------------------------
export class MansionBackground extends StageBase {
  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    const floorY = H * 0.5;

    // --- Wall ---
    const bg = ctx.createLinearGradient(0, 0, 0, floorY);
    bg.addColorStop(0, '#1a1010');
    bg.addColorStop(1, '#0d0808');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, floorY);

    // Wall panels / Columns
    ctx.strokeStyle = '#221515';
    ctx.lineWidth = 15;
    for (let x = 80; x < W; x += 300) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, floorY); ctx.stroke();
      // Base molding
      ctx.fillStyle = '#150d0d';
      ctx.fillRect(x - 20, floorY - 30, 40, 30);
    }

    // Classic Painting
    ctx.fillStyle = '#2d2218';
    ctx.fillRect(W * 0.3, 80, 160, 200);
    ctx.strokeStyle = '#b8860b'; // Gold frame
    ctx.lineWidth = 10;
    ctx.strokeRect(W * 0.3, 80, 160, 200);
    // Painting detail (abstract dark)
    ctx.fillStyle = '#15100a';
    ctx.beginPath(); ctx.arc(W * 0.3 + 80, 160, 40, 0, Math.PI*2); ctx.fill();

    // Large Window (moonlight)
    const wx = W * 0.7;
    ctx.fillStyle = '#0a1020'; // night sky
    ctx.fillRect(wx, 50, 200, 250);
    ctx.strokeStyle = '#111'; // Window frame
    ctx.lineWidth = 8;
    ctx.strokeRect(wx, 50, 200, 250);
    ctx.beginPath(); ctx.moveTo(wx + 100, 50); ctx.lineTo(wx + 100, 300); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx, 175); ctx.lineTo(wx + 200, 175); ctx.stroke();
    
    // Moonlight rays
    ctx.fillStyle = 'rgba(150, 180, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(wx, 50); ctx.lineTo(wx + 200, 50);
    ctx.lineTo(wx - 100, floorY + 100); ctx.lineTo(wx - 300, floorY + 100);
    ctx.fill();

    // --- Floor (Red Carpet with Perspective) ---
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
    floorGrad.addColorStop(0, '#110505');
    floorGrad.addColorStop(1, '#330808'); // Deep red carpet
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, W, H - floorY);

    // Carpet pattern / Wood borders
    ctx.fillStyle = '#1a100c'; // Wood floor sides
    ctx.beginPath(); ctx.moveTo(0, floorY); ctx.lineTo(0, H); ctx.lineTo(W*0.1, H); ctx.lineTo(W*0.2, floorY); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W, floorY); ctx.lineTo(W, H); ctx.lineTo(W*0.9, H); ctx.lineTo(W*0.8, floorY); ctx.fill();
  }
}

// ----------------------------------------
// 2. Village (寒村)
// ----------------------------------------
export class VillageBackground extends StageBase {
  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    const floorY = H * 0.52;

    // --- Sky ---
    const bg = ctx.createLinearGradient(0, 0, 0, floorY);
    bg.addColorStop(0, '#0a101a');
    bg.addColorStop(1, '#050a10');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, floorY);

    // Giant Moon
    ctx.fillStyle = 'rgba(200, 210, 220, 0.4)';
    ctx.beginPath(); ctx.arc(W * 0.8, 120, 50, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(200, 210, 220, 0.1)';
    ctx.beginPath(); ctx.arc(W * 0.8, 120, 150, 0, Math.PI * 2); ctx.fill();

    // Dead Trees / Forest line
    ctx.fillStyle = '#08080a';
    for(let i=0; i<15; i++) {
      const tx = i * 100 + Math.sin(i)*50;
      ctx.beginPath();
      ctx.moveTo(tx, floorY);
      ctx.lineTo(tx + 5, floorY - 150 - Math.random()*100);
      ctx.lineTo(tx + 15, floorY);
      ctx.fill();
      // branches
      ctx.beginPath(); ctx.moveTo(tx+5, floorY-100); ctx.lineTo(tx-20, floorY-130); ctx.strokeStyle='#08080a'; ctx.lineWidth=3; ctx.stroke();
    }

    // Ruined Hut
    ctx.fillStyle = '#100c0a';
    ctx.fillRect(W * 0.2, floorY - 150, 250, 150);
    ctx.beginPath(); ctx.moveTo(W*0.15, floorY-150); ctx.lineTo(W*0.32, floorY-220); ctx.lineTo(W*0.48, floorY-150); ctx.fill();
    // Campfire glow near hut
    const fireGlow = 0.3 + Math.sin(this.time * 8) * 0.1;
    const fg = ctx.createRadialGradient(W*0.55, floorY, 10, W*0.55, floorY, 150);
    fg.addColorStop(0, `rgba(255, 100, 20, ${fireGlow})`);
    fg.addColorStop(1, 'rgba(255, 100, 20, 0)');
    ctx.fillStyle = fg; ctx.fillRect(W*0.3, floorY-150, 400, 300);

    // --- Ground (Mud/Dirt with Perspective) ---
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
    floorGrad.addColorStop(0, '#0a0806');
    floorGrad.addColorStop(1, '#1a1612');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, W, H - floorY);

    // Path details
    ctx.fillStyle = '#120f0d';
    ctx.beginPath();
    ctx.moveTo(W*0.4, floorY); ctx.lineTo(W*0.6, floorY);
    ctx.lineTo(W*0.8, H); ctx.lineTo(W*0.1, H);
    ctx.fill();

    // Foreground Grass/Rocks
    ctx.fillStyle = '#050403';
    ctx.fillRect(0, H - 40, W, 40);
  }
}

// ----------------------------------------
// 3. Lab (研究所)
// ----------------------------------------
export class LabBackground extends StageBase {
  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    const floorY = H * 0.5;

    // --- Wall ---
    const bg = ctx.createLinearGradient(0, 0, 0, floorY);
    bg.addColorStop(0, '#10151a');
    bg.addColorStop(1, '#0a0d11');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, floorY);

    // Lab Glass Cylinders
    for(let i=0; i<3; i++) {
      const cx = W * 0.2 + i * 350;
      
      // Tank back
      ctx.fillStyle = '#081a10';
      ctx.fillRect(cx, 100, 150, floorY - 100);
      
      // Green liquid
      const liqH = (floorY - 100) * 0.8;
      const liqY = floorY - liqH;
      ctx.fillStyle = `rgba(50, 200, 100, ${0.3 + Math.sin(this.time * 2 + i) * 0.1})`;
      ctx.fillRect(cx, liqY, 150, liqH);
      
      // Tank frame
      ctx.strokeStyle = '#222d33';
      ctx.lineWidth = 10;
      ctx.strokeRect(cx, 100, 150, floorY - 100);
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx, liqY); ctx.lineTo(cx+150, liqY); ctx.stroke();

      // Bubbles
      ctx.fillStyle = 'rgba(100, 255, 150, 0.5)';
      const bubbleY = floorY - ((this.time * 50 + i * 100) % liqH);
      ctx.beginPath(); ctx.arc(cx + 75, bubbleY, 5, 0, Math.PI*2); ctx.fill();
    }

    // --- Floor (Metal Grating) ---
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
    floorGrad.addColorStop(0, '#0a0d11');
    floorGrad.addColorStop(1, '#1a222c');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, W, H - floorY);

    // Warning Stripes at bottom
    ctx.fillStyle = '#aa8800';
    for(let x=0; x<W; x+=80) {
      ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x+40, H);
      ctx.lineTo(x+80, H-40); ctx.lineTo(x+40, H-40); ctx.fill();
    }
    
    // Grating perspective lines
    ctx.strokeStyle = '#10151a';
    ctx.lineWidth = 2;
    for(let x = -W; x < W*2; x += 60) {
      ctx.beginPath();
      ctx.moveTo(W/2, floorY); // Vanishing point
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for(let y = floorY; y < H; y += Math.pow((y - floorY)/10, 1.5) + 5) {
       ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }
}

// ----------------------------------------
// 4. Castle (古城)
// ----------------------------------------
export class CastleBackground extends StageBase {
  render(ctx) {
    const W = GAME_WIDTH, H = GAME_HEIGHT;
    const floorY = H * 0.48;

    // --- Wall (Stone Blocks) ---
    ctx.fillStyle = '#0f0e10';
    ctx.fillRect(0, 0, W, floorY);

    // Giant Pillars
    ctx.fillStyle = '#151216';
    ctx.strokeStyle = '#050405';
    ctx.lineWidth = 3;
    for(let x=50; x<W; x+=400) {
      ctx.fillRect(x, 0, 100, floorY);
      // Grooves
      for(let g=x+20; g<x+100; g+=20) {
        ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, floorY); ctx.stroke();
      }
    }

    // Huge Stained Glass
    const gx = W * 0.4;
    ctx.fillStyle = '#150505'; // very dark red glass
    ctx.beginPath();
    ctx.moveTo(gx, floorY); ctx.lineTo(gx, 150);
    ctx.arc(gx + 100, 150, 100, Math.PI, 0);
    ctx.lineTo(gx + 200, floorY); ctx.fill();
    
    // Moon/Storm light passing through
    const glassLight = 0.1 + Math.sin(this.time) * 0.05;
    ctx.fillStyle = `rgba(100, 40, 40, ${glassLight})`;
    ctx.fill();
    
    // Glass panes framing
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx+100, 50); ctx.lineTo(gx+100, floorY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gx, 150); ctx.lineTo(gx+200, 150); ctx.stroke();

    // Torches on pillars
    for(let x=100; x<W; x+=400) {
      const fi = 0.2 + Math.sin(this.time * 8 + x) * 0.1;
      const fg = ctx.createRadialGradient(x, 250, 5, x, 250, 120);
      fg.addColorStop(0, `rgba(255, 120, 30, ${fi})`);
      fg.addColorStop(1, 'rgba(255, 50, 10, 0)');
      ctx.fillStyle = fg; ctx.fillRect(x-150, 100, 300, 300);
      
      // flame core
      ctx.fillStyle = `rgba(255, 200, 100, ${fi + 0.5})`;
      ctx.beginPath(); ctx.arc(x, 250, 8, 0, Math.PI*2); ctx.fill();
    }

    // --- Floor (Stone perspective) ---
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
    floorGrad.addColorStop(0, '#0a0a0c');
    floorGrad.addColorStop(1, '#1a1a1f');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, W, H - floorY);

    // Stone tile perspective
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    for(let x = -W; x < W*2; x += 150) {
      ctx.beginPath();
      ctx.moveTo(W/2, floorY); // Vanishing point
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for(let y = floorY; y < H; y += Math.pow((y - floorY)/12, 1.5) + 8) {
       ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }
}

// Factory
export function createStageBackground(stageId) {
  switch (stageId) {
    case 'mansion': return new MansionBackground();
    case 'village': return new VillageBackground();
    case 'lab': return new LabBackground();
    case 'castle': return new CastleBackground();
    default: return new MansionBackground();
  }
}
