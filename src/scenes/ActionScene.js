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
        
      this.time.delayedCall(3000, () => {
            console.log("ActionScene: オーバーレイ表示をリクエストします。");
            
            // ★★★ 司令塔に、オーバーレイの起動を依頼 ★★★
            this.scene.get('SystemScene').events.emit('request-overlay', { 
                from: 'ActionScene', // 誰が依頼したか
                scenario: 'overlay_test.ks' // どのシナリオを再生するか
            });

            // 依頼を出したら、自分は入力を受け付けなくする
            this.input.enabled = false;
        });
        
    }
       bossDefeated() {
        this.scene.get('SystemScene').events.emit('return-to-novel', { 
            'f.battle_result': 'win'
        });
        this.scene.stop();
    }
}

