const canvas = document.getElementById('dayCanvas');
const ctx = canvas.getContext('2d');
const S = 6; 
let frame = 0;

// 樱花瓣数据初始化
const petals = Array.from({length: 35}, () => ({
    x: Math.random() * 100, y: Math.random() * 100,
    s: Math.random() * 0.3 + 0.2, vx: Math.random() * 0.3 + 0.1,
    r: Math.random() * Math.PI
}));

// 云朵数据初始化
const clouds = [
    { x: 10, y: 25, scale: 1.2, speed: 0.04 },
    { x: 65, y: 45, scale: 0.8, speed: 0.06 }
];

/**
 * 像素绘制工具函数
 * @param {number} x 坐标X
 * @param {number} y 坐标Y
 * @param {number} w 宽度
 * @param {number} h 高度
 * @param {string} c 颜色
 */
function p(x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(Math.floor(x * S), Math.floor(y * S), Math.floor(w * S), Math.floor(h * S));
}

function render() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制天空背景
    ctx.fillStyle = '#e3f2fd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制远山/建筑剪影
    const bColor = '#d1e9ff';
    p(55, 65, 25, 35, bColor); p(60, 60, 10, 5, bColor);
    p(15, 75, 30, 25, bColor); p(20, 72, 15, 3, bColor);

    // 绘制云朵
    clouds.forEach(c => {
        c.x = (c.x + c.speed) % 120;
        p(c.x-20, c.y, 12*c.scale, 4*c.scale, 'rgba(255,255,255,0.6)');
        p(c.x-20 + 2*c.scale, c.y - 2*c.scale, 8*c.scale, 2*c.scale, 'rgba(255,255,255,0.6)');
    });

    // 绘制屋檐/横梁
    p(0, 0, 100, 8, '#5d4037'); p(0, 7, 100, 1.5, '#3e2723');
    for(let i=0; i<10; i++) p(i*12, 0, 8, 2, '#4e342e');

    // 绘制摆动的晴天娃娃
    let swing = Math.sin(frame * 0.035) * 0.12;
    ctx.save();
    ctx.translate(35 * S, 8 * S);
    ctx.rotate(swing);
    p(-0.4, 0, 0.8, 15, '#90a4ae'); // 绳子
    ctx.translate(0, 15 * S);
    p(-4, 0, 8, 8, '#ffffff'); // 头部
    p(-2, 3, 1, 1, '#37474f'); p(1, 3, 1, 1, '#37474f'); // 眼睛
    p(-3, 5, 1, 0.5, 'rgba(255,182,193,0.6)'); p(2, 5, 1, 0.5, 'rgba(255,182,193,0.6)'); // 腮红
    p(-4, 8, 8, 1, '#ff5252'); // 红领结
    p(-5, 9, 10, 9, '#ffffff'); // 身体
    for(let i=0; i<3; i++) {
        let dy = Math.sin(frame * 0.1 + i) * 1.5;
        p(-5 + i*4, 18 + dy, 2, 2, '#ffffff'); // 裙摆装饰
    }
    ctx.restore();

    // 绘制飘落的樱花瓣
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

    // 绘制底部草坪
    for(let i=0; i<6; i++) p(i*20 - 5, 96, 15, 6, '#aed581');

    requestAnimationFrame(render);
}

// 启动渲染循环
render();
