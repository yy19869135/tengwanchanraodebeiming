// ========== 时间系统（支持副本倒计时 + 正常时间）==========
var timeSystem = {
    mode: 'countdown',  // 'countdown' = 副本倒计时, 'normal' = 正常时间
    countdownSeconds: 12 * 60 * 60 - 4,  // 副本倒计时（秒）
    normalTime: { year: 2024, month: 10, day: 16, hour: 9, minute: 0, second: 0 },
    intervalId: null,
    
    init: function() {
        var self = this;
        if (this.intervalId) clearInterval(this.intervalId);
        
        this.intervalId = setInterval(function() {
            if (self.mode === 'countdown') {
                if (self.countdownSeconds > 0) self.countdownSeconds--;
            } else {
                self.normalTime.second = (self.normalTime.second || 0) + 1;
                if (self.normalTime.second >= 60) {
                    self.normalTime.second = 0;
                    self.normalTime.minute = (self.normalTime.minute || 0) + 1;
                    if (self.normalTime.minute >= 60) {
                        self.normalTime.minute = 0;
                        self.normalTime.hour = (self.normalTime.hour || 0) + 1;
                        if (self.normalTime.hour >= 24) {
                            self.normalTime.hour = 0;
                            self.normalTime.day = (self.normalTime.day || 1) + 1;
                        }
                    }
                }
            }
            self.updateDisplay();
        }, 1000);
        this.updateDisplay();
    },
    
    updateDisplay: function() {
        var timeEl = document.getElementById('countdownTime');
        var labelEl = document.querySelector('.countdown-label');
        var boxEl = document.querySelector('.countdown-box');
        
        if (!timeEl) return;
        
        if (this.mode === 'countdown') {
            if (labelEl) labelEl.textContent = '剩余时间';
            if (boxEl) boxEl.style.borderColor = '#8b0000';
            timeEl.style.color = '#ff4444';
            
            var h = Math.floor(this.countdownSeconds / 3600);
            var m = Math.floor((this.countdownSeconds % 3600) / 60);
            var s = this.countdownSeconds % 60;
            timeEl.textContent = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        } else {
            if (labelEl) labelEl.textContent = '当前时间';
            if (boxEl) boxEl.style.borderColor = '#4a90a4';
            timeEl.style.color = '#7eb8da';
            
            var hour = this.normalTime.hour || 0;
            var minute = this.normalTime.minute || 0;
            var second = this.normalTime.second || 0;
            
            var hStr = hour < 10 ? '0' + hour : '' + hour;
            var mStr = minute < 10 ? '0' + minute : '' + minute;
            var sStr = second < 10 ? '0' + second : '' + second;
            
            timeEl.textContent = hStr + ':' + mStr + ':' + sStr;
        }
    },
    
    switchToNormalMode: function(time) {
        this.mode = 'normal';
        if (time) {
            this.normalTime = {
                year: time.year || 2024, month: time.month || 10, day: time.day || 16,
                hour: time.hour || 9, minute: time.minute || 0, second: time.second || 0
            };
        } else {
            this.normalTime.second = 0;
        }
        this.updateDisplay();
    },
    
    switchToCountdownMode: function() {
        this.mode = 'countdown';
        this.updateDisplay();
    },
    
    setTime: function(hour, minute) {
        if (this.mode !== 'normal') return;
        this.normalTime.hour = hour || 0;
        this.normalTime.minute = minute || 0;
        this.normalTime.second = 0;
        this.updateDisplay();
    },
    
    advanceTime: function(minutes) {
        if (this.mode !== 'normal') return;
        var totalMinutes = (this.normalTime.hour || 0) * 60 + (this.normalTime.minute || 0) + minutes;
        while (totalMinutes >= 24 * 60) {
            totalMinutes -= 24 * 60;
            this.normalTime.day = (this.normalTime.day || 1) + 1;
        }
        while (totalMinutes < 0) {
            totalMinutes += 24 * 60;
            this.normalTime.day = (this.normalTime.day || 1) - 1;
        }
        this.normalTime.hour = Math.floor(totalMinutes / 60);
        this.normalTime.minute = totalMinutes % 60;
        this.normalTime.second = 0;
        this.updateDisplay();
    },
    
    reset: function() {
        this.mode = 'countdown';
        this.countdownSeconds = 12 * 60 * 60 - 4;
        this.normalTime = { year: 2024, month: 10, day: 16, hour: 9, minute: 0, second: 0 };
        this.updateDisplay();
    }
};

