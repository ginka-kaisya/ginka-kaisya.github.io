const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const timerBar = document.getElementById('timer-bar');
const weaponContainer = document.getElementById('weapon-container');
const crosshair = document.getElementById('crosshair');

let gameActive = false;
let mode = 'flick'; 
let score = 0, hits = 0, shots = 0, timeLeft = 30;
let targets = [];
let realStartTime = 0; 
let combo = 0; // 连击数
let maxCombo = 0; // 最高连击
const REQUIRED_TIME = 30000; // 30秒的毫秒数
let mouseX = 0, mouseY = 0;
const GAME_DURATION = 30;

function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', resize);
resize();

class Target {
    constructor(isTracking = false) {
        this.isTracking = isTracking;
        this.r = 0;
        this.maxR = isTracking ? 25 : Math.random() * 10 + 20;
        this.x = Math.random() * (canvas.width - 150) + 75;
        this.y = Math.random() * (canvas.height - 150) + 75;
        this.life = 1.0;
        this.shrinkSpeed = isTracking ? 0 : (0.007 + Math.random() * 0.006);
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
    }

    update() {
        if (this.isTracking) {
            if (Math.random() < 0.15) {
                this.vx += (Math.random() - 0.5) * 4;
                this.vy += (Math.random() - 0.5) * 4;
            }
            const maxSpeed = 12;
            const speed = Math.hypot(this.vx, this.vy);
            if (speed > maxSpeed) { this.vx = (this.vx/speed)*maxSpeed; this.vy = (this.vy/speed)*maxSpeed; }
            const margin = 100;
            if (this.x < margin) this.vx += 0.8;
            if (this.x > canvas.width - margin) this.vx -= 0.8;
            if (this.y < margin) this.vy += 0.8;
            if (this.y > canvas.height - margin) this.vy -= 0.8;
            this.x += this.vx; this.y += this.vy;
            if(this.r < this.maxR) this.r += 2;
        } else {
            if(this.r < this.maxR) this.r += 2;
            this.life -= this.shrinkSpeed;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.isTracking ? `rgba(79, 195, 247, 0.85)` : `rgba(255, 138, 128, ${this.life})`;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.8)"; 
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

function start(selectedMode) {
    mode = selectedMode;
    score = 0; hits = 0; shots = 0; timeLeft = GAME_DURATION;
    targets = [];
    gameActive = true;
    realStartTime = performance.now();
    document.getElementById('ui-menu').style.display = 'none';
    document.getElementById('ui-end').style.display = 'none';
    
    crosshair.style.display = 'block';

    if(mode === 'track') targets.push(new Target(true));
    
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=50) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }
    for(let i=0; i<canvas.height; i+=50) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); ctx.stroke(); }

    timeLeft -= 1/60;
    timerBar.style.width = (timeLeft / GAME_DURATION) * 100 + '%';
    if (timeLeft <= 0) return endGame();

    if (mode === 'flick') {
        if (Math.random() < 0.045 && targets.length < 5) targets.push(new Target(false));
    } else {
        shots++;
        const t = targets[0];
        if (t && Math.hypot(t.x - mouseX, t.y - mouseY) < t.r) { hits++; score += 5; }
    }

    targets = targets.filter(t => t.life > 0);
    targets.forEach(t => { t.update(); t.draw(); });
    updateStats();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if (gameActive) {
        crosshair.style.left = e.clientX - 12 + 'px';
        crosshair.style.top = e.clientY - 12 + 'px';
    }

    if (gameActive) {
        const swayX = (e.clientX - window.innerWidth / 2) * 0.06;
        const swayY = (e.clientY - window.innerHeight / 2) * 0.02;
        weaponContainer.style.transform = `translate(${swayX}px, ${swayY}px) rotate(${swayX * 0.05}deg)`;
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (!gameActive) return;

    weaponContainer.classList.add('weapon-fire');
    setTimeout(() => weaponContainer.classList.remove('weapon-fire'), 60);

    weaponContainer.style.transition = 'none';
    weaponContainer.style.transform += ' translate(-8px, -40px) scale(1.04) rotate(-1.5deg)';
    
    setTimeout(() => {
        weaponContainer.style.transition = 'transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
        const shiftX = (e.clientX - window.innerWidth / 2) * 0.06;
        const shiftY = (e.clientY - window.innerHeight / 2) * 0.02;
        weaponContainer.style.transform = `translate(${shiftX}px, ${shiftY}px) rotate(${shiftX * 0.05}deg)`;
    }, 50);

    if (mode === 'track') return;
    shots++;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for(let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        if (Math.hypot(t.x - x, t.y - y) < t.r) {
            hits++;
            combo++; 
            if (combo > maxCombo) maxCombo = combo;

            const reactionBonus = Math.round(t.life * 100);
            const comboBonus = Math.floor(combo / 5) * 10; 
            const gainedScore = 50 + reactionBonus + comboBonus;
            
            score += gainedScore;
            targets.splice(i, 1);
            
            showEffect(x, y, `+${gainedScore} (x${combo})`);
            return;
        } else {
            combo = 0;
        }
    }
});

function updateStats() {
    document.getElementById('score').innerText = Math.floor(score);
    document.getElementById('hits').innerText = hits;
    const acc = shots === 0 ? 100 : Math.round((hits / shots) * 100);
    document.getElementById('accuracy').innerText = acc + '%';
}

function endGame() {
    gameActive = false;
    const actualElapsed = performance.now() - realStartTime;
    const uiEnd = document.getElementById('ui-end');
    uiEnd.style.display = 'flex';
    
    crosshair.style.display = 'none';

    if (actualElapsed < (REQUIRED_TIME - 100)) {
        document.getElementById('result-rank').innerText = "❌ 异常检测";
        document.getElementById('result-detail').innerHTML = 
            `物理检测未通过！<br>逻辑运行过快，成绩已作废。`;
        return; 
    }
    
    const acc = shots === 0 ? 0 : Math.round((hits / shots) * 100);
    
    let rank = "D";
    let color = "#90a4ae";
    
    if (acc > 90 && score > 2500) { rank = "S+"; color = "#ff1744"; }
    else if (acc > 80 && score > 2000) { rank = "S"; color = "#ff5252"; }
    else if (acc > 70 && score > 1500) { rank = "A"; color = "#ffab40"; }
    else if (acc > 60 && score > 1000) { rank = "B"; color = "#4fc3f7"; }
    else { rank = "C"; color = "#81c784"; }

    const rankEl = document.getElementById('result-rank');
    rankEl.innerText = `RANK: ${rank}`;
    rankEl.style.color = color;

    document.getElementById('result-detail').innerHTML = `
        <div style="text-align:left; display:inline-block; font-family:monospace;">
            总分: ${Math.floor(score)}<br>
            准确率: ${acc}%<br>
            命中数: ${hits}<br>
            最高连击: ${maxCombo}<br>
            物理校验: 正常
        </div>
    `;
}

function backToMenu() {
    document.getElementById('ui-end').style.display = 'none';
    document.getElementById('ui-menu').style.display = 'flex';
    weaponContainer.style.transform = 'none';
    crosshair.style.display = 'none';
    ctx.clearRect(0,0,canvas.width, canvas.height);
}

function showEffect(x, y, text) {
    const el = document.createElement('div');
    el.className = 'combo-text';
    el.innerText = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.querySelector('.canvas-area').appendChild(el);
    setTimeout(() => el.remove(), 500);
}

function exit() { if(confirm("确定退出并重置吗？")) window.location.reload(); }
