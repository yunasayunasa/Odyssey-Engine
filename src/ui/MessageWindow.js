// ★★★ 先頭の import 文を削除し、この行を代わりに追加 ★★★
const Container = Phaser.GameObjects.Container;

// MessageWindowクラスを定義し、エクスポート
export default class MessageWindow extends Container{

      /**
     * @param {Phaser.Scene} scene
     * @param {SoundManager} soundManager // ★★★ JSDocにも追加 ★★★
     */
    constructor(scene, soundManager, configManager) { // ★★★ 引数に soundManager を追加 ★★★
        // 親クラス(Container)のコンストラクタを呼び出す
        // コンテナ自体の位置は(0,0)でOK。中の要素の位置で調整する。
        super(scene, 0, 0);
        
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;

        // --- ウィンドウ画像 ---
        // ★★★ 位置を調整しましょう！ ★★★
        // 画面下端から、ウィンドウの高さの半分だけ上に配置するイメージ
        const windowY = gameHeight - 180; // 例：画面下から180pxの位置
        this.windowImage = scene.add.image(gameWidth / 2, windowY, 'message_window');
//サウンドマネージャーオブジェクト
        this.soundManager = soundManager;
        this.configManager = configManager;
        this.charByCharTimer = null;
        this.isTyping = false;
        
        // ★★★ コンフィグ値から、currentTextDelayの初期値を設定 ★★★
        const textSpeedValue = this.configManager.getValue('textSpeed');
        this.currentTextDelay = 100 - textSpeedValue;

        // ★★★ コンフィグが変更されたら、currentTextDelayも更新するイベントリスナー ★★★
        this.configManager.on('change:textSpeed', (newValue) => {
            this.currentTextDelay = 100 - newValue;
            console.log(`コンフィグ変更を検知: テキスト表示速度を ${this.currentTextDelay}ms に更新`);
        });
    

        // --- テキストオブジェクト ---
        const padding = 35; // ウィンドウの内側の余白
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
        this.currentTextDelay = 50; // デフォルト値

       // ★★★ ここからがアイコンの修正 ★★★

    // 1. アイコンの基準座標を計算
    const iconX = (gameWidth / 2) + (this.windowImage.width / 2) - 60; // ウィンドウ右端から60px内側
    const iconY = windowY + (this.windowImage.height / 2) - 50;       // ウィンドウ下端から50px内側
    
    // 2. アイコンを生成し、サイズを調整
    this.nextArrow = scene.add.image(iconX, iconY, 'next_arrow');
    this.nextArrow.setScale(0.5); // ★★★ サイズを半分にする ★★★
    this.nextArrow.setVisible(false);

    // 3. アニメーションの定義
    // yoyoで戻る距離も、スケールに合わせて小さくする
    const arrowMoveDistance = 10 * this.nextArrow.scaleY; 
    this.arrowTween = scene.tweens.add({
        targets: this.nextArrow,
        y: this.nextArrow.y - arrowMoveDistance, // 少しだけ上に移動
        duration: 400,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        paused: true
    });

    // 4. すべての要素をコンテナに追加
    this.add([this.windowImage, this.textObject, this.nextArrow]);

    // 5. シーンに自身を登録
    scene.add.existing(this);
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
        
        // テロップ表示を使わない条件を判定
        if (!useTyping || text.length === 0 || this.currentTextDelay <= 0) {
            this.textObject.setText(text);
            this.isTyping = false;
            onComplete();
            return;
        }
        
        // --- ここからテロップ表示処理 ---
        this.isTyping = true;
        let index = 0; // ★★★ index変数はここで一度だけ宣言 ★★★
        
        const timerConfig = {
            delay: this.currentTextDelay,
            callback: () => {
                // タイプ音を再生
                this.soundManager.playSe('popopo');

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