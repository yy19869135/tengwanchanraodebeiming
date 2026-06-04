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

// ========== SDK检测 ==========
function detectSDK() {
    console.log('=== 检测SDK ===');
    if (typeof window.MujianSdk === 'function') return new window.MujianSdk();
    if (window.MujianUMD && window.MujianUMD.MujianSdk) return new window.MujianUMD.MujianSdk();
    if (window.mujian && window.mujian.MujianSdk) return new window.mujian.MujianSdk();
    if (window.MujianUMD && window.MujianUMD.default) return new window.MujianUMD.default();
    console.log('✗ 未找到SDK');
    return null;
}

// ========== 获取人设信息 ==========
function fetchPersonaInfo() {
    if (!sdkReady || !mujianSdk) {
        console.log('SDK未就绪，无法获取人设');
        return;
    }
    mujianSdk.ai.chat.settings.persona.getActive().then(function(res) {
        console.log("=== 人设信息 ===", res);
        if (res) {
            if (res.name) {
                var nameInput = document.getElementById('playerNameInput');
                if (nameInput && !nameInput.value) nameInput.value = res.name;
            }
            var bioText = res.description || res.bio || res.persona || res.content || res.intro || res.profile || '';
            if (bioText) {
                var bioInput = document.getElementById('playerBioInput');
                if (bioInput && !bioInput.value) bioInput.value = bioText;
            }
        }
    }).catch(function(err) {
        console.log("获取人设信息失败:", err);
    });
}

// ========== 初始化SDK ==========
async function initSDK() {
    updateStatus('检测SDK...', '#ffaa00');
    console.log('=== 初始化SDK (尝试 ' + (retryCount + 1) + '/' + maxRetry + ') ===');

    try {
        mujianSdk = detectSDK();
        if (mujianSdk) {
            console.log('SDK实例创建成功，开始初始化...');
            await mujianSdk.init();
            sdkReady = true;
            fetchPersonaInfo();
            updateStatus('✓ 已连接', '#00ff00');
            return true;
        } else {
            retryCount++;
            if (retryCount < maxRetry) {
                updateStatus('重试中(' + retryCount + ')...', '#ffaa00');
                setTimeout(initSDK, 500 * retryCount);
                return false;
            } else {
                updateStatus('✗ 未连接', '#ff4444');
                sdkReady = false;
                return false;
            }
        }
    } catch (error) {
        console.error('SDK初始化失败:', error);
        updateStatus('✗ 错误', '#ff4444');
        sdkReady = false;
        return false;
    }
}

// ========== 发送消息 ==========
async function sendToAI(query) {
    if (isWaiting) return;
    setWaiting(true);

    if (!sdkReady || !mujianSdk) {
        setTimeout(function() {
            setWaiting(false);
            document.getElementById('dialogueText').textContent = '❌ SDK未连接，请在幕间APP中打开';
            document.getElementById('continueHint').textContent = '请检查环境';
        }, 500);
        return;
    }

    try {
        var fullContent = '';
        var finalQuery = query;
        if (playerInfo.name && !playerInfoSent) {
            finalQuery = getPlayerInfoText() + query;
            playerInfoSent = true;
        }

        await mujianSdk.ai.chat.complete(finalQuery,
            function(res) {
                fullContent = res.fullContent;
                var preview = fullContent.substring(0, 80);
                document.getElementById('dialogueText').textContent = preview + '...';

                if (res.isFinished) {
                    setWaiting(false);
                    handleAIResponse(fullContent);
                }
            },
            null,
            { parseContent: true }
        );
    } catch (error) {
        console.error('发送失败:', error);
        setWaiting(false);
        document.getElementById('dialogueText').textContent = '❌ 发送失败: ' + error.message;
        document.getElementById('continueHint').textContent = '请重试';
    }
}
