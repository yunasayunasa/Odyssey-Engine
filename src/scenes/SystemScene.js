export default class SystemScene extends Phaser.Scene {
    constructor() {
        // ★★★ active:trueを復活させる ★★★
        super({ key: 'SystemScene', active: true });
    }

    create() {
        console.log("SystemScene: 起動・イベント監視開始");
        
        // ★★★ 自分自身のイベントリスナーを使う ★★★
               this.events.on('request-overlay', (data) => {
            console.log("SystemScene: オーバーレイ表示リクエストを受信");
            
            // GameSceneがアクティブか確認してから、charaDefsを取得
            const gameScene = this.scene.get('GameScene');
            const charaDefs = gameScene.sys.isActive() ? gameScene.charaDefs : {};
            
            this.scene.launch('NovelOverlayScene', { 
                scenario: data.scenario,
                charaDefs: charaDefs 
            });
            // UISceneはNovelOverlaySceneが表示されてから起動する方が安全
            // this.scene.launch('UIScene');
        });
        
        this.events.on('end-overlay', (data) => {
            console.log("SystemScene: オーバーレイ終了報告を受信");
            this.scene.stop(data.from);
            this.scene.stop('UIScene');
        });
    }
}