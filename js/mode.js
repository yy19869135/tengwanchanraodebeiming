// ========== 游戏模式与视觉特效 ==========
var gameMode = 'normal'; // 默认模式：'normal' 或 'horror'

function toggleGameMode() {
    var indicator = document.getElementById('modeIndicator');
    
    // ★ 修复：添加点击按钮时的动态缩放回弹效果
    if (indicator) {
        indicator.style.transition = 'transform 0.2s ease';
        indicator.style.transform = 'scale(0.8)';
        setTimeout(function() {
            indicator.style.transform = 'scale(1)';
        }, 200);
    }

    // 切换模式逻辑
    if (gameMode === 'normal') {
        gameMode = 'horror';
        if (typeof showToast === 'function') {
            showToast('已切换至【恐怖模式】\n包含惊吓、血腥及精神污染元素', '#ff4444');
        }
        document.body.classList.add('horror-theme');
    } else {
        gameMode = 'normal';
        if (typeof showToast === 'function') {
            showToast('已切换至【温和模式】\n已屏蔽核心恐怖画面', '#4CAF50');
        }
        document.body.classList.remove('horror-theme');
        // 如果切回温和模式，立刻清除屏幕上的恐怖图
        if (typeof resetJumpscareState === 'function') resetJumpscareState();
    }
    updateModeDisplay();
}

function updateModeDisplay() {
    var indicator = document.getElementById('modeIndicator');
    if (indicator) {
        indicator.textContent = gameMode === 'horror' ? '恐怖' : '温和';
        indicator.className = 'mode-indicator ' + gameMode;
    }
}

function toggleStyleMode() {
    var body = document.body;
    var btn = document.getElementById('styleModeBtn');
    
    // ★ 修复：简洁/沉浸按钮的动态点击效果
    if (btn) {
        btn.style.transition = 'transform 0.2s ease';
        btn.style.transform = 'scale(0.8)';
        setTimeout(function() {
            btn.style.transform = 'scale(1)';
        }, 200);
    }

    if (body.classList.contains('simple-mode')) {
        body.classList.remove('simple-mode');
        if (btn) btn.textContent = '沉浸';
        if (typeof showToast === 'function') showToast('已切换至【沉浸模式】', '#7eb8da');
    } else {
        body.classList.add('simple-mode');
        if (btn) btn.textContent = '简洁';
        if (typeof showToast === 'function') showToast('已切换至【简洁模式】', '#4CAF50');
    }
}

// 视觉特效：进入/退出恐怖氛围滤镜
function enterDungeonVisualMode() {
    document.body.classList.add('dungeon-mode');
    var gameScreen = document.getElementById('gameScreen');
    if (gameScreen) gameScreen.style.boxShadow = 'inset 0 0 100px rgba(255,0,0,0.4)';
}

function exitDungeonVisualMode() {
    document.body.classList.remove('dungeon-mode');
    var gameScreen = document.getElementById('gameScreen');
    if (gameScreen) gameScreen.style.boxShadow = 'none';
}
