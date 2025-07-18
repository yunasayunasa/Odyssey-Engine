// src/scenes/UIScene.js (最終版 - 全ての改善を統合)

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: true });

        // UI要素と状態を、すべてプロパティとして初期化 (stop()で破棄するため)
        this.menuButton = null;
        this.panel = null;
        this.isPanelOpen = false; // パネル開閉状態

        // パネル内のUI要素への参照
        this.panelBg = null;
        this.saveButton = null;
        this.loadButton = null;
        this.backlogButton = null;
        this.configButton = null;
        this.autoButton = null;
        this.skipButton = null;

        this.panelTween = null; // パネルのTween参照

        // ★★★ 追加: シーン遷移イベント発行済みフラグ ★★★
        this.eventEmitted = false; 
    }

    create() {
        console.log("UIScene: 作成・初期化");
        // createメソッドは「常にアクティブ」なので通常一度しか呼ばれないはずだが、
        // もし何らかの理由で再起動された場合に備え、既存要素を破棄しておく（防御的プログラミング）
        this.destroyExistingUI(); 

        const gameWidth = 1280;
        const gameHeight = 720;

        // --- 1. パネルと、その中のボタンを生成 ---
        this.panel = this.add.container(0, gameHeight + 120); 
        
        this.panelBg = this.add.rectangle(gameWidth / 2, 0, gameWidth, 120, 0x000000, 0.8).setInteractive();
        this.saveButton = this.add.text(0, 0, 'セーブ', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.loadButton = this.add.text(0, 0, 'ロード', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.backlogButton = this.add.text(0, 0, '履歴', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.configButton = this.add.text(0, 0, '設定', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.autoButton = this.add.text(0, 0, 'オート', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.skipButton = this.add.text(0, 0, 'スキップ', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.panel.add([this.panelBg, this.saveButton, this.loadButton, this.backlogButton, this.configButton, this.autoButton, this.skipButton]);

        // --- 2. パネル内のボタンのレイアウトを確定 ---
        const buttons = [this.saveButton, this.loadButton, this.backlogButton, this.configButton, this.autoButton, this.skipButton];
        const areaStartX = 250;
        const areaWidth = gameWidth - areaStartX - 100;
        const buttonMargin = areaWidth / buttons.length;
        buttons.forEach((button, index) => {
            button.setX(areaStartX + (buttonMargin * index) + (buttonMargin / 2));
        });

        // --- 3. メインの「メニュー」ボタンを生成・配置 ---
        this.menuButton = this.add.text(100, gameHeight - 50, 'MENU', { fontSize: '36px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // --- 4. すべてのイベントリスナーを、ここで一括設定 ---
        
        // パネル背景は、クリックイベントを止めるだけ
        this.panelBg.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
        });

        // メニューボタンは、パネルの開閉をトリガー
        this.menuButton.on('pointerdown', (pointer, localX, localY, event) => {
            this.togglePanel();
            event.stopPropagation();
        });

        // ★★★ 各機能ボタンのクリック処理 (SystemScene経由に修正) ★★★
        this.saveButton.on('pointerdown', (pointer, localX, localY, event) => {
            // 入力無効化とイベント発行制御
            this.disableAllPanelButtons();
            if (!this.eventEmitted) { this.eventEmitted = true; this.openScene('SaveLoadScene', { mode: 'save' }); }
            event.stopPropagation();
        });
        this.loadButton.on('pointerdown', (pointer, localX, localY, event) => {
            this.disableAllPanelButtons();
            if (!this.eventEmitted) { this.eventEmitted = true; this.openScene('SaveLoadScene', { mode: 'load' }); }
            event.stopPropagation();
        });
        this.backlogButton.on('pointerdown', (pointer, localX, localY, event) => {
            this.disableAllPanelButtons();
            if (!this.eventEmitted) { this.eventEmitted = true; this.openScene('BacklogScene'); }
            event.stopPropagation();
        });
        this.configButton.on('pointerdown', (pointer, localX, localY, event) => {
            this.disableAllPanelButtons();
            if (!this.eventEmitted) { this.eventEmitted = true; this.openScene('ConfigScene'); }
            event.stopPropagation();
        });
        this.autoButton.on('pointerdown', (pointer, localX, localY, event) => {
            this.toggleGameMode('auto');
            this.togglePanel(); // パネルを閉じる
            event.stopPropagation();
        });
        this.skipButton.on('pointerdown', (pointer, localX, localY, event) => {
            this.toggleGameMode('skip');
            this.togglePanel(); // パネルを閉じる
            event.stopPropagation();
        });

        console.log("UIScene: create 完了");
    }

    // ★★★ UISceneが停止される際にリソースを破棄するメソッド ★★★
    // (active:trueだが、ゲーム全体が停止した場合などに備える防御的な実装)
    stop() {
        super.stop();
        console.log("UIScene: stop されました。UI要素とTweenを破棄します。");

        // メニューボタンのリスナー解除と破棄
        if (this.menuButton) {
            this.menuButton.off('pointerdown');
            this.menuButton.destroy();
            this.menuButton = null;
        }

        // パネルのTweenを停止・破棄
        if (this.panelTween) {
            this.panelTween.stop();
            this.panelTween.remove();
            this.panelTween = null;
        }

        // パネル内のUI要素のリスナー解除と破棄
        if (this.panel) {
            const panelButtons = [
                this.panelBg, this.saveButton, this.loadButton, this.backlogButton,
                this.configButton, this.autoButton, this.skipButton
            ];
            panelButtons.forEach(btn => {
                if (btn) {
                    btn.off('pointerdown'); // イベントリスナー解除
                    btn.destroy(); // オブジェクト破棄
                }
            });
            this.panelBg = this.saveButton = this.loadButton = this.backlogButton = 
            this.configButton = this.autoButton = this.skipButton = null;

            this.panel.destroy(); // コンテナ自身を破棄
            this.panel = null;
        }
    }

    // ★★★ createが複数回呼ばれる可能性に備え、既存UIを破棄するヘルパー（防御的） ★★★
    destroyExistingUI() {
        // stop()メソッドが呼ばれていれば、通常はこれらの参照はnullになっているはず
        // しかし、何らかの理由でcreateが複数回呼ばれる場合に備える
        if (this.menuButton) { this.menuButton.destroy(); this.menuButton = null; }
        if (this.panel) { this.panel.destroy(); this.panel = null; }
        // その他のプロパティも必要に応じて初期化
    }

    // ★★★ パネル内の全ボタンの入力を無効化するヘルパー ★★★
    disableAllPanelButtons() {
        const buttonsToDisable = [
            this.saveButton, this.loadButton, this.backlogButton,
            this.configButton, this.autoButton, this.skipButton,
            this.menuButton // メニューボタンも無効化
        ];
        buttonsToDisable.forEach(btn => {
            if (btn) btn.disableInteractive();
        });
    }

    // ★★★ パネル内の全ボタンの入力を有効化するヘルパー ★★★
    // SystemSceneがUISceneのinput.enabledを制御するので、これはUIScene内部でのみ使用
    enableAllPanelButtons() {
        const buttonsToEnable = [
            this.saveButton, this.loadButton, this.backlogButton,
            this.configButton, this.autoButton, this.skipButton,
            this.menuButton
        ];
        buttonsToEnable.forEach(btn => {
            if (btn) btn.setInteractive({ useHandCursor: true });
        });
        this.eventEmitted = false; // イベント発行フラグもリセット
    }

    togglePanel() {
        this.isPanelOpen = !this.isPanelOpen;
        const targetY = this.isPanelOpen ? this.scale.height - 60 : this.scale.height + 120; 

        // 既存のTweenがあれば停止・破棄
        if (this.panelTween) {
            this.panelTween.stop();
            this.panelTween.remove();
            this.panelTween = null;
        }

        this.panelTween = this.tweens.add({
            targets: this.panel,
            y: targetY,
            duration: 300,
            ease: 'Cubic.easeInOut',
            onComplete: () => {
                this.panelTween = null; // 完了後に参照をクリア
            }
        });
    }

    // ★★★ openSceneメソッドをSystemScene経由に修正 ★★★
    openScene(sceneKey, data = {}) {
        // UIScene自身でGameSceneをpause/resumeするのではなく、SystemSceneに依頼する
        this.scene.get('SystemScene').events.emit('request-scene-transition', {
            to: sceneKey,
            from: this.scene.key, // UISceneから
            params: data
        });
        // パネルを閉じる (UXとして)
        if (this.isPanelOpen) {
            this.togglePanel();
        }
    }
    
    toggleGameMode(mode) {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.scenarioManager) {
            const currentMode = gameScene.scenarioManager.mode;
            const newMode = currentMode === mode ? 'normal' : mode;
            gameScene.scenarioManager.setMode(newMode);
        }
    }
}