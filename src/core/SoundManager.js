export default class SoundManager {
    constructor(scene, configManager) {
        this.scene = scene;
        //this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.currentBgm = null;
        this.configManager = configManager;
   // ★★★ 設定変更イベントを監視する ★★★
        this.configManager.on('change:bgmVolume', (newValue) => {
            // bgmVolumeが変更されたら、この関数が呼ばれる
            if (this.currentBgm && this.currentBgm.isPlaying) {
                this.currentBgm.setVolume(newValue);
            }
        });

        this.configManager.on('change:seVolume', (newValue) => {
            // SE音量が変わった時の処理もここに追加できる
            // (今回はplaySeの中で毎回値を見ているので不要だが、設計としては可能)
        });
       
    }
    
    
    playSe(key, options = {}) {
    if (!key) return;

    const se = this.scene.sound.add(key);
    
    // configから基本ボリュームを取得し、タグのvolumeで上書き
    let volume = this.configManager.getValue('seVolume');
    if (options.volume !== undefined) {
        volume = Number(options.volume);
    }
    se.setVolume(volume);

    se.play();
}

    

    

         
    
   // SoundManager.js の中

playBgm(key, fadeInTime = 0) {
    if (!key) return;
    
    // 現在のBGMがあれば、フェードアウトさせる
    if (this.currentBgm && this.currentBgm.isPlaying) {
        this.scene.tweens.add({
            targets: this.currentBgm,
            volume: 0,
            duration: fadeInTime,
            onComplete: () => {
                this.currentBgm.stop();
            }
        });
    }

    // 新しいBGMを再生
    const newBgm = this.scene.sound.add(key, { loop: true, volume: 0 });
    newBgm.play();
    
    // ★★★ 現在のBGMとして保持 ★★★
    this.currentBgm = newBgm;
    this.currentBgmKey = key; // ← セーブ用にキーも保持

    // フェードイン
    this.scene.tweens.add({
        targets: newBgm,
        volume: this.configManager.getValue('bgmVolume'),
        duration: fadeInTime
    });
}

// そして、セーブ時に現在のBGMキーを渡せるようにする
getCurrentBgmKey() {
    if (this.currentBgm && this.currentBgm.isPlaying) {
        return this.currentBgmKey;
    }
    return null;
}
   // SoundManager.js の中に...

stopBgm(fadeOutTime = 0) {
    if (this.currentBgm && this.currentBgm.isPlaying) {
        if (fadeOutTime > 0) {
            this.scene.tweens.add({
                targets: this.currentBgm,
                volume: 0,
                duration: fadeOutTime,
                onComplete: () => {
                    this.currentBgm.stop();
                    // ★★★ BGM情報をクリア ★★★
                    this.currentBgm = null;
                    this.currentBgmKey = null;
                }
            });
        } else {
            this.currentBgm.stop();
            // ★★★ BGM情報をクリア ★★★
            this.currentBgm = null;
            this.currentBgmKey = null;
        }
    }
}
    
    /**
     * 指定された波形の音を短時間だけ再生する (Web Audio APIを使用)
     * @param {string} waveType - 'sine', 'square', 'sawtooth', 'triangle' のいずれか
     * @param {number} frequency - 周波数 (Hz)。例: 440は「ラ」の音
     * @param {number} duration - 音の長さ（秒）
     */
    playSynth(waveType = 'square', frequency = 1200, duration = 0.05) {
        if (!this.audioContext) return;

        // 1. オシレーター（発振器）を作成。これが音の元になる。
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = waveType; // 波形を設定
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime); // 周波数（音の高さ）を設定

        // 2. ゲイン（音量）を制御するノードを作成
        const gainNode = this.audioContext.createGain();
        // 音がブツッと切れないように、最後に少しだけ音量を下げる
        gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        // 3. オシレーターをゲインノードに、ゲインノードを最終出力（スピーカー）に接続
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // 4. 再生を開始し、指定時間後に停止する
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
}
