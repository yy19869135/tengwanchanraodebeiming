// ========== 音效系统（带调试） ==========
var soundEffects = {
    door: null,
    footstep: null,
    clock: null
};
var soundEnabled = true;
var soundUnlocked = false;
var soundUrls = {
    door: 'https://cdn.mujian.me/sounds/kms.mp3',
    footstep: 'https://cdn.mujian.me/sounds/jbs.mp3',
    clock: 'https://cdn.mujian.me/sounds/zbs.mp3'
};

// 预加载音效
function preloadSounds() {
    Object.keys(soundUrls).forEach(function(key) {
        var audio = new Audio();
        audio.addEventListener('canplaythrough', function() {
            console.log('✓ 音效加载成功:', key);
        });
        audio.addEventListener('error', function(e) {
            console.error('✗ 音效加载失败:', key, soundUrls[key]);
        });
        audio.src = soundUrls[key];
        audio.volume = 0.5;
        audio.load();
        soundEffects[key] = audio;
    });
    console.log('音效预加载开始...');
}

// 解锁音频
function unlockAudio() {
    if (soundUnlocked) return;
    console.log('尝试解锁音频...');
    Object.keys(soundEffects).forEach(function(key) {
        var sound = soundEffects[key];
        if (!sound) return;
        var originalVolume = sound.volume;
        sound.volume = 0;
        var playPromise = sound.play();
        if (playPromise !== undefined) {
            playPromise.then(function() {
                sound.pause();
                sound.currentTime = 0;
                sound.volume = originalVolume;
                console.log('  ✓ 解锁成功:', key);
            }).catch(function(e) {
                console.log('  ✗ 解锁失败:', key, e.message);
            });
        }
    });
    soundUnlocked = true;
}

// 播放音效
function playSound(soundName, volume) {
    if (!soundEnabled) return;
    var sound = soundEffects[soundName];
    if (!sound) return;
    
    sound.currentTime = 0;
    sound.volume = volume || 0.5;
    var playPromise = sound.play();
    if (playPromise !== undefined) {
        playPromise.catch(function(e) {
            console.log('  ✗ 播放失败:', soundName, e.message);
        });
    }
}

// 停止音效
function stopSound(soundName) {
    var sound = soundEffects[soundName];
    if (sound) {
        sound.pause();
        sound.currentTime = 0;
    }
}

// 循环播放
function loopSound(soundName, volume) {
    if (!soundEnabled) return;
    var sound = soundEffects[soundName];
    if (sound) {
        sound.loop = true;
        sound.volume = volume || 0.3;
        sound.play().catch(function(e) {
            console.log('循环音效播放失败:', soundName, e.message);
        });
    }
}

// 停止循环
function stopLoopSound(soundName) {
    var sound = soundEffects[soundName];
    if (sound) {
        sound.loop = false;
        sound.pause();
        sound.currentTime = 0;
    }
}

// 根据内容自动播放音效
function autoPlaySoundByContent(content, scene) {
    console.log('=== 自动音效检测 ===');
    
    var doorKeywords = ['推开门', '打开门', '开门', '门开了', '推门', '敲门', '门缓缓', '大门打开', '推开大门', '门吱呀', '打开房门'];
    var doorTriggered = false;
    for (var i = 0; i < doorKeywords.length; i++) {
        if (content.indexOf(doorKeywords[i]) !== -1) {
            playSound('door', 0.6);
            doorTriggered = true;
            break;
        }
    }
    
    var footstepKeywords = ['走进', '走入', '走向', '走到', '脚步', '踏入', '迈步', '迈入', '走廊', '楼梯', '上楼', '下楼', '步入', '跨入'];
    for (var j = 0; j < footstepKeywords.length; j++) {
        if (content.indexOf(footstepKeywords[j]) !== -1) {
            setTimeout(function() { playSound('footstep', 0.4); }, 500);
            break;
        }
    }
    
    var clockKeywords = ['钟', '时间', '滴答', '钟摆', '钟声', '时钟', '挂钟'];
    for (var k = 0; k < clockKeywords.length; k++) {
        if (content.indexOf(clockKeywords[k]) !== -1) {
            playSound('clock', 0.5);
            break;
        }
    }
    
    if (scene) {
        if (scene.indexOf('大厅') !== -1 || scene.indexOf('客厅') !== -1) {
            loopSound('clock', 0.2);
        } else {
            stopLoopSound('clock');
        }
    }
}
