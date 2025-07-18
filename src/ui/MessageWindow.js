// src/ui/MessageWindow.js (最終版 - 全ての改善を統合)

const Container = Phaser.GameObjects.Container;

export default class MessageWindow extends Container {
    constructor(scene, soundManager, configManager) {
        super(scene, 0, 0);

        this.scene = scene; 
        this.soundManager = soundManager;
        this.configManager = configManager;
        this.charByCharTimer = null;
        this.isTyping = false;

        // セーブ＆ロード用の状態保持プロパティ
        this.currentText = '';
        this.currentSpeaker = null;

        // --- UI要素のプロパティを初期化 (destroy()で破棄するため) ---
        this.windowImage = null;
        this.textObject = null;
        this.nextArrow = null;
        this.arrowTween = null;
        this.configChangeListener = null; // ConfigManagerのリスナーを保持するプロパティ

        // --- ウィンドウとテキストのセットアップ ---
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const windowY = gameHeight - 180;
        this.windowImage = scene.add.image(gameWidth / 2, windowY, 'message_window');

        const padding = 35;
        const textWidth = this.windowImage.width - (padding * 2);
        const textHeight = this.windowImage.height - (padding * 2);

        this.textObject = scene.add.text(
            this.windowImage.x - (this.windowImage.width / 2) + padding,
            this.windowImage.y - (this.windowImage.height / 2) + padding,
            '',
            {
                fontFamily: '"Noto Sans JP", sans-serif',
                fontSize: '36px',
                fill: '#ffffff',
                fixedWidth: textWidth,
                fixedHeight: textHeight
            }
        );

        // --- コンフィグと連携するテキスト速度 ---
        this.textDelay = 50; // デフォルト値
        this.updateTextSpeed(); // コンフィグから初期値を取得
        // ★★★ ConfigManagerのリスナーをプロパティに保持 ★★★
        this.configChangeListener = this.configManager.on('change:textSpeed', this.updateTextSpeed, this);

        // --- クリック待ちアイコン ---
        const iconX = (gameWidth / 2) + (this.windowImage.width / 2) - 60;
        const iconY = windowY + (this.windowImage.height / 2) - 50;
        this.nextArrow = scene.add.image(iconX, iconY, 'next_arrow');
        this.nextArrow.setScale(0.5).setVisible(false);
        this.arrowTween = scene.tweens.add({
            targets: this.nextArrow,
            y: this.nextArrow.y - (10 * this.nextArrow.scaleY),
            duration: 400,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            paused: true
        });

        // --- コンテナに追加 & シーンに登録 ---
        this.add([this.windowImage, this.textObject, this.nextArrow]);
        scene.add.existing(this);
    }

    // ★★★ MessageWindowに destroy() メソッドを追加 ★★★
    destroy(fromScene = false) {
        console.log("MessageWindow: destroy されました。");

        // ConfigManagerのイベントリスナーを解除
        if (this.configChangeListener) {
            this.configManager.off('change:textSpeed', this.updateTextSpeed, this);
            this.configChangeListener = null;
        }

        // テキスト表示タイマーを停止
        if (this.charByCharTimer) {
            this.charByCharTimer.remove();
            this.charByCharTimer = null;
        }

        // アローのTweenを停止・破棄
        if (this.arrowTween) {
            this.arrowTween.stop();
            this.arrowTween.remove();
            this.arrowTween = null;
        }
        
        // Phaserオブジェクトを破棄
        if (this.windowImage) { this.windowImage.destroy(); this.windowImage = null; }
        if (this.textObject) { this.textObject.destroy(); this.textObject = null; }
        if (this.nextArrow) { this.nextArrow.destroy(); this.nextArrow = null; }

        // 親クラス（Phaser.GameObjects.Container）のdestroyを呼び出す
        super.destroy(fromScene);
        console.log("MessageWindow: destroy 完了。");
    }

    updateTextSpeed() {
        const textSpeedValue = this.configManager.getValue('textSpeed');
        this.textDelay = 100 - textSpeedValue;
        console.log(`テキスト表示速度を ${this.textDelay}ms に更新`);
    }

    setTypingSpeed(newSpeed) {
        this.textDelay = newSpeed;
    }

    /**
     * テキストを設定するメソッド
     * @param {string} text - 表示する全文
     * @param {boolean} useTyping - テロップ表示を使うかどうか
     * @param {Function} [onComplete] - 表示完了時に呼ばれるコールバック関数（オプション）
     * @param {string|null} [speaker] - 話者名（任意）
     */
    setText(text, useTyping = true, onComplete = null, speaker = null) { 
        this.currentText = text;
        this.currentSpeaker = speaker;

        if (this.textObject) this.textObject.setText(''); // nullチェック
        if (this.charByCharTimer) {
            this.charByCharTimer.remove();
            this.charByCharTimer = null; 
        }

        const typeSoundMode = this.configManager.getValue('typeSound');

        if (!useTyping || text.length === 0 || this.textDelay <= 0) {
            if (this.textObject) this.textObject.setText(text); // nullチェック
            this.isTyping = false;
            if(onComplete) onComplete(); 
            return;
        }
        
        this.isTyping = true;
        let index = 0;
        let timerConfig = {
            delay: this.textDelay,
            callback: () => {
                if (typeSoundMode === 'se') {
                    this.soundManager.playSe('popopo');
                }
                if (this.textObject && timerConfig.fullText && index < timerConfig.fullText.length) { // nullチェック
                    this.textObject.text += timerConfig.fullText[index];
                    index++;
                }
                
                if (index === (timerConfig.fullText ? timerConfig.fullText.length : 0)) { 
                    if (this.charByCharTimer) { // nullチェック
                        this.charByCharTimer.remove();
                        this.charByCharTimer = null;
                    }
                    this.isTyping = false;
                    if(onComplete) onComplete();
                }
            },
            callbackScope: this,
            loop: true,
            fullText: text
        };
        
        this.charByCharTimer = this.scene.time.addEvent(timerConfig);
    }
    
    skipTyping() {
        if (!this.isTyping) return;
        
        if (this.charByCharTimer && this.charByCharTimer.fullText && this.textObject) { // nullチェック
            this.textObject.setText(this.charByCharTimer.fullText);
        } else if (this.textObject) { // タイマーがない場合、currentTextを表示
            this.textObject.setText(this.currentText); 
        }
        
        if (this.charByCharTimer) {
            this.charByCharTimer.remove();
            this.charByCharTimer = null; 
        }
        this.isTyping = false;
    }

    reset() {
        if (this.textObject) this.textObject.setText(''); // nullチェック
        this.currentText = '';
        this.currentSpeaker = null;
        this.isTyping = false;
        if (this.charByCharTimer) {
            this.charByCharTimer.remove();
            this.charByCharTimer = null; 
        }
        this.hideNextArrow();
    }

    showNextArrow() {
        if (this.nextArrow) this.nextArrow.setVisible(true); // nullチェック
        if (this.arrowTween && this.arrowTween.isPaused()) { 
            this.arrowTween.resume();
        }
    }
    
    hideNextArrow() {
        if (this.nextArrow) this.nextArrow.setVisible(false); // nullチェック
        if (this.arrowTween && this.arrowTween.isPlaying()) { 
            this.arrowTween.pause();
        }
    }

    get textBoxWidth() {
        return this.textObject ? this.textObject.width : 0; // nullチェック
    }
}