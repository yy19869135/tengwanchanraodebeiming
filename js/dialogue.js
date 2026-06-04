// ========== 角色颜色切换 ==========
function setCharacterStyle(characterName) {
    var nameBox = document.getElementById('nameBox');
    nameBox.classList.remove('char-shen', 'char-chi', 'char-wen', 'char-uncle', 'char-ghost', 'char-stepmother', 'char-system', 'user-name');
    
    if (characterName === '沈砚辞') nameBox.classList.add('char-shen');
    else if (characterName === '炽野') nameBox.classList.add('char-chi');
    else if (characterName === '温辞') nameBox.classList.add('char-wen');
    else if (characterName === '二叔' || characterName === '叔叔') nameBox.classList.add('char-uncle');
    else if (characterName === '继母' || characterName === '母亲') nameBox.classList.add('char-stepmother');
    else if (characterName === '???' || characterName === '鬼魂' || characterName === '诡异声音' || characterName === '未知') nameBox.classList.add('char-ghost');
    else if (characterName === '系统' || characterName === '提示') nameBox.classList.add('char-system');
}

// ========== 处理AI回复 ==========
function handleAIResponse(content) {
    lastAIResponse = content;
    extractStoryFromResponse(content);
    checkTruthRevealed(content);
    parseAffectionChange(content);
    parseTimeFromAIResponse(content);
    
    var data = parseXML(content);
    autoPlaySoundByContent(content, data.scene.location);
    
    // 如果没有解析到内容，尝试提取纯文本
    if (data.contentBlocks.length === 0) {
        var cleanText = content.replace(/<[^>]+>/g, '').replace(/\[选项\|[^\]]+\]/g, '').replace(/\[场景\|[^\]]+\]/g, '').replace(/\[时间\|[^\]]+\]/g, '').replace(/\[氛围\|[^\]]+\]/g, '').replace(/\s+/g, ' ').trim();
        if (cleanText.length > 10) {
            data.contentBlocks.push({ type: 'narration', speaker: null, content: cleanText.substring(0, 500) });
        }
    }

    // 备用选项补充
    if (data.choices.length === 0) {
        var scene = data.scene.location || '';
        var hasDialogue = data.contentBlocks.some(function(b) { return b.type === 'dialogue'; });
        if (hasDialogue) data.choices = ['继续听他说', '询问更多细节', '环顾四周', '保持沉默'];
        else if (scene.indexOf('走廊') !== -1 || scene.indexOf('楼梯') !== -1) data.choices = ['继续向前走', '检查周围的门', '仔细聆听声音', '原路返回'];
        else if (scene.indexOf('门') !== -1) data.choices = ['推开门进去', '敲门试探', '透过门缝观察', '离开这里'];
        else data.choices = ['仔细观察周围', '寻找线索', '继续前进', '等待观察'];
    }

    if (data.contentBlocks.length > 0 || data.choices.length > 0) {
        renderPage(data);
    } else {
        dialogueLines = ['（系统提示：AI回复格式异常，请重试）'];
        dialogueTypes = ['narration'];
        dialogueSpeakers = [null];
        currentDialogueIndex = 0;
        currentChoices = ['重新尝试', '继续探索'];
        document.getElementById('nameBox').style.display = 'none';
        document.getElementById('charSprite').style.display = 'none';
        typeWriter(document.getElementById('dialogueText'), dialogueLines[0]);
        document.getElementById('continueHint').textContent = '已读完';
        setTimeout(function() { renderChoices(currentChoices); }, 500);
    }
}

