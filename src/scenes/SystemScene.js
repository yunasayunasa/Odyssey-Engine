export default class SystemScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SystemScene', active: true });
    }

 // SystemScene.js の create メソッド

    create() {
        console.log("SystemScene: 起動・イベント監視開始");
         this.events.on('return-to-novel', (data) => {
            const params = data.params;
            const fromSceneKey = data.from;
            console.log("--- SystemScene: 'return-to-novel' 受信！ ---");
            console.log("受信データ:", data);
            console.log(`SystemScene: [${fromSceneKey}]からの帰還命令を受信`, params);

            const gameScene = this.scene.get('GameScene');
            if (!gameScene) {
                console.error("SystemScene ERROR: GameSceneが見つかりません。");
                return;
            }

            // 呼び出し元のサブシーンを停止
            if (fromSceneKey && this.scene.isActive(fromSceneKey)) {
                this.scene.stop(fromSceneKey);
            }
            
            // ★★★ GameSceneを「再起動」し、復帰情報をinitデータとして渡す ★★★
            this.scene.start('GameScene', { 
                resumedFrom: fromSceneKey, // どのシーンから戻ってきたか
                returnParams: params       // [return]タグやサブシーンからのパラメータ
            });

            // ★★★ UISceneも再起動する ★★★
            // stopせずにlaunchすると、古いUIが残ってしまうことがあるため、
            // startでクリーンな状態から始めるのが安全
            this.scene.start('UIScene');
        });
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
                charaDefs: charaDefs,
               returnTo: data.from // ★ returnTo情報も渡す
            });
        });
        
         // --- オーバーレイ終了報告の受付 ---
        this.events.on('end-overlay', (data) => {
            console.log(`SystemScene: オーバーレイ終了報告。${data.returnTo} に戻ります。`);
            
            // オーバーレイシーンを停止
            this.scene.stop(data.from);
            
            // ★★★ 戻り先のシーンの入力を再開させる ★★★
            const returnScene = this.scene.get(data.returnTo);
            if (returnScene) {
                returnScene.input.enabled = true;
                console.log(`シーン[${data.returnTo}]の入力を再開しました。`);
            }
        });

        // --- call/return用のシーン遷移リスナーもここ ---
        // (省略)
    }}