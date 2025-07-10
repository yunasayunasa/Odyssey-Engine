export default class ActionScene extends Phaser.Scene {
    constructor() {
        super('ActionScene');
    }

    create() {
        console.log("ActionScene: create 開始");
        this.cameras.main.setBackgroundColor('#4a86e8');

        // ダミーのプレイヤーオブジェクト
        const player = this.add.text(100, 360, 'PLAYER', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.tweens.add({
            targets: player,
            x: 1180,
            duration: 4000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        // ★★★ 3秒後に、一度だけオーバーレイ表示をリクエストする ★★★
        this.time.delayedCall(3000, () => {
            console.log("ActionScene: オーバーレイ表示をリクエストします。");
        this.sys.game.config.globals.systemScene.events.emit('request-overlay', { 
                // ★★★ ".ks" を付け忘れないこと！ ★★★
                scenario: 'overlay_test.ks'
            });
        });
    }
}