// ========== 解析时间与结局场景 ==========
function parseTimeFromAIResponse(content) {
    var heSceneKeywords = ['海边', '沙滩', '海滩', '海', '冲浪', '海边日落', '海边小屋', '沙滩日出', '海浪', '海岸', '花店', '茉莉', '花园', '花房', '鲜花', '城市街头', '街道', '公园', '古籍馆', '书店', '江南', '水乡', '苏州', '园林', '黄山', '敦煌', '丽江', '临湖小院', '图书馆', '温馨洋楼', '阳光洋楼', '重生洋楼', '记忆疗愈馆', '洋楼庭院', '疗愈馆', '清晨', '早晨', '阳光', '温暖', '现实', '医院', '病房', '苏醒', '醒来', '咖啡厅', '餐厅', '家中', '公寓', '客厅', '卧室阳光', '窗外阳光', '雨后', '晴天', '蓝天', '白云', '微风'];
    var dungeonKeywords = ['洋楼门前', '洋楼大厅', '大厅', '客厅', '走廊', '楼梯', '家暴', '教室', '停尸', '婚房', '书房', '阁楼', '卧室', '地下室', '血迹', '诡异', '恐怖', '阴森', '黑暗', '凌晨3', '3:17', '午夜', '深夜'];
    
    var sceneMatch = content.match(/\[场景\|([^\]]+)\]/);
    var timeMatch = content.match(/\[时间\|([^\]]+)\]/);
    var moodMatch = content.match(/\[氛围\|([^\]]+)\]/);
    
    var currentScene = (sceneMatch ? sceneMatch[1] : '') || '';
    var currentTime = (timeMatch ? timeMatch[1] : '') || '';
    var currentMood = (moodMatch ? moodMatch[1] : '') || '';
    
    var isHEScene = false;
    var isDungeonScene = false;
    
    for (var i = 0; i < heSceneKeywords.length; i++) {
        if (currentScene.indexOf(heSceneKeywords[i]) !== -1) { isHEScene = true; break; }
    }
    for (var j = 0; j < dungeonKeywords.length; j++) {
        if (currentScene.indexOf(dungeonKeywords[j]) !== -1 || currentTime.indexOf(dungeonKeywords[j]) !== -1) { isDungeonScene = true; break; }
    }
    var positiveAtmosphere = ['温馨', '幸福', '温暖', '平静', '安宁', '甜蜜', '浪漫', '轻松', '愉快', '明媚', '温存'];
    for (var k = 0; k < positiveAtmosphere.length; k++) {
        if (currentMood.indexOf(positiveAtmosphere[k]) !== -1) { isHEScene = true; break; }
    }
    var normalTimePatterns = ['上午', '下午', '早上', '中午', '傍晚', '晚上', '清晨', '黄昏'];
    for (var m = 0; m < normalTimePatterns.length; m++) {
        if (currentTime.indexOf(normalTimePatterns[m]) !== -1 && currentTime.indexOf('3:17') === -1 && currentTime.indexOf('凌晨') === -1) {
            if (!isDungeonScene) isHEScene = true;
            break;
        }
    }
    
    if (isHEScene && !isDungeonScene) {
        if (timeSystem.mode === 'countdown') {
            var initialTime = { hour: 9, minute: 0 };
            if (currentTime) {
                var parsed = parseTimeString(currentTime);
                if (parsed) initialTime = parsed;
            }
            timeSystem.switchToNormalMode({ year: 2024, month: 10, day: 16, hour: initialTime.hour, minute: initialTime.minute });
            exitDungeonVisualMode();
        }
    } else if (isDungeonScene && !isHEScene) {
        if (timeSystem.mode === 'normal') {
            timeSystem.switchToCountdownMode();
            enterDungeonVisualMode();
        }
    }
    
    if (timeSystem.mode === 'normal' && currentTime) {
        var parsedTime = parseTimeString(currentTime);
        if (parsedTime) timeSystem.setTime(parsedTime.hour, parsedTime.minute);
        
        if (content.indexOf('一小时后') !== -1 || content.indexOf('1小时后') !== -1) timeSystem.advanceTime(60);
        else if (content.indexOf('半小时后') !== -1 || content.indexOf('30分钟后') !== -1) timeSystem.advanceTime(30);
        else if (content.indexOf('几分钟后') !== -1) timeSystem.advanceTime(5);
        else if (content.indexOf('第二天') !== -1 || content.indexOf('次日') !== -1) {
            timeSystem.normalTime.day++;
            timeSystem.setTime(8, 0);
        }
    }
}

