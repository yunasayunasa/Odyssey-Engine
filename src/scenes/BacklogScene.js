// src/scenes/BacklogScene.js (最終版 - 全ての改善を統合)

import StateManager from '../core/StateManager.js';

export default class BacklogScene extends Phaser.Scene {
    constructor() {
        super('BacklogScene');
        this.stateManager = null;
        // ★★★ 追加: UI要素への参照をプロパティとして初期化 (stop()で破棄するため) ★★★
        this.backgroundRect = null;
        this.titleText = null;
        this.backButton = null;
        this.historyTextObjects = []; // 履歴のテキストオブジェクトを保持する配列
        this.eventEmitted = false; // ★★★ 追加: イベント発行済みフラグ ★★★
    }

    create() {
        console.log("BacklogScene: create 開始");
        
        const gameScene = this.scene.get('GameScene');
        if (!gameScene || !gameScene.stateManager || !gameScene.charaDefs) { 
            console.error("BacklogScene: GameScene, StateManager, または charaDefs が見つかりません。");
            // エラー時もSystemScene経由でタイトルなどに戻るのが理想だが、ここでは一旦シーンを停止
            this.scene.stop(this.scene.key); 
            return;
        }
        this.stateManager = gameScene.stateManager;
        
        this.eventEmitted = false; // ★★★ create時にフラグをリセット ★★★

        // --- UIのセットアップ ---
        this.backgroundRect = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.9).setOrigin(0, 0);
        this.titleText = this.add.text(this.scale.width / 2, 60, 'バックログ', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        
        this.backButton = this.add.text(this.scale.width - 100, 50, '戻る', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.backButton.on('pointerdown', () => {
            // ★★★ 修正箇所: SystemScene経由でノベルパートに戻る ★★★
            this.backButton.disableInteractive(); // クリック時にボタンの入力を即座に無効化

            if (!this.eventEmitted) {
                this.eventEmitted = true; 
                console.log("BacklogScene: 戻るボタンクリック -> return-to-novel を発行");
                this.scene.get('SystemScene').events.emit('return-to-novel', {
                    from: this.scene.key, 
                    params: {} 
                });
            } else {
                console.warn("BacklogScene: return-to-novel イベントは既に発行されています。スキップします。");
            }
        });

        // --- 履歴の表示 ---
        const history = this.stateManager.sf.history || [];
        
        let y = this.scale.height - 100; 

        [...history].reverse().forEach(log => {
            let lineText = '';
            
            if (log.speaker) {
                const charaDef = gameScene.charaDefs[log.speaker]; 
                const speakerName = charaDef && charaDef.jname ? charaDef.jname : log.speaker;
                lineText += `【${speakerName}】\n`;
            }
            
            lineText += log.dialogue || ""; 

            const textObject = this.add.text(this.scale.width / 2, y, lineText, {
                fontSize: '28px',
                fill: '#fff',
                wordWrap: { width: this.scale.width - 120 }, 
                align: 'left'
            }).setOrigin(0.5, 1); 
            
            this.historyTextObjects.push(textObject); 
            y -= textObject.getBounds().height + 20; 

            if (y < 120) {
                return; 
            }
        });
        console.log("BacklogScene: create 完了");
    }

    // ★★★ stop() メソッドを追加し、生成したUI要素を破棄 ★★★
    stop() {
        super.stop();
        console.log("BacklogScene: stop されました。UI要素を破棄します。");

        if (this.backgroundRect) { this.backgroundRect.destroy(); this.backgroundRect = null; }
        if (this.titleText) { this.titleText.destroy(); this.titleText = null; }
        
        // 戻るボタンのリスナー解除と破棄
        if (this.backButton) { 
            this.backButton.off('pointerdown'); 
            this.backButton.destroy(); 
            this.backButton = null; 
        }

        // 履歴のテキストオブジェクトをすべて破棄
        this.historyTextObjects.forEach(textObj => {
            if (textObj) { textObj.destroy(); }
        });
        this.historyTextObjects = []; 
    }
    
    resume() {
        super.resume();
        console.log("BacklogScene: resume されました。");
    }
}