// ========== 解析XML（增强包容版） ==========
function parseXML(xml) {
    var result = { scene: {}, contentBlocks: [], choices: [] };

    try {
        // 1. 解析场景信息
        var sm = xml.match(/<scene_info>([\s\S]*?)<\/scene_info>/i);
        if (sm) {
            var t = sm[1];
            var lm = t.match(/\[场景\|([^\]]+)\]/); if (lm) result.scene.location = lm[1].trim();
            var tm = t.match(/\[时间\|([^\]]+)\]/); if (tm) result.scene.time = tm[1].trim();
            var mm = t.match(/\[氛围\|([^\]]+)\]/); if (mm) result.scene.mood = mm[1].trim();
        }

        var els = [];
        
        // 2. 解析旁白 (增强：即使AI没写 [旁白|] 也能提取)
        var nr = /<narration>([\s\S]*?)<\/narration>/gi, m;
        while ((m = nr.exec(xml)) !== null) {
            var raw = m[1].trim();
            var n = raw.match(/\[旁白\|([\s\S]*?)\]/);
            var content = n ? n[1].trim() : raw.replace(/\[旁白\|/g, '').replace(/\]/g, '').trim();
            
            if (content) {
                // 额外兼容：如果AI把对话写进了旁白里 (例如 沈砚辞：“你好”)
                var dialogMatch = content.match(/^([^:：\n【\[]{1,10})[:：]\s*“?([^”]+)”?(.*)$/);
                if (dialogMatch && !content.startsWith('旁白')) {
                    els.push({ idx: m.index, type: 'dialogue', speaker: dialogMatch[1].trim(), content: dialogMatch[2].trim() + (dialogMatch[3]||'') });
                } else {
                    els.push({ idx: m.index, type: 'narration', content: content });
                }
            }
        }

        // 3. 解析对话 (增强：即使AI漏写 [说话人|] 或 [台词|] 也能提取)
        var dr = /<dialogue>([\s\S]*?)<\/dialogue>/gi;
        while ((m = dr.exec(xml)) !== null) {
            var rawDiag = m[1].trim();
            var spkMatch = rawDiag.match(/\[说话人\|([\s\S]*?)\]/);
            var lnMatch = rawDiag.match(/\[台词\|([\s\S]*?)\]/);
            
            var speaker = spkMatch ? spkMatch[1].trim() : "";
            var content = lnMatch ? lnMatch[1].trim() : "";

            // 兜底方案：如果AI没有用标准括号格式
            if (!speaker || !content) {
                var lines = rawDiag.split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l; });
                if (lines.length >= 2) {
                    speaker = speaker || lines[0].replace(/\[说话人\|/g, '').replace(/\]/g, '').replace(/说话人[:：]/g, '').trim();
                    content = content || lines[1].replace(/\[台词\|/g, '').replace(/\]/g, '').replace(/台词[:：]/g, '').trim();
                } else if (lines.length === 1) {
                    var inlineMatch = lines[0].match(/^([^:：]+)[:：]\s*(.*)$/);
                    if (inlineMatch) {
                        speaker = inlineMatch[1].replace(/\[说话人\|/g, '').replace(/\]/g, '').trim();
                        content = inlineMatch[2].replace(/\[台词\|/g, '').replace(/\]/g, '').trim();
                    } else {
                        content = lines[0].replace(/\[台词\|/g, '').replace(/\]/g, '').trim();
                        speaker = "???";
                    }
                }
            }

            if (content) {
                els.push({ idx: m.index, type: 'dialogue', speaker: speaker || "???", content: content });
            }
        }

        // 4. 解析选项 (增强：即使AI没写 [选项|] 也能提取)
        var ch = xml.match(/<choices>([\s\S]*?)<\/choices>/i);
        if (ch) {
            var rawChoices = ch[1];
            var cx = /\[选项\|([\s\S]*?)\]/g;
            var hasChoices = false;
            while ((m = cx.exec(rawChoices)) !== null) {
                result.choices.push(m[1].trim());
                hasChoices = true;
            }
            // 兜底方案：直接按行读取选项
            if (!hasChoices) {
                var clines = rawChoices.split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l; });
                clines.forEach(function(l) {
                    var clean = l.replace(/\[选项\|/g, '').replace(/\]/g, '').replace(/^\d+[\.、]\s*/, '').trim();
                    if (clean) result.choices.push(clean);
                });
            }
        }

        // 按在XML中出现的顺序排序
        els.sort(function(a, b) { return a.idx - b.idx; });
        els.forEach(function(e) {
            result.contentBlocks.push({ type: e.type, speaker: e.speaker || null, content: e.content });
        });

        return result;
    } catch (err) {
        console.error('解析错误:', err);
        return result;
    }
}

// ========== 打字机 ==========
function typeWriter(el, txt, spd, cb) {
    isTyping = true;
    el.textContent = '';
    var i = 0;

    function t() {
        if (i < txt.length) {
            el.textContent += txt.charAt(i);
            i++;
            typewriterTimeout = setTimeout(t, spd || 25);
        } else {
            isTyping = false;
            if (cb) cb();
        }
    }
    t();
}

function skipType() {
    if (isTyping && typewriterTimeout) {
        clearTimeout(typewriterTimeout);
        isTyping = false;
    }
}

// ========== 分割文本 ==========
function splitText(txt, max) {
    if (txt.length <= max) return [txt];
    var pages = [], rem = txt;
    while (rem.length > 0) {
        if (rem.length <= max) { pages.push(rem); break; }
        var bp = max;
        for (var i = max; i > max - 20 && i > 0; i--) {
            if ('。！？，；…】'.indexOf(rem[i]) !== -1) { bp = i + 1; break; }
        }
        pages.push(rem.substring(0, bp));
        rem = rem.substring(bp);
    }
    return pages;
}
