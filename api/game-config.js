export default function handler(req, res) {
    // 允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const config = {
        // 游戏平衡参数
        gameDuration: 30,         // 游戏时长
        flickSpawnRate: 0.045,    // 刷新频率
        maxTargets: 5,            // 最大同屏目标
        baseScore: 50,            // 基础分
        trackingScore: 5,         // 跟枪每帧得分
        
        // 视觉参数
        crosshairColor: "#00ff00", // 绿色准星
        targetColor: "#ff8a80",    // 红色目标
        
        // 判定文本
        titles: {
            main: "AIM TRAINER PRO",
            sub: "CS:GO 视角版 | 加密协议已启动",
            cheat: "❌ 异常检测：物理校验失败"
        },
        
        // 评价等级
        ranks: [
            { score: 2500, acc: 90, label: "S+", color: "#ff1744" },
            { score: 2000, acc: 80, label: "S", color: "#ff5252" },
            { score: 1500, acc: 70, label: "A", color: "#ffab40" },
            { score: 1000, acc: 60, label: "B", color: "#4fc3f7" }
        ]
    };

    res.status(200).json(config);
}
