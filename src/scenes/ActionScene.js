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
        
        // 3秒後に、オーバーレイ表示をリクエストする
        this.time.delayedCall(3000, () => {
            console.log("ActionScene: オーバーレイ表示をリクエストします。");
            
               // ★★★ これが、シーン間で通信する最も安全な方法 ★★★
            this.scene.get('SystemScene').events.emit('request-overlay', { 
                scenario: 'overlay_test.ks'
            });
        });
    }
}

