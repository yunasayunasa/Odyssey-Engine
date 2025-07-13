// SystemScene.js (最終版 Ver.2)

export default class SystemScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SystemScene', active: true });
        this.globalCharaDefs = null; // ★★★ charaDefsを保持するプロパティを追加 ★★★
    }

    create() {
        console.log("SystemScene: 起動・イベント監視開始");

        // ★★★ GameSceneが起動する際にcharaDefsを受け取る ★★★
        // GameSceneのcreateが呼ばれた後に、this.scene.get('GameScene').charaDefs が利用可能になる
        // しかし、SystemSceneがcharaDefsを覚えておく方が堅牢
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.charaDefs) {
            this.globalCharaDefs = gameScene.charaDefs;
            console.log("SystemScene: GameSceneからcharaDefsを取得しました。");
        } else {
            console.warn("SystemScene: GameSceneから初期charaDefsが取得できませんでした。");
        }

        // --- 1. [jump] や [call] によるシーン遷移リクエストを処理 ---
        this.events.on('request-scene-transition', (data) => {
            console.log(`[SystemScene] シーン遷移リクエスト: ${data.from} -> ${data.to}`, data.params);

            this.scene.stop('GameScene');
            this.scene.stop('UIScene');

            // ★★★ 新しいシーンを開始する際にcharaDefsを渡す ★★★
            this.scene.start(data.to, {
                charaDefs: this.globalCharaDefs, // グローバルなcharaDefsを渡す
                startScenario: data.to === 'GameScene' ? 'test.ks' : null, // GameSceneに戻るならシナリオ指定
                startLabel: null,
                // 他にも必要なパラメータがあればここに
            });
        });

        // ★★★ 2. サブシーンからノベルパートへの復帰リクエストを処理 ★★★
        this.events.on('return-to-novel', (data) => {
            console.log(`[SystemScene] ノベル復帰リクエスト: from ${data.from}`, data.params);

            if (data.from && this.scene.isActive(data.from)) {
                this.scene.stop(data.from);
            }

            // ★★★ GameSceneを「復帰モード」で再開する際にcharaDefsを渡す ★★★
            this.scene.start('GameScene', {
                charaDefs: this.globalCharaDefs, // グローバルなcharaDefsを渡す
                resumedFrom: data.from,
                returnParams: data.params,
            });
            this.scene.launch('UIScene'); // UISceneも再起動
        });


             // --- オーバーレイ関連のイベントリスナー ---

        this.events.on('request-overlay', (data) => {
            console.log("[SystemScene] オーバーレイ表示リクエスト", data);
            
            // ★★★ 修正箇所: ここで直接 input.enabled を操作しない ★★★
            // リクエスト元のシーンはpauseされるので、入力は自動で止まる
            // const requestScene = this.scene.get(data.from);
            // if (requestScene) {
            //     requestScene.input.enabled = false; 
            // }
            
            this.scene.launch('NovelOverlayScene', { 
                scenario: data.scenario,
                charaDefs: this.globalCharaDefs,
                returnTo: data.from
            });
        });
        
        this.events.on('end-overlay', (data) => {
            console.log(`[SystemScene] オーバーレイ終了`, data);
            
            this.scene.stop(data.from);
            
            // ★★★ 修正箇所: ここで直接 input.enabled を操作しない ★★★
            // 戻り先のシーンが resume された時に、そのシーン自身が入力制御する
            // const returnScene = this.scene.get(data.returnTo);
            // if (returnScene) {
            //     returnScene.input.enabled = true;
            //     console.log(`シーン[${data.returnTo}]の入力を再開しました。`);
            // }

            // ★ 戻り先のシーンを resume する
            this.scene.resume(data.returnTo);
        });
    }
}