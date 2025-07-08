export default class BacklogScene extends Phaser.Scene {
    constructor() {
        super('BacklogScene');
        this.stateManager = null;
    }

    create() {
        // GameSceneからStateManagerを受け取る
        const gameScene = this.scene.get('GameScene');
        this.stateManager = gameScene.stateManager;
        
        // --- UIのセットアップ ---
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.9).setOrigin(0, 0);
        this.add.text(this.scale.width / 2, 60, 'バックログ', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        const backButton = this.add.text(this.scale.width - 100, 50, '戻る', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        backButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('GameScene');
            this.scene.resume('UIScene');
        });

        // --- 履歴の表示 ---
        const history = this.stateManager.getState().history;
        let y = this.scale.height - 100; // 画面の一番下から表示を開始

        // 履歴を逆順（新しいものが下）にループ
        [...history].reverse().forEach(log => {
            let lineText = '';
            
            // 話者がいる場合
            if (log.speaker) {
                // キャラクター定義から日本語名を取得
                const charaDef = gameScene.charaDefs[log.speaker];
                const speakerName = charaDef ? charaDef.jname : log.speaker;
                lineText += `【${speakerName}】\n`;
            }
            
            lineText += log.dialogue;

            // テキストオブジェクトを作成
            const textObject = this.add.text(this.scale.width / 2, y, lineText, {
                fontSize: '28px',
                fill: '#fff',
                wordWrap: { width: this.scale.width - 100 },
                align: 'left'
            }).setOrigin(0.5, 1); // ★ Yの原点を1(下端)に設定
            
            // 次のテキストのY座標を、今表示したテキストの高さ分だけ上にずらす
            y -= textObject.getBounds().height + 20; // 20pxの余白
        });
    }
}