// ========== 恐怖特效 ==========
function enableHorrorFlicker() {
    if (gameMode !== 'horror') return;
    document.getElementById('dialogueBox').classList.add('horror-flicker');
}
function disableHorrorFlicker() {
    document.getElementById('dialogueBox').classList.remove('horror-flicker');
}
function enableHorrorShake() {
    if (gameMode !== 'horror') return;
    document.getElementById('dialogueBox').classList.add('horror-shake');
}
function disableHorrorShake() {
    document.getElementById('dialogueBox').classList.remove('horror-shake');
}
function enableHorrorPulse() {
    document.getElementById('dialogueBox').classList.add('horror-pulse');
}
function disableAllHorrorEffects() {
    var dialogueBox = document.getElementById('dialogueBox');
    dialogueBox.classList.remove('horror-flicker', 'horror-shake', 'horror-pulse');
}

// ========== Jump Scare 系统 ==========
var jumpscareShown = {};
var isJumpscareActive = false;

var scaryTexts = {
    stepmother: ['修裕...不，是你...', '你为什么不听话！', '都是你的错...', '我要打死你！', '你不该存在...'],
    children: ['一起玩吧...', '别走...', '永远陪我们', '你是我们的了'],
    hand: ['抓住你了', '别动...', '跟我来', '你的了'],
    mirror: ['看着我...', '你就是我...', '别走...我在等你', '3:17...你来了', '镜中的你...是真的吗？', '一起留下来...'],
    doll: ['救救我...', '为什么不看我...', '我在这里...', '别丢下我...', '我好痛...', '3:17...'],
    graffiti: ['救救我', '不要进来', '3:17', '他们来了...', '快跑...', '别回头...'],
    finale: ['不要唤醒他...', '让他睡...', '你会毁了他...', '3:17...死期...', '我们都在看着你...', '这就是结局...']
};

function triggerJumpscare(type) {
    if (gameMode !== 'horror') return;
    if (jumpscareShown[type]) return;
    
    jumpscareShown[type] = true;
    isJumpscareActive = true;
    
    var overlay = document.getElementById('jumpscareOverlay');
    var blackout = document.getElementById('jumpscareBlackout');
    var dismiss = document.getElementById('jumpscareDismiss');
    var blood = document.getElementById('jumpscareBlood');
    var scaryText = document.getElementById('jumpscareText');
    
    document.getElementById('jumpscareStepmother').classList.remove('active');
    document.getElementById('jumpscareChildren').classList.remove('active');
    document.getElementById('jumpscareHand').classList.remove('active');
    document.getElementById('jumpscareMirror').classList.remove('active');
    document.getElementById('jumpscareDoll').classList.remove('active');
    document.getElementById('jumpscareGraffiti').classList.remove('active');
    document.getElementById('jumpscareFinale').classList.remove('active');
    blackout.classList.remove('darken');
    
    if (blood) { blood.classList.remove('active'); blood.style.display = 'none'; }
    if (scaryText) { scaryText.classList.remove('active'); scaryText.style.display = 'none'; }
    
    var texts = scaryTexts[type];
    var randomText = texts[Math.floor(Math.random() * texts.length)];
    
    switch(type) {
        case 'stepmother':
            overlay.classList.add('active');
            document.getElementById('jumpscareStepmother').classList.add('active');
            setTimeout(function() { if (scaryText) { scaryText.textContent = randomText; scaryText.style.display = 'block'; scaryText.classList.add('active'); } }, 300);
            break;
        case 'children':
            overlay.classList.add('active');
            document.getElementById('jumpscareChildren').classList.add('active');
            setTimeout(function() { if (scaryText) { scaryText.textContent = randomText; scaryText.style.display = 'block'; scaryText.classList.add('active'); } }, 300);
            break;
        case 'hand':
            overlay.classList.add('active');
            document.getElementById('jumpscareHand').classList.add('active');
            setTimeout(function() { if (scaryText) { scaryText.textContent = randomText; scaryText.style.display = 'block'; scaryText.classList.add('active'); } }, 300);
            break;
        case 'mirror':
            overlay.classList.add('active');
            overlay.classList.add('mirror-active');
            document.getElementById('jumpscareMirror').classList.add('active');
            setTimeout(function() { if (scaryText) { scaryText.textContent = randomText; scaryText.style.display = 'block'; scaryText.style.top = '8%'; scaryText.classList.add('active'); } }, 300);
            break;
        case 'doll':
            overlay.classList.add('active');
            document.getElementById('jumpscareDoll').classList.add('active');
            setTimeout(function() { if (scaryText) { scaryText.textContent = randomText; scaryText.style.display = 'block'; scaryText.style.top = '12%'; scaryText.classList.add('active'); } }, 300);
            break;
        case 'graffiti':
            overlay.classList.add('active');
            document.getElementById('jumpscareGraffiti').classList.add('active');
            setTimeout(function() { if (scaryText) { scaryText.textContent = randomText; scaryText.style.display = 'block'; scaryText.style.top = '8%'; scaryText.style.color = '#ff0000'; scaryText.classList.add('active'); } }, 300);
            break;
        case 'finale':
            overlay.classList.add('active');
            if (blackout) { blackout.style.backgroundColor = '#000'; blackout.style.transition = 'opacity 0.5s ease-out'; blackout.style.opacity = '1'; }
            setTimeout(function() {
                document.getElementById('jumpscareFinale').classList.add('active');
                if (blackout) { blackout.style.backgroundColor = '#2a0000'; blackout.style.transition = 'opacity 0.8s ease-out'; blackout.style.opacity = '0.6'; }
            }, 500);
            setTimeout(function() {
                if (scaryText) { scaryText.textContent = randomText; scaryText.style.display = 'block'; scaryText.style.fontSize = '36px'; scaryText.style.top = '35%'; scaryText.style.color = '#ff0000'; scaryText.style.textShadow = '0 0 20px #ff0000, 0 0 40px #8b0000'; scaryText.classList.add('active'); }
            }, 1000);
            setTimeout(function() { if (blood) { blood.style.display = 'block'; blood.classList.add('active'); } }, 1500);
            break;
    }
    
    dismiss.style.display = 'none';
    setTimeout(function() { dismiss.style.display = 'block'; }, 500);
    setTimeout(function() { dismissJumpscare(); }, 1000);
}

