export default class SystemScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SystemScene', active: true });
    }

    create() {
        console.log("SystemScene: 起動・イベント監視開始");
        
        // createメソッドの中
        // ★★★ オーバーレイ終了報告リスナーを、このように書き換える ★★★
        this.events.on('end-overlay', (data) => {
            console.log("SystemScene: オーバーレイ終了報告を受信", data);
            
            // --- まず、オーバーレイしていたシーンを停止させる ---
            // NovelOverlaySceneを停止
            if (this.scene.isActive(data.from)) {
                this.scene.stop(data.from);
            }
            // UISceneも止める
            if (this.scene.isActive('UIScene')) {
                this.scene.stop('UIScene');
            }

            // --- 次の行き先を判断 ---
            if (data.targetStorage) {
                // ★ 行き先が指定されている場合 (例:エンディングへ)
                console.log(`次のシーン[${data.targetStorage}]へ遷移します。`);
                
                // GameSceneを再起動し、新しいシナリオをロードさせる
                this.scene.start('GameScene', {
                    startScenario: data.targetStorage,
                    startLabel: data.targetLabel
                });
                // UISceneも再起動
                this.scene.launch('UIScene');

            } else {
                // ★ 行き先が指定されていない場合 (例:アクションシーンの操作に戻る)
                console.log("呼び出し元のシーンの操作に戻ります。");
                // 何もしない。ActionSceneは動き続けているので、
                // オーバーレイが消えるだけで、プレイヤーは操作を再開できる。
            }
        });
