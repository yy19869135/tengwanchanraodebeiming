// ========== 全局变量 ==========
var mujianSdk = null;
var gameMode = 'normal'; // 'normal' 或 'horror'
var sdkReady = false;
var isWaiting = false;
var retryCount = 0;
var maxRetry = 5;

// ========== 视觉小说变量 ==========
var currentDialogueIndex = 0, dialogueLines = [], dialogueTypes = [], dialogueSpeakers = [];
var isTyping = false, typewriterTimeout = null, MAX_CHARS = 90, currentChoices = [];
var lastAIResponse = '';  // 保存最后一次AI回复的完整内容

// ========== 开场白 ==========
var openingContent = '<visual_novel>\n<scene_info>\n[场景|洋楼门前]\n[时间|凌晨3:17]\n[氛围|恐怖诡异]\n</scene_info>\n<narration>\n[旁白|凌晨3点17分。]\n</narration>\n<narration>\n[旁白|你睁开眼，发现自己站在一栋洋楼门前。]\n</narration>\n<narration>\n[旁白|四周是浓雾，白得像墙，看不到尽头。]\n</narration>\n<narration>\n[旁白|大门是铜制的，雕花款，锈迹斑斑。门环是扭曲的人脸，眼珠在缓慢转动。]\n</narration>\n<narration>\n[旁白|【副本名称：记忆缝合楼】【时间限制：12小时】]\n</narration>\n<narration>\n[旁白|只能进去。]\n</narration>\n<choices>\n[选项|走过去，推开大门]\n[选项|检查随身物品]\n[选项|观察四周]\n[选项|静止不动]\n</choices>\n</visual_novel>';

// ========== 好感度数据 ==========
var affectionData = {
    characters: [
        { name: '沈砚辞', type: '清冷禁欲系', affectionType: '信任值', value: 10, stage: '阶段1', stageName: '警惕期', stageDesc: '仅提供基础逻辑分析', abilities: ['基础逻辑分析'], colorClass: 'trust' },
        { name: '炽野', type: '桀骜叛逆系', affectionType: '接纳值', value: 5, stage: '阶段1', stageName: '试探期', stageDesc: '言语挑衅', abilities: ['被动保护'], colorClass: 'accept' },
        { name: '温辞', type: '温柔守护系', affectionType: '尊重值', value: 15, stage: '阶段1', stageName: '陪伴期', stageDesc: '情绪安抚', abilities: ['情绪安抚'], colorClass: 'respect' }
    ]
};

// ========== 角色立绘映射 ==========
var characterSprites = {
    '沈砚辞': 'https://cdn.mujian.me/tuchuang/6941397274448.png',
    '炽野': 'https://cdn.mujian.me/tuchuang/69413a0ea9686.png',
    '温辞': 'https://cdn.mujian.me/tuchuang/69413a4f41f2c.png'
};

