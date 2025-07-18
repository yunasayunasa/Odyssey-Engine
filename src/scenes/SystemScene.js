// src/scenes/SystemScene.js (最終版 - 再調整)

export default class SystemScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SystemScene', active: false }); // ★★★ 修正箇所: active:false に変更 ★★★
        this.globalCharaDefs = null;
        this.isProcessingTransition = false; 
        this.targetSceneKey = null; 
    }

    create() {
        console.log("SystemScene: 起動・イベント監視開始");

        // ★★★ 修正箇所: create時のglobalCharaDefs初期化は削除。startInitialGameで設定されるため。 ★★★
        // const gameScene = this.scene.get('GameScene');
        // if (gameScene && gameScene.charaDefs) {
        //     this.globalCharaDefs = gameScene.charaDefs;
        // }

        // --- シーン開始処理とフラグのリセットを管理する共通ヘルパー関数 ---
        const startAndMonitorScene = (sceneKey, params, waitForGameSceneLoadComplete) => {
            if (this.isProcessingTransition || (this.targetSceneKey && this.targetSceneKey === sceneKey)) {
                console.warn(`[SystemScene] シーン[${sceneKey}]は既に遷移処理中またはアクティブです。新しいリクエストをスキップします。`);
                return;
            }

            this.isProcessingTransition = true; 
            this.targetSceneKey = sceneKey;    
            console.log(`[SystemScene] シーン[${sceneKey}]の起動を開始します。`);

            this.scene.start(sceneKey, params);

            if (waitForGameSceneLoadComplete) {
                // GameSceneへの遷移の場合、GameSceneからのカスタムイベント 'gameScene-load-complete' を待つ
                const gameSceneInstance = this.scene.get('GameScene');
                if (gameSceneInstance) { // GameSceneが起動していることを確認
                    gameSceneInstance.events.once('gameScene-load-complete', () => {
                        gameSceneInstance.input.enabled = true;
                        
                        const uiScene = this.scene.get('UIScene');
                        if (uiScene && uiScene.scene.isActive()) { 
                            uiScene.input.enabled = true;
                        } else {
                            console.warn("SystemScene: GameSceneロード完了時、UISceneがアクティブではありませんでした。");
                        }
                        console.log("SystemScene: GameSceneとUISceneの入力を再有効化しました。");

                        this.isProcessingTransition = false;
                        this.targetSceneKey = null; 
                        console.log(`[SystemScene] GameSceneのロード完了イベント受信。遷移処理フラグをリセットしました。`);
                    });
                } else {
                    console.error("SystemScene: GameSceneインスタンスが取得できません。gameScene-load-completeイベントを待てません。");
                    // エラー時にはフラグをリセットするなど、リカバリー処理が必要
                    this.isProcessingTransition = false;
                    this.targetSceneKey = null;
                }
            } else {
                const targetSceneInstance = this.scene.get(sceneKey);
                if (targetSceneInstance) { // ターゲットシーンが起動していることを確認
                    targetSceneInstance.events.once(Phaser.Scenes.Events.CREATE, () => {
                        this.isProcessingTransition = false;
                        this.targetSceneKey = null; 
                        console.log(`[SystemScene] シーン[${sceneKey}]のCREATEイベント受信。遷移処理フラグをリセットしました。`);
                    });
                } else {
                     console.error(`SystemScene: シーン[${sceneKey}]インスタンスが取得できません。CREATEイベントを待てません。`);
                     this.isProcessingTransition = false;
                     this.targetSceneKey = null;
                }
            }
        };


        // --- 1. [jump] や [call] によるシーン遷移リクエストを処理 ---
        this.events.on('request-scene-transition', (data) => {
            console.log(`[SystemScene] シーン遷移リクエスト: ${data.from} -> ${data.to}`, data.params);

            // GameSceneの入力を無効化し、停止
            const gameSceneInstance = this.scene.get('GameScene');
            if (gameSceneInstance && gameSceneInstance.scene.isActive()) {
                gameSceneInstance.input.enabled = false;
                gameSceneInstance.scene.stop('GameScene');
            }
            
            // UISceneは「停止しない」。入力だけ無効化。
            const uiSceneInstance = this.scene.get('UIScene');
            if (uiSceneInstance && uiSceneInstance.scene.isActive()) { 
                uiSceneInstance.input.enabled = false;
            }
            
            startAndMonitorScene(data.to, {
                charaDefs: this.globalCharaDefs,
                transitionParams: data.params, 
                startScenario: data.to === 'GameScene' ? 'test_main.ks' : null,
                startLabel: null,
            }, data.to === 'GameScene'); 
        });

        // --- 2. サブシーンからノベルパートへの復帰リクエストを処理 ---
        this.events.on('return-to-novel', (data) => {
            console.log(`[SystemScene] ノベル復帰リクエスト: from ${data.from}`, data.params);

            const fromScene = this.scene.get(data.from);
            if (fromScene) {
                fromScene.input.enabled = false;
            }
            if (data.from && this.scene.isActive(data.from)) {
                this.scene.stop(data.from);
            }
            
            startAndMonitorScene('GameScene', {
                charaDefs: this.globalCharaDefs,
                resumedFrom: data.from,
                returnParams: data.params,
            }, true); 
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

            // UISceneを先に起動（またはアクティブ化）する
            const uiSceneInstance = this.scene.get('UIScene');
            if (!uiSceneInstance || !uiSceneInstance.scene.isActive()) { // UISceneがまだactiveでない場合
                this.scene.launch('UIScene'); 
            }
            // UISceneのinputはGameSceneのロード完了後に有効化されるので、ここでは何もしない

            // startAndMonitorSceneを使ってGameSceneを起動
            startAndMonitorScene('GameScene', { 
                charaDefs: this.globalCharaDefs,
                startScenario: startScenarioKey,
                startLabel: null,
            }, true); 
            
            console.log("SystemScene: 初期ゲーム起動処理を開始しました。");
        };

        // --- オーバーレイ関連のイベントリスナー ---
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
            if (returnScene) { // returnToシーンが存在するか確認
                returnScene.input.enabled = true; 
                console.log(`SystemScene: シーン[${data.returnTo}]の入力を再有効化しました。`);
            }
        });
    }
}