// ========== 玩家信息设置 ==========
var playerInfo = {
    name: '',
    gender: 'female',
    bio: ''
};
var playerInfoSent = false;

function showSetupPanel() {
    document.getElementById('setupPanel').classList.remove('hidden');
}

function savePlayerInfo() {
    var name = document.getElementById('playerNameInput').value.trim();
    if (!name) {
        alert('请输入姓名！');
        return;
    }
    
    playerInfo.name = name;
    playerInfo.bio = document.getElementById('playerBioInput').value.trim();
    
    document.getElementById('setupPanel').classList.add('hidden');
    updatePlayerInfoDisplay();
    playerInfoSent = false; 
    
        document.getElementById('gameDeclaration').classList.remove('hidden');

}

function getPlayerInfoText() {
    if (!playerInfo.name) return '';
    var text = "【玩家设定】我的名字是" + playerInfo.name + "，性别女。";
    if (playerInfo.bio) {
        text += "我的背景设定是：" + playerInfo.bio + "。";
    }
    text += "请在后续对话中符合我的设定。\n\n我的行动：";
    return text;
}

function updatePlayerInfoDisplay() {
    var display = document.getElementById('playerInfoBar');
    var nameEl = document.getElementById('playerNameDisplay');
    
    if (playerInfo.name) {
        nameEl.textContent = playerInfo.name;
        display.classList.remove('hidden');
    } else {
        display.classList.add('hidden');
    }
}

// ========== 人物介绍面板 ==========
function toggleCharacterIntro() {
    var panel = document.getElementById('characterIntroPanel');
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) {
        document.getElementById('menuBtn').style.display = 'none';
        switchIntroTab('沈砚辞');
    } else {
        document.getElementById('menuBtn').style.display = 'flex';
    }
}

function switchIntroTab(charName) {
    var tabs = document.querySelectorAll('.intro-tab');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    
    var activeTab = Array.from(tabs).find(function(t) { return t.textContent.includes(charName); });
    if (activeTab) activeTab.classList.add('active');
    
    var contentDiv = document.getElementById('charIntroContent');
    
    var charData = {
        '沈砚辞': {
            name: '沈砚辞', title: '清冷禁欲系 / 逻辑担当',
            desc: '戴着金丝眼镜的大学教授，永远西装革履，扣子扣到最上面一颗。看似冷漠无情，实则用强大的逻辑能力为你规划最安全的路线。',
            traits: ['极度理智', '细节控', '隐藏的占有欲'],
            plot: '他一直在寻找当年洋楼惨案的真相，似乎与你有着某种被遗忘的渊源。'
        },
        '炽野': {
            name: '炽野', title: '桀骜叛逆系 / 武力担当',
            desc: '一头张扬的红发，穿着机车夹克，随身带着一根棒球棍。说话夹枪带棒，但每次危险来临时，总是第一个冲在前面挡住怪物。',
            traits: ['嘴硬心软', '冲动护短', '武力值爆表'],
            plot: '他是当年惨案的幸存者之一，因为愧疚而重返洋楼，发誓这次一定要保护好你。'
        },
        '温辞': {
            name: '温辞', title: '温柔守护系 / 治愈担当',
            desc: '穿着白色针织衫的医生，笑容如沐春风。他的声音有安定人心的力量，能驱散你脑海中的恐怖幻象。',
            traits: ['情绪稳定', '温柔包容', '自我牺牲'],
            plot: '他知道洋楼的所有秘密，但他选择隐瞒，只为了让你能在恐怖中保留一丝纯真。'
        }
    };
    
    var data = charData[charName];
    if (!data) return;
    
    var traitsHtml = data.traits.map(function(t) { return '<li>' + t + '</li>'; }).join('');
    
    var truthUnlocked = affectionData.characters.find(function(c) { return c.name === charName; }).value >= 70;
    var truthHtml = '';
    
    if (truthUnlocked) {
        var truthDesc = '';
        if (charName === '沈砚辞') truthDesc = '【真相碎片】他其实是你童年时的邻居哥哥，当年惨案发生时，他因为懦弱没有救你，一直在深深的自责中寻找复活你的方法。';
        else if (charName === '炽野') truthDesc = '【真相碎片】他曾是你最讨厌的校霸，但在你被继母虐待时，只有他偷偷给你送过药。棒球棍是他为了保护你而准备的武器。';
        else if (charName === '温辞') truthDesc = '【真相碎片】他并不是人类，而是你绝望中幻想出的守护灵。他的存在就是为了吸收你的痛苦，一旦你离开洋楼，他就会消散。';
        
        truthHtml = 
            '<div class="char-intro-section">' +
                '<div class="char-intro-label">🔓 核心真相 (好感度达标解锁)</div>' +
                '<div class="char-intro-text" style="color:#ff6b6b;font-weight:bold;">' + truthDesc + '</div>' +
            '</div>';
    } else {
        truthHtml = 
            '<div class="char-intro-section locked-hint">' +
                '<div class="lock-icon">🔒</div>' +
                '<div>好感度达到70解锁核心真相</div>' +
            '</div>';
    }
    
    contentDiv.innerHTML = 
        '<div class="char-intro-card">' +
            '<div class="char-intro-header">' +
                '<div class="char-intro-name">' + data.name + '</div>' +
                '<div class="char-intro-title">' + data.title + '</div>' +
            '</div>' +
            '<div class="char-intro-section">' +
                '<div class="char-intro-label">📝 角色设定</div>' +
                '<div class="char-intro-text">' + data.desc + '</div>' +
            '</div>' +
            '<div class="char-intro-section">' +
                '<div class="char-intro-label">✨ 性格特质</div>' +
                '<ul class="char-intro-list">' + traitsHtml + '</ul>' +
            '</div>' +
            '<div class="char-intro-section">' +
                '<div class="char-intro-label">📜 背景剧情</div>' +
                '<div class="char-intro-text">' + data.plot + '</div>' +
            '</div>' +
            truthHtml +
        '</div>';
}

function checkTruthRevealed(content) {
    if (content.indexOf('真相') !== -1 || content.indexOf('秘密') !== -1) {
        if (content.indexOf('沈砚辞') !== -1 && content.indexOf('邻居') !== -1) showTruthToast('沈砚辞');
        if (content.indexOf('炽野') !== -1 && content.indexOf('校霸') !== -1) showTruthToast('炽野');
        if (content.indexOf('温辞') !== -1 && content.indexOf('幻想') !== -1) showTruthToast('温辞');
    }
}

function showTruthToast(charName) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#8b0000,#4a0000);color:#fff;padding:20px 40px;border-radius:12px;z-index:9999;font-size:16px;text-align:center;box-shadow:0 4px 20px rgba(139,0,0,0.5);border:2px solid #ff4444;';
    toast.innerHTML = '<div style="font-size:32px;margin-bottom:12px;">🔓</div><div style="font-weight:bold;">真相碎片已解锁</div><div style="margin-top:8px;font-size:14px;">请前往【人物介绍】查看 <b>' + charName + '</b> 的隐藏剧情</div>';
    document.body.appendChild(toast);
    
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s';
    setTimeout(function() { toast.style.opacity = '1'; }, 50);
    
    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() { toast.remove(); }, 500);
    }, 4000);
}
