import { Layout } from '../core/Layout.js';
import ScenarioManager from '../core/ScenarioManager.js';
import SoundManager from '../core/SoundManager.js';
import StateManager from '../core/StateManager.js';
import MessageWindow from '../ui/MessageWindow.js';

import { handleCharaShow } from '../handlers/chara_show.js';
import { handleCharaHide } from '../handlers/chara_hide.js';
import { handleCharaMod } from '../handlers/chara_mod.js';
import { handlePageBreak } from '../handlers/p.js';
import { handleWait } from '../handlers/wait.js';
import { handleBg } from '../handlers/bg.js';
import { handlePlaySe } from '../handlers/playse.js';
import { handlePlayBgm } from '../handlers/playbgm.js';
import { handleStopBgm } from '../handlers/stopbgm.js';
import ConfigManager from '../core/ConfigManager.js';
import { handleLink } from '../handlers/link.js';
import { handleJump } from '../handlers/jump.js';
import { handleMove } from '../handlers/move.js';
import { handleWalk } from '../handlers/walk.js';
import { handleShake } from '../handlers/shake.js';
import { handleVibrate } from '../handlers/vibrate.js';
import { handleFlip } from '../handlers/flip.js';
import { handleCharaJump } from '../handlers/chara_jump.js';
import { handleEval } from '../handlers/eval.js';
import { handleLog } from '../handlers/log.js';
import { handleIf } from '../handlers/if.js';
import { handleElsif } from '../handlers/elsif.js';
import { handleElse } from '../handlers/else.js';
import { handleEndif } from '../handlers/endif.js';
import { handleStop } from '../handlers/s.js';
import { handleClearMessage } from '../handlers/cm.js';
import { handleErase } from '../handlers/er.js';
import { handleDelay } from '../handlers/delay.js';
import { handleImage } from '../handlers/image.js';
import { handleFreeImage } from '../handlers/freeimage.js';
import { handleButton } from '../handlers/button.js';
import { handleCall } from '../handlers/call.js';
import { handleReturn } from '../handlers/return.js';
import { handleStopAnim } from '../handlers/stop_anim.js';
// import文に追加
import { handleFadeout } from '../handlers/fadeout.js';
import { handleFadein } from '../handlers/fadein.js';
import { handleVideo } from '../handlers/video.js';
import { handleStopVideo } from '../handlers/stopvideo.js';


