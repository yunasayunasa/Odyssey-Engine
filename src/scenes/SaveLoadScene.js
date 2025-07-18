// src/scenes/SaveLoadScene.js (最終版 - 全ての改善を統合)

export default class SaveLoadScene extends Phaser.Scene {
    constructor() {
        super('SaveLoadScene');
        this.mode = 'load'; // デフォルトはロードモード
        // ★★★ 追加: UI要素への参照をプロパティとして初期化 (stop()で破棄するため) ★★★
        this.backgroundRect = null;
        this.titleText = null;
        this.backButton = null;
        this.slotBackgrounds = []; // スロットの背景オブジェクトを保持
        this.slotTexts = []; // スロットのテキストオブジェクトを保持
        this.eventEmitted = false; // ★★★ 追加: イベント発行済みフラグ ★★★
    }

    init(data) {
        this.mode = data.mode;
        this.eventEmitted = false; // ★★★ init時にフラグをリセット ★★★
    }

    create() {
        console.log("SaveLoadScene: create 開始 (Mode: " + this.mode + ")");

        // 背景を少し暗くして、UIが目立つようにする
        this.backgroundRect = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0, 0);
        
        // モードに応じてタイトルを変更
        const titleText = this.mode === 'save' ? 'セーブ' : 'ロード';
        this.titleText = this.add.text(this.scale.width / 2, 100, titleText, { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

        // 戻るボタン
        this.backButton = this.add.text(this.scale.width - 100, 50, '戻る', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.backButton.on('pointerdown', () => {
            // ★★★ 修正箇所: SystemScene経由でノベルパートに戻る ★★★
            this.backButton.disableInteractive(); // クリック時にボタンの入力を即座に無効化
            if (!this.eventEmitted) {
                this.eventEmitted = true;
                console.log("SaveLoadScene: 戻るボタンクリック -> return-to-novel を発行");
                this.scene.get('SystemScene').events.emit('return-to-novel', {
                    from: this.scene.key, 
                    params: {}
                });
            } else {
                console.warn("SaveLoadScene: 戻るイベントは既に発行されています。スキップします。");
            }
        });

        // --- セーブスロットを表示 ---
        const slots = 5;
        const gameScene = this.scene.get('GameScene'); // GameSceneの参照を一度取得しておく
        if (!gameScene) {
            console.error("SaveLoadScene: GameSceneが見つかりません。セーブ/ロード機能が無効です。");
            // エラーハンドリング（例えばタイトルに戻るなど）
            return;
        }

        for (let i = 1; i <= slots; i++) {
            const y = 200 + ((i-1) * 150);
            
            const slotBg = this.add.rectangle(this.scale.width / 2, y, 600, 120, 0xffffff, 0.1).setInteractive({ useHandCursor: true });
            this.slotBackgrounds.push(slotBg); // 破棄するために配列に保持

            const saveData = localStorage.getItem(`save_data_${i}`);
            let text = `スロット ${i}\n`;
            text += saveData ? JSON.parse(saveData).saveDate : '(空)';
            
            const slotText = this.add.text(this.scale.width / 2, y, text, { fontSize: '28px', fill: '#fff', align: 'center' }).setOrigin(0.5);
            this.slotTexts.push(slotText); // 破棄するために配列に保持

            // スロットがクリックされた時の処理
            slotBg.on('pointerdown', () => {
                // ★★★ 修正箇所: SystemScene経由でノベルパートに戻る ★★★
                // 全てのスロットの入力を無効化（二重クリック防止）
                this.slotBackgrounds.forEach(bg => bg.disableInteractive());
                this.backButton.disableInteractive();

                if (!this.eventEmitted) { // イベントがまだ発行されていない場合のみ
                    this.eventEmitted = true; // フラグを立てる

                    if (this.mode === 'save') {
                        gameScene.performSave(i);
                        console.log(`SaveLoadScene: スロット${i}にセーブしました。`);
                        this.scene.get('SystemScene').events.emit('return-to-novel', {
                            from: this.scene.key, 
                            params: {}
                        });
                    } else { // 'load'モードの場合
                        if (saveData) {
                            gameScene.performLoad(i);
                            console.log(`SaveLoadScene: スロット${i}からロードしました。`);
                            this.scene.get('SystemScene').events.emit('return-to-novel', {
                                from: this.scene.key, 
                                params: {}
                            });
                        } else {
                            console.log(`SaveLoadScene: スロット${i}は空なのでロードできません。`);
                            // 空スロットのロード失敗時はイベントを発行しない（画面に留まる）
                            this.eventEmitted = false; // イベント発行しなかったのでフラグをリセット
                            // 全てのスロットと戻るボタンの入力を再度有効化
                            this.slotBackgrounds.forEach(bg => bg.setInteractive({ useHandCursor: true })); 
                            this.backButton.setInteractive({ useHandCursor: true });
                        }
                    }
                } else {
                    console.warn(`SaveLoadScene: イベントは既に発行されています。スキップします。(Mode: ${this.mode}, Slot: ${i})`);
                }
            });
        }
        console.log("SaveLoadScene: create 完了");
    }

    // ★★★ stop() メソッドを追加し、生成したUI要素を破棄 ★★★
    stop() {
        super.stop();
        console.log("SaveLoadScene: stop されました。UI要素を破棄します。");

        if (this.backgroundRect) { this.backgroundRect.destroy(); this.backgroundRect = null; }
        if (this.titleText) { this.titleText.destroy(); this.titleText = null; }
        
        // 戻るボタンのリスナー解除と破棄
        if (this.backButton) { 
            this.backButton.off('pointerdown'); 
            this.backButton.destroy(); 
            this.backButton = null; 
        }

        // 各スロットの背景とテキストを破棄
        this.slotBackgrounds.forEach(bg => {
            if (bg) { bg.off('pointerdown'); bg.destroy(); }
        });
        this.slotBackgrounds = [];

        this.slotTexts.forEach(text => {
            if (text) { text.destroy(); }
        });
        this.slotTexts = [];
    }

    resume() {
        super.resume();
        console.log("SaveLoadScene: resume されました。");
    }
}