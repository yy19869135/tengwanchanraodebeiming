// ========== 存档系统 ==========
var saveSlots = [null, null, null, null];
var currentSaveMode = 'save'; // 'save' 或 'load'

// 初始化时从本地存储读取存档
function initSaves() {
    try {
        var savedData = localStorage.getItem('memory_mansion_saves');
        if (savedData) {
            saveSlots = JSON.parse(savedData);
        }
    } catch (e) {
        console.error('读取本地存档失败', e);
    }
}
// 立即执行初始化
initSaves();

// 保存到浏览器本地存储
function saveToLocal() {
    try {
        localStorage.setItem('memory_mansion_saves', JSON.stringify(saveSlots));
    } catch (e) {
        console.error('写入本地存档失败', e);
    }
}

function toggleSavePanel() {
    var panel = document.getElementById('savePanel');
    panel.classList.toggle('active');
    document.getElementById('menuBtn').style.display = 'flex'; // 确保关闭时恢复菜单按钮
    if (panel.classList.contains('active')) {
        renderSaveSlots();
    }
}

function switchSaveMode(mode) {
    currentSaveMode = mode;
    document.getElementById('saveTab').classList.toggle('active', mode === 'save');
    document.getElementById('loadTab').classList.toggle('active', mode === 'load');
    renderSaveSlots();
}

function renderSaveSlots() {
    // ★ 修复：将错误的 saveSlotsContainer 改为正确的 saveSlots
    var container = document.getElementById('saveSlots');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (var i = 0; i < 4; i++) {
        var slot = saveSlots[i];
        var div = document.createElement('div');
        div.className = 'save-slot ' + (slot ? '' : 'empty');
        
        if (slot) {
            var charBadges = getCharBadges(slot.affection);
            div.innerHTML = 
                '<div class="slot-header">' +
                    '<span class="slot-number">存档 ' + (i + 1) + '</span>' +
                    '<span class="slot-time">' + slot.time + '</span>' +
                '</div>' +
                '<div class="slot-info">' + slot.scene + '</div>' +
                '<div class="slot-chars">' + charBadges + '</div>' +
                (currentSaveMode === 'save' ? '<button class="delete-btn" onclick="deleteSave(' + i + ', event)">覆盖</button>' : '');
        } else {
            div.innerHTML = '<div class="slot-empty-text">空存档位</div>';
        }
        
        div.onclick = (function(index, hasSlot) {
            return function() {
                if (currentSaveMode === 'save') createSave(index);
                else if (hasSlot) loadSave(index);
            };
        })(i, !!slot);
        
        container.appendChild(div);
    }
}

function createSave(index) {
    var scene = document.getElementById('sceneTime').textContent + ' ' + document.getElementById('sceneMood').textContent;
    if (!scene.trim()) scene = '未知进度';
    
    var bgImage = document.getElementById('bgImage');
    
    // ★ 修复：保存所有核心游戏数据（包括AI记忆、文本、背景、时间等）
    saveSlots[index] = {
        time: formatTime(new Date()),
        scene: scene,
        affection: JSON.parse(JSON.stringify(affectionData)),
        chatHistory: typeof chatHistory !== 'undefined' ? JSON.parse(JSON.stringify(chatHistory)) : [],
        dialogueLines: JSON.parse(JSON.stringify(dialogueLines)),
        dialogueTypes: JSON.parse(JSON.stringify(dialogueTypes)),
        dialogueSpeakers: JSON.parse(JSON.stringify(dialogueSpeakers)),
        currentDialogueIndex: currentDialogueIndex,
        currentChoices: JSON.parse(JSON.stringify(currentChoices)),
        lastAIResponse: lastAIResponse,
        playerInfo: JSON.parse(JSON.stringify(playerInfo)),
        playerInfoSent: playerInfoSent,
        gameMode: gameMode,
        bgUrl: bgImage ? bgImage.src : '',
        timeSystemMode: timeSystem.mode,
        countdownSeconds: timeSystem.countdownSeconds,
        normalTime: JSON.parse(JSON.stringify(timeSystem.normalTime)),
        sceneTimeText: document.getElementById('sceneTime').textContent,
        sceneMoodText: document.getElementById('sceneMood').textContent
    };
    
    saveToLocal(); // 写入本地存储，刷新不丢失
    renderSaveSlots();
    
    showSaveToast('存档 ' + (index + 1) + ' 保存成功', '#4CAF50');
}

