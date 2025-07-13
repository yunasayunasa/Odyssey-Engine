// src/handlers/voice.js

/**
 * [voice] タグの処理
 * 指定されたテキストを合成音声で発話させる。
 * 発話中はシナリオの進行を停止する。
 * @param {ScenarioManager} manager
 * @param {Object} params - { text, lang, voice, rate, pitch }
 * @returns {Promise<void>}
 */
export async function handleVoice(manager, params) { // ★ async関数にする
    return new Promise(async resolve => { // ★ Promiseコンストラクタもasyncにする
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

        // ★★★ 修正箇所: 合成音声が有効になるまで待機 ★★★
        try {
            await manager.soundManager.ensureSynthEnabled();
        } catch (e) {
            console.error("[voice] 合成音声の有効化に失敗しました。発話をスキップします。", e);
            resolve();
            return;
        }

        // SpeechSynthesisUtteranceオブジェクトを作成
        const utterance = new SpeechSynthesisUtterance(text);

        // (言語、話速、ピッチ、声の設定は変更なし)
        // ...

        // ★★★ 発話の完了イベント ★★★
        utterance.onend = () => {
            console.log(`[voice] 発話完了: "${text}"`);
            resolve();
        };

        // ★★★ 発話のエラーイベント ★★★
        utterance.onerror = (event) => {
            console.error(`[voice] 発話エラー: "${text}"`, event);
            resolve();
        };

        // ★★★ 発話を開始 ★★★
        // ここはtry-catchで囲むが、ensureSynthEnabled()が成功していればブロックされないはず
        try {
            window.speechSynthesis.speak(utterance);
            console.log(`[voice] 発話開始: "${text}"`);
        } catch (e) {
            console.error(`[voice] 発話の開始に失敗しました (speak呼び出し時): "${text}"`, e);
            resolve();
        }
    });
}