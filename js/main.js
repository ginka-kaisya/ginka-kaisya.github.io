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
let isDragging = false;
let startY = 0;
let currentY = 0; // 当前拉伸的长度
let velY = 0;    // 垂直速度
const originalLength = 1; // 初始缩放比例

teru.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    teru.style.transition = 'none'; // 拖动时关闭过渡
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaY = e.clientY - startY;
    
    if (deltaY > 0) {
        // 向下拖动时，增加拉伸感（控制最大拉伸长度，比如最大拉到 2 倍长）
        currentY = 1 + (deltaY / 200); 
        currentY = Math.min(currentY, 2.0); 
        
        // 应用 scaleY 形变：y轴拉长，x轴稍微变细（保持体积感）
        const scaleX = 1 / Math.sqrt(currentY);
        teru.style.transform = `scale(${scaleX}, ${currentY})`;
    }
});

window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    
    // 记录当前位置作为初值，开始物理回弹
    requestAnimationFrame(updateStretchPhysics);
});

function updateStretchPhysics() {
    if (isDragging) return;

    const k = 0.15;      // 弹性系数（劲度系数）
    const damping = 0.85; // 阻尼（空气阻力，让它慢慢停下来）

    // 目标缩放比例是 1
    const displacement = currentY - 1;
    const force = -k * displacement;
    
    velY += force;
    velY *= damping;
    currentY += velY;

    // 应用形变
    const scaleX = 1 / Math.sqrt(currentY);
    teru.style.transform = `scale(${scaleX}, ${currentY})`;

    // 当位移和速度都足够小时，停止动画
    if (Math.abs(velY) > 0.001 || Math.abs(currentY - 1) > 0.001) {
        requestAnimationFrame(updateStretchPhysics);
    } else {
        currentY = 1;
        teru.style.transform = `scale(1, 1)`;
    }
}

render();
