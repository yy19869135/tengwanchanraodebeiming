// ========== 剧情回忆系统 ==========
var storyRecall = [];

function extractStoryFromResponse(content) {
    var sceneMatch = content.match(/\[场景\|([^\]]+)\]/);
    var timeMatch = content.match(/\[时间\|([^\]]+)\]/);
    var scene = sceneMatch ? sceneMatch[1] : '未知场景';
    var time = timeMatch ? timeMatch[1] : (timeSystem.mode === 'normal' ? 
        (timeSystem.normalTime.hour + ':' + (timeSystem.normalTime.minute < 10 ? '0' : '') + timeSystem.normalTime.minute) : '未知时间');
    
    var chars = [];
    if (content.indexOf('沈砚辞') !== -1) chars.push('沈砚辞');
    if (content.indexOf('炽野') !== -1) chars.push('炽野');
    if (content.indexOf('温辞') !== -1) chars.push('温辞');
    if (content.indexOf('二叔') !== -1 || content.indexOf('叔叔') !== -1) chars.push('二叔');
    if (content.indexOf('继母') !== -1 || content.indexOf('母亲') !== -1) chars.push('继母');
    
    var summary = '';
    var impMatch = content.match(/【关键剧情】([^【]+)/);
    if (impMatch) {
        summary = impMatch[1].trim();
    } else {
        var narMatch = content.match(/<narration>([\s\S]*?)<\/narration>/);
        if (narMatch) {
            var text = narMatch[1].replace(/\[旁白\|([^\]]+)\]/, '$1').trim();
            summary = text.substring(0, 50) + (text.length > 50 ? '...' : '');
        } else {
            summary = '探索中...';
        }
    }
    
    var fullText = content.replace(/<[^>]+>/g, '').replace(/\[[^\]]+\]/g, '').trim();
    
    var isImportant = content.indexOf('好感度') !== -1 || content.indexOf('关键') !== -1 || content.indexOf('真相') !== -1;
    
    if (summary && summary !== '探索中...') {
        storyRecall.unshift({
            scene: scene,
            time: time,
            summary: summary,
            fullText: fullText,
            chars: chars,
            important: isImportant,
            timestamp: new Date().getTime()
        });
        
        if (storyRecall.length > 50) {
            storyRecall.pop();
        }
    }
}

function toggleStoryRecall() {
    var panel = document.getElementById('storyRecallPanel');
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) {
        document.getElementById('menuBtn').style.display = 'none';
        renderStoryRecall('all');
    } else {
        document.getElementById('menuBtn').style.display = 'flex'; // ★ 修复：关闭时恢复菜单按钮
    }
}

function renderStoryRecall(filterChar) {
    var container = document.getElementById('recallTimeline');
    var statsContainer = document.getElementById('recallStats');
    
    // 更新统计
    var impCount = storyRecall.filter(function(e) { return e.important; }).length;
    var shenCount = storyRecall.filter(function(e) { return e.chars.includes('沈砚辞'); }).length;
    var chiCount = storyRecall.filter(function(e) { return e.chars.includes('炽野'); }).length;
    var wenCount = storyRecall.filter(function(e) { return e.chars.includes('温辞'); }).length;
    
    statsContainer.innerHTML = 
        '<div class="recall-stat">总事件：<span class="recall-stat-value">' + storyRecall.length + '</span></div>' +
        '<div class="recall-stat">关键：<span class="recall-stat-value">' + impCount + '</span></div>' +
        '<div class="recall-stat">沈砚辞：<span class="recall-stat-value">' + shenCount + '</span></div>' +
        '<div class="recall-stat">炽野：<span class="recall-stat-value">' + chiCount + '</span></div>' +
        '<div class="recall-stat">温辞：<span class="recall-stat-value">' + wenCount + '</span></div>';
        
    // 渲染过滤器
    var btns = document.querySelectorAll('.filter-btn');
    btns.forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').indexOf(filterChar) !== -1) {
            btn.classList.add('active');
        }
    });
    
    // 渲染事件列表
    container.innerHTML = '';
    
    var filteredEvents = storyRecall.filter(function(e) {
        if (filterChar === 'all') return true;
        if (filterChar === 'important') return e.important;
        return e.chars.includes(filterChar);
    });
    
    if (filteredEvents.length === 0) {
        container.innerHTML = '<div class="recall-empty"><div class="recall-empty-icon">📜</div>暂无符合条件的剧情记录</div>';
        return;
    }
    
    filteredEvents.forEach(function(event, index) {
        var charHtml = event.chars.map(function(c) {
            return '<span class="recall-char-tag">' + c + '</span>';
        }).join('');
        
        var html = 
            '<div class="recall-event ' + (event.important ? 'important' : '') + '" onclick="showRecallDetail(' + index + ', \'' + filterChar + '\')">' +
                '<div class="recall-event-header">' +
                    '<div class="recall-event-scene">' + event.scene + '</div>' +
                    '<div class="recall-event-time">' + event.time + '</div>' +
                '</div>' +
                '<div class="recall-event-content">' + event.summary + '</div>' +
                '<div class="recall-event-chars">' + charHtml + '</div>' +
                '<div class="recall-event-hint">点击查看详情 🔍</div>' +
            '</div>';
        container.innerHTML += html;
    });
}