function dismissJumpscare() {
    if (!isJumpscareActive) return;
    isJumpscareActive = false;
    
    var overlay = document.getElementById('jumpscareOverlay');
    var afterimage = document.getElementById('jumpscareAfterimage');
    var activeImage = document.querySelector('.jumpscare-image.active');
    
    if (activeImage && afterimage) {
        afterimage.src = activeImage.src;
        afterimage.style.display = 'block';
        afterimage.classList.add('active');
        setTimeout(function() { afterimage.style.display = 'none'; afterimage.classList.remove('active'); }, 3000);
    }
    
    overlay.style.transition = 'opacity 0.5s ease-out';
    overlay.style.opacity = '0';
    
    setTimeout(function() {
        overlay.classList.remove('active', 'mirror-active');
        overlay.style.opacity = ''; overlay.style.transition = '';
        document.getElementById('jumpscareStepmother').classList.remove('active');
        document.getElementById('jumpscareChildren').classList.remove('active');
        document.getElementById('jumpscareHand').classList.remove('active');
        document.getElementById('jumpscareMirror').classList.remove('active');
        document.getElementById('jumpscareDoll').classList.remove('active');
        document.getElementById('jumpscareGraffiti').classList.remove('active');
        
        var blackout = document.getElementById('jumpscareBlackout');
        if (blackout) blackout.classList.remove('darken');
        var dismiss = document.getElementById('jumpscareDismiss');
        if (dismiss) dismiss.style.display = 'none';
        var scaryText = document.getElementById('jumpscareText');
        if (scaryText) { scaryText.classList.remove('active'); scaryText.style.display = 'none'; }
        var blood = document.getElementById('jumpscareBlood');
        if (blood) { blood.classList.remove('active'); blood.style.display = 'none'; }
        
        var container = document.getElementById('gameContainer');
        container.classList.remove('screen-darken', 'distort-effect');
    }, 500);
}

