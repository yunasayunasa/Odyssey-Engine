export default class SystemScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SystemScene', active: true });
    }

 create() {
        console.log("SystemScene: 起動・イベント監視開始");
        
        // --- request-overlay イベントのリスナー ---
        this.events.on('request-overlay', (data) => {
            console.log("SystemScene: オーバーレイ表示リクエストを受信", data);
            
            const gameScene = this.scene.get('GameScene');
            const charaDefs = gameScene.sys.isActive() ? gameScene.charaDefs : (this.sys.game.config.globals.charaDefs || {});
            
            this.scene.launch('NovelOverlayScene', { 
                scenario: data.scenario,
                charaDefs: charaDefs 
            });
            // オーバーレイ表示中は、メインのUIは起動しない方がシンプル
            // this.scene.launch('UIScene');
        });
        
        // --- end-overlay イベントのリスナー ---
        this.events.on('end-overlay', (data) => {
            console.log("SystemScene: オーバーレイ終了報告を受信", data);
            
            if (this.scene.isActive(data.from)) {
                this.scene.stop(data.from);
            }
            // if (this.scene.isActive('UIScene')) {
            //     this.scene.stop('UIScene');
            // }

            if (data.targetStorage) {
                console.log(`次のシーン[${data.targetStorage}]へ遷移します。`);
                this.scene.start('GameScene', {
                    startScenario: data.targetStorage,
                    startLabel: data.targetLabel
                });
                this.scene.launch('UIScene');
            } else {
                console.log("呼び出し元のシーンの操作に戻ります。");
            }
        });

        // --- call/return用のシーン遷移リスナーもここにあると美しい ---
        // (省略)
    }
}
