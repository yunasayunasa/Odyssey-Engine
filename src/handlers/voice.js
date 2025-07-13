// src/handlers/voice.js

/**
 * [voice] タグの処理
 * 指定されたテキストを合成音声で発話させる。
 * 発話中はシナリオの進行を停止する。
 * @param {ScenarioManager} manager
 * @param {Object} params - { text, lang, voice, rate, pitch }
 * @returns {Promise<void>}
 */
export function handleVoice(manager, params) {
    return new Promise(resolve => {
        // SpeechSynthesis APIが利用可能かチェック
        if (!('speechSynthesis' in window)) {
            console.warn('[voice] Web Speech API (SpeechSynthesis) はこのブラウザでサポートされていません。');
            resolve();
            return;
        }

        const text = params.text;
        if (!text) {
            console.warn('[voice] text属性は必須です。');
            resolve();
            return;
        }

        // SpeechSynthesisUtteranceオブジェクトを作成
        const utterance = new SpeechSynthesisUtterance(text);

        // パラメータを設定
        // 言語 (例: 'ja-JP', 'en-US')
        if (params.lang) {
            utterance.lang = params.lang;
        } else {
            // デフォルト言語を設定 (ConfigManagerから取得できるようにすると尚良い)
            utterance.lang = 'ja-JP'; 
        }

        // 話速 (0.1 - 10.0)
        const rate = parseFloat(params.rate);
        if (!isNaN(rate) && rate >= 0.1 && rate <= 10.0) {
            utterance.rate = rate;
        } else {
            utterance.rate = 1.0; // デフォルト
        }

        // ピッチ (0.0 - 2.0)
        const pitch = parseFloat(params.pitch);
        if (!isNaN(pitch) && pitch >= 0.0 && pitch <= 2.0) {
            utterance.pitch = pitch;
        } else {
            utterance.pitch = 1.0; // デフォルト
        }

        // 特定の声を選択 (利用可能な声のリストはブラウザ依存)
        // 例えば 'Google 日本語' や 'Microsoft Haruka' など
        if (params.voice) {
            // 利用可能な声がロードされていることを確認する必要がある
            const voices = window.speechSynthesis.getVoices();
            const selectedVoice = voices.find(v => v.name === params.voice && v.lang === utterance.lang);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            } else {
                console.warn(`[voice] 指定された声 (${params.voice}) が見つからないか、言語が一致しません。`);
            }
        }
        
        // ★★★ 発話の完了イベント ★★★
        utterance.onend = () => {
            console.log(`[voice] 発話完了: "${text}"`);
            resolve(); // Promiseを解決し、シナリオ進行を再開
        };

        // ★★★ 発話のエラーイベント ★★★
        utterance.onerror = (event) => {
            console.error(`[voice] 発話エラー: "${text}"`, event);
            // エラー時もシナリオを停止させないためにPromiseを解決
            resolve(); 
        };

        // ★★★ 発話を開始 ★★★
        // ここがブラウザの自動再生ポリシーと最も関わる部分
        try {
            window.speechSynthesis.speak(utterance);
            console.log(`[voice] 発話開始: "${text}"`);
        } catch (e) {
            console.error(`[voice] 発話の開始に失敗しました: "${text}"`, e);
            resolve();
        }
    });
}