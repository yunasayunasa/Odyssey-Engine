export default class ActionScene extends Phaser.Scene {
    constructor() {
        super('ActionScene');
    }
    create() {
        console.log("ActionScene: create 開始");
        this.cameras.main.setBackgroundColor('#4a86e8');
        const player = this.add.text(100, 360, 'PLAYER', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.tweens.add({ targets: player, x: 1180, duration: 4000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
        
        this.time.delayedCall(3000, () => {
            this.scene.get('SystemScene').events.emit('request-overlay', { 
                from: 'ActionScene',
                scenario: 'overlay_test.ks'
            });
          //  this.input.enabled = false;
        });

        const returnButton = this.add.text(640, 600, 'ボスを倒してノベルパートに戻る', { fontSize: '32px', fill: '#fff', backgroundColor: '#c00' })
            .setOrigin(0.5).setInteractive();
        
        returnButton.on('pointerdown', () => {
            this.scene.get('SystemScene').events.emit('return-to-novel', {
                from: 'ActionScene',
                params: { 'f.battle_result': 'win' }
            });
        });
    }bossDefeated() {
        console.log("--- ActionScene: bossDefeated 実行 ---");
        
        const data = { 
            from: 'ActionScene',
            params: { 'f.battle_result': 'win' }
        };
        console.log("SystemSceneに 'return-to-novel' を発行します。データ:", data);
      this.scene.get('SystemScene').events.emit('return-to-novel', data);

        console.log("ActionSceneを停止します。");
        this.scene.stop();
    }
}