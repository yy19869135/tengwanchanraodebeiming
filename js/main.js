// ========== 主菜单与UI交互 ==========
function toggleMenu() {
    var menu = document.getElementById('menuPanel');
    menu.classList.toggle('active');
    var menuBtn = document.getElementById('menuBtn');
    if (menu.classList.contains('active')) {
        menuBtn.style.display = 'none';
    } else {
        menuBtn.style.display = 'flex';
    }
}

function menuAction(a) {
    document.getElementById('menuPanel').classList.remove('active');
    document.getElementById('menuBtn').style.display = 'flex'; // ★ 修复：点击任何菜单项后，确保恢复显示骷髅头

    if (a === 'affection') { renderAffection(); toggleAffection(); return; }
    if (a === 'character') { toggleCharacterIntro(); return; }
    if (a === 'recall') { toggleStoryRecall(); return; }
    if (a === 'save') { switchSaveMode('save'); toggleSavePanel(); return; }
    if (a === 'load') { switchSaveMode('load'); toggleSavePanel(); return; }
    if (a === 'minigame') { toggleMinigamePanel(); return; }
    if (a === 'sound') { showToast('🎵 暂无', '#666'); return; }
    if (a === 'toggleMode') { toggleGameMode(); return; }
    if (a === 'editPlayer') { openEditPlayer(); return; }
    if (a === 'restart') {
        if (confirm('确定要重新开始游戏吗？当前进度将丢失。')) { fullGameReset(); }
        return;
    }
    if (a === 'title') {
        if (confirm('确定返回标题？')) { returnToTitle(); }
        return;
    }
}

// ★ 修复：添加缺失的编辑身份功能
function openEditPlayer() {
    document.getElementById('playerNameInput').value = playerInfo.name || '';
    document.getElementById('playerBioInput').value = playerInfo.bio || '';
    document.getElementById('setupPanel').classList.remove('hidden');
}

// ★ 修复：添加缺失的切换简洁模式功能
function toggleSimpleMode() {
    if (typeof toggleStyleMode === 'function') {
        toggleStyleMode();
    }
}

// ★ 修复：添加缺失的重新开始和返回标题功能
function fullGameReset() {
    if (typeof resetJumpscareState === 'function') resetJumpscareState();
    if (typeof resetBellState === 'function') resetBellState();
    
    playerInfo = { name: '', gender: 'female', bio: '' };
    playerInfoSent = false;
    gameMode = 'normal';
    
    affectionData.characters.forEach(function(c) {
        c.value = c.name === '温辞' ? 15 : (c.name === '沈砚辞' ? 10 : 5);
        updateStage(c);
    });
    
    currentDialogueIndex = 0;
    dialogueLines = [];
    dialogueTypes = [];
    dialogueSpeakers = [];
    currentChoices = [];
    lastAIResponse = '';
    isTyping = false;
    isWaiting = false;
    
    if (typeof storyRecall !== 'undefined') storyRecall = [];
    if (typeof storyIntroShown !== 'undefined') storyIntroShown = {};
    timeSystem.reset();
    
    ['affectionPanel','savePanel','characterIntroPanel','storyRecallPanel','minigamePanel','gameScreen','inputModal','menuPanel'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) { el.classList.remove('active'); if (id === 'inputModal') el.style.display = 'none'; }
    });
    
    document.getElementById('choicesContainer').classList.add('hidden');
    document.getElementById('playerInfoBar').style.display = 'none';
    document.getElementById('charSprite').style.display = 'none';
    document.getElementById('dialogueText').textContent = '';
    document.getElementById('nameBox').style.display = 'none';
    document.getElementById('menuBtn').style.display = 'flex';
    
    var bg = document.getElementById('bgImage');
    bg.classList.remove('loaded');
    bg.src = '';
    
    gameStarted = false;
    document.getElementById('gameDeclaration').classList.remove('hidden');
    
    var indicator = document.getElementById('modeIndicator');
    if (indicator) {
        indicator.textContent = '温和';
        indicator.className = 'mode-indicator normal';
    }
    
    if (typeof showToast === 'function') showToast('🔄 游戏已重新开始', '#4CAF50');
}

function returnToTitle() {
    fullGameReset();
}

function restartGame() {
    fullGameReset();
}

// ========== 初始化与事件绑定 ==========
window.onload = function() {
    timeSystem.init();
    preloadSounds();

    var userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }

    showSetupPanel();
    initSDK();
};