function parseTimeString(str) {
    var match1 = str.match(/(\d{1,2}):(\d{2})/);
    if (match1) return { hour: parseInt(match1[1]), minute: parseInt(match1[2]) };
    
    var match2 = str.match(/(上午|下午|晚上|早上|中午|凌晨)?(\d{1,2})点(半|(\d{1,2})分)?/);
    if (match2) {
        var hour = parseInt(match2[2]), minute = 0;
        if (match2[3] === '半') minute = 30;
        else if (match2[4]) minute = parseInt(match2[4]);
        
        var period = match2[1];
        if ((period === '下午' || period === '晚上') && hour < 12) hour += 12;
        return { hour: hour, minute: minute };
    }
    
    if (str.indexOf('清晨') !== -1) return { hour: 6, minute: 0 };
    if (str.indexOf('早晨') !== -1 || str.indexOf('早上') !== -1) return { hour: 8, minute: 0 };
    if (str.indexOf('上午') !== -1) return { hour: 10, minute: 0 };
    if (str.indexOf('中午') !== -1) return { hour: 12, minute: 0 };
    if (str.indexOf('下午') !== -1) return { hour: 15, minute: 0 };
    if (str.indexOf('傍晚') !== -1 || str.indexOf('黄昏') !== -1) return { hour: 18, minute: 0 };
    if (str.indexOf('晚上') !== -1) return { hour: 20, minute: 0 };
    if (str.indexOf('深夜') !== -1) return { hour: 23, minute: 0 };
    return null;
}

// ========== 更新显示 ==========
function updateDisplay(idx) {
    var nb = document.getElementById('nameBox');
    var cn = document.getElementById('charName');
    var dt = document.getElementById('dialogueText');
    var sprite = document.getElementById('charSprite');

    if (idx >= dialogueTypes.length) return;

    var type = dialogueTypes[idx];
    var speaker = dialogueSpeakers[idx];

    if (type === 'dialogue' && speaker && speaker !== '旁白') {
        cn.textContent = speaker;
        setCharacterStyle(speaker);
        nb.style.display = 'flex';
        nb.classList.remove('user-name');

        if (characterSprites[speaker]) {
            sprite.src = characterSprites[speaker];
            sprite.style.display = 'block';
        } else {
            sprite.style.display = 'none';
        }
    } else {
        nb.style.display = 'none';
        sprite.style.display = 'none';
    }

    dt.classList.toggle('narration', type === 'narration');
    dt.classList.remove('user-message');
}

// ========== 继续对话 ==========
function continueDialogue() {
    if (isWaiting) return;
    unlockAudio();

    if (isTyping) {
        skipType();
        document.getElementById('dialogueText').textContent = dialogueLines[currentDialogueIndex] || '';
        return;
    }

    currentDialogueIndex++;

    if (currentDialogueIndex < dialogueLines.length) {
        updateDisplay(currentDialogueIndex);
        
        var currentLine = dialogueLines[currentDialogueIndex] || '';
        if (typeof checkJumpscareForCurrentLine === 'function') checkJumpscareForCurrentLine(currentLine);
        if (typeof checkBellForCurrentLine === 'function') checkBellForCurrentLine(currentLine);
        checkAndSwitchBackground(currentLine);
        
        typeWriter(document.getElementById('dialogueText'), dialogueLines[currentDialogueIndex]);
        document.getElementById('continueHint').textContent = '点击继续';
    } else {
        document.getElementById('continueHint').textContent = '已读完';
        if (currentChoices.length > 0) renderChoices(currentChoices);
    }
}

