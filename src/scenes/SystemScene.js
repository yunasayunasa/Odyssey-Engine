// src/scenes/SystemScene.js (最終版 - 全ての改善を統合)

export default class SystemScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SystemScene', active: true });
        this.globalCharaDefs = null;
        this.isProcessingTransition = false; // ★★★ 追加: 遷移処理中フラグ ★★★
        this.targetSceneKey = null; // ★★★ 追加: 現在遷移を試みているターゲットシーンのキーを保持 ★★★
    }

    create() {
        console.log("SystemScene: 起動・イベント監視開始");

        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.charaDefs) {
            this.globalCharaDefs = gameScene.charaDefs;
        }

        // --- シーン開始処理とフラグのリセットを管理する共通ヘルパー関数 ---
        // この関数がシーンを実際に開始し、完了イベントを待ち、フラグをリセットする
        const startAndMonitorScene = (sceneKey, params, waitForGameSceneLoadComplete) => {
            // すでに遷移処理中の場合、またはターゲットシーンが既にアクティブ/遷移中の場合
            if (this.isProcessingTransition || (this.targetSceneKey && this.targetSceneKey === sceneKey)) {
                console.warn(`[SystemScene] シーン[${sceneKey}]は既に遷移処理中またはアクティブです。新しいリクエストをスキップします。`);
                return;
            }

            this.isProcessingTransition = true; // 遷移処理開始
            this.targetSceneKey = sceneKey;    // ターゲットシーンを設定
            console.log(`[SystemScene] シーン[${sceneKey}]の起動を開始します。`);

            // ターゲットシーンを実際に開始
            this.scene.start(sceneKey, params);

            // 遷移完了イベントを購読してフラグをリセット
            if (waitForGameSceneLoadComplete) {
                // GameSceneへの遷移の場合、GameSceneからのカスタムイベント 'gameScene-load-complete' を待つ
                // GameSceneのロードが完了してから有効化することで、未準備状態でのUI操作を防ぐ
                this.scene.get('GameScene').events.once('gameScene-load-complete', () => {
                    this.scene.get('GameScene').input.enabled = true;
                    if (this.scene.isActive('UIScene')) { 
                        this.scene.get('UIScene').input.enabled = true;
                    }
                    console.log("SystemScene: GameSceneとUISceneの入力を再有効化しました。");

                    this.isProcessingTransition = false;
                    this.targetSceneKey = null; // ターゲットシーンをクリア
                    console.log(`[SystemScene] GameSceneのロード完了イベント受信。遷移処理フラグをリセットしました。`);
                });
            } else {
                // その他のシーン（ActionScene, BattleSceneなど）への遷移の場合、PhaserのCREATEイベントを待つ
                this.scene.get(sceneKey).events.once(Phaser.Scenes.Events.CREATE, () => {
                    this.isProcessingTransition = false;
                    this.targetSceneKey = null; // ターゲットシーンをクリア
                    console.log(`[SystemScene] シーン[${sceneKey}]のCREATEイベント受信。遷移処理フラグをリセットしました。`);
                });
            }
        };


        // --- 1. [jump] や [call] によるシーン遷移リクエストを処理 ---
        this.events.on('request-scene-transition', (data) => {
            console.log(`[SystemScene] シーン遷移リクエスト: ${data.from} -> ${data.to}`, data.params);

            // 現在のノベルパートのシーン（GameScene）の入力を完全に無効化し、停止
            if (this.scene.isActive('GameScene')) {
                this.scene.get('GameScene').input.enabled = false;
                this.scene.stop('GameScene'); // GameSceneは停止して再起動
            }
            
            // ★★★ 修正箇所: UISceneは「停止しない」。入力だけ無効化。 ★★★
            // UISceneは常にアクティブなPersistent UIであるため、destroy/recreateすべきではない
            if (this.scene.isActive('UIScene')) {
                this.scene.get('UIScene').input.enabled = false;
                // this.scene.stop('UIScene'); // <<< この行を削除
            }
            
            // 共通ヘルパー関数でシーン遷移を開始
            startAndMonitorScene(data.to, {
                charaDefs: this.globalCharaDefs,
                transitionParams: data.params, 
                startScenario: data.to === 'GameScene' ? 'test_main.ks' : null,
                startLabel: null,
            }, data.to === 'GameScene'); // GameSceneの場合はgameScene-load-completeを待つ
        });

        // --- 2. サブシーンからノベルパートへの復帰リクエストを処理 ---
        this.events.on('return-to-novel', (data) => {
            console.log(`[SystemScene] ノベル復帰リクエスト: from ${data.from}`, data.params);

            // 戻り元のシーンの入力を無効化し、停止 (例: BattleSceneを停止)
            const fromScene = this.scene.get(data.from);
            if (fromScene) {
                fromScene.input.enabled = false;
            }
            if (data.from && this.scene.isActive(data.from)) {
                this.scene.stop(data.from);
            }

            // ★★★ 修正箇所: GameSceneとUISceneの入力有効化は、GameSceneのロード完了時に移動 ★★★
            // ここにあった以下の行を削除 (startAndMonitorScene内のgameScene-load-completeコールバックに移動)
            // this.scene.get('GameScene').input.enabled = true;
            // if (this.scene.isActive('UIScene')) { 
            //     this.scene.get('UIScene').input.enabled = true;
            // }
            // console.log("SystemScene: GameSceneとUISceneの入力を再有効化しました。");

            // 共通ヘルパー関数でGameSceneへの復帰を開始 (GameSceneの場合は常にload-completeを待つ)
            startAndMonitorScene('GameScene', {
                charaDefs: this.globalCharaDefs,
                resumedFrom: data.from,
                returnParams: data.params,
            }, true); // GameSceneへの復帰なので、常にgameScene-load-completeを待つ
        });

        /**
         * ゲーム初期起動時のGameSceneとUISceneの起動を処理する
         * PreloadSceneから一度だけ呼び出されることを想定
         * @param {Object} charaDefs - ロード済みのcharaDefsオブジェクト
         * @param {string} startScenarioKey - GameSceneで最初にロードするシナリオキー
         */
        this.startInitialGame = (charaDefs, startScenarioKey) => {
            this.globalCharaDefs = charaDefs;
            console.log("SystemScene: 初期ゲーム起動リクエストを受信しました。");

            // startAndMonitorSceneを使ってGameSceneとUISceneを起動
            // GameSceneはロード完了を待つように設定
            startAndMonitorScene('GameScene', { 
                charaDefs: this.globalCharaDefs,
                startScenario: startScenarioKey,
                startLabel: null,
            }, true); // GameSceneはロード完了を待つ

            // UISceneはGameConfigでactive:trueになっているはずなので、ここでは特にlaunchしない
            // もし何らかの理由でUISceneがactive:trueでない場合に備えた防御的チェック
            if (!this.scene.isActive('UIScene')) {
                this.scene.launch('UIScene'); 
            }
            // UISceneのinputはGameSceneのロード完了後に有効化されるので、ここでは何もしない
            
            console.log("SystemScene: 初期ゲーム起動処理を開始しました。");
        };

        // --- オーバーレイ関連のイベントリスナー (ここでは isProcessingTransition フラグは使用しない) ---
        // オーバーレイは既存シーンを停止しないため、遷移とは別の扱い
        this.events.on('request-overlay', (data) => {
            console.log("[SystemScene] オーバーレイ表示リクエスト", data);
            this.scene.launch('NovelOverlayScene', { 
                scenario: data.scenario,
                charaDefs: this.globalCharaDefs,
                returnTo: data.from
            });
        });
        
        this.events.on('end-overlay', (data) => {
            console.log(`[SystemScene] オーバーレイ終了`, data);
            this.scene.stop(data.from); 
            const returnScene = this.scene.get(data.returnTo);
            if (returnScene) {
                returnScene.input.enabled = true; 
                console.log(`SystemScene: シーン[${data.returnTo}]の入力を再有効化しました。`);
            }
        });
    }
}