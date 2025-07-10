export default class SystemScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SystemScene', active: true });
    }

    create() {
        console.log("SystemScene: 起動・イベント監視開始");
        
        this.events.on('request-overlay', (data) => {
            console.log("SystemScene: オーバーレイ表示リクエストを受信");
            
            // ★★★ 1. 裏で待機しているGameSceneのインスタンスを取得 ★★★
            const gameScene = this.scene.get('GameScene');

            // ★★★ 2. GameSceneが持っているcharaDefsを取得 ★★★
            const charaDefs = gameScene.charaDefs;
            
            // ★★★ 3. 取得したcharaDefsを、NovelOverlaySceneに渡して起動 ★★★
            this.scene.launch('NovelOverlayScene', { 
                scenario: data.scenario,
                charaDefs: charaDefs 
            });
            // UISceneは、NovelOverlaySceneが表示されてから、必要ならそちらで起動する方が安全
            // this.scene.launch('UIScene');
        });
        
        this.events.on('end-overlay', (data) => {
            console.log("SystemScene: オーバーレイ終了報告を受信");
            this.scene.stop(data.from); // NovelOverlaySceneを停止
            // UISceneも止める必要があれば、ここで止める
            if (this.scene.isActive('UIScene')) {
                this.scene.stop('UIScene');
            }
        });

        // call/return用のリスナーもここに追加すると、より堅牢になる
        // ...
    }
}