// ========== 背景切换 ==========
function checkAndSwitchBackground(lineContent) {
    if (!lineContent) return;
    var scene = '';
    if (lastAIResponse) {
        var sceneMatch = lastAIResponse.match(/\[场景\|([^\]]+)\]/);
        if (sceneMatch) scene = sceneMatch[1];
    }
    
    var newBgKey = null;
    
    if (scene.indexOf('客厅') !== -1 || scene.indexOf('大厅') !== -1 || scene.indexOf('一楼') !== -1 || scene.indexOf('家暴') !== -1) {
        if (lineContent.indexOf('立柱') !== -1 || lineContent.indexOf('铜门') !== -1 || lineContent.indexOf('门环') !== -1 || lineContent.indexOf('推开门') !== -1) return;
        if (lineContent.indexOf('鸡毛掸子') !== -1 || lineContent.indexOf('高举着') !== -1 || lineContent.indexOf('抽打') !== -1 || lineContent.indexOf('瑟瑟发抖') !== -1 || lineContent.indexOf('哭着哀求') !== -1 || lineContent.indexOf('尖利模糊的怒骂') !== -1 || lineContent.indexOf('循环上演') !== -1) newBgKey = '家暴画面';
        else if ((lineContent.indexOf('地板') !== -1 || lineContent.indexOf('地面') !== -1) && lineContent.indexOf('看') !== -1) newBgKey = (lineContent.indexOf('血') !== -1 || lineContent.indexOf('污渍') !== -1 || lineContent.indexOf('铁锈') !== -1) ? '地板血迹' : '大厅地板';
        else if (lineContent.indexOf('挂钟') !== -1 || lineContent.indexOf('钟面') !== -1 || lineContent.indexOf('指针停在') !== -1) newBgKey = '挂钟特写';
        else if (lineContent.indexOf('沙发') !== -1 && lineContent.indexOf('鸡毛掸子') === -1 && lineContent.indexOf('发抖') === -1) newBgKey = '沙发角落';
        else if (lineContent.indexOf('煤油灯') !== -1 && lineContent.indexOf('灯光下') === -1) newBgKey = '煤油灯';
        else if (lineContent.indexOf('破损的') !== -1 && lineContent.indexOf('家具') !== -1) newBgKey = '破损家具';
    }
    else if (scene.indexOf('教室') !== -1 || scene.indexOf('二楼') !== -1 || scene.indexOf('二层') !== -1) {
        if (lineContent.indexOf('窃笑') !== -1 || lineContent.indexOf('嘲笑') !== -1 || lineContent.indexOf('你是异类') !== -1 || lineContent.indexOf('没人喜欢你') !== -1) newBgKey = '黑板特写';
        else if (lineContent.indexOf('课桌') !== -1 || lineContent.indexOf('最后一排') !== -1 || lineContent.indexOf('作业本') !== -1) newBgKey = '课桌特写';
        else if (lineContent.indexOf('黑板') !== -1 || lineContent.indexOf('粉笔字') !== -1) newBgKey = '黑板特写';
        else if (lineContent.indexOf('杂物间') !== -1 || lineContent.indexOf('被锁在') !== -1) newBgKey = '杂物间';
    }
    else if (scene.indexOf('停尸') !== -1 || scene.indexOf('三楼') !== -1 || scene.indexOf('三层') !== -1) {
        if (lineContent.indexOf('床单掀开') !== -1 || lineContent.indexOf('苍白的手') !== -1 || lineContent.indexOf('伸出') !== -1 || lineContent.indexOf('救我') !== -1) newBgKey = '病床特写';
        else if (lineContent.indexOf('病床') !== -1 || lineContent.indexOf('床单') !== -1 || lineContent.indexOf('覆盖着') !== -1) newBgKey = '病床特写';
        else if (lineContent.indexOf('骨灰盒') !== -1 || lineContent.indexOf('骨灰') !== -1) newBgKey = '骨灰盒';
        else if (lineContent.indexOf('病历') !== -1 || lineContent.indexOf('病历卡') !== -1) newBgKey = '病床特写';
    }
    else if (scene.indexOf('婚房') !== -1 || scene.indexOf('四楼') !== -1 || scene.indexOf('四层') !== -1) {
        if (lineContent.indexOf('镜中') !== -1 || lineContent.indexOf('倒影') !== -1 || lineContent.indexOf('镜子里') !== -1 || lineContent.indexOf('铜镜') !== -1) newBgKey = '铜镜特写';
        else if (lineContent.indexOf('婚床') !== -1 || lineContent.indexOf('红被褥') !== -1 || lineContent.indexOf('枕头下') !== -1) newBgKey = '婚床特写';
        else if (lineContent.indexOf('梳妆台') !== -1 || lineContent.indexOf('胭脂盒') !== -1 || lineContent.indexOf('黑色粉末') !== -1) newBgKey = '梳妆台';
        else if (lineContent.indexOf('未寄出的信') !== -1 || lineContent.indexOf('信纸') !== -1) newBgKey = '梳妆台';
    }
    else if (scene.indexOf('书房') !== -1 || scene.indexOf('五楼') !== -1 || scene.indexOf('五层') !== -1) {
        if (lineContent.indexOf('涂抹的脸') !== -1 || lineContent.indexOf('露出眼睛') !== -1 || lineContent.indexOf('死死盯着') !== -1) newBgKey = '家族合影';
        else if (lineContent.indexOf('书架') !== -1 || lineContent.indexOf('古籍') !== -1 || lineContent.indexOf('家族家训') !== -1) newBgKey = '书架特写';
        else if (lineContent.indexOf('家族合影') !== -1 || lineContent.indexOf('合影') !== -1 || lineContent.indexOf('照片上') !== -1) newBgKey = '家族合影';
        else if (lineContent.indexOf('密室') !== -1 || lineContent.indexOf('暗门') !== -1) newBgKey = '密室门';
        else if (lineContent.indexOf('台灯') !== -1 || lineContent.indexOf('绿色灯光') !== -1) newBgKey = '书架特写';
    }
    else if (scene.indexOf('阁楼') !== -1 || scene.indexOf('六楼') !== -1 || scene.indexOf('六层') !== -1) {
        if (lineContent.indexOf('布娃娃') !== -1 || lineContent.indexOf('娃娃') !== -1 || lineContent.indexOf('血泪') !== -1 || lineContent.indexOf('眼睛睁开') !== -1 || lineContent.indexOf('睁开了眼') !== -1 || lineContent.indexOf('丝线断裂') !== -1 || lineContent.indexOf('渗出红色') !== -1 || lineContent.indexOf('肮脏的脸') !== -1 || lineContent.indexOf('缝住的眼睛') !== -1 || lineContent.indexOf('娃娃的眼睛') !== -1 || lineContent.indexOf('顺着娃娃') !== -1 || lineContent.indexOf('滴在摇篮') !== -1) newBgKey = '布娃娃';
        else if (lineContent.indexOf('涂鸦') !== -1 || lineContent.indexOf('救救我') !== -1 || lineContent.indexOf('不要进来') !== -1 || lineContent.indexOf('墙上的字') !== -1) newBgKey = '墙壁涂鸦';
        else if ((lineContent.indexOf('摇篮') !== -1 || lineContent.indexOf('嘎吱') !== -1) && lineContent.indexOf('娃娃') === -1 && lineContent.indexOf('布娃娃') === -1 && lineContent.indexOf('滴在摇篮') === -1) newBgKey = '摇篮特写';
        else if (lineContent.indexOf('收音机') !== -1 || lineContent.indexOf('童谣') !== -1) newBgKey = '摇篮特写';
    }
    else if (scene.indexOf('卧室') !== -1 || scene.indexOf('七楼') !== -1 || scene.indexOf('七层') !== -1 || scene.indexOf('终局') !== -1) {
        if (lineContent.indexOf('记忆残影') !== -1 || lineContent.indexOf('围着') !== -1 || lineContent.indexOf('让他睡') !== -1 || lineContent.indexOf('不要唤醒') !== -1) newBgKey = '林晏清病床';
        else if (lineContent.indexOf('林晏清') !== -1 || lineContent.indexOf('昏迷的') !== -1 || lineContent.indexOf('躺在床上') !== -1) newBgKey = '林晏清病床';
        else if (lineContent.indexOf('铜铃') !== -1 || lineContent.indexOf('守护') !== -1) newBgKey = '铜铃特写';
        else if (lineContent.indexOf('茉莉花') !== -1 || lineContent.indexOf('窗台上的花') !== -1) newBgKey = '茉莉花';
        else if (lineContent.indexOf('完整的日记') !== -1 || lineContent.indexOf('日记本') !== -1) newBgKey = '林晏清病床';
    }
    
    if (newBgKey) switchBackgroundSmooth(genBgUrl(newBgKey));
}

