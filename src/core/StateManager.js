export default class StateManager {
    constructor() {
        // --- セーブデータとして保存する情報の「器」を定義 ---
        this.state = {
            scenario: {
                fileName: null,
                line: 0
            },
            layers: {
                background: null,
                characters: {}
            },
            sound: {
                bgm: null
            },
            variables: {},      // f.変数用
            history: [],        // バックログ用
            ifStack: [],        // if文のネスト状態
            callStack: []       // call/returnの履歴
        };

        // --- セーブデータとは別に管理するシステム変数 ---
        this.systemVariables = this.loadSystemVariables() || {}; // sf.変数
    }

    /**
     * 現在のゲームの完全なスナップショットを取得する
     * @param {ScenarioManager} manager - 最新の状態を持つシナリオマネージャー
     * @returns {Object} セーブ可能な状態オブジェクト
     */
    getState(manager) {
        // 1. ScenarioManagerから、最新の動的な状態をコピーする
        this.state.ifStack = manager.ifStack;
        this.state.callStack = manager.callStack;
        
        // 2. 現在の行番号やファイル名も、念のため最新のものに更新
        this.state.scenario.fileName = manager.currentFile;
        this.state.scenario.line = manager.currentLine;

        // 3. stateオブジェクトの完全なコピーを返す
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * ロードしたデータで、内部状態を完全に上書きする
     * @param {Object} newState - ロードした状態オブジェクト
     */
    setState(newState) {
        this.state = newState;
    }
    
    // --- 各タグハンドラから呼ばれる、単純な状態更新メソッド群 ---

    updateBg(storage) {
        this.state.layers.background = storage;
        console.log('State Updated (Background):', this.state.layers.background);
    }

    updateChara(name, charaData) {
        if (charaData) {
            this.state.layers.characters[name] = charaData;
        } else {
            delete this.state.layers.characters[name];
        }
        console.log('State Updated (Characters):', this.state.layers.characters);
    }

    updateBgm(key) {
        this.state.sound.bgm = key;
        console.log('State Updated (BGM):', this.state.sound.bgm);
    }

    addHistory(speaker, dialogue) {
        this.state.history.push({ speaker, dialogue });
        if (this.state.history.length > 100) {
            this.state.history.shift();
        }
    }
    
    // --- 変数操作とシステム変数 ---

    eval(exp) {
        const f = this.state.variables;
        const sf = this.systemVariables;
        try {
            const result = (function(f, sf) {
                'use strict';
                return eval(exp); 
            })(f, sf);
            this.saveSystemVariables();
            return result;
        } catch (e) {
            console.error(`[eval] 式の評価中にエラーが発生しました: "${exp}"`, e);
            return undefined;
        }
    }

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
}