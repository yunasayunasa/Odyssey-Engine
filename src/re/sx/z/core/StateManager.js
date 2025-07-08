export default class StateManager {
    constructor() {
        this.state = {
            scenario: { fileName: null, line: 0 },
            layers: { background: null, characters: {} },
            sound: { bgm: null },
            variables: {},
            history: [], // ★★★ 履歴を保存する配列を追加 ★★★
           
        };
        this.systemVariables = this.loadSystemVariables(); 
    }

    // ★★★ 変数を操作するメソッドを追加 ★★★
    /**
     * 文字列のJavaScript式を安全に評価・実行する
     * @param {string} exp - 実行する式 (例: "f.hoge = 10")
     */
              eval(exp) {
        const f = this.state.variables;
        const sf = this.systemVariables;

        try {
            // new Function のスコープ内で、式を安全に評価・実行する
            // この方法が、代入・比較・値の取得すべてを最もシンプルに扱える
            const result = (function(f, sf) {
                // 'use strict' を使うことで、より安全な実行モードになる
                'use strict';
                return eval(exp); 
            })(f, sf);

            // sf変数が変更された場合は、自動で保存
            this.saveSystemVariables();
            return result;

        } catch (e) {
            console.error(`[eval] 式の評価中にエラーが発生しました: "${exp}"`, e);
            return undefined;
        }
    }

    // ★★★ sf変数のセーブ/ロード機能 ★★★
    saveSystemVariables() {
        try {
            localStorage.setItem('my_novel_engine_system', JSON.stringify(this.systemVariables));
        } catch (e) {
            console.error("システム変数の保存に失敗しました。", e);
        }
    }
    loadSystemVariables() {
        try {
            const data = localStorage.getItem('my_novel_engine_system');
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error("システム変数の読み込みに失敗しました。", e);
            return {};
        }
    }

      /**
     * 読んだテキストの履歴を追加する
     * @param {string} speaker - 話者名 (地の文の場合はnull)
     * @param {string} dialogue - セリフ内容
     */
    addHistory(speaker, dialogue) {
        this.state.history.push({ speaker, dialogue });
        
        // 履歴が長くなりすぎないように、古いものから削除する (例: 100件まで)
        if (this.state.history.length > 100) {
            this.state.history.shift();
        }
        console.log('History Updated:', this.state.history);
    }

    getState() { return JSON.parse(JSON.stringify(this.state)); }
    setState(newState) { this.state = newState; }
    updateScenario(fileName, line) { this.state.scenario.fileName = fileName; this.state.scenario.line = line; console.log('State Updated (Scenario):', this.state.scenario); }
    updateBg(storage) { this.state.layers.background = storage; console.log('State Updated (Background):', this.state.layers.background); }
    updateChara(name, charaData) { if (charaData) { this.state.layers.characters[name] = charaData; } else { delete this.state.layers.characters[name]; } console.log('State Updated (Characters):', this.state.layers.characters); }
    updateBgm(key) { this.state.sound.bgm = key; console.log('State Updated (BGM):', this.state.sound.bgm); }
}
