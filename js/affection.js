// ========== 好感度面板 ==========
function toggleAffection() {
    var panel = document.getElementById('affectionPanel');
    panel.classList.toggle('active');
    document.getElementById('menuBtn').style.display = 'flex'; // ★ 修复：无论怎样都确保恢复菜单按钮
}

function renderAffection() {
    var c = document.getElementById('affectionContent'), html = '';
    affectionData.characters.forEach(function(ch) {
        html += '<div class="character-card"><div class="char-header"><div class="char-name">' + ch.name + '</div><div class="char-type">' + ch.type + '</div></div>';
        html += '<div class="affection-bar-container"><div class="affection-label"><span>' + ch.affectionType + '</span><span>' + ch.value + '/100</span></div>';
        html += '<div class="affection-bar"><div class="affection-fill ' + ch.colorClass + '" style="width:' + ch.value + '%"></div></div></div>';
        html += '<div class="stage-info"><div class="stage-title">' + ch.stage + ' · ' + ch.stageName + '</div><div class="stage-desc">' + ch.stageDesc + '</div></div>';
        html += '<div class="abilities">'; ch.abilities.forEach(function(a) { html += '<span class="ability-tag">✦ ' + a + '</span>'; }); html += '</div></div>';
    });
    c.innerHTML = html;
}

// ========== 解析好感度变化 ==========
function parseAffectionChange(content) {
    var match = content.match(/<affection_change>([\s\S]*?)<\/affection_change>/i);
    if (!match) return;

    var text = match[1];
    var regex = /\[好感度\|([^|]+)\|([+-]?\d+)\|([^\]]+)\]/g;
    var m;

    while ((m = regex.exec(text)) !== null) {
        var charName = m[1].trim();
        var changeValue = parseInt(m[2]);
        var reason = m[3].trim();

        var validChars = ['沈砚辞', '炽野', '温辞'];
        if (!validChars.includes(charName)) continue;
        if (isNaN(changeValue) || changeValue < -50 || changeValue > 50) continue;
        if (!reason || reason.length < 2) continue;

        updateAffection(charName, changeValue, reason);
    }
}

// ========== 更新好感度 ==========
function updateAffection(charName, change, reason) {
    var char = affectionData.characters.find(function(c) { return c.name === charName; });
    if (!char) return;

    char.value = Math.max(0, Math.min(100, char.value + change));
    updateStage(char);
    showAffectionToast(charName, change, reason);

    if (document.getElementById('affectionPanel').classList.contains('active')) {
        renderAffection();
    }
}

// ========== 更新阶段 ==========
function updateStage(char) {
    var value = char.value;
    var oldStage = char.stage;

    if (char.name === '沈砚辞') {
        if (value < 30) {
            char.stage = '阶段1'; char.stageName = '警惕期'; char.stageDesc = '仅提供基础逻辑分析'; char.abilities = ['基础逻辑分析'];
        } else if (value < 70) {
            char.stage = '阶段2'; char.stageName = '松动期'; char.stageDesc = '主动分享调查线索，镇邪符5次'; char.abilities = ['基础逻辑分析', '分享线索', '挡伤害'];
        } else {
            char.stage = '阶段3'; char.stageName = '信任期'; char.stageDesc = '坦白童年情谊，古籍解读技能'; char.abilities = ['基础逻辑分析', '分享线索', '挡伤害', '古籍解读'];
        }
    } else if (char.name === '炽野') {
        if (value < 30) {
            char.stage = '阶段1'; char.stageName = '试探期'; char.stageDesc = '言语挑衅'; char.abilities = ['被动保护'];
        } else if (value < 70) {
            char.stage = '阶段2'; char.stageName = '软化期'; char.stageDesc = '不再说反话，主动预警危险'; char.abilities = ['被动保护', '主动预警', '暂停循环2分钟'];
        } else {
            char.stage = '阶段3'; char.stageName = '依赖期'; char.stageDesc = '坦白内心愧疚，残影沟通技能'; char.abilities = ['被动保护', '主动预警', '抵挡致命伤', '残影沟通'];
        }
    } else if (char.name === '温辞') {
        if (value < 30) {
            char.stage = '阶段1'; char.stageName = '陪伴期'; char.stageDesc = '情绪安抚'; char.abilities = ['情绪安抚'];
        } else if (value < 70) {
            char.stage = '阶段2'; char.stageName = '倾诉期'; char.stageDesc = '分享童年记忆，驱散中度残影'; char.abilities = ['情绪安抚', '分享记忆', '驱散残影'];
        } else {
            char.stage = '阶段3'; char.stageName = '托付期'; char.stageDesc = '坦白真实愿望，意识连接技能'; char.abilities = ['情绪安抚', '分享记忆', '压制反噬', '意识连接'];
        }
    }

    if (oldStage !== char.stage) {
        showStageUpToast(char.name, char.stage, char.stageName);
    }
}

// ========== 提示 UI ==========
function showAffectionToast(charName, change, reason) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:20%;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.9);color:#fff;padding:12px 24px;border-radius:8px;z-index:9999;font-size:14px;border:2px solid ' + (change > 0 ? '#4CAF50' : '#f44336') + ';';
    toast.innerHTML = '<div style="color:' + (change > 0 ? '#4CAF50' : '#f44336') + ';font-weight:bold;">' + charName + ' ' + (change > 0 ? '+' : '') + change + '</div><div style="color:#aaa;font-size:12px;margin-top:4px;">' + reason + '</div>';
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(function() { toast.remove(); }, 500);
    }, 2000);
}

function showStageUpToast(charName, stage, stageName) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:30%;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:20px 32px;border-radius:12px;z-index:9999;font-size:16px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.3);';
    toast.innerHTML = '<div style="font-size:20px;margin-bottom:8px;">🎉 关系提升！</div><div><b>' + charName + '</b></div><div style="margin-top:8px;font-size:14px;">' + stage + ' · ' + stageName + '</div>';
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(function() { toast.remove(); }, 500);
    }, 3000);
}
