export default class SystemScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SystemScene', active: true });
    }

 // SystemScene.js の create メソッド

    create() {
        console.log("SystemScene: 起動・イベント監視開始");
        
        // --- request-overlay イベントのリスナー ---
        this.events.on('request-overlay', (data) => {
            console.log("SystemScene: オーバーレイ表示リクエストを受信", data);
            
            // ★★★ GameSceneのインスタンスを安全に取得 ★★★
            const gameScene = this.scene.get('GameScene');
            if (!gameScene) {
                console.error("SystemScene: GameSceneが見つかりません。オーバーレイを起動できません。");
                return;
            }

            // ★★★ GameSceneがプロパティとして持っているcharaDefsを取得 ★★★
            const charaDefs = gameScene.charaDefs;
            
            // NovelOverlaySceneを起動し、取得したcharaDefsを渡す
            this.scene.launch('NovelOverlayScene', { 
                scenario: data.scenario,
                charaDefs: charaDefs 
            });
        });
        
        // --- end-overlay イベントのリスナー (こちらは変更なしでOK) ---
        this.events.on('end-overlay', (data) => {
            console.log("SystemScene: オーバーレイ終了報告を受信", data);
            
            if (this.scene.isActive(data.from)) {
                this.scene.stop(data.from);
            }

            // ActionSceneなどから戻ってきた場合は、UISceneは存在しないので、
            // 起動しているか確認してから止めるのが安全
            if (this.scene.isActive('UIScene')) {
                this.scene.stop('UIScene');
            }
        });

        // --- call/return用のシーン遷移リスナーもここ ---
        // (省略)
    }}