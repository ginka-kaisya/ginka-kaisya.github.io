const canvas = document.getElementById('dayCanvas');
const ctx = canvas.getContext('2d');
const S = 6; 
let frame = 0;

// --- Canvas 内部渲染逻辑 (保持原样) ---
const petals = Array.from({length: 35}, () => ({
    x: Math.random() * 100, y: Math.random() * 100,
    s: Math.random() * 0.3 + 0.2, vx: Math.random() * 0.3 + 0.1,
    r: Math.random() * Math.PI
}));

const clouds = [
    { x: 10, y: 25, scale: 1.2, speed: 0.04 },
    { x: 65, y: 45, scale: 0.8, speed: 0.06 }
];

function p(x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(Math.floor(x * S), Math.floor(y * S), Math.floor(w * S), Math.floor(h * S));
}

function render() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e3f2fd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const bColor = '#d1e9ff';
    p(55, 65, 25, 35, bColor); p(60, 60, 10, 5, bColor);
    p(15, 75, 30, 25, bColor); p(20, 72, 15, 3, bColor);
    clouds.forEach(c => {
        c.x = (c.x + c.speed) % 120;
        p(c.x-20, c.y, 12*c.scale, 4*c.scale, 'rgba(255,255,255,0.6)');
        p(c.x-20 + 2*c.scale, c.y - 2*c.scale, 8*c.scale, 2*c.scale, 'rgba(255,255,255,0.6)');
    });
    p(0, 0, 100, 8, '#5d4037'); p(0, 7, 100, 1.5, '#3e2723');
    for(let i=0; i<10; i++) p(i*12, 0, 8, 2, '#4e342e');
    let swing = Math.sin(frame * 0.035) * 0.12;
    ctx.save();
    ctx.translate(35 * S, 8 * S);
    ctx.rotate(swing);
    p(-0.4, 0, 0.8, 15, '#90a4ae');
    ctx.translate(0, 15 * S);
    p(-4, 0, 8, 8, '#ffffff'); 
    p(-2, 3, 1, 1, '#37474f'); p(1, 3, 1, 1, '#37474f');
    p(-3, 5, 1, 0.5, 'rgba(255,182,193,0.6)'); p(2, 5, 1, 0.5, 'rgba(255,182,193,0.6)');
    p(-4, 8, 8, 1, '#ff5252'); 
    p(-5, 9, 10, 9, '#ffffff'); 
    for(let i=0; i<3; i++) {
        let dy = Math.sin(frame * 0.1 + i) * 1.5;
        p(-5 + i*4, 18 + dy, 2, 2, '#ffffff');
    }
    ctx.restore();
    petals.forEach((pt, i) => {
        pt.y += pt.s; pt.x += pt.vx + Math.sin(frame * 0.02 + i) * 0.15;
        if(pt.y > 105) { pt.y = -5; pt.x = Math.random() * 100; }
        ctx.save();
        ctx.translate(pt.x * S, pt.y * S);
        ctx.rotate(pt.r + frame * 0.02);
        ctx.fillStyle = i % 2 === 0 ? '#ffc0cb' : '#ffffff';
        ctx.fillRect(-0.5 * S, -0.5 * S, 1.2 * S, 0.8 * S);
        ctx.restore();
    });
    for(let i=0; i<6; i++) p(i*20 - 5, 96, 15, 6, '#aed581');
    requestAnimationFrame(render);
}

// --- 外部垂直拉伸晴天娃娃逻辑 ---
const teru = document.getElementById('drag-teru');
const ROOF_Y = 0; // 挂载点高度
const ANCHOR_X = window.innerWidth * 0.85; // 对应 CSS 中的 right: 15%

let isDragging = false;
let curPos = { x: 0, y: 0 }; // 偏移向量
let vel = { x: 0, y: 0 };    // 速度向量

teru.addEventListener('mousedown', (e) => {
    isDragging = true;
    teru.style.animation = 'none';
    teru.style.transition = 'none';
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    // 计算鼠标相对于挂载点的偏移
    // 注意：ANCHOR_X 需要根据窗口大小实时调整或固定
    const rect = teru.parentElement.getBoundingClientRect();
    const anchorX = rect.right - (window.innerWidth * 0.15); 
    
    let dx = e.clientX - anchorX;
    let dy = e.clientY - ROOF_Y;

    // 限制向上拉动（保持在屋檐下方）
    dy = Math.max(10, dy);

    // 阻尼处理：让拉伸感更丝滑，不容易拉出屏幕
    const dist = Math.sqrt(dx * dx + dy * dy);
    const limitDist = 150 * Math.log1p(dist / 150);
    const ratio = limitDist / dist;

    curPos.x = dx * ratio;
    curPos.y = dy * ratio;

    applyTransform(curPos.x, curPos.y);
});

window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    requestAnimationFrame(updatePhysics);
});

function applyTransform(x, y) {
    const angle = Math.atan2(x, y); // 计算旋转弧度
    const dist = Math.sqrt(x * x + y * y);
    const initialLen = 100; // 绳子+头部的基础长度
    const scaleY = 1 + (dist - initialLen) / 200;
    const finalScaleY = Math.max(1, scaleY);
    const scaleX = 1 / Math.sqrt(finalScaleY);

    // 转换为角度
    const deg = -angle * (180 / Math.PI);
    
    teru.style.transform = `rotate(${deg}deg) scale(${scaleX}, ${finalScaleY})`;
}

function updatePhysics() {
    if (isDragging) return;

    const k = 0.15;      // 弹性系数
    const damping = 0.85; // 阻尼

    // 目标位置是 (0, 100) -> 假设 100 是自然下垂距离
    const target = { x: 0, y: 100 };
    
    const ax = (target.x - curPos.x) * k;
    const ay = (target.y - curPos.y) * k;

    vel.x += ax;
    vel.y += ay;
    vel.x *= damping;
    vel.y *= damping;

    curPos.x += vel.x;
    curPos.y += vel.y;

    applyTransform(curPos.x, curPos.y);

    if (Math.abs(vel.x) > 0.01 || Math.abs(vel.y) > 0.01 || Math.abs(curPos.x) > 0.01) {
        requestAnimationFrame(updatePhysics);
    } else {
        teru.style.transform = `rotate(0deg) scale(1, 1)`;
        teru.style.animation = 'teru-swing 3s ease-in-out infinite alternate';
    }
}

render();
