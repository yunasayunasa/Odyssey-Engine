const Container = Phaser.GameObjects.Container;

export default class MessageWindow extends Container {
    constructor(scene, soundManager, configManager) {
        super(scene, 0, 0); // 自身の位置は(0,0)で初期化
        this.soundManager = soundManager;
        this.configManager = configManager;

        // プロパティ初期化
        this.isTyping = false;
        
        // --- UI要素を、コンテナ内の相対座標(0,0)を中心に生成 ---
        this.windowImage = this.scene.add.image(0, 0, 'message_window').setOrigin(0.5);
        
        const padding = 35;
        const textWidth = this.windowImage.width - (padding * 2);
        const textHeight = this.windowImage.height - (padding * 1.5);
        this.textObject = this.scene.add.text(
            -this.windowImage.width / 2 + padding,
            -this.windowImage.height / 2 + (padding / 2),
            '',
            { fontFamily: '"Noto Sans JP", sans-serif', fontSize: '36px', fill: '#ffffff' }
        ).setWordWrapWidth(textWidth, true).setFixedSize(textWidth, textHeight);
        
        this.nextArrow = this.scene.add.image(
            this.windowImage.width / 2 - padding,
            this.windowImage.height / 2 - padding,
            'next_arrow'
        ).setScale(0.5).setOrigin(0.5);

        // コンテナに要素を追加
        this.add([this.windowImage, this.textObject, this.nextArrow]);
        this.hideNextArrow();

        // コンフィグの初期値設定とリスナー登録
        const textSpeedValue = this.configManager.getValue('textSpeed');
        this.currentTextDelay = 100 - textSpeedValue;
        this.configManager.on('change:textSpeed', (newValue) => {
            this.currentTextDelay = 100 - newValue;
        });

        // 矢印アニメーションの生成
        this.arrowTween = this.scene.tweens.add({
            targets: this.nextArrow,
            y: this.nextArrow.y - 10,
            duration: 400,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            paused: true
        });
    }

    // --- setText, skipTypingなどのメソッド群 ---
    // (この部分は、あなたの正常に動作していたコードのままでOKです)
}
    
       // ★★★ アイコンを制御するメソッドを追加 ★★★
    /**
     * クリック待ちアイコンを表示し、アニメーションを開始する
     */
    showNextArrow() {
        this.nextArrow.setVisible(true);
        if (this.arrowTween.isPaused()) {
            this.arrowTween.resume();
        }
    }
    
    /**
     * クリック待ちアイコンを非表示にし、アニメーションを停止する
     */
    hideNextArrow() {
        this.nextArrow.setVisible(false);
        if (this.arrowTween.isPlaying()) {
            this.arrowTween.pause();
        }
    }

         /**
     * テキストを設定するメソッド
     * @param {string} text - 表示する全文
     * @param {boolean} useTyping - テロップ表示を使うかどうか
     * @param {function} onComplete - 表示完了時に呼ばれるコールバック関数
     */
    setText(text, useTyping = true, onComplete = () => {}) {
        // 既存のテキストとタイマーをクリア
        this.textObject.setText('');
        if (this.charByCharTimer) {
            this.charByCharTimer.remove();
        }

          // ★★★ コンフィグから、現在のタイプ音設定を取得 ★★★
        const typeSoundMode = this.configManager.getValue('typeSound');

        

        
        // テロップ表示を使わない条件を判定
           if (!useTyping || text.length === 0 || this.currentTextDelay <= 0) {
            this.textObject.setText(text);
            this.isTyping = false;
            if(onComplete) onComplete();
            return;
        }
        
         // テロップ表示処理
        this.isTyping = true;
        let index = 0;
        const timerConfig = {
            delay: this.currentTextDelay,
            callback: () => {
                // ★★★ 効果音モード('se')の場合だけ音を鳴らす ★★★
                if (typeSoundMode === 'se') {
                    this.soundManager.playSe('popopo');
                }

                // 文字を追加 (timerConfigのfullTextを参照)
                this.textObject.text += timerConfig.fullText[index];
                index++; // スコープの外側で宣言されたindexをインクリメント

                // 終了判定
                if (index === timerConfig.fullText.length) {
                    this.charByCharTimer.remove();
                    this.isTyping = false;
                    onComplete();
                }
            },
            callbackScope: this,
            loop: true,
            fullText: text // カスタムプロパティとして全文を保存
        };
        
        this.charByCharTimer = this.scene.time.addEvent(timerConfig);
    }
    
    skipTyping() {
        if (!this.isTyping) return;

        // ★★★ タイマーオブジェクトから直接 fullText プロパティを取得 ★★★
        this.textObject.setText(this.charByCharTimer.fullText);

        this.charByCharTimer.remove();
        this.isTyping = false;
    }

    /**
     * テキストオブジェクトの横幅を返すプロパティ (getter)
     */
    get textBoxWidth() {
        return this.textObject.width;
    }
}