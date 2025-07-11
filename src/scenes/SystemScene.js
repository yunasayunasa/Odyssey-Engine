export default class SystemScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SystemScene', active: true });
    }

    create() {
        console.log("SystemScene: 起動・イベント監視開始");
        
        // --- request-overlay イベントのリスナー ---
        this.events.on('request-overlay', (data) => {
            const gameScene = this.scene.get('GameScene');
            const charaDefs = gameScene.sys.isActive() ? gameScene.charaDefs : {};
            this.scene.launch('NovelOverlayScene', { 
                scenario: data.scenario,
                charaDefs: charaDefs 
            });
        });
        
        // --- end-overlay イベントのリスナー ---
        this.events.on('end-overlay', (data) => {
            const actionScene = this.scene.get(data.returnTo);
            if (actionScene && actionScene.sys.isActive()) {
                actionScene.input.enabled = true;
            }
            this.scene.stop(data.from);
        });

        // ★★★ すべての「ノベルパートへの帰還」を処理するリスナー ★★★
        this.events.on('return-to-novel', (data) => {
            const params = data.params;
            const fromSceneKey = data.from;

            console.log(`SystemScene: [${fromSceneKey}]からの帰還命令を受信`, params);

            const gameScene = this.scene.get('GameScene');
            if (!gameScene) return;

            // 呼び出し元のサブシーンを停止
            if (fromSceneKey && this.scene.isActive(fromSceneKey)) {
                this.scene.stop(fromSceneKey);
            }

            // GameSceneが止まっていたら、再開させる
            if (!gameScene.sys.isActive()) {
                this.scene.resume('GameScene');
                this.scene.resume('UIScene');
            }

            // GameSceneに、return処理の実行を命令
            gameScene.events.emit('execute-return', params);
        });
    }
}