// 兼容旧代码
var countdownSeconds = timeSystem.countdownSeconds;
function updateCountdown() {
    timeSystem.updateDisplay();
}

// ========== 副本/HE结局视觉模式切换 ==========
var currentVisualMode = 'dungeon'; // 'dungeon' = 副本暗色, 'normal' = 正常亮度

function enterDungeonVisualMode() {
    if (currentVisualMode === 'dungeon') return;
    currentVisualMode = 'dungeon';
    
    var bg = document.getElementById('bgImage');
    if (bg) {
        bg.style.transition = 'filter 1s ease-out';
        bg.style.filter = 'brightness(0.7) contrast(1.1) saturate(0.8)';
    }
    var atmosphereLayer = document.querySelector('.atmosphere-layer');
    if (atmosphereLayer) {
        atmosphereLayer.style.transition = 'opacity 1s ease-out';
        atmosphereLayer.style.opacity = '1';
    }
    document.querySelectorAll('.blood-drop-anim').forEach(function(drop) {
        drop.style.display = 'block';
    });
    
    var countdownBox = document.querySelector('.countdown-box');
    if (countdownBox) countdownBox.style.borderColor = '#8b0000';
    var countdownTime = document.getElementById('countdownTime');
    if (countdownTime) countdownTime.style.color = '#ff4444';
}

function exitDungeonVisualMode() {
    if (currentVisualMode === 'normal') return;
    currentVisualMode = 'normal';
    
    var bg = document.getElementById('bgImage');
    if (bg) {
        bg.style.transition = 'filter 1.5s ease-out';
        bg.style.filter = 'brightness(1) contrast(1) saturate(1)';
    }
    
    var atmosphereLayer = document.querySelector('.atmosphere-layer');
    if (atmosphereLayer) {
        atmosphereLayer.style.transition = 'opacity 1.5s ease-out';
        atmosphereLayer.style.opacity = '0';
    }
    
    document.querySelectorAll('.blood-drop-anim').forEach(function(drop) {
        drop.style.display = 'none';
    });
    
    var dialogueBloodBox = document.querySelector('.blood-drip-box');
    if (dialogueBloodBox) {
        dialogueBloodBox.style.transition = 'opacity 1s ease-out';
        dialogueBloodBox.style.opacity = '0';
    }
    
    var countdownBox = document.querySelector('.countdown-box');
    if (countdownBox) {
        countdownBox.style.transition = 'border-color 0.5s ease-out';
        countdownBox.style.borderColor = '#4a90a4';
    }
    var countdownTime = document.getElementById('countdownTime');
    if (countdownTime) {
        countdownTime.style.transition = 'color 0.5s ease-out';
        countdownTime.style.color = '#7eb8da';
    }
    var countdownLabel = document.querySelector('.countdown-label');
    if (countdownLabel) countdownLabel.textContent = '当前时间';
    
    showModeTransitionToast();
}

function showModeTransitionToast() {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,rgba(74,144,164,0.95),rgba(45,106,122,0.95));color:#fff;padding:20px 40px;border-radius:12px;z-index:9999;font-size:16px;text-align:center;box-shadow:0 4px 20px rgba(74,144,164,0.5);border:2px solid #7eb8da;';
    toast.innerHTML = '<div style="font-size:32px;margin-bottom:12px;">🌅</div><div style="font-weight:bold;">离开记忆副本</div><div style="margin-top:8px;font-size:13px;opacity:0.9;">阳光洒落，世界恢复了色彩...</div>';
    document.body.appendChild(toast);
    
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s ease-out';
    setTimeout(function() { toast.style.opacity = '1'; }, 50);
    
    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() { toast.remove(); }, 500);
    }, 3000);
}

function resetVisualMode() {
    currentVisualMode = 'dungeon';
    var bg = document.getElementById('bgImage');
    if (bg) bg.style.filter = 'brightness(0.7) contrast(1.1) saturate(0.8)';
    var atmosphereLayer = document.querySelector('.atmosphere-layer');
    if (atmosphereLayer) atmosphereLayer.style.opacity = '1';
    document.querySelectorAll('.blood-drop-anim').forEach(function(d) { d.style.display = 'block'; });
    var dialogueBloodBox = document.querySelector('.blood-drip-box');
    if (dialogueBloodBox) dialogueBloodBox.style.opacity = '1';
}
