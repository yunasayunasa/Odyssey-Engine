// src/scenes/UIScene.js (最終版 - 全ての改善を統合)

export default class UIScene extends Phaser.Scene {
    constructor() {
         super({ key: 'UIScene', active: false }); // ★★★ 修正箇所: active:false に変更 ★★★

        // UI要素と状態を、すべてプロパティとして初期化 (stop()で破棄するため)
        this.menuButton = null;
        this.panel = null;
        this.isPanelOpen = false; 

        this.panelBg = null;
        this.saveButton = null;
        this.loadButton = null;
        this.backlogButton = null;
        this.configButton = null;
        this.autoButton = null;
        this.skipButton = null;

        this.panelTween = null; 

        this.eventEmitted = false; 
    }

    create() {
        console.log("UIScene: 作成・初期化");
        this.destroyExistingUI(); 

        const gameWidth = 1280;
        const gameHeight = 720;

        this.panel = this.add.container(0, gameHeight + 120); 
        
        this.panelBg = this.add.rectangle(gameWidth / 2, 0, gameWidth, 120, 0x000000, 0.8).setInteractive();
        this.saveButton = this.add.text(0, 0, 'セーブ', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.loadButton = this.add.text(0, 0, 'ロード', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.backlogButton = this.add.text(0, 0, '履歴', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.configButton = this.add.text(0, 0, '設定', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.autoButton = this.add.text(0, 0, 'オート', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.skipButton = this.add.text(0, 0, 'スキップ', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.panel.add([this.panelBg, this.saveButton, this.loadButton, this.backlogButton, this.configButton, this.autoButton, this.skipButton]);

        const buttons = [this.saveButton, this.loadButton, this.backlogButton, this.configButton, this.autoButton, this.skipButton];
        const areaStartX = 250;
        const areaWidth = gameWidth - areaStartX - 100;
        const buttonMargin = areaWidth / buttons.length;
        buttons.forEach((button, index) => {
            button.setX(areaStartX + (buttonMargin * index) + (buttonMargin / 2));
        });

        this.menuButton = this.add.text(100, gameHeight - 50, 'MENU', { fontSize: '36px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.panelBg.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
        });

        this.menuButton.on('pointerdown', (pointer, localX, localY, event) => {
            this.togglePanel();
            event.stopPropagation();
        });

        this.saveButton.on('pointerdown', (pointer, localX, localY, event) => {
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
            this.togglePanel(); 
            event.stopPropagation();
        });
        this.skipButton.on('pointerdown', (pointer, localX, localY, event) => {
            this.toggleGameMode('skip');
            this.togglePanel(); 
            event.stopPropagation();
        });

        console.log("UIScene: create 完了");
    }

    stop() {
        super.stop();
        console.log("UIScene: stop されました。UI要素とTweenを破棄します。");

        if (this.menuButton) {
            this.menuButton.off('pointerdown');
            this.menuButton.destroy();
            this.menuButton = null;
        }

        if (this.panelTween) {
            this.panelTween.stop();
            this.panelTween.remove();
            this.panelTween = null;
        }

        if (this.panel) {
            const panelButtons = [
                this.panelBg, this.saveButton, this.loadButton, this.backlogButton,
                this.configButton, this.autoButton, this.skipButton
            ];
            panelButtons.forEach(btn => {
                if (btn) {
                    btn.off('pointerdown'); 
                    btn.destroy(); 
                }
            });
            this.panelBg = this.saveButton = this.loadButton = this.backlogButton = 
            this.configButton = this.autoButton = this.skipButton = null;

            this.panel.destroy(); 
            this.panel = null;
        }
    }

    destroyExistingUI() {
        if (this.menuButton) { this.menuButton.destroy(); this.menuButton = null; }
        if (this.panel) { this.panel.destroy(); this.panel = null; }
    }

    disableAllPanelButtons() {
        const buttonsToDisable = [
            this.saveButton, this.loadButton, this.backlogButton,
            this.configButton, this.autoButton, this.skipButton,
            this.menuButton 
        ];
        buttonsToDisable.forEach(btn => {
            if (btn) btn.disableInteractive();
        });
    }

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
                this.panelTween = null; 
            }
        });
    }

    openScene(sceneKey, data = {}) {
        this.scene.get('SystemScene').events.emit('request-scene-transition', {
            to: sceneKey,
            from: this.scene.key, 
            params: data
        });
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