// core/StateManager.js

export default class StateManager {
    constructor() {
        // ゲーム内変数 (f) とシステム変数 (sf) を分離
        this.f = {};
        this.sf = this.loadSystemVariables(); 
        
        // ★ 履歴は sf (システム変数) に持たせるのが一般的
        if (!this.sf.history) {
            this.sf.history = [];
        }
    }

    /**
     * ★★★ 新しいgetState: ゲームの現在の状態をすべて収集して返す ★★★
     * @param {ScenarioManager} scenarioManager - 現在のシナリオの状態を取得するための参照
     * @returns {Object} 現在のゲーム状態のスナップショット
     */
    getState(scenarioManager) {
       // const scene = scenarioManager.scene;
        
        // 表示されているキャラクターの状態を収集
        const characterStates = {};
        for (const name in scene.characters) {
            const chara = scene.characters[name];
            if (chara && chara.visible && chara.alpha > 0) {
                characterStates[name] = {
                    storage: chara.texture.key,
                    x: chara.x, y: chara.y,
                    scaleX: chara.scaleX, scaleY: chara.scaleY,
                    alpha: chara.alpha, flipX: chara.flipX,
                    tint: chara.tintTopLeft, // ★ 話者ハイライト復元用
                };
            }
        }
        
        // 背景の状態を取得
        const backgroundState = scenarioManager.layers.background.list.length > 0
            ? scenarioManager.layers.background.list[0].texture.key
            : null;

        // ★★★ ここが最重要: ScenarioManagerとMessageWindowから論理的な状態を収集 ★★★
        const scenarioState = {
            fileName: scenarioManager.currentFile,
            line: scenarioManager.currentLine,
            ifStack: scenarioManager.ifStack,
            callStack: scenarioManager.callStack,
            isWaitingClick: scenarioManager.isWaitingClick,
            isWaitingChoice: scenarioManager.isWaitingChoice,
            pendingChoices: scene.pendingChoices, // GameSceneが持つ選択肢データ
            // isWaitingClickがtrueの時のテキストと話者を保存
            // (MessageWindowにこれらのプロパティを追加する必要がある)
            currentText: scenarioManager.isWaitingClick ? scenarioManager.messageWindow.currentText : "",
            speakerName: scenarioManager.isWaitingClick ? scenarioManager.messageWindow.currentSpeaker : null,
        };
        
        // すべての状態を一つのオブジェクトに統合して返す
        return {
            saveDate: new Date().toLocaleString('ja-JP'),
            // ★ state.variables ではなく、このクラスが直接持つ f をセーブ
            variables: { f: this.f }, 
            scenario: scenarioState,
            layers: {
                background: backgroundState,
                characters: characterStates,
            },
            sound: {
                bgm: scenarioManager.soundManager.currentBgm, // SoundManagerから取得
            }
        };
    }

    /**
     * ★★★ 新しいsetState: ロードした状態から変数を復元する ★★★
     * @param {Object} loadedState - localStorageから読み込んだ状態オブジェクト
     */
    setState(loadedState) {
        // 変数(f)のみを復元する責務を持つ
        this.f = loadedState.variables.f || {};
    }

    // `eval` メソッドは変更の必要なし。そのままでOK。
    eval(exp) {
        // 'use strict' スコープ内で安全に実行
        try {
            return (function(f, sf) {
                'use strict';
                return eval(exp);
            })(this.f, this.sf);
        } catch (e) {
            console.error(`[eval] 式の評価中にエラーが発生しました: "${exp}"`, e);
            return undefined;
        }
    }

    // システム変数のセーブ/ロード、履歴の追加は変更なし。
    saveSystemVariables() {
        try {
            // sfが変更されたら自動保存
            localStorage.setItem('my_novel_engine_system', JSON.stringify(this.sf));
        } catch (e) { console.error("システム変数の保存に失敗しました。", e); }
    }
    loadSystemVariables() {
        try {
            const data = localStorage.getItem('my_novel_engine_system');
            return data ? JSON.parse(data) : {};
        } catch (e) { console.error("システム変数の読み込みに失敗しました。", e); return {}; }
    }
    addHistory(speaker, dialogue) {
        this.sf.history.push({ speaker, dialogue });
        if (this.sf.history.length > 100) this.sf.history.shift();
        this.saveSystemVariables(); // 履歴はシステム変数なので即時保存
    }
    
    // updateCharaなどの個別のupdateメソッドは不要になるため削除
}