function loadSave(index) {
    var slot = saveSlots[index];
    if (!slot) return;
    
    // 1. 恢复好感度
    affectionData = JSON.parse(JSON.stringify(slot.affection));
    
    // 2. 恢复核心剧情数据和AI记忆
    if (typeof chatHistory !== 'undefined') chatHistory = JSON.parse(JSON.stringify(slot.chatHistory || []));
    dialogueLines = JSON.parse(JSON.stringify(slot.dialogueLines || []));
    dialogueTypes = JSON.parse(JSON.stringify(slot.dialogueTypes || []));
    dialogueSpeakers = JSON.parse(JSON.stringify(slot.dialogueSpeakers || []));
    currentDialogueIndex = slot.currentDialogueIndex || 0;
    currentChoices = JSON.parse(JSON.stringify(slot.currentChoices || []));
    lastAIResponse = slot.lastAIResponse || '';
    playerInfo = JSON.parse(JSON.stringify(slot.playerInfo || {name:'', gender:'female', bio:''}));
    playerInfoSent = slot.playerInfoSent || false;
    gameMode = slot.gameMode || 'normal';
    
    // 3. 恢复时间系统
    timeSystem.mode = slot.timeSystemMode || 'countdown';
    timeSystem.countdownSeconds = slot.countdownSeconds || (12 * 60 * 60 - 4);
    timeSystem.normalTime = JSON.parse(JSON.stringify(slot.normalTime || { year: 2024, month: 10, day: 16, hour: 9, minute: 0, second: 0 }));
    timeSystem.updateDisplay();
    
    // 4. 恢复UI状态和背景
    document.getElementById('sceneTime').textContent = slot.sceneTimeText || '';
    document.getElementById('sceneMood').textContent = slot.sceneMoodText || '';
    if (slot.bgUrl) {
        var bg = document.getElementById('bgImage');
        bg.src = slot.bgUrl;
        bg.classList.add('loaded');
    }
    
    // 5. 刷新对话框画面
    if (dialogueLines.length > 0) {
        if (typeof updateDisplay === 'function') updateDisplay(currentDialogueIndex);
        document.getElementById('dialogueText').textContent = dialogueLines[currentDialogueIndex] || '';
        
        if (currentDialogueIndex >= dialogueLines.length - 1) {
            document.getElementById('continueHint').textContent = '已读完';
            if (typeof renderChoices === 'function') renderChoices(currentChoices);
        } else {
            document.getElementById('continueHint').textContent = '点击继续';
            document.getElementById('choicesContainer').classList.add('hidden');
        }
    }
    
    // 6. 恢复视觉滤镜效果
    if (timeSystem.mode === 'countdown') {
        if (typeof enterDungeonVisualMode === 'function') enterDungeonVisualMode();
    } else {
        if (typeof exitDungeonVisualMode === 'function') exitDungeonVisualMode();
    }
    if (typeof updatePlayerInfoDisplay === 'function') updatePlayerInfoDisplay();
    if (typeof updateModeDisplay === 'function') updateModeDisplay();
    
    // 关闭面板，恢复游戏
    toggleSavePanel();
    document.getElementById('menuPanel').classList.remove('active');
    document.getElementById('menuBtn').style.display = 'flex';
    
    showSaveToast('存档 ' + (index + 1) + ' 读取成功', '#7eb8da');
}

function deleteSave(index, event) {
    event.stopPropagation();
    if (confirm('确定要覆盖这个存档吗？')) {
        createSave(index);
    }
}

function formatTime(date) {
    var pad = function(n) { return n < 10 ? '0' + n : n; };
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + 
           pad(date.getHours()) + ':' + pad(date.getMinutes());
}

function getCharBadges(affection) {
    if (!affection || !affection.characters) return '';
    return affection.characters.map(function(c) {
        return '<span class="char-badge">' + c.name + ' ' + c.value + '</span>';
    }).join('');
}

function showSaveToast(text, color) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);background:rgba(0,0,0,0.8);color:' + color + ';padding:12px 24px;border-radius:8px;z-index:9999;border:1px solid ' + color + ';';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 1500);
}
