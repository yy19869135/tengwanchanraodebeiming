// ========== 互动小游戏系统 ==========

// 1. 挂钟解谜 (将时间拨到 3:17)
function initClockPuzzle() {
    var overlay = document.getElementById('clockPuzzleOverlay');
    overlay.classList.add('active');
    document.getElementById('clockHour').value = '12';
    document.getElementById('clockMinute').value = '00';
    document.getElementById('clockResult').textContent = '';
}

function checkClockPuzzle() {
    var h = document.getElementById('clockHour').value;
    var m = document.getElementById('clockMinute').value;
    var result = document.getElementById('clockResult');
    
    if (h === '3' && m === '17') {
        result.style.color = '#4CAF50';
        result.textContent = '咔哒。挂钟深处传来机括转动的声音...';
        playSound('clock', 0.6);
        setTimeout(function() {
            closeClockPuzzle();
            sendToAI('【系统判定：玩家成功将挂钟时间拨至3:17，解开了时间的秘密】');
        }, 1500);
    } else {
        result.style.color = '#ff4444';
        result.textContent = '指针卡住了，时间不对...';
        if (gameMode === 'horror') triggerJumpscare('mirror');
    }
}

function closeClockPuzzle() {
    document.getElementById('clockPuzzleOverlay').classList.remove('active');
}


// 2. 画符驱邪 (Canvas 连线)
var talismanCanvas, ctx, isDrawing = false, drawingPoints = [];

function initTalismanGame() {
    var overlay = document.getElementById('talismanGameOverlay');
    overlay.classList.add('active');
    
    talismanCanvas = document.getElementById('talismanCanvas');
    ctx = talismanCanvas.getContext('2d');
    
    // 适配不同屏幕
    talismanCanvas.width = talismanCanvas.offsetWidth;
    talismanCanvas.height = talismanCanvas.offsetHeight;
    
    ctx.clearRect(0, 0, talismanCanvas.width, talismanCanvas.height);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0000';
    
    drawingPoints = [];
    document.getElementById('talismanResult').textContent = '请一笔画出镇邪符的轮廓';
    
    // 绑定事件
    talismanCanvas.onmousedown = startDrawing;
    talismanCanvas.onmousemove = drawTalisman;
    talismanCanvas.onmouseup = stopDrawing;
    talismanCanvas.onmouseleave = stopDrawing;
    
    talismanCanvas.ontouchstart = function(e) { e.preventDefault(); startDrawing(e.touches[0]); };
    talismanCanvas.ontouchmove = function(e) { e.preventDefault(); drawTalisman(e.touches[0]); };
    talismanCanvas.ontouchend = stopDrawing;
}

