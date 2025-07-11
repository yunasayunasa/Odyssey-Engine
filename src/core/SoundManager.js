export default class SoundManager {
    constructor(scene, configManager) {
        this.scene = scene;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
    
     playSe(key, config = {}) {
        // ★★★ SE音量の設定を反映 ★★★
        // configでvolumeが指定されていなければ、設定値を使う
        if (config.volume === undefined) {
            config.volume = this.configManager.getValue('seVolume');
        }
        this.scene.sound.play(key, config);
    }

    /* 指定されたテキストを音声合成で読み上げる
     * @param {string} text - 読み上げるテキスト
     * @returns {Promise} 読み上げ完了を待つためのPromise
     */
    playVoice(text) {
        // Web Speech APIが使えるかチェック
        if (!('speechSynthesis' in window)) {
            console.warn("このブラウザはWeb Speech APIに対応していません。");
            return Promise.resolve(); // 即座に完了を返す
        }

        return new Promise((resolve) => {
            // 既存の読み上げがあればキャンセル
            window.speechSynthesis.cancel();
            
            // 発話オブジェクトを作成
            const utterance = new SpeechSynthesisUtterance(text);
            
            // ★ 声や言語を設定（任意）★
            // 利用可能な音声リストから日本語のものを探す
            const voices = window.speechSynthesis.getVoices();
            const japaneseVoice = voices.find(voice => voice.lang === 'ja-JP');
            if (japaneseVoice) {
                utterance.voice = japaneseVoice;
            }
            utterance.lang = 'ja-JP';
            utterance.rate = 1.2; // 読み上げ速度 (少し速め)
            utterance.pitch = 1;  // 声の高さ

            // ★ 読み上げが終了したら、Promiseを解決する
            utterance.onend = () => {
                console.log("読み上げ完了:", text);
                resolve();
            };

            // 読み上げ開始
            window.speechSynthesis.speak(utterance);
        });
    }
    
    playBgm(key, volume, fadeInTime = 0) {
        // ★★★ BGM音量の設定を反映 ★★★
        // volumeが引数で指定されていなければ、設定値を使う
        const targetVolume = volume !== undefined ? volume : this.configManager.getValue('bgmVolume');
        if (this.currentBgm && this.currentBgm.key === key) return;
        if (this.currentBgm) { this.stopBgm(); }
        this.currentBgm = this.scene.sound.add(key, { loop: true, volume: fadeInTime > 0 ? 0 : volume });
        this.currentBgm.play();
        if (fadeInTime > 0) {
            this.scene.tweens.add({ targets: this.currentBgm, volume: targetVolume, duration: fadeInTime, ease: 'Linear' }); }
    }
    stopBgm(fadeOutTime = 0) {
        if (!this.currentBgm) return;
        if (fadeOutTime > 0) {
            this.scene.tweens.add({ targets: this.currentBgm, volume: 0, duration: fadeOutTime, ease: 'Linear', onComplete: () => { this.currentBgm.stop(); this.currentBgm = null; } });
        } else {
            this.currentBgm.stop();
            this.currentBgm = null;
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
