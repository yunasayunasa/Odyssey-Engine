// src/scenes/ActionScene.js (最終版 - 全ての改善を統合)

import CoinHud from '../ui/CoinHud.js'; // CoinHudは直接使用されていませんが、もし使うなら残します
export default class ActionScene extends Phaser.Scene {
    constructor() {
        super('ActionScene');
        this.receivedParams = null; 
        this.eventEmitted = false; // ★★★ 追加: イベント発行済みフラグ ★★★
        
        // ★★★ 追加: ボタンへの参照をプロパティとして初期化 (stop()で破棄するため) ★★★
        this.winButton = null;
        this.loseButton = null;
        this.playerObject = null; // 例: createで作成するplayerテキストオブジェクト
    }

    init(data) {
        this.receivedParams = data.transitionParams || {}; 
        console.log("ActionScene: init 完了。受け取ったパラメータ:", this.receivedParams);
        
        this.eventEmitted = false; // ★★★ init時にフラグをリセット ★★★
    }

    create() {
        console.log("ActionScene: create 開始");
        this.cameras.main.setBackgroundColor('#4a86e8');
        // playerオブジェクトもプロパティに保持
        this.playerObject = this.add.text(100, 360, 'PLAYER', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.tweens.add({ targets: this.playerObject, x: 1180, duration: 4000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
        
        // --- オーバーレイ表示リクエスト ---
        this.time.delayedCall(3000, () => {
            console.log("ActionScene: request-overlay を発行");
            // オーバーレイは既存シーンを停止しないため、eventEmittedフラグは通常使わない
            this.scene.get('SystemScene').events.emit('request-overlay', { 
                from: this.scene.key,
                scenario: 'overlay_test.ks'
            });
        });

        // --- ★★★ 勝利ボタン ★★★ ---
        this.winButton = this.add.text(320, 600, 'ボスに勝利してノベルパートに戻る', { fontSize: '32px', fill: '#0c0', backgroundColor: '#000' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.winButton.on('pointerdown', () => {
            // ★★★ 修正箇所: クリック時にボタンの入力を即座に無効化 ★★★
            this.winButton.disableInteractive(); 
            if (this.loseButton) this.loseButton.disableInteractive(); 

            // ★★★ 修正箇所: イベントがまだ発行されていない場合のみ発行 ★★★
            if (!this.eventEmitted) {
                this.eventEmitted = true; 
                console.log("ActionScene: 勝利ボタンクリック -> return-to-novel を発行");
                this.scene.get('SystemScene').events.emit('return-to-novel', {
                    from: this.scene.key,
                    params: { 'f.battle_result': 'win' } 
                });
            } else {
                console.warn("ActionScene: return-to-novel イベントは既に発行されています。スキップします。");
            }
        });

        // --- ★★★ 敗北ボタン ★★★ ---
        this.loseButton = this.add.text(960, 600, 'ボスに敗北してノベルパートに戻る', { fontSize: '32px', fill: '#c00', backgroundColor: '#000' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.loseButton.on('pointerdown', () => {
            // ★★★ 修正箇所: クリック時にボタンの入力を即座に無効化 ★★★
            this.loseButton.disableInteractive(); 
            if (this.winButton) this.winButton.disableInteractive(); 

            // ★★★ 修正箇所: イベントがまだ発行されていない場合のみ発行 ★★★
            if (!this.eventEmitted) {
                this.eventEmitted = true; 
                console.log("ActionScene: 敗北ボタンクリック -> return-to-novel を発行");
                this.scene.get('SystemScene').events.emit('return-to-novel', {
                    from: this.scene.key,
                    params: { 'f.battle_result': 'lose' } 
                });
            } else {
                console.warn("ActionScene: return-to-novel イベントは既に発行されています。スキップします。");
            }
        });
        console.log("ActionScene: create 完了");
    }

    // ★★★ stop() メソッドを追加し、リソースを破棄 ★★★
    stop() {
        super.stop();
        console.log("ActionScene: stop されました。UI要素を破棄します。");

        // シーン停止時にボタンがあればリスナー解除と破棄
        if (this.winButton) { 
            this.winButton.off('pointerdown'); 
            this.winButton.destroy(); 
            this.winButton = null; 
        }
        if (this.loseButton) { 
            this.loseButton.off('pointerdown'); 
            this.loseButton.destroy(); 
            this.loseButton = null; 
        }

        // playerオブジェクトとそれに付随するTweenも破棄
        if (this.playerObject) {
            this.tweens.killTweensOf(this.playerObject); // Tweenがあれば停止・破棄
            this.playerObject.destroy(); 
            this.playerObject = null;
        }
    }

    resume() {
        super.resume();
        console.log("ActionScene: resume されました。");
    }
}