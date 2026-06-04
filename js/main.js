// ========== 主菜单与UI交互 ==========
function toggleMenu() {
    var menu = document.getElementById('menuPanel');
    menu.classList.toggle('active');
}

function restartGame() {
    if (confirm('确定要重新开始游戏吗？当前进度将丢失（除非已存档）。')) {
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
}

// ========== 初始化与事件绑定 ==========
window.onload = function() {
    // 1. 初始化系统
    timeSystem.init();
    preloadSounds();
    
    // 2. 绑定核心按钮事件
    var inputBtn = document.getElementById('inputBtn');
    if (inputBtn) inputBtn.onclick = openInputBox;
    
    var sendBtn = document.getElementById('sendBtn');
    if (sendBtn) sendBtn.onclick = sendMessage;
    
    var closeInputBtn = document.getElementById('closeInputBtn');
    if (closeInputBtn) closeInputBtn.onclick = closeInputBox;
    
    var dialogueBox = document.getElementById('dialogueBox');
    if (dialogueBox) dialogueBox.onclick = continueDialogue;
    
    var userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // 3. 绑定顶部菜单按钮事件
    var menuBtn = document.getElementById('menuBtn');
    if (menuBtn) menuBtn.onclick = toggleMenu;

    var styleToggleBtn = document.getElementById('styleToggleBtn');
    if (styleToggleBtn) styleToggleBtn.onclick = toggleStyleMode;

    // 4. 显示开场设定面板
    showSetupPanel();
    
    // 5. 连接幕间 SDK
    initSDK();
};
