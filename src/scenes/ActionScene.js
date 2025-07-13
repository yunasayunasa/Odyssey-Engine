// ActionScene.js (最終版)

export default class ActionScene extends Phaser.Scene {
    constructor() {
        super('ActionScene');
    }

    create() {
        console.log("ActionScene: create 開始");
        this.cameras.main.setBackgroundColor('#4a86e8');
        const player = this.add.text(100, 360, 'PLAYER', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.tweens.add({ targets: player, x: 1180, duration: 4000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
        
        // --- オーバーレイ表示リクエスト ---
        this.time.delayedCall(3000, () => {
            console.log("ActionScene: request-overlay を発行");
            // ★★★ 修正箇所: シーンの一時停止と入力無効化はSystemSceneに任せる ★★★
            // this.scene.pause(); // 削除
            this.scene.get('SystemScene').events.emit('request-overlay', { 
                from: this.scene.key,
                scenario: 'overlay_test.ks'
            });
            // this.input.enabled = false; // 削除
        });

        // --- ノベルパートへの戻るボタン ---
        const returnButton = this.add.text(640, 600, 'ボスを倒してノベルパートに戻る', { fontSize: '32px', fill: '#fff', backgroundColor: '#c00' })
            .setOrigin(0.5).setInteractive();
        
        returnButton.on('pointerdown', () => {
            console.log("ActionScene: return-to-novel を発行");
            // ★★★ 修正箇所: ここでinput.enabled=false;は不要 ★★★
            this.scene.get('SystemScene').events.emit('return-to-novel', {
                from: this.scene.key,
                params: { 'f.battle_result': 'win' }
            });
        });
    }

    // ★★★ シーンが resume された時に、入力を再有効化する (これはこのままでOK) ★★★
    resume() {
        console.log("ActionScene: resume されました。入力を再有効化します。");
        this.input.enabled = true;
    }
}