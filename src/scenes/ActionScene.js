// ★★★ export default をクラス定義の先頭に付ける ★★★
export default class ActionScene extends Phaser.Scene {
    constructor() {
        super('ActionScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#336699');
        this.add.text(640, 300, 'アクションシーン', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);

        const returnButton = this.add.text(640, 450, 'ノベルパートに戻る', { fontSize: '40px', fill: '#fff', backgroundColor: '#555', padding: {x:20, y:10}})
            .setOrigin(0.5)
            .setInteractive();
            
        returnButton.on('pointerdown', () => {
            // GameSceneの'scene-resume'イベントを発火させる
            // ★★★ シーンがpause状態だとイベントを受け取れないことがあるので、resumeしてからemitする方が安全 ★★★
            const gameScene = this.scene.get('GameScene');
            this.scene.resume('GameScene');
            gameScene.events.emit('scene-resume');
            
            this.scene.stop();
        });
    }
}