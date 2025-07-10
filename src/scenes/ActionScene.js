export default class ActionScene extends Phaser.Scene {
    constructor() {
        super('ActionScene');
    }

    create() {
        // 背景色
        this.cameras.main.setBackgroundColor('#4a86e8');

        // ★★★ "ゲームが動いている感"を出すためのダミーオブジェクト ★★★
        const player = this.add.text(100, 360, 'PLAYER', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        // 右に移動し続けるアニメーション
        this.tweens.add({
            targets: player,
            x: 1180,
            duration: 4000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        // ★★★ 3秒後に、オーバーレイ表示をリクエストする ★★★
        this.time.delayedCall(3000, () => {
            console.log("ActionScene: オーバーレイ表示をリクエストします。");
            this.scene.get('SystemScene').events.emit('request-overlay', { 
                scenario: 'overlay_test.ks' // 表示したいシナリオファイルを指定
            });
        });

        // 戻るボタンは、オーバーレイが終了すれば不要なので削除してもOK
    }
}