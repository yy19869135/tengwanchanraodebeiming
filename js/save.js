// ========== 存档系统 ==========
var saveSlots = [null, null, null, null];
var currentSaveMode = 'save'; // 'save' 或 'load'

function toggleSavePanel() {
    var panel = document.getElementById('savePanel');
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) {
        renderSaveSlots();
    }
}

function switchSaveMode(mode) {
    currentSaveMode = mode;
    document.getElementById('tabSave').classList.toggle('active', mode === 'save');
    document.getElementById('tabLoad').classList.toggle('active', mode === 'load');
    renderSaveSlots();
}

function renderSaveSlots() {
    var container = document.getElementById('saveSlotsContainer');
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
        
        div.onclick = (function(index) {
            return function() {
                if (currentSaveMode === 'save') createSave(index);
                else if (slot) loadSave(index);
            };
        })(i);
        
        container.appendChild(div);
    }
}

function createSave(index) {
    var scene = document.getElementById('sceneTime').textContent + ' ' + document.getElementById('sceneMood').textContent;
    if (!scene.trim()) scene = '未知进度';
    
    saveSlots[index] = {
        time: formatTime(new Date()),
        scene: scene,
        dialogueIndex: currentDialogueIndex,
        affection: JSON.parse(JSON.stringify(affectionData))
    };
    renderSaveSlots();
    
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);background:rgba(0,0,0,0.8);color:#4CAF50;padding:12px 24px;border-radius:8px;z-index:9999;border:1px solid #4CAF50;';
    toast.textContent = '存档 ' + (index + 1) + ' 保存成功';
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 1500);
}

function loadSave(index) {
    var slot = saveSlots[index];
    if (!slot) return;
    
    affectionData = JSON.parse(JSON.stringify(slot.affection));
    toggleSavePanel();
    document.getElementById('menuPanel').classList.remove('active');
    
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);background:rgba(0,0,0,0.8);color:#7eb8da;padding:12px 24px;border-radius:8px;z-index:9999;border:1px solid #7eb8da;';
    toast.textContent = '存档 ' + (index + 1) + ' 读取成功';
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 1500);
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
    return affection.characters.map(function(c) {
        return '<span class="char-badge">' + c.name + ' ' + c.value + '</span>';
    }).join('');
}