function filterRecall(charName) {
    renderStoryRecall(charName);
}

function showRecallDetail(index, filterChar) {
    var filteredEvents = storyRecall.filter(function(e) {
        if (filterChar === 'all') return true;
        if (filterChar === 'important') return e.important;
        return e.chars.includes(filterChar);
    });
    
    var event = filteredEvents[index];
    if (!event) return;
    
    var modal = document.getElementById('recallModal');
    document.getElementById('recallModalScene').textContent = event.scene;
    document.getElementById('recallModalTime').textContent = event.time;
    document.getElementById('recallModalContent').textContent = event.fullText || event.summary;
    
    var charHtml = event.chars.map(function(c) {
        return '<span class="recall-char-tag">' + c + '</span>';
    }).join('');
    document.getElementById('recallModalChars').innerHTML = charHtml;
    
    modal.classList.add('active');
}

function closeRecallDetail() {
    document.getElementById('recallModal').classList.remove('active');
}

// ========== 场景介绍系统 ==========
var storyIntroShown = {};

function checkAndShowStoryIntro(sceneName) {
    if (storyIntroShown[sceneName]) return;
    
    var introData = {
        '洋楼大厅': {
            floor: 'FIRST FLOOR', title: '记忆缝合楼 · 一层大厅',
            scenes: [
                { title: '🕰️ 停滞的时间', text: '大厅中央的座钟指针永远停在3:17。' },
                { title: '🩸 无法洗净的地板', text: '暗红色的实木地板上，有一滩无论如何也擦不掉的陈年血迹。' }
            ],
            warnings: ['不要盯着座钟看超过10秒', '避开地板上的血迹行走', '如果听到二楼传来弹珠声，立刻闭上眼睛'],
            hint: '【探索建议】寻找能照亮角落的物品，也许能发现隐藏的线索。',
            atmosphere: '空气中弥漫着霉味和淡淡的铁锈味，仿佛这里刚刚发生过一场惨剧。'
        },
        // ... (其他楼层数据同理，为了节省篇幅，这里保留原有的数据结构)
        '二楼教室': {
            floor: 'SECOND FLOOR', title: '记忆缝合楼 · 二层教室',
            scenes: [
                { title: '🪑 凌乱的课桌', text: '教室里的课桌东倒西歪，黑板上写满了恶毒的诅咒。' },
                { title: '👧 窃笑的阴影', text: '角落里似乎总有孩童的窃笑声，但看过去却空无一人。' }
            ],
            warnings: ['不要擦除黑板上的字', '不要坐在最后一排的空位上', '听到笑声时不要回头'],
            hint: '【探索建议】课桌抽屉里可能藏有当年的日记残页。',
            atmosphere: '粉笔灰的气味混合着一种令人作呕的甜腻香气，让人感到窒息。'
        },
        '三楼停尸间': {
            floor: 'THIRD FLOOR', title: '记忆缝合楼 · 三层停尸间',
            scenes: [
                { title: '🛏️ 冰冷的病床', text: '几张生锈的铁床上盖着白布，白布下隐约透出人形的轮廓。' },
                { title: '🏺 破碎的骨灰盒', text: '角落的架子上散落着几个骨灰盒，有的已经破碎。' }
            ],
            warnings: ['绝对不要掀开白布', '不要触碰地上的骨灰', '如果白布开始起伏，立刻屏住呼吸'],
            hint: '【探索建议】病历卡上或许记录着死者的身份和死因。',
            atmosphere: '极度的寒冷，空气中弥漫着福尔马林和腐肉的味道。'
        },
        '四楼婚房': {
            floor: 'FOURTH FLOOR', title: '记忆缝合楼 · 四层婚房',
            scenes: [
                { title: '🪞 诡异的铜镜', text: '梳妆台上的铜镜蒙着一层灰，倒影总是比你的动作慢半拍。' },
                { title: '🛏️ 褪色的红被', text: '婚床上的红被褥已经褪色发黑，床底似乎藏着什么东西。' }
            ],
            warnings: ['不要在铜镜前梳头', '不要看向床底', '如果听到女人的哭声，请捂住耳朵'],
            hint: '【探索建议】梳妆台的抽屉里可能藏有未寄出的信件。',
            atmosphere: '沉闷压抑，空气中飘散着劣质胭脂和陈腐木材的气味。'
        },
        '五楼书房': {
            floor: 'FIFTH FLOOR', title: '记忆缝合楼 · 五层书房',
            scenes: [
                { title: '📚 摇摇欲坠的书架', text: '书架上摆满了厚重的古籍，有些书的封皮像是某种皮革。' },
                { title: '🖼️ 诡异的家族合影', text: '墙上的家族合影中，所有人的脸都被涂抹掉了，只露出一双双死鱼般的眼睛。' }
            ],
            warnings: ['不要阅读红皮书', '不要直视合影中的眼睛', '如果书房门突然关上，寻找暗门'],
            hint: '【探索建议】书架后可能隐藏着密室的开关。',
            atmosphere: '纸张发霉的味道和淡淡的墨香混合，令人感到头晕目眩。'
        },
        '六楼阁楼': {
            floor: 'SIXTH FLOOR', title: '记忆缝合楼 · 六层阁楼',
            scenes: [
                { title: '🧸 泣血的布娃娃', text: '角落里堆满残破的布娃娃，它们的眼睛被粗糙的黑线缝死。' },
                { title: '🖍️ 绝望的涂鸦', text: '墙壁上画满了扭曲的线条和求救的话语，字迹像是用指甲抠出来的。' }
            ],
            warnings: ['不要剪断娃娃眼上的线', '不要回应收音机里的童谣', '如果娃娃的头转动了，立刻逃跑'],
            hint: '【探索建议】墙上的涂鸦也许是破解迷局的关键密码。',
            atmosphere: '闷热潮湿，空气中充斥着灰尘和令人不安的死寂。'
        },
        '七楼卧室': {
            floor: 'SEVENTH FLOOR', title: '记忆缝合楼 · 七层卧室',
            scenes: [
                { title: '🛎️ 守护的铜铃', text: '床头挂着一个锈迹斑斑的铜铃，无风自动，发出微弱的声响。' },
                { title: '🌸 枯萎的茉莉', text: '窗台上有一盆枯萎的茉莉花，即使枯萎也散发着淡淡的幽香。' }
            ],
            warnings: ['不要让铜铃停止摇晃', '不要触碰病床上的林晏清', '当残影围拢时，摇响铜铃'],
            hint: '【探索建议】这是最后的试炼，所有的真相都在这里。',
            atmosphere: '平静中暗藏杀机，茉莉花香与血腥味交织在一起。'
        }
    };

    var data = introData[sceneName];
    if (!data) return;

    storyIntroShown[sceneName] = true;
    
    document.getElementById('storyIntroFloor').textContent = data.floor;
    document.getElementById('storyIntroTitle').textContent = data.title;
    
    var scenesHtml = data.scenes.map(function(s) {
        return '<div class="story-intro-scene"><div class="story-intro-scene-title">' + s.title + '</div><div>' + s.text + '</div></div>';
    }).join('');
    
    var warningsHtml = data.warnings.map(function(w) {
        return '<li>' + w + '</li>';
    }).join('');
    
    var bodyHtml = scenesHtml + 
        '<div class="story-intro-warning">' +
            '<div class="story-intro-warning-title">⚠️ 生存守则</div>' +
            '<ul class="story-intro-warning-list">' + warningsHtml + '</ul>' +
        '</div>' +
        '<div class="story-intro-hint">' +
            '<div class="story-intro-hint-title">💡 探索指引</div>' +
            '<div class="story-intro-hint-text">' + data.hint + '</div>' +
        '</div>' +
        '<div class="story-intro-atmosphere">' +
            '<div class="story-intro-atmosphere-text">「 ' + data.atmosphere + ' 」</div>' +
        '</div>';
        
    document.getElementById('storyIntroBody').innerHTML = bodyHtml;
    
    var overlay = document.getElementById('storyIntroOverlay');
    overlay.classList.add('active');
    if (gameMode === 'horror') {
        overlay.classList.add('horror-effect');
        setTimeout(function() { overlay.classList.remove('horror-effect'); }, 100);
    }
    
    startStoryIntroTyping();
}

function closeStoryIntro() {
    var overlay = document.getElementById('storyIntroOverlay');
    overlay.style.transition = 'opacity 0.5s ease-out';
    overlay.style.opacity = '0';
    setTimeout(function() {
        overlay.classList.remove('active');
        overlay.style.opacity = '';
        overlay.style.transition = '';
        document.getElementById('storyIntroBody').classList.remove('typing');
    }, 500);
}

function startStoryIntroTyping() {
    var body = document.getElementById('storyIntroBody');
    body.classList.remove('typing');
    void body.offsetWidth; 
    body.classList.add('typing');
}
