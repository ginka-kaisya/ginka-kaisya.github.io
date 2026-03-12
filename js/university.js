const canvas = document.getElementById('gateCanvas');
const ctx = canvas.getContext('2d');
let frame = 0;
let mouseX = 0;
let mouseY = 0;

/**
 * 响应式 Canvas 尺寸调整
 */
function resize() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    ctx.scale(ratio, ratio);
}

window.addEventListener('resize', resize);
resize();

/**
 * 鼠标位置监听
 */
canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

/**
 * 圆角矩形绘制函数
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}

/**
 * 核心渲染循环
 */
function render() {
    frame++;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h * 0.45;

    // 1. 地面投影
    const shadowGrad = ctx.createRadialGradient(cx, cy + 250, 50, cx, cy + 250, 300);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.06)');
    shadowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(0, cy + 100, w, 300);

    // 2. 绘制校门立柱
    ctx.shadowColor = 'rgba(100, 116, 139, 0.1)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, cx - 180, cy - 80, 50, 350, 12);
    drawRoundedRect(ctx, cx + 130, cy - 80, 50, 350, 12);
    ctx.fill();

    // 3. 广工红横梁
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(177, 62, 83, 0.15)';
    const beamGrad = ctx.createLinearGradient(cx - 220, 0, cx + 220, 0);
    beamGrad.addColorStop(0, '#b13e53');
    beamGrad.addColorStop(0.5, '#ce4b62');
    beamGrad.addColorStop(1, '#b13e53');
    ctx.fillStyle = beamGrad;
    drawRoundedRect(ctx, cx - 220, cy - 60, 440, 65, 15);
    ctx.fill();

    // 扫光特效
    const scan = (frame * 4) % 440;
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(cx - 220 + scan, cy - 60, 40, 65);

    // 4. 绘制校名
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = "900 48px 'Hiragino Sans GB', 'STHeiti', serif";
    ctx.fillStyle = "#eab308"; 
    ctx.fillText("广东工业大学", cx, cy - 25);

    // 5. 动态跟随校徽
    const pulse = Math.sin(frame * 0.04) * 0.5 + 0.5;
    const dx = (mouseX - cx) * 0.03;
    const dy = (mouseY - cy) * 0.03;

    ctx.beginPath();
    ctx.arc(cx + dx, cy - 130 + dy, 28, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
    ctx.fill();
    ctx.strokeStyle = `rgba(177, 62, 83, ${0.2 + pulse * 0.5})`;
    ctx.lineWidth = 4;
    ctx.stroke();

    // 6. 氛围粒子
    for(let i=0; i<8; i++) {
        let offset = (frame * 0.4 + i * 100) % h;
        ctx.fillStyle = 'rgba(177, 62, 83, 0.03)';
        ctx.beginPath();
        ctx.arc(cx + Math.cos(frame * 0.01 + i) * 300, offset, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(render);
}

render();

/**
 * 按钮点击平滑转场
 */
document.getElementById("enterCampus").addEventListener("click", e => {
    e.preventDefault();
    const url = e.currentTarget.href;

    document.body.style.transition = "0.8s";
    document.body.style.transform = "scale(1.05)";
    document.body.style.opacity = "0";

    setTimeout(() => {
        window.open(url);
        // 如果是当前页面跳转，改用 window.location.href = url;
    }, 800);
});