function checkJumpscareForCurrentLine(lineContent) {
    if (!lineContent) return;
    var scene = '';
    if (lastAIResponse) {
        var sceneMatch = lastAIResponse.match(/\[场景\|([^\]]+)\]/);
        if (sceneMatch) scene = sceneMatch[1];
    }
    
    if (scene.indexOf('客厅') !== -1 || scene.indexOf('一楼') !== -1 || scene.indexOf('一层') !== -1 || scene.indexOf('家暴') !== -1) {
        var stepmotherKeywords = ['继母举起', '鸡毛掸子', '继母怒骂', '家暴片段', '继母的身影', '旗袍', '继母手持', '继母每次', '继母因', '继母联合', '煤油灯熄灭', '旗袍摩擦声', '身后有人', '温热呼吸', '转身却空无一人', '后背剧烈', '后背抽痛', '尖利的怒骂', '压抑的哭声', '情绪不受控', '陷入绝望', '修裕'];
        for (var i = 0; i < stepmotherKeywords.length; i++) {
            if (lineContent.indexOf(stepmotherKeywords[i]) !== -1) { setTimeout(function() { triggerJumpscare('stepmother'); }, 500); return; }
        }
    }
    
    if (scene.indexOf('教室') !== -1 || scene.indexOf('二楼') !== -1 || scene.indexOf('二层') !== -1) {
        var childrenKeywords = ['嘻嘻嘻', '窃笑', '嘲笑', '孩童', '课桌突然', '灰尘飞扬', '黑板上的字', '异类', '你看她', '真奇怪', '嘲讽声', '窃笑声'];
        for (var j = 0; j < childrenKeywords.length; j++) {
            if (lineContent.indexOf(childrenKeywords[j]) !== -1) { setTimeout(function() { triggerJumpscare('children'); }, 500); return; }
        }
    }
    
    if (scene.indexOf('停尸') !== -1 || scene.indexOf('病床') !== -1 || scene.indexOf('三楼') !== -1 || scene.indexOf('三层') !== -1) {
        var handKeywords = ['床单掀开', '床单掀起', '掀起了一角', '掀开了一角', '伸出一只手', '露出一只', '苍白的手', '苍白得', '毫无血色', '抓住', '冰冷的触感', '手指', '攥住', '拽住', '骨节分明', '一只手', '那只手', '病床突然'];
        for (var k = 0; k < handKeywords.length; k++) {
            if (lineContent.indexOf(handKeywords[k]) !== -1) { setTimeout(function() { triggerJumpscare('hand'); }, 500); return; }
        }
    }
    
    if (scene.indexOf('婚房') !== -1 || scene.indexOf('四楼') !== -1 || scene.indexOf('四层') !== -1) {
        var mirrorKeywords = ['镜子里', '镜中', '倒影', '铜镜', '镜面', '看着你', '注视', '镜子突然', '倒影变成', '镜中出现'];
        for (var m = 0; m < mirrorKeywords.length; m++) {
            if (lineContent.indexOf(mirrorKeywords[m]) !== -1) { setTimeout(function() { triggerJumpscare('mirror'); }, 500); return; }
        }
    }
    
    if (scene.indexOf('阁楼') !== -1 || scene.indexOf('六楼') !== -1 || scene.indexOf('六层') !== -1) {
        var dollKeywords = ['血泪', '流出血', '渗出血', '眼睛流血', '红色液体', '眼睛睁开', '睁开了眼', '睁开眼睛', '缝住的眼睛睁开', '丝线断裂', '丝线崩断', '眼睛睁', '睁开了', '娃娃动了', '娃娃突然', '娃娃的眼睛', '布娃娃的眼', '娃娃看着', '娃娃盯着', '娃娃的脸', '渗出红色', '肮脏的脸', '布娃娃', '娃娃肮脏', '顺着娃娃', '滴在摇篮'];
        for (var dd = 0; dd < dollKeywords.length; dd++) {
            if (lineContent.indexOf(dollKeywords[dd]) !== -1) { setTimeout(function() { triggerJumpscare('doll'); }, 500); return; }
        }
        var graffitiKeywords = ['涂鸦', '救救我', '不要进来', '墙上的字', '墙壁上的字', '红色的字', '血字', '墙上写着'];
        for (var gg = 0; gg < graffitiKeywords.length; gg++) {
            if (lineContent.indexOf(graffitiKeywords[gg]) !== -1) { setTimeout(function() { triggerJumpscare('graffiti'); }, 500); return; }
        }
    }
    
    if (scene.indexOf('卧室') !== -1 || scene.indexOf('七楼') !== -1 || scene.indexOf('七层') !== -1 || scene.indexOf('终局') !== -1) {
        var hasCanying = lineContent.indexOf('残影') !== -1;
        var hasAppear = lineContent.indexOf('渗透') !== -1 || lineContent.indexOf('涌出') !== -1 || lineContent.indexOf('从墙壁') !== -1 || lineContent.indexOf('出现了') !== -1 || lineContent.indexOf('围过来') !== -1 || lineContent.indexOf('逼近') !== -1;
        if (hasCanying && hasAppear) { setTimeout(function() { triggerJumpscare('finale'); }, 500); return; }
        
        var finaleKeywords = ['满脸怨毒的继母、窃笑的霸凌孩童', '窃笑的霸凌孩童、流着血泪', '流着血泪的景玥、面目模糊', '无数记忆残影从墙壁中渗透', '残影从墙壁中渗透出来', '它们全都围了过来', '黑影从四面八方涌来', '所有残影同时发出', '你会毁了他', '让他永远沉睡', '不要唤醒他'];
        for (var f = 0; f < finaleKeywords.length; f++) {
            if (lineContent.indexOf(finaleKeywords[f]) !== -1) { setTimeout(function() { triggerJumpscare('finale'); }, 500); return; }
        }
    }
}

