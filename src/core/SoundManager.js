export default class SoundManager {
    constructor(scene, configManager) {
        this.scene = scene;
        this.configManager = configManager;
        this.currentBgm = null;
        this.currentBgmKey = null;

        this.audioContext = null;
        // ★★★ 合成音声関連のプロパティを追加 ★★★
        this.synthEnabled = false; // 合成音声が有効か
        this.synthEnablePromise = null; // 合成音声の有効化を待つPromise
        this.synthWaitingButton = null; // 合成音声許可ボタン

        // AudioContextの初期化
        this.scene.input.once('pointerdown', () => {
            if (this.scene.sound.context.state === 'suspended') {
                this.scene.sound.context.resume();
            }
            this.audioContext = this.scene.sound.context;
            console.log("AudioContext is ready.");
        }, this);

        // --- 設定変更イベントの監視 ---
        this.configManager.on('change:bgmVolume', (newValue) => {
            if (this.currentBgm && this.currentBgm.isPlaying) {
                this.currentBgm.setVolume(newValue);
            }
        });

        this.configManager.on('change:seVolume', (newValue) => {
            // (将来的な拡張用)
        });
    }

    playSe(key, options = {}) {
        if (!key) return;
        const se = this.scene.sound.add(key);
        let volume = this.configManager.getValue('seVolume');
        if (options.volume !== undefined) {
            volume = Number(options.volume);
        }
        se.setVolume(volume);
        se.play();
    }

    playBgm(key, fadeInTime = 0) {
        if (!key) return;

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

        const newBgm = this.scene.sound.add(key, { loop: true, volume: 0 });
        newBgm.play();
        this.currentBgm = newBgm;
        this.currentBgmKey = key;

        this.scene.tweens.add({
            targets: newBgm,
            volume: this.configManager.getValue('bgmVolume'),
            duration: fadeInTime
        });
    }

    stopBgm(fadeOutTime = 0) {
        if (this.currentBgm && this.currentBgm.isPlaying) {
            if (fadeOutTime > 0) {
                this.scene.tweens.add({
                    targets: this.currentBgm,
                    volume: 0,
                    duration: fadeOutTime,
                    onComplete: () => {
                        this.currentBgm.stop();
                        this.currentBgm = null;
                        this.currentBgmKey = null;
                    }
                });
            } else {
                this.currentBgm.stop();
                this.currentBgm = null;
                this.currentBgmKey = null;
            }
        }
    }

    getCurrentBgmKey() {
        if (this.currentBgm && this.currentBgm.isPlaying) {
            return this.currentBgmKey;
        }
        return null;
    }
    
    playSynth(waveType = 'square', frequency = 1200, duration = 0.05) {
        // ★ AudioContextが有効になるまで何もしない
        if (!this.audioContext || this.audioContext.state !== 'running') {
            console.warn("AudioContext is not ready. Cannot play synth sound.");
            return;
        }

        const oscillator = this.audioContext.createOscillator();
        oscillator.type = waveType;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(this.configManager.getValue('seVolume'), this.audioContext.currentTime); // ★ SE音量を適用
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
     /**
     * 合成音声の有効化状態をチェックし、必要であればユーザーに許可を求める。
     * @returns {Promise<void>} 合成音声が利用可能になったら解決するPromise
     */
    async ensureSynthEnabled() {
        if (this.synthEnabled) {
            return Promise.resolve();
        }
        if (this.synthEnablePromise) {
            return this.synthEnablePromise; // 既に許可を待機中
        }

        this.synthEnablePromise = new Promise(resolve => {
            // ★ 合成音声許可ボタンを表示する
            const buttonText = "合成音声の再生を許可しますか？\n（クリックで開始）";
            this.synthWaitingButton = this.scene.add.text(
                this.scene.scale.width / 2,
                this.scene.scale.height / 2,
                buttonText,
                {
                    fontSize: '32px',
                    fill: '#fff',
                    backgroundColor: '#0055aa',
                    padding: { x: 20, y: 10 },
                    align: 'center'
                }
            )
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(999); // 最前面に表示

            this.synthWaitingButton.on('pointerdown', () => {
                // ボタンがクリックされたら、合成音声を有効化
                try {
                    window.speechSynthesis.resume(); // 一応resumeを試みる
                    // ダミーの発話を試みて、許可状態にする
                    const dummyUtterance = new SpeechSynthesisUtterance(' ');
                    window.speechSynthesis.speak(dummyUtterance);
                    window.speechSynthesis.cancel(); // 即座にキャンセル

                    this.synthEnabled = true;
                    if (this.synthWaitingButton) {
                        this.synthWaitingButton.destroy(); // ボタンを削除
                        this.synthWaitingButton = null;
                    }
                    console.log("合成音声が有効になりました。");
                    resolve(); // Promiseを解決
                } catch (e) {
                    console.error("合成音声の有効化に失敗しました。", e);
                    // 失敗してもシナリオが止まらないようにresolve
                    resolve();
                }
            });
            console.log("合成音声の許可を待機しています...");
        });
        return this.synthEnablePromise;
    }
}
