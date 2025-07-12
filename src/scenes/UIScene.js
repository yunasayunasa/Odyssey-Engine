export default class UIScene extends Phaser.Scene {
    constructor() {
        // key: このシーンを呼び出すための名前
        // active: true にすることで、他のシーンと同時に自動で起動・表示される
        super({ key: 'UIScene', active: true });
         this.pendingChoices = [];
    this.choiceButtons = [];
    }

   create() {
        console.log("UIScene: 作成されました。");
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        this.events.on('jump-to', (data) => {
        const gameScene = this.scene.get('GameScene');
        gameScene.scenarioManager.jumpTo(data.target);
        gameScene.scenarioManager.next();
    });
    

        // --- 1. メニューパネル（ボタンの入れ物）を作成 ---
        // 最初は画面の外に隠しておく
        const panelY = gameHeight + 100; // 画面の下に隠れる位置
        const panel = this.add.container(0, panelY);

        // パネルの背景（半透明の黒）
          // --- 1. メニューパネルの背景 ---
        const panelBg = this.add.rectangle(gameWidth / 2, 0, gameWidth, 120, 0x000000, 0.8)
            .setInteractive(); // ★ パネル背景もクリック可能にする
        
        // ★ パネル背景がクリックされたら、何もせずイベントだけを止める
        panelBg.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
        });

        
        // --- 2. パネル内の各ボタンを作成 ---
        const buttonY = 0; // パネル内のY座標
        const saveButton = this.add.text(0, 0, 'セーブ', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        const loadButton = this.add.text(0, 0,'ロード', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        const configButton = this.add.text(0, 0, '設定', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        // ★★★ パネルにバックログボタンを追加 ★★★
        const backlogButton = this.add.text(0, 0, '履歴', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        const autoButton = this.add.text(0, 0, 'オート', { fontSize: '32px', fill: '#fff' }).setInteractive();
        const skipButton = this.add.text(0, 0, 'スキップ', { fontSize: '32px', fill: '#fff' }).setInteractive();
        panel.add([saveButton, loadButton, backlogButton, configButton, autoButton, skipButton]);

          // ★★★ ボタンのレイアウトを調整 ★★★
       // ★★★ ここからレイアウト調整 ★★★
        const buttons = [saveButton, loadButton, backlogButton, configButton, autoButton, skipButton];
        
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

          menuButton.on('pointerdown', (pointer, localX, localY, event) => {
            this.togglePanel();
            isPanelOpen = !isPanelOpen; // パネルの表示/非表示を切り替え
            
            const targetY = isPanelOpen ? gameHeight - 60 : gameHeight + 100; // 表示位置 or 隠れる位置

            // パネルをスライドさせるアニメーション
            this.tweens.add({
                targets: panel,
                y: targetY,
                duration: 300,
                ease: 'Cubic.easeInOut'
            });
            event.stopPropagation();
        });

        // パネル内の各ボタンの動作
         saveButton.on('pointerdown', (pointer, localX, localY, event) => {
            this.openScene('SaveLoadScene', { mode: 'save' });
            event.stopPropagation();
        });
        loadButton.on('pointerdown', (pointer, localX, localY, event) => {
            this.openScene('SaveLoadScene', { mode: 'load' });
            event.stopPropagation();
        });
       
        configButton.on('pointerdown', () => {
            this.scene.pause('GameScene');
            this.scene.pause('UIScene'); // Configを開くときはUIも止める
            this.scene.launch('ConfigScene');
        event.stopPropagation();
        });
         // ★★★ バックログボタンの動作を定義 ★★★
        backlogButton.on('pointerdown', () => {
            this.scene.pause('GameScene');
            this.scene.pause('UIScene');
            this.scene.launch('BacklogScene');
        event.stopPropagation();
        });
        autoButton.on('pointerdown', () => {
            const gameScene = this.scene.get('GameScene');
            // 'normal'と'auto'を切り替える
            const currentMode = gameScene.scenarioManager.mode;
            const newMode = currentMode === 'auto' ? 'normal' : 'auto';
            gameScene.scenarioManager.setMode(newMode);
        });
        skipButton.on('pointerdown', () => {
            const gameScene = this.scene.get('GameScene');
            const currentMode = gameScene.scenarioManager.mode;
            const newMode = currentMode === 'skip' ? 'normal' : 'skip';
            gameScene.scenarioManager.setMode(newMode);
        });
      this.input.setGlobalTopOnly(false);
         // ★★★ 初期レイアウト適用と、リサイズイベントの監視 ★★★
       /* this.checkOrientation(); // 起動時に一度チェック
        this.scale.on('resize', this.checkOrientation, this);*/
        this.scene.get('GameScene').events.on('displaychoices', () => {
    this.displayChoiceButtons();
});
    }

    // 新しいメソッドを追加
addPendingChoice(choiceData) {
    this.pendingChoices.push(choiceData);
}
getPendingChoiceCount() {
    return this.pendingChoices.length;
}

/**
 * 溜まっている選択肢情報を元に、ボタンを一括で画面に表示する
 */
displayChoiceButtons() {
    this.inputBlocker.setVisible(true);
    // Y座標の計算を、全体のボタン数に基づいて行う
    const totalButtons = this.pendingChoices.length;
    const startY = (this.scale.height / 2) - ((totalButtons - 1) * 60); // 全体が中央に来るように開始位置を調整

    this.pendingChoices.forEach((choice, index) => {
        const y = startY + (index * 120); // ボタン間のスペース

    const button = this.add.text(this.scale.width / 2, y, choice.text, { fontSize: '36px', fill: '#fff', backgroundColor: '#555', padding: { x: 20, y: 10 }})
        .setOrigin(0.5)
        .setInteractive();
    
        button.on('pointerdown', () => {
            this.clearChoiceButtons();
            this.scenarioManager.jumpTo(choice.target);
        });

        this.choiceButtons.push(button);
    });

    this.pendingChoices = []; // 溜めていた情報はクリア
}
 
// ★★★ ボタンを消すためのヘルパーメソッドを追加 ★★★
clearChoiceButtons() {
    this.inputBlocker.setVisible(false);
    this.choiceButtons.forEach(button => button.destroy());
    this.choiceButtons = []; // 配列を空にする
    // 選択肢待ち状態を解除
    if (this.scenarioManager) {
        this.scenarioManager.isWaitingChoice = false;
    }
}

    // ★★★ 画面の向きをチェックするメソッドを新設 ★★★
  /*  checkOrientation() {
        const overlay = document.getElementById('orientation-overlay');
        const gameCanvas = this.sys.game.canvas;

        // isPortraitはPhaserが計算してくれる、現在のウィンドウの向き
        if (this.scale.isPortrait) {
            // 縦向きの場合
            overlay.style.display = 'flex'; // オーバーレイを表示
            gameCanvas.style.display = 'none'; // ゲームキャンバスを隠す
        } else {
            // 横向きの場合
            overlay.style.display = 'none'; // オーバーレイを隠す
            gameCanvas.style.display = 'block'; // ゲームキャンバスを表示
        }*/
    

    // ... (applyLayout, togglePanel, openScene は変更なし) ...

}

    
