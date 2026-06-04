// ========== 解析XML ==========
function parseXML(xml) {
    var result = { scene: {}, contentBlocks: [], choices: [] };

    try {
        var sm = xml.match(/<scene_info>([\s\S]*?)<\/scene_info>/i);
        if (sm) {
            var t = sm[1];
            var lm = t.match(/\[场景\|([^\]]+)\]/); if (lm) result.scene.location = lm[1];
            var tm = t.match(/\[时间\|([^\]]+)\]/); if (tm) result.scene.time = tm[1];
            var mm = t.match(/\[氛围\|([^\]]+)\]/); if (mm) result.scene.mood = mm[1];
        }

        var els = [];
        var nr = /<narration>([\s\S]*?)<\/narration>/gi, m;
        while ((m = nr.exec(xml)) !== null) {
            var n = m[1].match(/\[旁白\|([^\]]+)\]/);
            if (n) els.push({ idx: m.index, type: 'narration', content: n[1] });
        }

        var dr = /<dialogue>([\s\S]*?)<\/dialogue>/gi;
        while ((m = dr.exec(xml)) !== null) {
            var spk = m[1].match(/\[说话人\|([^\]]+)\]/);
            var ln = m[1].match(/\[台词\|([^\]]+)\]/);
            if (ln) els.push({ idx: m.index, type: 'dialogue', speaker: spk ? spk[1] : '???', content: ln[1] });
        }

        var ch = xml.match(/<choices>([\s\S]*?)<\/choices>/i);
        if (ch) {
            var cx = /\[选项\|([^\]]+)\]/g;
            while ((m = cx.exec(ch[1])) !== null) result.choices.push(m[1]);
        }

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