export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.scenarioManager = null;
        this.soundManager = null;
        this.stateManager = null;
        this.messageWindow = null;
        this.layer = { background: null, character: null, cg: null, message: null };
        this.charaDefs = null;
        this.characters = {};
        this.configManager = null;
        this.choiceButtons = [];
        this.pendingChoices = []; // ★★★ 選択肢の一時保管場所 ★★★
        this.uiButtons = [];
    }

    init(data) {
        this.charaDefs = data.charaDefs;

        this.startScenario = data.startScenario || 'scene1.ks';
        this.startLabel = data.startLabel || null;
        this.isResuming = data.resumedFrom ? true : false;
        this.returnParams = data.returnParams || null;
    }



    preload() {
        this.load.text('scene1', 'assets/scene1.ks');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');



        // --- レイヤー生成 ---
        this.layer.background = this.add.container(0, 0);
        this.layer.character = this.add.container(0, 0);
        this.layer.cg = this.add.container(0, 0);
        this.layer.message = this.add.container(0, 0);

        // --- マネージャー/UIクラスの生成 (最終・確定版) ---

        // 1. 独立した部品を作る
        this.configManager = this.sys.registry.get('configManager');
        this.soundManager = new SoundManager(this, this.configManager);
        this.messageWindow = new MessageWindow(this, this.soundManager, this.configManager);
        // const mwLayout = Layout.landscape.ui.messageWindow; ではなく
        const mwLayout = Layout.ui.messageWindow; // ★ シンプルに
        this.messageWindow.setPosition(mwLayout.x, mwLayout.y);
        this.layer.message.add(this.messageWindow);

        // 2. 相互に依存する、中核マネージャーを生成
        this.stateManager = new StateManager();
        this.scenarioManager = new ScenarioManager(this, this.layer, this.charaDefs, this.messageWindow, this.soundManager, this.stateManager, this.configManager);

        // 3. ★★★ 相互参照を、ここで確立する ★★★
        this.stateManager.setScenarioManager(this.scenarioManager);



        // --- タグハンドラの登録 ---
        this.scenarioManager.registerTag('chara_show', handleCharaShow);
        this.scenarioManager.registerTag('chara_hide', handleCharaHide);
        this.scenarioManager.registerTag('chara_mod', handleCharaMod);
        this.scenarioManager.registerTag('p', handlePageBreak);
        this.scenarioManager.registerTag('wait', handleWait);
        this.scenarioManager.registerTag('bg', handleBg);
        this.scenarioManager.registerTag('playse', handlePlaySe);
        this.scenarioManager.registerTag('playbgm', handlePlayBgm);
        this.scenarioManager.registerTag('stopbgm', handleStopBgm);
        this.scenarioManager.registerTag('link', handleLink);
        this.scenarioManager.registerTag('jump', handleJump);
        this.scenarioManager.registerTag('move', handleMove);
        this.scenarioManager.registerTag('walk', handleWalk);
        this.scenarioManager.registerTag('shake', handleShake);
        this.scenarioManager.registerTag('vibrate', handleVibrate);
        this.scenarioManager.registerTag('flip', handleFlip);
        this.scenarioManager.registerTag('chara_jump', handleCharaJump);
        this.scenarioManager.registerTag('eval', handleEval);
        this.scenarioManager.registerTag('log', handleLog);
        this.scenarioManager.registerTag('if', handleIf);
        this.scenarioManager.registerTag('elsif', handleElsif);
        this.scenarioManager.registerTag('else', handleElse);
        this.scenarioManager.registerTag('endif', handleEndif);
        this.scenarioManager.registerTag('s', handleStop);
        this.scenarioManager.registerTag('cm', handleClearMessage);
        this.scenarioManager.registerTag('er', handleErase);
        this.scenarioManager.registerTag('delay', handleDelay);
        this.scenarioManager.registerTag('image', handleImage);
        this.scenarioManager.registerTag('freeimage', handleFreeImage);
        this.scenarioManager.registerTag('button', handleButton);
        this.scenarioManager.registerTag('call', handleCall);
        this.scenarioManager.registerTag('return', handleReturn);
        this.scenarioManager.registerTag('stop_anim', handleStopAnim);
        this.scenarioManager.registerTag('fadeout', handleFadeout);
        this.scenarioManager.registerTag('fadein', handleFadein);
        this.scenarioManager.registerTag('video', handleVideo);
        this.scenarioManager.registerTag('stopvideo', handleStopVideo);
        this.events.on('execute-return', (params) => {
            console.log("--- GameScene: 'execute-return' 受信！ ---");
            console.log("受信パラメータ:", params);
            this.performReturn(params);
        });
        // ★★★ ゲーム開始ロジックを、起動状態によって分岐させる ★★★
        if (this.isResuming) {
            // --- サブシーンからの復帰の場合 ---
            console.log("GameScene: 復帰処理を実行します。");
            this.performReturn(this.returnParams);
        } else {
            // --- 通常の初回起動の場合 ---
            this.scenarioManager.load(this.startScenario);
            if (this.startLabel) {
                this.scenarioManager.jumpTo(this.startLabel);
            }
            this.time.delayedCall(10, () => { this.scenarioManager.next(); }, [], this);
        }

        this.input.once('pointerdown', () => { if (this.sound.context.state === 'suspended') this.sound.context.resume(); }, this);
        this.input.on('pointerdown', () => { this.scenarioManager.onClick(); });

        console.log("GameScene: create 完了");
    }

    // ★★★ このメソッドを追加 ★★★
    setStateManager(stateManager) {
        this.stateManager = stateManager;
    }

    // GameSceneクラスの中に追加
    performSave(slot) {
        try {
            // ★★★ StateManagerに、ScenarioManagerのインスタンスを渡す ★★★
            const gameState = this.stateManager.getState(this.scenarioManager);
            gameState.saveDate = new Date().toLocaleString();
            localStorage.setItem(`save_data_${slot}`, JSON.stringify(gameState));
            console.log(`スロット[${slot}]にセーブしました。`);
        } catch (e) {
            console.error(`セーブに失敗しました: スロット[${slot}]`, e);
        }
    }

       /**
     * 溜まっている選択肢情報を元に、ボタンを一括で画面に表示する
     */
    displayChoiceButtons() {
        // 以前の選択肢が残っていれば、念のためクリア
        this.clearChoiceButtons();

        const totalButtons = this.pendingChoices.length;
        if (totalButtons === 0) return;

        // ★★★ Layout.jsから、横画面用のレイアウト定義を取得 ★★★
        const layout = Layout.ui.choiceButton;
        const gameWidth = 1280;

        // ボタン群全体が画面中央に来るように、開始Y座標を計算
        const startY = (720 / 2) - ((totalButtons - 1) * layout.stepY / 2);

        this.pendingChoices.forEach((choice, index) => {
            const y = startY + (index * layout.stepY);
            
            const button = this.add.text(gameWidth / 2, y, choice.text, {
                fontSize: '40px',
                fill: '#fff',
                backgroundColor: '#333333',
                padding: { x: 40, y: 20 },
                align: 'center',
                fixedWidth: 500 // ボタンの幅を固定すると綺麗
            }).setOrigin(0.5).setInteractive();
            console.log("ボタン設置");
            button.on('pointerdown', () => {
                this.clearChoiceButtons();
                this.scenarioManager.jumpTo(choice.target);
                this.scenarioManager.next();
            });

            this.choiceButtons.push(button);
        });

        this.pendingChoices = []; // 溜めていた情報はクリア
    }
 
    /**
     * 表示されている選択肢ボタンをすべて消去する
     */
    clearChoiceButtons() {
        this.choiceButtons.forEach(button => button.destroy());
        this.choiceButtons = [];
        // pendingChoicesもクリアしておくのが安全
        this.pendingChoices = [];
        
        if (this.scenarioManager) {
            this.scenarioManager.isWaitingChoice = false;
        }
    }
    // GameScene.js
    async performReturn(params, returnInfo) {
        console.log("GameScene: performReturn実行", params, returnInfo);

        // 1. 変数更新
        for (const key in params) {
            this.scenarioManager.stateManager.eval(`${key}="${params[key]}"`);
        }

        // 2. シナリオコンテキストを復元
        // (loadScenarioは使わない)
        const rawText = this.cache.text.get(returnInfo.file);
        this.scenarioManager.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
        this.scenarioManager.currentFile = returnInfo.file;
        this.scenarioManager.currentLine = returnInfo.line;

        // 3. 画面の再構築
        // rebuildSceneのロジックをここに展開しても良いが、
        // 戻るだけなら、現在の画面を維持した方が自然な場合も多い。
        // ここでは、単純に次の行から再開する。
        this.scenarioManager.next();
    }


    // GameSceneクラスの中に追加
    performLoad(slot) {
        try {
            const jsonString = localStorage.getItem(`save_data_${slot}`);
            if (!jsonString) { return; }
            const loadedState = JSON.parse(jsonString);

            // ★★★ rebuildSceneに、this(GameScene自身)を渡す ★★★
            rebuildScene(this, loadedState);

            // 復元された状態からシナリオを再開
            if (!this.scenarioManager.isWaitingChoice && !this.scenarioManager.isWaitingClick) {
                this.scenarioManager.next();
            }
        } catch (e) {
            console.error(`ロード処理でエラーが発生しました。`, e);
        }
    }
}
/**

// ★★★ rebuildSceneの定義を、引数を2つ受け取る形に修正 ★★★
/**
 * @param {GameScene} scene - 操作対象のGameSceneインスタンス
 * @param {Object} state - ロードした状態オブジェクト
 */
