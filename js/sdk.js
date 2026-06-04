// ========== 自定义 API 配置 (在这里修改你的配置) ==========
const API_URL = 'https://api.242243.xyz/v1'; // 替换为你的 API 地址
const API_KEY = 'sk-4FyMPKGgQZCm5UMAE5ki638FFOaJDLr6ewKlvyCHLFde74xA'; // 替换为你的真实 API Key
const MODEL_NAME = '[官3] deepseek-v4-pro'; // 替换为你的模型名称

// 从世界书构建系统提示词
function buildSystemPrompt() {
    if (typeof LOREBOOK_DATA === 'undefined' || !LOREBOOK_DATA.entries) {
        return '你是一个文字冒险游戏的AI引擎。请严格按照<visual_novel>、<scene_info>、<narration>、<choices>等XML标签格式输出游戏内容，推动剧情发展。';
    }
    var entries = [];
    var data = LOREBOOK_DATA.entries;
    for (var key in data) {
        var e = data[key];
        if (e.disable) continue;        // 跳过被禁用的条目
        if (!e.content) continue;       // 跳过空内容的条目
        entries.push(e);
    }
    // 按 order 从小到大排序，order 相同则按 displayIndex
    entries.sort(function(a, b) {
        if (a.order !== b.order) return a.order - b.order;
        return a.displayIndex - b.displayIndex;
    });
    var parts = [];
    for (var i = 0; i < entries.length; i++) {
        parts.push(entries[i].content);
    }
    return parts.join('\n\n---\n\n');
}

// 聊天历史记录（用于让 AI 记住上下文）
let chatHistory = [
    {
        role: 'system',
        content: buildSystemPrompt()
    }
];

// ========== 状态显示 ==========
function updateStatus(text, color) {
    var st = document.getElementById('sdkStatus');
    if (st) {
        st.textContent = text;
        st.style.color = color;
    }
}

function setWaiting(waiting) {
    isWaiting = waiting;
    var db = document.getElementById('dialogueBox');
    var cc = document.getElementById('choicesContainer');
    var ib = document.getElementById('inputBtn');
    if (waiting) {
        if (db) db.classList.add('waiting');
        if (cc) cc.classList.add('waiting');
        if (ib) ib.classList.add('waiting');
        var hint = document.getElementById('continueHint');
        if (hint) hint.textContent = '等待中...';
        updateStatus('发送中...', '#ffaa00');
    } else {
        if (db) db.classList.remove('waiting');
        if (cc) cc.classList.remove('waiting');
        if (ib) ib.classList.remove('waiting');
        updateStatus(sdkReady ? '✓ 已连接' : '✗ 未连接', sdkReady ? '#00ff00' : '#ff4444');
    }
}

// ========== 初始化自定义API ==========
async function initSDK() {
    updateStatus('连接API...', '#ffaa00');
    console.log('=== 初始化自定义 API ===');
    
    // 直接标记为就绪，跳过繁琐的检测
    sdkReady = true;
    updateStatus('✓ 已连接', '#00ff00');
    
    return true;
}

// ========== 发送消息到自定义API ==========
async function sendToAI(query) {
    if (isWaiting) return;
    setWaiting(true);

    if (!sdkReady) {
        setTimeout(function() {
            setWaiting(false);
            document.getElementById('dialogueText').textContent = '❌ API未连接';
            document.getElementById('continueHint').textContent = '请刷新页面重试';
        }, 500);
        return;
    }

    try {
        var finalQuery = query;
        
        // 兼容你原有的玩家设定发送逻辑
        if (typeof playerInfo !== 'undefined' && playerInfo.name && typeof playerInfoSent !== 'undefined' && !playerInfoSent) {
            if (typeof getPlayerInfoText === 'function') {
                finalQuery = getPlayerInfoText() + query;
            }
            playerInfoSent = true;
        }

        // 把玩家说的话加入历史记录
        chatHistory.push({ role: 'user', content: finalQuery });

        document.getElementById('dialogueText').textContent = 'AI思考中...';

        // 正式发起 API 请求
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + API_KEY
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: chatHistory,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('HTTP 状态码错误: ' + response.status);
        }

        const data = await response.json();
        const fullContent = data.choices[0].message.content;

        // 把 AI 的回复也加入历史记录，这样它就有记忆了
        chatHistory.push({ role: 'assistant', content: fullContent });

        var preview = fullContent.substring(0, 80);
        document.getElementById('dialogueText').textContent = preview + '...';

        setWaiting(false);
        
        // 呼叫你原有的解析系统，处理 AI 返回的 XML
        if (typeof handleAIResponse === 'function') {
            handleAIResponse(fullContent);
        }

    } catch (error) {
        console.error('发送失败:', error);
        setWaiting(false);
        document.getElementById('dialogueText').textContent = '❌ 发送失败: ' + error.message;
        var hint = document.getElementById('continueHint');
        if (hint) hint.textContent = '请检查 API 地址和密钥是否正确';
    }
}
