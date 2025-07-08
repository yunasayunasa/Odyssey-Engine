export default class ConfigScene extends Phaser.Scene {
    constructor() {
        super('ConfigScene');
        this.configManager = null;
    }

    create() {
        // GameSceneとUISceneからConfigManagerを受け取る
        const gameScene = this.scene.get('GameScene');
        this.configManager = gameScene.configManager;

        // 背景
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0, 0);
        
        // タイトル
        this.add.text(this.scale.width / 2, 100, 'コンフィグ', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

        // 戻るボタン
        const backButton = this.add.text(this.scale.width - 100, 50, '戻る', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        backButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('GameScene');
            this.scene.resume('UIScene');
        });

        // --- 設定項目を自動生成 ---
        const configDefs = this.configManager.getDefs();
        let y = 250; // UIを配置する最初のY座標

        for (const key in configDefs) {
            const def = configDefs[key];
            
            // ラベルを表示
            this.add.text(100, y, def.label, { fontSize: '32px', fill: '#fff' }).setOrigin(0, 0.5);

            // 値を表示
            const valueTextX = this.scale.width - 320;
            const valueText = this.add.text(valueTextX, y, this.configManager.getValue(key), { fontSize: '32px', fill: '#fff' }).setOrigin(1, 0.5);

            // スライダーUIを模した簡単なクリックボタンを作成
            // (本格的なスライダーUIは、外部ライブラリを使うか、自作する必要があり複雑なため)
            const minusButton = this.add.text(this.scale.width - 250, y, '-', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5).setInteractive();
            const plusButton = this.add.text(this.scale.width - 150, y, '+', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5).setInteractive();

            const updateValue = (newValue) => {
                // 値が範囲内に収まるように調整
                newValue = Phaser.Math.Clamp(newValue, def.min, def.max);
                // stepに合わせる（例: 0.1単位にする）
                newValue = Math.round(newValue / def.step) * def.step;
                
                this.configManager.setValue(key, parseFloat(newValue.toFixed(2)));
                valueText.setText(this.configManager.getValue(key));
            };

            minusButton.on('pointerdown', () => {
                updateValue(this.configManager.getValue(key) - def.step);
            });
            plusButton.on('pointerdown', () => {
                updateValue(this.configManager.getValue(key) + def.step);
            });
            
            y += 100; // 次のUIのY座標
        }
    }
}