function genBgUrl(scene) {
    var imageMap = {
        // === 原有核心场景 ===
        '洋楼门前': 'https://cdn.mujian.me/tuchuang/6944fd262231a.png',
        '洋楼大门': 'https://cdn.mujian.me/tuchuang/6944fd262231a.png',
        '铜制大门': 'https://cdn.mujian.me/tuchuang/6944fd262231a.png',
        '门环': 'https://cdn.mujian.me/tuchuang/6944fd262231a.png',
        '家暴现场': 'https://cdn.mujian.me/tuchuang/69450463292c5.png',
        '一楼客厅': 'https://cdn.mujian.me/tuchuang/69450463292c5.png',
        '民国教室': 'https://cdn.mujian.me/tuchuang/694505bd3cba1.png',
        '二楼教室': 'https://cdn.mujian.me/tuchuang/694505bd3cba1.png',
        '停尸间': 'https://cdn.mujian.me/tuchuang/694552641b82a.png',
        '三楼停尸间': 'https://cdn.mujian.me/tuchuang/694552641b82a.png',
        '洋楼大厅': 'https://cdn.mujian.me/tuchuang/69466f94454c6.jpg',
        '大厅': 'https://cdn.mujian.me/tuchuang/69466f94454c6.jpg',
        '一楼大厅': 'https://cdn.mujian.me/tuchuang/69466f94454c6.jpg',
        '洋楼大厅的灯': 'https://cdn.mujian.me/tuchuang/69466fc334852.JPEG',
        '大厅吊灯': 'https://cdn.mujian.me/tuchuang/69466fc334852.JPEG',
        '四层婚房': 'https://cdn.mujian.me/tuchuang/6946706c09ff9.jpg',
        '四楼婚房': 'https://cdn.mujian.me/tuchuang/6946706c09ff9.jpg',
        '婚房': 'https://cdn.mujian.me/tuchuang/6946706c09ff9.jpg',
        '五层书房': 'https://cdn.mujian.me/tuchuang/696a51a2e50c7.png',
        '五楼书房': 'https://cdn.mujian.me/tuchuang/696a51a2e50c7.png',
        '书房': 'https://cdn.mujian.me/tuchuang/696a51a2e50c7.png',
        '六层阁楼': 'https://cdn.mujian.me/tuchuang/696a5b518c40c.png',
        '六楼阁楼': 'https://cdn.mujian.me/tuchuang/696a5b518c40c.png',
        '阁楼': 'https://cdn.mujian.me/tuchuang/696a5b518c40c.png',
        '七层卧室': 'https://cdn.mujian.me/tuchuang/696a6192e4112.png',
        '七楼卧室': 'https://cdn.mujian.me/tuchuang/696a6192e4112.png',
        '七楼': 'https://cdn.mujian.me/tuchuang/696a6192e4112.png',
        '卧室': 'https://cdn.mujian.me/tuchuang/696a6192e4112.png',

        // === 核心流程场景 ===
        '一楼走廊': 'https://cdn.mujian.me/tuchuang/695f4c906ee0a.png',
        '走廊': 'https://cdn.mujian.me/tuchuang/695f4c906ee0a.png',
        '楼梯间': 'https://cdn.mujian.me/tuchuang/695f51369eb69.png',
        '楼梯': 'https://cdn.mujian.me/tuchuang/695f51369eb69.png',
        '二楼走廊': 'https://cdn.mujian.me/tuchuang/695f52d38f7e1.png',
        '地下室': 'https://cdn.mujian.me/tuchuang/695f53ca9ada8.png',
        '花园': 'https://cdn.mujian.me/tuchuang/695f56271ab8a.png',
        '后院': 'https://cdn.mujian.me/tuchuang/695f56271ab8a.png',

        // === 沈砚辞线结局场景 ===
        '江南水乡': 'https://cdn.mujian.me/tuchuang/695f669469685.png',
        '苏州园林': 'https://cdn.mujian.me/tuchuang/695f5a2732cc5.png',
        '黄山云海': 'https://cdn.mujian.me/tuchuang/695f681a76486.png',
        '敦煌沙漠': 'https://cdn.mujian.me/tuchuang/695f6a6a1e704.png',
        '丽江古城': 'https://cdn.mujian.me/tuchuang/695f6c769930f.png',
        '临湖小院': 'https://cdn.mujian.me/tuchuang/695f6d6e38f58.png',
        '古籍馆': 'https://cdn.mujian.me/tuchuang/695f5b60b9b21.png',

        // === 炽野线结局场景 ===
        '海': 'https://cdn.mujian.me/tuchuang/695f5ced9d627.png',
        '大海': 'https://cdn.mujian.me/tuchuang/695f5ced9d627.png',
        '看海': 'https://cdn.mujian.me/tuchuang/695f5ced9d627.png',
        '海边': 'https://cdn.mujian.me/tuchuang/695f5ced9d627.png',
        '海边沙滩': 'https://cdn.mujian.me/tuchuang/695f5ced9d627.png',
        '海滩': 'https://cdn.mujian.me/tuchuang/695f5ced9d627.png',
        '沙滩': 'https://cdn.mujian.me/tuchuang/695f5ced9d627.png',
        '海边日落': 'https://cdn.mujian.me/tuchuang/695f6e3662807.png',
        '冲浪俱乐部': 'https://cdn.mujian.me/tuchuang/695f6f8764975.png',
        '海边小屋': 'https://cdn.mujian.me/tuchuang/695f5e46eafab.png',
        '沙滩日出': 'https://cdn.mujian.me/tuchuang/695f709925a7e.png',

        // === 温辞线结局场景 ===
        '花店': 'https://cdn.mujian.me/tuchuang/695f61205bf3b.png',
        '花房': 'https://cdn.mujian.me/tuchuang/695f61205bf3b.png',
        '花店黄昏': 'https://cdn.mujian.me/tuchuang/696601754bcec.jpg',
        '花房黄昏': 'https://cdn.mujian.me/tuchuang/696601754bcec.jpg',
        '茉莉花店': 'https://cdn.mujian.me/tuchuang/695f61205bf3b.png',
        '茉莉花房': 'https://cdn.mujian.me/tuchuang/695f61205bf3b.png',
        '茉莉花店黄昏': 'https://cdn.mujian.me/tuchuang/696601754bcec.jpg',
        '茉莉花房黄昏': 'https://cdn.mujian.me/tuchuang/696601754bcec.jpg',
        '茉莉花园': 'https://cdn.mujian.me/tuchuang/695f62508c43a.png',
        '城市街头': 'https://cdn.mujian.me/tuchuang/695f7230ea71b.png',
        
        // ★★★ 新增：更多别名映射 ★★★
        '茉莉花房': 'https://cdn.mujian.me/tuchuang/695f61205bf3b.png',  // 映射到花店
        '温辞花店': 'https://cdn.mujian.me/tuchuang/695f61205bf3b.png',  // 映射到花店
        '鲜花店': 'https://cdn.mujian.me/tuchuang/695f61205bf3b.png',    // 映射到花店
        '花卉店': 'https://cdn.mujian.me/tuchuang/695f61205bf3b.png',    // 映射到花店
        '花艺工作室': 'https://cdn.mujian.me/tuchuang/695f61205bf3b.png',// 映射到花店
        
        '花圃': 'https://cdn.mujian.me/tuchuang/695f62508c43a.png',      // 映射到茉莉花园
        '花田': 'https://cdn.mujian.me/tuchuang/695f62508c43a.png',      // 映射到茉莉花园
        
        '海岸': 'https://cdn.mujian.me/tuchuang/695f5ced9d627.png',      // 映射到海边
        '海岸线': 'https://cdn.mujian.me/tuchuang/695f5ced9d627.png',    // 映射到海边
        '海浪': 'https://cdn.mujian.me/tuchuang/695f5ced9d627.png',      // 映射到海边
        '沿海': 'https://cdn.mujian.me/tuchuang/695f5ced9d627.png',      // 映射到海边
        '海景': 'https://cdn.mujian.me/tuchuang/695f5ced9d627.png',      // 映射到海边
        
        '古书店': 'https://cdn.mujian.me/tuchuang/695f5b60b9b21.png',    // 映射到古籍馆
        '书店': 'https://cdn.mujian.me/tuchuang/695f5b60b9b21.png',      // 映射到古籍馆
        '藏书阁': 'https://cdn.mujian.me/tuchuang/695f5b60b9b21.png',    // 映射到古籍馆
        '图书馆': 'https://cdn.mujian.me/tuchuang/695f5b60b9b21.png',    // 映射到古籍馆

        // === 群像守护结局场景 ===
        '温馨洋楼': 'https://cdn.mujian.me/tuchuang/695f635bf3e82.png',
        '阳光洋楼': 'https://cdn.mujian.me/tuchuang/695f635bf3e82.png',
        '重生洋楼': 'https://cdn.mujian.me/tuchuang/695f635bf3e82.png',
        '记忆疗愈馆': 'https://cdn.mujian.me/tuchuang/695f635bf3e82.png',
        '洋楼庭院': 'https://cdn.mujian.me/tuchuang/695f642c4e773.png',
        '疗愈馆大厅': 'https://cdn.mujian.me/tuchuang/69466f94454c6.jpg',

        // === 一楼大厅细节场景 ===
        '大厅全景': 'https://cdn.mujian.me/tuchuang/69466f94454c6.jpg',
        '大厅地板': 'https://cdn.mujian.me/tuchuang/696a3b786a031.png',
        '地板血迹': 'https://cdn.mujian.me/tuchuang/696a3df7d4f51.png',
        '大厅挂钟': 'https://cdn.mujian.me/tuchuang/696a44e735510.png',
        '挂钟特写': 'https://cdn.mujian.me/tuchuang/696a44e735510.png',
        '沙发角落': 'https://cdn.mujian.me/tuchuang/696a45fde4d8e.png',
        '破损家具': 'https://cdn.mujian.me/tuchuang/696a45fde4d8e.png',
        '煤油灯': 'https://cdn.mujian.me/tuchuang/696a474366b66.png',
        '家暴画面': 'https://cdn.mujian.me/tuchuang/69450463292c5.png',
        
        // === 二楼教室细节场景 ===
        '课桌特写': 'https://cdn.mujian.me/tuchuang/696a47cdd8ef8.png',
        '黑板特写': 'https://cdn.mujian.me/tuchuang/696a48108da16.png',
        '杂物间': 'https://cdn.mujian.me/tuchuang/696a4842afd87.png',
        
        // === 三楼停尸间细节场景 ===
        '病床特写': 'https://cdn.mujian.me/tuchuang/696a48b6c3dbd.png',
        '骨灰盒': 'https://cdn.mujian.me/tuchuang/696a48e3e64ab.png',
        
        // === 四楼婚房细节场景 ===
        '铜镜特写': 'https://cdn.mujian.me/tuchuang/696a4d1ee4b69.png',
        '婚床特写': 'https://cdn.mujian.me/tuchuang/696a4ce6de6ce.png',
        '梳妆台': 'https://cdn.mujian.me/tuchuang/696a4d081a730.png',
        
        // === 五楼书房细节场景 ===
        '书架特写': 'https://cdn.mujian.me/tuchuang/696a51a32b228.png',
        '家族合影': 'https://cdn.mujian.me/tuchuang/696a51a422cea.png',
        '密室门': 'https://cdn.mujian.me/tuchuang/696a5297b0478.jpg',
        
        // === 六楼阁楼细节场景 ===
        '摇篮特写': 'https://cdn.mujian.me/tuchuang/696a5b4ead661.png',
        '布娃娃': 'https://cdn.mujian.me/tuchuang/696bd5ef36570.png',
        '墙壁涂鸦': 'https://cdn.mujian.me/tuchuang/696bd6b9dbb6a.png',
        
        // === 七楼卧室细节场景 ===
        '林晏清病床': 'https://cdn.mujian.me/tuchuang/696a6192e4112.png',
        '铜铃特写': 'https://cdn.mujian.me/tuchuang/696a61eab14d2.jpg',
        '茉莉花': 'https://cdn.mujian.me/tuchuang/696a621255a41.png'
    };
    
    if (imageMap[scene]) {
        console.log('✓ 使用预设图片:', scene);
        return imageMap[scene];
    }

    // 模糊匹配
    var sceneKeys = Object.keys(imageMap);
    for (var i = 0; i < sceneKeys.length; i++) {
        var key = sceneKeys[i];
        if (scene.indexOf(key) !== -1 || key.indexOf(scene) !== -1) {
            console.log('✓ 模糊匹配图片:', scene, '→', key);
            return imageMap[key];
        }
    }

    // 关键词匹配
    if (scene.indexOf('花') !== -1) {
        return 'https://cdn.mujian.me/tuchuang/695f61205bf3b.png'; 
    }
    if (scene.indexOf('海') !== -1 || scene.indexOf('浪') !== -1 || scene.indexOf('滩') !== -1) {
        return 'https://cdn.mujian.me/tuchuang/695f5ced9d627.png'; 
    }
    if (scene.indexOf('书') !== -1 || scene.indexOf('籍') !== -1) {
        return 'https://cdn.mujian.me/tuchuang/695f5b60b9b21.png'; 
    }
    if (scene.indexOf('走廊') !== -1 || scene.indexOf('过道') !== -1) {
        return 'https://cdn.mujian.me/tuchuang/695f4c906ee0a.png'; 
    }
    if (scene.indexOf('楼梯') !== -1) {
        return 'https://cdn.mujian.me/tuchuang/695f51369eb69.png'; 
    }

    console.log('⚠ 场景未预设，使用默认图片:', scene);
    return 'https://cdn.mujian.me/tuchuang/6944fd262231a.png';
}
