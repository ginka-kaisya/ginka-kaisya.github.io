// server.js
const express = require('express');
const app = express();
app.use(express.json());

// 内存存储游戏会话（生产环境建议使用 Redis）
const sessions = {};

// 1. 初始化游戏
app.post('/api/game/start', (req, res) => {
    const sessionId = Math.random().toString(36).substring(7);
    const mode = req.body.mode || 'flick';
    
    sessions[sessionId] = {
        mode: mode,
        score: 0,
        hits: 0,
        shots: 0,
        startTime: Date.now(),
        targets: [],
        maxCombo: 0,
        currentCombo: 0,
        lastUpdate: Date.now()
    };

    res.json({ sessionId, message: "Game started" });
});

// 2. 获取/刷新目标 (后端控制逻辑)
app.get('/api/game/targets/:sessionId', (req, res) => {
    const session = sessions[req.params.sessionId];
    if (!session) return res.status(404).send("Session not found");

    // Flick 模式逻辑：如果目标少于5个，随机生成
    if (session.mode === 'flick') {
        if (Math.random() < 0.3 && session.targets.length < 5) {
            const newTarget = {
                id: Math.random().toString(36).substring(7),
                x: Math.random() * 800 + 50, // 假设画布 900x550
                y: Math.random() * 400 + 50,
                r: Math.random() * 10 + 20,
                life: 1.0,
                createdAt: Date.now()
            };
            session.targets.push(newTarget);
        }
    }
    
    // 清理过期目标
    const now = Date.now();
    session.targets = session.targets.filter(t => (now - t.createdAt) < 2000); 

    res.json({ targets: session.targets });
});

// 3. 点击判定 (核心逻辑移交后端)
app.post('/api/game/click', (req, res) => {
    const { sessionId, x, y } = req.body;
    const session = sessions[sessionId];
    if (!session) return res.status(404).send("Session not found");

    session.shots++;
    let hitTarget = null;
    let gainedScore = 0;

    // 判定是否命中
    for (let i = session.targets.length - 1; i >= 0; i--) {
        const t = session.targets[i];
        const dist = Math.sqrt(Math.pow(t.x - x, 2) + Math.pow(t.y - y, 2));
        
        if (dist < t.r) {
            hitTarget = t;
            session.hits++;
            session.currentCombo++;
            if (session.currentCombo > session.maxCombo) session.maxCombo = session.currentCombo;

            // 后端计算分数，防止前端注入
            const lifeLeft = 1 - (Date.now() - t.createdAt) / 2000;
            const reactionBonus = Math.round(lifeLeft * 100);
            const comboBonus = Math.floor(session.currentCombo / 5) * 10;
            gainedScore = 50 + reactionBonus + comboBonus;
            
            session.score += gainedScore;
            session.targets.splice(i, 1);
            break;
        }
    }

    if (!hitTarget) session.currentCombo = 0;

    res.json({
        hit: !!hitTarget,
        gainedScore,
        currentScore: session.score,
        combo: session.currentCombo
    });
});

// 4. 结算与反作弊
app.post('/api/game/end', (req, res) => {
    const { sessionId } = req.body;
    const session = sessions[sessionId];
    const duration = (Date.now() - session.startTime) / 1000;

    // 反作弊：如果时间极短但分数极高，判定异常
    if (duration < 29) {
        return res.json({ error: "Security Check Failed: Unusual timing" });
    }

    const accuracy = (session.hits / session.shots * 100).toFixed(2);
    res.json({
        score: session.score,
        accuracy: accuracy,
        hits: session.hits,
        maxCombo: session.maxCombo
    });
    
    delete sessions[sessionId]; // 销毁会话
});

app.listen(3000, () => console.log('Game Server running on port 3000'));
