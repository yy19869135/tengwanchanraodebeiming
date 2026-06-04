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

    if (a === 'affection') { renderAffection(); toggleAffection(); return; }
    if (a === 'character') { toggleCharacterIntro(); return; }
    if (a === 'recall') { toggleStoryRecall(); return; }
    if (a === 'save') { switchSaveMode('save'); toggleSavePanel(); return; }
    if (a === 'load') { switchSaveMode('load'); toggleSavePanel(); return; }
    if (a === 'minigame') { toggleMinigamePanel(); return; }
    if (a === 'sound') { showToast('🎵 暂无', '#666'); return; }
    if (a === 'toggleMode') { toggleGameMode(); document.getElementById('menuBtn').style.display = 'flex'; return; }
    if (a === 'editPlayer') { openEditPlayer(); return; }
    if (a === 'restart') {
        if (confirm('确定要重新开始游戏吗？当前进度将丢失。')) { fullGameReset(); }
        document.getElementById('menuBtn').style.display = 'flex';
        return;
    }
    if (a === 'title') {
        if (confirm('确定返回标题？')) { returnToTitle(); }
        document.getElementById('menuBtn').style.display = 'flex';
        return;
    }
    document.getElementById('menuBtn').style.display = 'flex';
}

function restartGame() {
    timeSystem.reset();
    affectionData.characters.forEach(function(c) {
        c.value = c.name === '温辞' ? 15 : (c.name === '沈砚辞' ? 10 : 5);
        updateStage(c);
    });
    currentDialogueIndex = 0;
    dialogueLines = [];
    dialogueTypes = [];
    dialogueSpeakers = [];
    storyRecall = [];
    storyIntroShown = {};
    resetBellState();
    resetJumpscareState();
    document.getElementById('menuPanel').classList.remove('active');
    showSetupPanel();
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

