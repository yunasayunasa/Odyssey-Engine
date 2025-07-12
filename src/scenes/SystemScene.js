export default class SystemScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SystemScene', active: true });
    }

    create() {
        console.log("SystemScene: 起動・イベント監視開始");

        // --- 1. [jump storage="SceneKey"] / [call storage="SceneKey"] の処理 ---
        this.events.on('request-scene-transition', async (data) => {
            console.log(`SystemScene: シーン遷移リクエストを受信 -> ${data.to} (from ${data.from})`);
            const currentSceneKey = data.from;
            const targetSceneKey = data.to;
            const params = data.params || {};

            // 現在のGameSceneとUISceneを停止する
            if (this.scene.isActive('GameScene')) {
                this.scene.stop('GameScene');
                console.log("SystemScene: GameSceneを停止しました。");
            }
            if (this.scene.isActive('UIScene')) {
                this.scene.stop('UIScene');
                console.log("SystemScene: UISceneを停止しました。");
            }
            // 他のカスタムシーン（例：ActionSceneが自身からjumpする場合）も停止する
            if (currentSceneKey !== 'GameScene' && this.scene.isActive(currentSceneKey)) {
                this.scene.stop(currentSceneKey);
                console.log(`SystemScene: ${currentSceneKey}を停止しました。`);
            }
            
            // ★★★ ターゲットシーンを起動する（initにデータを渡す） ★★★
            // GameSceneに戻る場合はUISceneも一緒に起動する
            if (targetSceneKey === 'GameScene') {
                this.scene.start('GameScene', { resumedFrom: currentSceneKey, ...params });
                this.scene.launch('UIScene'); // UISceneは常にGameSceneと共に
            } else {
                // GameScene以外への遷移（例: ActionScene）
                this.scene.start(targetSceneKey, params);
            }
            console.log(`SystemScene: シーン[${targetSceneKey}]を起動しました。`);
        });

        // --- 2. ActionSceneなどからのノベルパートへの帰還処理 ---
        this.events.on('return-to-novel', async (data) => {
            console.log(`SystemScene: 'return-to-novel' 受信！ [${data.from}]からの帰還`);
            const fromSceneKey = data.from;
            const returnParams = data.params || {};

            // 帰還元のシーンを停止
            if (this.scene.isActive(fromSceneKey)) {
                this.scene.stop(fromSceneKey);
                console.log(`SystemScene: ${fromSceneKey}を停止しました。`);
            }

            // ★★★ GameSceneとUISceneを、データを渡してstartし直す ★★★
            // これにより、GameSceneのinit(data)が呼ばれ、復帰処理が可能になる
            // GameSceneのcreateのif(this.isResuming)ブロックでparamsを処理する
            this.scene.start('GameScene', { resumedFrom: fromSceneKey, returnParams: returnParams });
            this.scene.launch('UIScene'); // UISceneはGameSceneと共に
            console.log("SystemScene: GameSceneとUISceneを再起動しました。");
        });

        // --- 3. オーバーレイ表示リクエストの処理 ---
        this.events.on('request-overlay', (data) => {
            console.log("SystemScene: オーバーレイ表示リクエストを受信", data);
            const gameScene = this.scene.get('GameScene');
            if (!gameScene) { console.error("SystemScene: GameSceneが見つかりません。"); return; }

            // オーバーレイ中は呼び出し元シーンの入力を無効化（例：ActionScene）
            const callerScene = this.scene.get(data.from);
            if (callerScene) {
                callerScene.input.enabled = false;
                console.log(`SystemScene: シーン[${data.from}]の入力を一時停止しました。`);
            }
            
            this.scene.launch('NovelOverlayScene', { 
                scenario: data.scenario,
                charaDefs: gameScene.charaDefs, // charaDefsを渡す
                from: data.from // 戻り先シーンのキーを渡す
            });
            console.log("SystemScene: NovelOverlaySceneを起動しました。");
        });
        
        // --- 4. オーバーレイ終了報告の処理 ---
        this.events.on('end-overlay', (data) => {
            console.log(`SystemScene: オーバーレイ終了報告。${data.returnTo} に戻ります。`);
            this.scene.stop(data.from); // オーバーレイシーンを停止
            
            // ★★★ 戻り先のシーンの入力を再開させる ★★★
            const returnScene = this.scene.get(data.returnTo);
            if (returnScene) {
                returnScene.input.enabled = true;
                console.log(`SystemScene: シーン[${data.returnTo}]の入力を再開しました。`);
            }
        });
    }
}