function startDrawing(e) {
    isDrawing = true;
    var rect = talismanCanvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    drawingPoints.push({x: x, y: y});
    
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function drawTalisman(e) {
    if (!isDrawing) return;
    var rect = talismanCanvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    drawingPoints.push({x: x, y: y});
    
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    checkTalismanResult();
}

function checkTalismanResult() {
    var result = document.getElementById('talismanResult');
    // 简单判定：点数超过50且覆盖了一定范围即算成功
    if (drawingPoints.length > 50) {
        var minX = 999, maxX = 0, minY = 999, maxY = 0;
        drawingPoints.forEach(function(p) {
            if(p.x < minX) minX = p.x;
            if(p.x > maxX) maxX = p.x;
            if(p.y < minY) minY = p.y;
            if(p.y > maxY) maxY = p.y;
        });
        
        var width = maxX - minX;
        var height = maxY - minY;
        
        if (width > talismanCanvas.width * 0.3 && height > talismanCanvas.height * 0.4) {
            result.style.color = '#ffeb3b';
            result.textContent = '金光微闪，符成！';
            setTimeout(function() {
                closeTalismanGame();
                sendToAI('【系统判定：玩家成功画出镇邪符，暂时驱散了眼前的邪祟】');
            }, 1500);
            return;
        }
    }
    
    result.style.color = '#ff4444';
    result.textContent = '灵力不足，符纸碎裂...';
    setTimeout(function() {
        ctx.clearRect(0, 0, talismanCanvas.width, talismanCanvas.height);
        drawingPoints = [];
        result.textContent = '请重试';
    }, 1000);
}

function closeTalismanGame() {
    document.getElementById('talismanGameOverlay').classList.remove('active');
}


// 3. 屏息躲避 (心跳控制)
var heartbeatInterval, heartbeatScore = 0;

function initHeartbeatGame() {
    var overlay = document.getElementById('heartbeatGameOverlay');
    overlay.classList.add('active');
    
    var bar = document.getElementById('heartbeatBar');
    bar.style.height = '50%';
    heartbeatScore = 50;
    document.getElementById('heartbeatResult').textContent = '点击/长按按钮控制心跳，保持在安全区内';
    
    var btn = document.getElementById('breathBtn');
    btn.onmousedown = function() { heartbeatScore -= 8; };
    btn.ontouchstart = function(e) { e.preventDefault(); heartbeatScore -= 8; };
    
    heartbeatInterval = setInterval(heartbeatGameLoop, 100);
}

function heartbeatGameLoop() {
    heartbeatScore += 2; // 自然增长
    if (heartbeatScore > 100) heartbeatScore = 100;
    if (heartbeatScore < 0) heartbeatScore = 0;
    
    var bar = document.getElementById('heartbeatBar');
    bar.style.height = heartbeatScore + '%';
    
    var result = document.getElementById('heartbeatResult');
    
    // 安全区 30% - 70%
    if (heartbeatScore > 70) {
        bar.style.backgroundColor = '#ff4444';
        result.textContent = '心跳太快！会被发现的！';
        if (gameMode === 'horror' && Math.random() > 0.95) triggerJumpscare('hand');
    } else if (heartbeatScore < 30) {
        bar.style.backgroundColor = '#888';
        result.textContent = '快窒息了...';
    } else {
        bar.style.backgroundColor = '#4CAF50';
        result.textContent = '保持住...';
    }
    
    // 成功判定 (持续一段时间后由AI或外部逻辑结束，这里简化为点击按钮15次且活着)
}

function closeHeartbeatGame(success) {
    clearInterval(heartbeatInterval);
    document.getElementById('heartbeatGameOverlay').classList.remove('active');
    if (success) {
        sendToAI('【系统判定：玩家成功屏住呼吸躲过了巡视的怪物】');
    } else {
        sendToAI('【系统判定：玩家心跳失控/窒息，被怪物发现了】');
    }
}


// 4. 铁丝开锁 (时机点击)
var lockpickInterval, lockpickPos = 0, lockpickDir = 1;

function initLockpickGame() {
    var overlay = document.getElementById('lockpickGameOverlay');
    overlay.classList.add('active');
    
    var pin = document.getElementById('lockpickPin');
    lockpickPos = 0;
    pin.style.left = '0%';
    document.getElementById('lockpickResult').textContent = '当铁丝到达绿色区域时点击开锁';
    
    var speed = gameMode === 'horror' ? 3 : 2;
    
    lockpickInterval = setInterval(function() {
        lockpickPos += lockpickDir * speed;
        if (lockpickPos >= 100) { lockpickPos = 100; lockpickDir = -1; }
        if (lockpickPos <= 0) { lockpickPos = 0; lockpickDir = 1; }
        pin.style.left = lockpickPos + '%';
    }, 20);
}

function tryLockpick() {
    var result = document.getElementById('lockpickResult');
    // 目标区域 40% - 60%
    if (lockpickPos >= 40 && lockpickPos <= 60) {
        clearInterval(lockpickInterval);
        result.style.color = '#4CAF50';
        result.textContent = '咔哒，锁开了！';
        playSound('door', 0.6);
        setTimeout(function() {
            closeLockpickGame();
            sendToAI('【系统判定：玩家成功用铁丝撬开了锁】');
        }, 1500);
    } else {
        result.style.color = '#ff4444';
        result.textContent = '没对准，差点弄断铁丝...';
        if (gameMode === 'horror') triggerJumpscare('stepmother');
    }
}

function closeLockpickGame() {
    clearInterval(lockpickInterval);
    document.getElementById('lockpickGameOverlay').classList.remove('active');
}


// ========== 触发检测 ==========
function checkAndTriggerMinigame(text) {
    if (!text) return false;
    
    if ((text.indexOf('挂钟') !== -1 || text.indexOf('座钟') !== -1) && (text.indexOf('拨动') !== -1 || text.indexOf('时间') !== -1)) {
        setTimeout(initClockPuzzle, 1000);
        return true;
    }
    if ((text.indexOf('画符') !== -1 || text.indexOf('镇邪符') !== -1) && text.indexOf('黄纸') !== -1) {
        setTimeout(initTalismanGame, 1000);
        return true;
    }
    if (text.indexOf('屏住呼吸') !== -1 || text.indexOf('躲藏') !== -1 || text.indexOf('心跳') !== -1) {
        setTimeout(initHeartbeatGame, 1000);
        // 10秒后自动结束躲避
        setTimeout(function() { closeHeartbeatGame(heartbeatScore > 30 && heartbeatScore < 70); }, 10000);
        return true;
    }
    if ((text.indexOf('铁丝') !== -1 || text.indexOf('发夹') !== -1) && (text.indexOf('开锁') !== -1 || text.indexOf('撬锁') !== -1)) {
        setTimeout(initLockpickGame, 1000);
        return true;
    }
    return false;
}

var expandedCategory = null;
var gameCategories = [
    {
        id: 'bookstore', name: '沈砚辞的书店', icon: '📖', char: '沈砚辞',
        games: [
            { id: 'bookshelf', name: '整理书架', desc: '把乱序的书按规则排好' },
            { id: 'bookquiz', name: '古籍猜谜', desc: '根据描述猜书名' },
            { id: 'bookmemory', name: '记忆翻牌', desc: '翻牌配对找相同' },
            { id: 'bookmanage', name: '经营书店', desc: '买卖书籍赚取利润' }
        ]
    },
    {
        id: 'ocean', name: '炽野的海边', icon: '🌊', char: '炽野',
        games: [
            { id: 'surfing', name: '冲浪挑战', desc: '躲避障碍物' },
            { id: 'shells', name: '捡贝壳', desc: '限时收集贝壳' },
            { id: 'fishing', name: '钓鱼', desc: '把握时机钓大鱼' },
            { id: 'skipping', name: '打水漂', desc: '控制角度和力度' }
        ]
    },
    {
        id: 'flowershop', name: '温辞的花店', icon: '💐', char: '温辞',
        games: [
            { id: 'flowerquiz', name: '花语猜谜', desc: '根据花语猜花名' },
            { id: 'flowermanage', name: '经营花店', desc: '卖花赚取利润' },
            { id: 'bouquet', name: '插花搭配', desc: '搭配美丽的花束' },
            { id: 'watering', name: '浇花养花', desc: '照顾花朵成长' }
        ]
    }
];

function renderGameCategories() {
    var container = document.getElementById('gameCategories');
    if (!container) return;
    var html = '';
    gameCategories.forEach(function(cat) {
        html += '<div class="game-category">';
        html += '<div class="category-header" onclick="toggleCategory(\'' + cat.id + '\')">';
        html += '<span class="category-icon">' + cat.icon + '</span>';
        html += '<div class="category-info"><div class="category-name">' + cat.name + '</div><div class="category-char">关联角色：' + cat.char + '</div></div>';
        html += '<span class="category-lock category-unlock">▼</span>';
        html += '</div>';
        html += '<div class="game-list" id="gameList_' + cat.id + '">';
        cat.games.forEach(function(game) {
            html += '<div class="game-item" onclick="startGame(\'' + game.id + '\')">';
            html += '<div><div class="game-name">' + game.name + '</div><div class="game-desc">' + game.desc + '</div></div>';
            html += '</div>';
        });
        html += '</div></div>';
    });
    container.innerHTML = html;
}

function toggleCategory(catId) {
    var list = document.getElementById('gameList_' + catId);
    if (!list) return;
    if (expandedCategory === catId) {
        list.classList.remove('expanded');
        expandedCategory = null;
    } else {
        document.querySelectorAll('.game-list').forEach(function(el) { el.classList.remove('expanded'); });
        list.classList.add('expanded');
        expandedCategory = catId;
    }
}

function startGame(gameId) {
    if (typeof showToast === 'function') {
        showToast('小游戏代码暂未并入，开发中...', '#ffaa00');
    } else {
        alert('小游戏代码暂未并入，开发中...');
    }
}

function exitGame() {
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('menuBtn').style.display = 'flex';
}

function toggleMinigamePanel() {
    var panel = document.getElementById('minigamePanel');
    panel.classList.toggle('active');
    document.getElementById('menuBtn').style.display = 'flex'; // ★ 修复：关闭时恢复菜单按钮
    if (panel.classList.contains('active')) {
        renderGameCategories();
    }
}