function checkJumpscareFromContent(content, scene) {
    // 该内容已由 checkJumpscareForCurrentLine 按句处理，保留此空函数供向下兼容
}

// ========== 铃铛系统 ==========
var bellShown = {};
var isBellActive = false;

function triggerBell(text) {
    if (isBellActive) return;
    isBellActive = true;
    
    var overlay = document.getElementById('bellOverlay');
    var bellImage = document.getElementById('bellImage');
    var bellText = document.getElementById('bellText');
    
    bellText.textContent = text || '铃声清脆，回荡在洋楼之中...';
    overlay.classList.add('active');
    bellImage.classList.add('ringing');
    
    createBellParticles();
    if (typeof playSound === 'function') playSound('clock', 0.4);
}

function createBellParticles() {
    var container = document.querySelector('.bell-container');
    if (!container) return;
    for (var i = 0; i < 12; i++) {
        setTimeout(function() {
            var particle = document.createElement('div');
            particle.className = 'bell-particle';
            var angle = Math.random() * Math.PI * 2;
            var distance = 50 + Math.random() * 80;
            particle.style.setProperty('--tx', (Math.cos(angle) * distance) + 'px');
            particle.style.setProperty('--ty', (Math.sin(angle) * distance) + 'px');
            particle.style.left = '60px'; particle.style.top = '60px';
            container.appendChild(particle);
            setTimeout(function() { particle.remove(); }, 1000);
        }, i * 100);
    }
}

function dismissBell() {
    if (!isBellActive) return;
    isBellActive = false;
    var overlay = document.getElementById('bellOverlay');
    var bellImage = document.getElementById('bellImage');
    overlay.style.transition = 'opacity 0.5s ease-out';
    overlay.style.opacity = '0';
    setTimeout(function() {
        overlay.classList.remove('active');
        overlay.style.opacity = '';
        overlay.style.transition = '';
        bellImage.classList.remove('ringing');
    }, 500);
}

function checkBellForCurrentLine(lineContent) {
    if (!lineContent) return;
    var bellKeywords = ['摇响铃铛', '摇响铜铃', '摇响了铃铛', '摇响了铜铃', '铃铛响了', '铜铃响了', '铃铛响起', '铜铃响起', '叮铃', '叮——', '叮—', '铃声响起', '你摇响', '摇晃铃铛', '摇晃铜铃', '铃铛发出清脆', '铜铃发出清脆', '铃铛的声音响起', '铜铃的声音响起', '铃声回荡', '铃声穿透', '铃声传来'];
    for (var i = 0; i < bellKeywords.length; i++) {
        if (lineContent.indexOf(bellKeywords[i]) !== -1) {
            var bellText = getBellTextFromLine(lineContent);
            setTimeout(function() { triggerBell(bellText); }, 300);
            return;
        }
    }
}

function getBellTextFromLine(lineContent) {
    if (lineContent.indexOf('唤醒') !== -1) return '铃声穿透迷雾，唤醒沉睡的记忆...';
    if (lineContent.indexOf('守护') !== -1) return '守护的铃声，温柔而坚定...';
    if (lineContent.indexOf('眼睫') !== -1 || lineContent.indexOf('颤动') !== -1) return '铃声回荡，林晏清的眼睫微微颤动...';
    if (lineContent.indexOf('清脆') !== -1) return '清脆的铃声，驱散了周围的阴霾...';
    if (lineContent.indexOf('回荡') !== -1) return '铃声回荡在洋楼之中，余音袅袅...';
    if (lineContent.indexOf('叮') !== -1) return '叮——铃声清越，如破晓之光...';
    return '铃声清越，回荡在洋楼之中...';
}

function resetBellState() {
    bellShown = {};
    isBellActive = false;
    dismissBell();
}

function resetJumpscareState() {
    jumpscareShown = {};
    isJumpscareActive = false;
    dismissJumpscare();
}
