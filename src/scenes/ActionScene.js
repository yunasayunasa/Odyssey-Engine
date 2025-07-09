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
            // ★★★ UISceneとGameSceneを再開させる ★★★
            this.scene.resume('UIScene');
            this.scene.resume('GameScene');
            
            // 自分自身を停止する
            this.scene.stop();
        });
    }
}