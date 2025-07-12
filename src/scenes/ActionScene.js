export default class ActionScene extends Phaser.Scene {
    constructor() {
        super('ActionScene');
    }

    create() {
        console.log("ActionScene: create 開始");
        this.cameras.main.setBackgroundColor('#4a86e8');
        const player = this.add.text(100, 360, 'PLAYER', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.tweens.add({ targets: player, x: 1180, duration: 4000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
        
        // --- オーバーレイ表示リクエスト (このシーンは進行を一時停止しない) ---
        this.time.delayedCall(3000, () => {
            console.log("ActionScene: request-overlay を発行");
            this.scene.get('SystemScene').events.emit('request-overlay', { 
                from: this.scene.key, // 'ActionScene'
                scenario: 'overlay_test.ks'
            });
            // オーバーレイ中は、このシーンの入力を一時停止する方が良い場合が多い
            this.input.enabled = false;
        });

        // --- ノベルパートへの戻るボタン ---
        const returnButton = this.add.text(640, 600, 'ボスを倒してノベルパートに戻る', { fontSize: '32px', fill: '#fff', backgroundColor: '#c00' })
            .setOrigin(0.5).setInteractive();
        
        returnButton.on('pointerdown', () => {
            console.log("ActionScene: return-to-novel を発行");
            // ★★★ SystemSceneに、ノベルパートへの復帰を依頼する ★★★
            this.scene.get('SystemScene').events.emit('return-to-novel', {
                from: this.scene.key, // 'ActionScene'
                params: { 'f.battle_result': 'win' } // 復帰時にGameSceneに渡すパラメータ
            });
            // このシーンはSystemSceneによって停止されるため、ここでは何もせず終了
        });
    }
    // ★★★ bossDefeated() メソッドは不要なので削除 ★★★
}