/**
 * 射击训练营 Pro - 核心逻辑与配置 API
 */

export const GameConfig = {
    DURATION: 30, // 游戏时长（秒）
    REQUIRED_TIME_MS: 30000,
    SWAY_INTENSITY_X: 0.06,
    SWAY_INTENSITY_Y: 0.02,
    RECOIL_DURATION: 300,
    GRID_SIZE: 50,
    
    // 目标生成参数
    FLICK_SPAWN_CHANCE: 0.045,
    MAX_TARGETS: 5,
    
    // 评分等级定义
    getRanks: (score, acc) => {
        if (acc > 90 && score > 2500) return { rank: "S+", color: "#ff1744" };
        if (acc > 80 && score > 2000) return { rank: "S", color: "#ff5252" };
        if (acc > 70 && score > 1500) return { rank: "A", color: "#ffab40" };
        if (acc > 60 && score > 1000) return { rank: "B", color: "#4fc3f7" };
        return { rank: "C", color: "#81c784" };
    }
};

export class Target {
    constructor(canvasWidth, canvasHeight, isTracking = false) {
        this.isTracking = isTracking;
        this.r = 0;
        this.maxR = isTracking ? 25 : Math.random() * 10 + 20;
        this.x = Math.random() * (canvasWidth - 150) + 75;
        this.y = Math.random() * (canvasHeight - 150) + 75;
        this.life = 1.0;
        this.shrinkSpeed = isTracking ? 0 : (0.007 + Math.random() * 0.006);
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
    }

    update(canvasWidth, canvasHeight) {
        if (this.isTracking) {
            if (Math.random() < 0.15) {
                this.vx += (Math.random() - 0.5) * 4;
                this.vy += (Math.random() - 0.5) * 4;
            }
            const maxSpeed = 12;
            const speed = Math.hypot(this.vx, this.vy);
            if (speed > maxSpeed) { 
                this.vx = (this.vx / speed) * maxSpeed; 
                this.vy = (this.vy / speed) * maxSpeed; 
            }
            const margin = 100;
            if (this.x < margin) this.vx += 0.8;
            if (this.x > canvasWidth - margin) this.vx -= 0.8;
            if (this.y < margin) this.vy += 0.8;
            if (this.y > canvasHeight - margin) this.vy -= 0.8;
            this.x += this.vx; 
            this.y += this.vy;
            if (this.r < this.maxR) this.r += 2;
        } else {
            if (this.r < this.maxR) this.r += 2;
            this.life -= this.shrinkSpeed;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.isTracking ? `rgba(79, 195, 247, 0.85)` : `rgba(255, 138, 128, ${this.life})`;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

/**
 * 计算点击得分逻辑
 */
export function calculateHitScore(target, combo) {
    const reactionBonus = Math.round(target.life * 100);
    const comboBonus = Math.floor(combo / 5) * 10;
    return 50 + reactionBonus + comboBonus;
}
