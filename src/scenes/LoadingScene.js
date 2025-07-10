export default class LoadingScene extends Phaser.Scene {
    constructor() {
        super('LoadingScene');
        this.assetsToLoad = [];
        this.onCompleteCallback = () => {};
    }

   // initメソッド
init(data) {
    this.assetsToLoad = data.assets || [];
    // ★ onCompleteコールバックは、Promiseのresolve関数になる
    this.onCompleteCallback = data.onComplete;
}

    preload() {
        console.log("LoadingScene: 動的ロードを開始します。");
        
        // --- プログレスバーの背景とバー本体を作成 ---
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(340, 320, 600, 50); // 位置とサイズ

        // --- "Now Loading..."テキスト ---
        this.add.text(640, 280, 'Now Loading...', { fontSize: '36px', fill: '#ffffff' }).setOrigin(0.5);
        
        // --- パーセンテージ表示テキスト ---
        const percentText = this.add.text(640, 345, '0%', { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5);

        // --- ロードイベントの監視 ---
        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(350, 330, 580 * value, 30);
        });

        this.load.on('complete', () => {
            console.log("LoadingScene: 動的ロード完了。");
            progressBar.destroy();
            progressBox.destroy();
            percentText.destroy();
            
            // ★★★ ロード完了を呼び出し元に通知 ★★★
             // ★ resolve()を呼び出す
    if (this.onCompleteCallback) {
        this.onCompleteCallback();
    }
    this.scene.stop();
});

        // --- 受け取ったアセットリストに基づいて、ロードを実行 ---
        this.assetsToLoad.forEach(asset => {
            if (asset.type === 'image') {
                this.load.image(asset.key, asset.path);
            } else if (asset.type === 'sound') {
                this.load.audio(asset.key, asset.path);
            }
            // 他のタイプのアセット（spineなど）も、必要ならここに追加
        });
    }
}