function switchBackgroundSmooth(newUrl) {
    var bg = document.getElementById('bgImage');
    if (!bg || bg.src === newUrl) return;
    
    bg.style.transition = 'opacity 0.3s ease-out, filter 0.3s ease-out';
    bg.style.opacity = '0.2';
    bg.style.filter = 'brightness(0.3)';
    
    setTimeout(function() {
        bg.onload = function() {
            bg.style.opacity = '1';
            bg.style.filter = 'brightness(0.7) contrast(1.1) saturate(0.8)';
            bg.classList.add('loaded');
        };
        bg.onerror = function() {
            bg.style.opacity = '1';
            bg.style.filter = 'brightness(0.7) contrast(1.1) saturate(0.8)';
        };
        bg.src = newUrl;
    }, 200);
}

// ========== 选项与输入 ==========
function renderChoices(ch) {
    var c = document.getElementById('choicesContainer');
    if (!ch || !ch.length) { c.classList.add('hidden'); return; }

    c.innerHTML = '';
    ch.forEach(function(t) {
        var b = document.createElement('button');
        b.className = 'choice-button';
        b.textContent = t;
        b.onclick = function() { sendChoice(t); };
        c.appendChild(b);
    });
    c.classList.remove('hidden');
}

function sendChoice(text) {
    if (isWaiting) return;
    unlockAudio();

    var doorWords = ['推开', '打开', '进入', '推门', '开门', '进门', '敲门'];
    for (var i = 0; i < doorWords.length; i++) {
        if (text.indexOf(doorWords[i]) !== -1) { playSound('door', 0.6); break; }
    }
    var walkWords = ['走', '前进', '离开', '移动', '前往', '去', '进入', '踏入', '迈向'];
    for (var j = 0; j < walkWords.length; j++) {
        if (text.indexOf(walkWords[j]) !== -1) { setTimeout(function() { playSound('footstep', 0.4); }, 300); break; }
    }

    document.getElementById('choicesContainer').classList.add('hidden');
    showUserMessage(text);
    setTimeout(function() { sendToAI(text); }, 500);
}

