export default class SystemScene extends Phaser.Scene {
    constructor() {
        // active:trueで、他のシーンと同時に、常にバックグラウンドで動作する
        super({ key: 'SystemScene', active: true });
    }

    create() {
        console.log("SystemScene: 起動しました。イベント監視を開始します。");
        
        // ★★★ 他のシーンからの「シーン遷移して」という依頼を受信するリスナー ★★★
        this.events.on('request-scene-change', (data) => {
            console.log("SystemScene: シーン遷移リクエストを受信", data);

            // 現在のシーンを一時停止
            this.scene.pause(data.from); // 'GameScene'など
            this.scene.pause('UIScene'); // UISceneも止める

            // 新しいシーンを上に重ねて起動
            this.scene.launch(data.to, data); // ActionSceneにデータを渡せる
        });
        
        // ★★★ 他のシーンからの「終わりました」という報告を受信するリスナー ★★★
        this.events.on('report-scene-end', (data) => {
            console.log("SystemScene: シーン終了報告を受信", data);
            
            // 呼び出し元のシーンを再開
            this.scene.resume(data.returnTo); // 'GameScene'など
            this.scene.resume('UIScene');

            // 呼び出し元のシーンに、「シナリオを進めてOK」という命令を送る
            const returnScene = this.scene.get(data.returnTo);
            returnScene.events.emit('execute-next-command');
        });
             // ★★★ オーバーレイ表示リクエストを受信するリスナー ★★★
        this.events.on('request-overlay', (data) => {
            console.log("SystemScene: オーバーレイ表示リクエストを受信", data);
            
            // 呼び出し元のシーン(ActionSceneなど)は止めない！
            
            // NovelOverlaySceneとUISceneを上に重ねて起動
            this.scene.launch('NovelOverlayScene', data);
            this.scene.launch('UIScene');
        });

        // ★★★ オーバーレイ終了報告を受信するリスナー ★★★
        this.events.on('end-overlay', (data) => {
            console.log("SystemScene: オーバーレイ終了報告を受信", data);
            
            // オーバーレイしていたシーンを停止
            this.scene.stop(data.from); // 'NovelOverlayScene'
            this.scene.stop('UIScene'); // UISceneも止める
        });
    }
    

    
}