function rebuildScene(scene, state) {
    console.log("--- rebuildScene 開始 ---");
    const manager = scene.scenarioManager;

    // --- 1. クリア処理 ---
    scene.layer.background.removeAll(true);
    scene.layer.character.removeAll(true);
    scene.characters = {};
    manager.soundManager.stopBgm();

    // --- 2. 状態の完全な復元 ---
    manager.stateManager.setState(state);
    Object.assign(manager, {
        currentFile: state.scenario.fileName,
        currentLine: state.scenario.line,
        ifStack: state.ifStack || [],
        callStack: state.callStack || [],
        isWaitingChoice: state.isWaitingChoice || false,
        isWaitingClick: state.status.isWaitingClick || false, // ★ state.statusから取得
    });
    scene.pendingChoices = state.pendingChoices || [];

    // --- 3. シナリオ配列の再構築 ---
    const rawText = scene.cache.text.get(manager.currentFile);
    if (!rawText) throw new Error(`シナリオ[${manager.currentFile}]のキャッシュが見つかりません。`);
    manager.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');

    // --- 4. 見た目の再構築 ---
    // ★★★ this.add ではなく、scene.add を使う ★★★
    if (state.layers.background) {
        const bg = scene.add.image(640, 360, state.layers.background);
        scene.layer.background.add(bg);
    }
    for (const name in state.layers.characters) {
        const charaData = state.layers.characters[name];
        const chara = scene.add.image(charaData.x, charaData.y, charaData.storage);
        // ... (setData, setTintなど)
        scene.layer.character.add(chara);
        scene.characters[name] = chara;
    }
    if (state.sound.bgm) { manager.soundManager.playBgm(state.sound.bgm); }

    // --- 5. UIの再構築 ---
    manager.messageWindow.setText('', false);
    manager.highlightSpeaker(null);
    if (manager.isWaitingChoice) {
        scene.displayChoiceButtons();
    } else if (manager.isWaitingClick) {
        manager.messageWindow.showNextArrow();
    }
    console.log("--- rebuildScene 正常終了 ---");
}