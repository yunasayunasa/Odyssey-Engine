export default class UIScene extends Phaser.Scene {
    constructor() {
        // key: このシーンを呼び出すための名前
        // active: true にすることで、他のシーンと同時に自動で起動・表示される
        super({ key: 'UIScene', active: true });
    }

   create() {
        console.log("UIScene: 作成されました。");
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        // --- 1. メニューパネル（ボタンの入れ物）を作成 ---
        // 最初は画面の外に隠しておく
        const panelY = gameHeight + 100; // 画面の下に隠れる位置
        const panel = this.add.container(0, panelY);

        // パネルの背景（半透明の黒）
        const panelBg = this.add.rectangle(gameWidth / 2, 0, gameWidth, 120, 0x000000, 0.8);
        panel.add(panelBg);
        
        // --- 2. パネル内の各ボタンを作成 ---
        const buttonY = 0; // パネル内のY座標
        const saveButton = this.add.text(gameWidth / 2 - 180, buttonY, 'セーブ', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        const loadButton = this.add.text(gameWidth / 2 - 50, buttonY, 'ロード', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        const configButton = this.add.text(gameWidth / 2 + 180, buttonY, '設定', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        // ★★★ パネルにバックログボタンを追加 ★★★
        const backlogButton = this.add.text(gameWidth / 2 + 50, buttonY, '履歴', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        panel.add([saveButton, loadButton, backlogButton, configButton]);

          // ★★★ ボタンのレイアウトを調整 ★★★
       // ★★★ ここからレイアウト調整 ★★★
        const buttons = [saveButton, loadButton, backlogButton, configButton];
        
        // ボタンを配置する領域の「開始X座標」と「幅」を決める
        const areaStartX = 200; // 例: 画面左端から200pxの位置から配置を開始
        const areaWidth = gameWidth - areaStartX - 50; // 配置領域の幅 (右端にも少し余白)

        const buttonMargin = areaWidth / (buttons.length); // 各ボタンに割り当てられる幅

        buttons.forEach((button, index) => {
            // 各ボタンのX座標を計算
            const buttonX = areaStartX + (buttonMargin * index) + (buttonMargin / 2);
            button.setX(buttonX);
        });
        // ★★★ ここまで ★★★
        
        
        panel.add(buttons); // パネルにボタンを追加
        // --- 3. メインの「メニュー」ボタンを作成 ---
        // メッセージウィンドウの下の隙間あたりに配置
        const menuButtonY = gameHeight - 50;
        const menuButton = this.add.text(gameWidth / 10, menuButtonY, 'MENU', { fontSize: '36px', fill: '#fff' }).setOrigin(0.5).setInteractive();

        // --- 4. ボタンの動作を定義 ---
        let isPanelOpen = false;

        menuButton.on('pointerdown', () => {
            isPanelOpen = !isPanelOpen; // パネルの表示/非表示を切り替え
            
            const targetY = isPanelOpen ? gameHeight - 60 : gameHeight + 100; // 表示位置 or 隠れる位置

            // パネルをスライドさせるアニメーション
            this.tweens.add({
                targets: panel,
                y: targetY,
                duration: 300,
                ease: 'Cubic.easeInOut'
            });
        });

        // パネル内の各ボタンの動作
        saveButton.on('pointerdown', () => {
            this.scene.pause('GameScene');
            this.scene.launch('SaveLoadScene', { mode: 'save' });
        });
        loadButton.on('pointerdown', () => {
            this.scene.pause('GameScene');
            this.scene.launch('SaveLoadScene', { mode: 'load' });
        });
        configButton.on('pointerdown', () => {
            this.scene.pause('GameScene');
            this.scene.pause('UIScene'); // Configを開くときはUIも止める
            this.scene.launch('ConfigScene');
        });
         // ★★★ バックログボタンの動作を定義 ★★★
        backlogButton.on('pointerdown', () => {
            this.scene.pause('GameScene');
            this.scene.pause('UIScene');
            this.scene.launch('BacklogScene');
        });
    }
}

    
