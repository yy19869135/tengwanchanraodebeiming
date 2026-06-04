// ========== 游戏模式与界面风格 ==========
function toggleStyleMode() {
    var container = document.getElementById('gameContainer');
    var btn = document.getElementById('styleToggleBtn');
    
    container.classList.toggle('simple-mode');
    
    if (container.classList.contains('simple-mode')) {
        btn.classList.add('simple-mode');
        btn.innerHTML = '🩸'; 
        showToast('已切换至：简洁模式', '#4a90a4');
    } else {
        btn.classList.remove('simple-mode');
        btn.innerHTML = '📱'; 
        showToast('已切换至：血藤风格', '#8b0000');
    }
}

function showToast(text, color) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:10%;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:8px 16px;border-radius:20px;z-index:9999;font-size:12px;border:1px solid ' + color + ';';
    toast.textContent = text;
    document.body.appendChild(toast);
    
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(function() { toast.style.opacity = '1'; }, 10);
    
    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() { toast.remove(); }, 300);
    }, 1500);
}

function showGameDeclaration() {
    document.getElementById('gameDeclaration').classList.remove('hidden');
}

function selectGameMode(mode) {
    gameMode = mode;
    var overlay = document.getElementById('gameDeclaration');
    var transitionOverlay = document.getElementById('transitionOverlay');
    
    overlay.style.transition = 'opacity 0.5s ease-out';
    overlay.style.opacity = '0';
    
    transitionOverlay.className = 'transition-overlay active transition-' + mode;
    if (mode === 'normal') {
        for(var i=0; i<20; i++) {
            var p = document.createElement('div');
            p.className = 'moonlight-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = 50 + Math.random() * 50 + '%';
            p.style.animationDelay = Math.random() * 1 + 's';
            transitionOverlay.appendChild(p);
        }
    } else {
        transitionOverlay.innerHTML = '<div class="blood-flow"></div><div class="crack-effect"></div><div class="horror-flash"></div>';
    }
    
    setTimeout(function() {
        overlay.classList.add('hidden');
        overlay.style.opacity = '1';
        
        handleAIResponse(openingContent);
        
        setTimeout(function() {
            transitionOverlay.classList.remove('active');
            transitionOverlay.innerHTML = '';
        }, 1500);
    }, 500);
}

function toggleGameMode() {
    gameMode = gameMode === 'normal' ? 'horror' : 'normal';
    var indicator = document.getElementById('modeIndicator');
    if (indicator) {
        indicator.textContent = gameMode === 'horror' ? '恐怖' : '温和';
        indicator.className = 'mode-indicator ' + gameMode;
    }
    showToast(gameMode === 'horror' ? '💀 已切换到恐怖模式' : '🌙 已切换到温和模式', gameMode === 'horror' ? '#8b0000' : '#4a90a4');
}
