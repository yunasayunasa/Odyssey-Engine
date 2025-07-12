export default class ConfigScene extends Phaser.Scene {
    constructor() {
        super('ConfigScene');
        this.configManager = null;
        this.uiElements = []; // ★ UI要素を管理する配列を追加
    }

    create() {
         // ★★★ 1. 前回作られたUIをすべて破棄する ★★★
        this.uiElements.forEach(el => el.destroy());
        this.uiElements = [];
        // GameSceneとUISceneからConfigManagerを受け取る
        const gameScene = this.scene.get('GameScene');
 this.configManager = this.sys.registry.get('configManager');
        // 背景
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0, 0);
        
        // タイトル
        this.add.text(this.scale.width / 2, 100, 'コンフィグ', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

        // 戻るボタン
        const backButton = this.add.text(this.scale.width - 100, 50, '戻る', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
         this.uiElements.push( title, backButton); // 管理リストに追加
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

             // ★★★ 設定項目の種類(type)によって、生成するUIを変える ★★★
            if (def.type === 'slider') {
                // --- スライダーUIの生成 ---
                const valueText = this.add.text(1280 - 320, y, this.configManager.getValue(key), { fontSize: '32px', fill: '#fff' }).setOrigin(1, 0.5);
                const minusButton = this.add.text(1280 - 250, y, '-', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5).setInteractive();
                const plusButton = this.add.text(1280 - 150, y, '+', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5).setInteractive();

                const updateValue = (newValue) => {
                    newValue = Phaser.Math.Clamp(newValue, def.min, def.max);
                    newValue = Math.round(newValue / def.step) * def.step;
                    this.configManager.setValue(key, parseFloat(newValue.toFixed(2)));
                    valueText.setText(this.configManager.getValue(key));
                };
                minusButton.on('pointerdown', () => updateValue(this.configManager.getValue(key) - def.step));
                plusButton.on('pointerdown', () => updateValue(this.configManager.getValue(key) + def.step));

            } else if (def.type === 'option') {
                // --- オプション選択UIの生成 ---
                const options = def.options;
                const currentValue = this.configManager.getValue(key);
                let buttonX = 1280 - 150; // ボタンを配置する右端のX座標

                // optionsオブジェクトを逆順にループして、右からボタンを配置
                Object.keys(options).reverse().forEach(optionKey => {
                    const optionLabel = options[optionKey];
                    const button = this.add.text(buttonX, y, optionLabel, { fontSize: '32px' })
                        .setOrigin(1, 0.5)
                        .setInteractive()
                        .setPadding(10);
                    
                    // 現在選択されている値のボタンをハイライトする
                    if (optionKey === currentValue) {
                        button.setBackgroundColor('#555');
                    }
                    
                    button.on('pointerdown', () => {
                        this.configManager.setValue(key, optionKey);
                        // UIを再生成して、ハイライトを更新する
                        this.scene.restart(); 
                    });

                    // 次のボタンの位置を計算
                    buttonX -= button.width + 20;
                });
               // ★★★ オプションボタンのクリック処理 ★★★
        button.on('pointerdown', () => {
            this.configManager.setValue(key, optionKey);
            // 値を更新したら、シーンを再起動して表示を更新する
            this.scene.restart(); 
        });
    }
            
            y += 100; // 次のUI項目のY座標
        }
    }
}