function openInputBox() {
    if (isWaiting) return;
    document.getElementById('inputModal').style.display = 'flex';
    document.getElementById('userInput').focus();
}

function closeInputBox() {
    document.getElementById('inputModal').style.display = 'none';
    document.getElementById('userInput').value = '';
}

function sendMessage() {
    var msg = document.getElementById('userInput').value.trim();
    if (!msg || isWaiting) return;

    closeInputBox();
    showUserMessage(msg);
    setTimeout(function() { sendToAI(msg); }, 500);
}

function showUserMessage(msg) {
    document.getElementById('choicesContainer').classList.add('hidden');
    var nb = document.getElementById('nameBox');
    var cn = document.getElementById('charName');
    var dt = document.getElementById('dialogueText');

    document.getElementById('charSprite').style.display = 'none';
    cn.textContent = playerInfo.name || '我';
    nb.style.display = 'block';
    nb.classList.add('user-name');
    dt.classList.remove('narration');
    dt.classList.add('user-message');

    typeWriter(dt, msg, 20);
}

// ========== 渲染页面 ==========
function renderPage(data) {
    document.getElementById('loadingText').classList.add('hidden');

    if (data.scene.location && data.scene.location.indexOf('洋楼') !== -1) {
        setTimeout(function() { playSound('clock', 0.3); }, 2000);
    }
    if (data.scene.location && typeof checkAndShowStoryIntro === 'function') {
        setTimeout(function() { checkAndShowStoryIntro(data.scene.location); }, 800);
    }

    var bg = document.getElementById('bgImage');
    bg.classList.remove('loaded');
    bg.onload = function() { bg.classList.add('loaded'); };
    bg.onerror = function() { bg.classList.add('loaded'); };
    bg.src = genBgUrl(data.scene.location);

    document.getElementById('sceneTime').textContent = data.scene.time || '';
    document.getElementById('sceneMood').textContent = data.scene.mood || '';

    dialogueLines = [];
    dialogueTypes = [];
    dialogueSpeakers = [];
    currentChoices = data.choices || [];

    data.contentBlocks.forEach(function(b) {
        splitText(b.content, MAX_CHARS).forEach(function(p) {
            dialogueLines.push(p);
            dialogueTypes.push(b.type);
            dialogueSpeakers.push(b.speaker);
        });
    });

    if (!dialogueLines.length) {
        dialogueLines.push('...');
        dialogueTypes.push('narration');
        dialogueSpeakers.push(null);
    }

    currentDialogueIndex = 0;
    updateDisplay(0);

    document.getElementById('continueHint').textContent = dialogueLines.length > 1 ? '点击继续' : '已读完';
    typeWriter(document.getElementById('dialogueText'), dialogueLines[0]);

    if (dialogueLines.length === 1 && currentChoices.length > 0) {
        setTimeout(function() { renderChoices(currentChoices); }, 500);
    }
}
