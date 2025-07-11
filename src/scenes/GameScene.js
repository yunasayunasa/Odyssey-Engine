import ScenarioManager from '../core/ScenarioManager.js';
import SoundManager from '../core/SoundManager.js';
import StateManager from '../core/StateManager.js';
import MessageWindow from '../ui/MessageWindow.js';
import { Layout } from '../core/Layout.js';
import { handleCharaShow } from '../handlers/chara_show.js';
import { handleCharaHide } from '../handlers/chara_hide.js';
import { handleCharaMod } from '../handlers/chara_mod.js';
import { handlePageBreak } from '../handlers/p.js';
import { handleWait } from '../handlers/wait.js';
import { handleBg } from '../handlers/bg.js';
import { handlePlaySe } from '../handlers/playse.js';
import { handlePlayBgm } from '../handlers/playbgm.js';
import { handleStopBgm } from '../handlers/stopbgm.js';
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
import { handleCall } from '../handlers/call.js';
import { handleReturn } from '../handlers/return.js';
import { handleStopAnim } from '../handlers/stop_anim.js';
import { handleFadeout } from '../handlers/fadeout.js';
import { handleFadein } from '../handlers/fadein.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.scenarioManager = null;
        this.soundManager = null;
        this.stateManager = null;
        this.messageWindow = null;
        this.configManager = null;
        this.layer = { background: null, character: null, cg: null, message: null };
        this.charaDefs = null;
        this.characters = {};
        this.choiceButtons = [];
        this.pendingChoices = [];
    }

    init(data) {
        this.charaDefs = data.charaDefs || this.sys.registry.get('charaDefs');
        this.startScenario = data.startScenario || 'scene1.ks';
        this.startLabel = data.startLabel || null;
        this.returnParams = data.returnParams || null;
    }

    create() {
        console.log("GameScene: create 開始");
        this.cameras.main.setBackgroundColor('#000000');
        
        ['background', 'character', 'cg', 'message'].forEach(key => this.layer[key] = this.add.container(0, 0));

        this.configManager = this.sys.registry.get('configManager');
        this.stateManager = new StateManager();
        this.soundManager = new SoundManager(this, this.configManager);
        this.messageWindow = new MessageWindow(this, this.soundManager, this.configManager);
        this.messageWindow.setPosition(Layout.ui.messageWindow.x, Layout.ui.messageWindow.y);
        this.layer.message.add(this.messageWindow);
        this.scenarioManager = new ScenarioManager(this, this.layer, this.charaDefs, this.messageWindow, this.soundManager, this.stateManager, this.configManager);
        
        const tags = { handleCharaShow, handleCharaHide, handleCharaMod, handlePageBreak, handleWait, handleBg, handlePlaySe, handlePlayBgm, handleStopBgm, handleLink, handleJump, handleMove, handleWalk, handleShake, handleVibrate, handleFlip, handleCharaJump, handleEval, handleLog, handleIf, handleElsif, handleElse, handleEndif, handleStop, handleClearMessage, handleErase, handleDelay, handleImage, handleFreeImage, handleCall, handleReturn, handleStopAnim, handleFadeout, handleFadein };
        for (const key in tags) {
            const tagName = key.replace('handle', '').replace(/([A-Z])/g, '_$1').toLowerCase().substring(1);
            this.scenarioManager.registerTag(tagName, tags[key]);
        }
        
        this.input.once('pointerdown', () => { if (this.sound.context.state === 'suspended') this.sound.context.resume(); }, this);
        this.input.on('pointerdown', () => { this.scenarioManager.onClick(); });

        if (this.returnParams) {
            this.performReturn(this.returnParams);
        } else {
            this.scenarioManager.load(this.startScenario);
            if (this.startLabel) {
                this.scenarioManager.jumpTo(this.startLabel);
            }
            this.time.delayedCall(10, () => { this.scenarioManager.next(); }, [], this);
        }
        console.log("GameScene: create 完了");
    }

    // GameSceneクラスの中に追加
 performSave(slot) {
        try {
            const gameState = this.stateManager.getState();
            gameState.saveDate = new Date().toLocaleString();
            localStorage.setItem(`save_data_${slot}`, JSON.stringify(gameState));
        } catch (e) {
            console.error(`セーブに失敗しました`, e);
        }
    }
    
    // GameSceneクラスの中に追加
async performLoad(slot) { // asyncに戻しておくと後々安全
    try {
        const jsonString = localStorage.getItem(`save_data_${slot}`);
        if (!jsonString) {
            console.warn(`スロット[${slot}]にセーブデータがありません。`);
            return;
        }
        const loadedState = JSON.parse(jsonString);
        this.stateManager.setState(loadedState);
        console.log(`スロット[${slot}]からロードしました。`, loadedState);

        rebuildScene(this.scenarioManager, loadedState);
        
        // ★★★ ここからデバッグログ ★★★
        console.log("--- performLoad: シナリオ再開処理 ---");

        // ScenarioManagerが持つシナリオ配列は正しいか？
        if (!this.scenarioManager.scenario) {
            console.error("エラー: scenarioManager.scenarioが存在しません！");
            return;
        }
        console.log(`シナリオ配列の長さ: ${this.scenarioManager.scenario.length}`);
        
        // currentLineは正しいか？
        console.log(`再開行番号: ${this.scenarioManager.currentLine}`);

        if (this.scenarioManager.currentLine >= this.scenarioManager.scenario.length) {
            console.error("エラー: 再開行番号がシナリオの範囲外です！");
            return;
        }
        
        // 行テキストの取得
        const line = this.scenarioManager.scenario[this.scenarioManager.currentLine];
        console.log(`再開する行テキスト: "${line}"`);

        // 行番号を進める
        this.scenarioManager.currentLine++;

        // パース実行
        console.log("parseを実行します...");
        this.scenarioManager.parse(line);
        console.log("performLoad 正常終了");
        
    } catch (e) {
        // ★★★ エラーオブジェクトも出力する ★★★
        console.error(`ロード処理でエラーが発生しました。`, e);
    }
}

/**
 * 溜まっている選択肢情報を元に、ボタンを一括で画面に表示する
 */
displayChoiceButtons() {
    // Y座標の計算を、全体のボタン数に基づいて行う
    const totalButtons = this.pendingChoices.length;
    const startY = (this.scale.height / 2) - ((totalButtons - 1) * 60); // 全体が中央に来るように開始位置を調整

    this.pendingChoices.forEach((choice, index) => {
        const y = startY + (index * 120); // ボタン間のスペース

    const button = this.add.text(this.scale.width / 2, y, choice.text, { fontSize: '36px', fill: '#fff', backgroundColor: '#555', padding: { x: 20, y: 10 }})
        .setOrigin(0.5)
        .setInteractive();
    
        button.on('pointerdown', () => {
            this.clearChoiceButtons();
            this.scenarioManager.jumpTo(choice.target);
        });

        this.choiceButtons.push(button);
    });

    this.pendingChoices = []; // 溜めていた情報はクリア
}
 
// ★★★ ボタンを消すためのヘルパーメソッドを追加 ★★★
clearChoiceButtons() {
    this.choiceButtons.forEach(button => button.destroy());
    this.choiceButtons = []; // 配列を空にする
    // 選択肢待ち状態を解除
    if (this.scenarioManager) {
        this.scenarioManager.isWaitingChoice = false;
    }
}



clearChoiceButtons() {
    this.choiceButtons.forEach(button => button.destroy());
    this.choiceButtons = [];
    this.pendingChoices = []; // 念のためこちらもクリア
    if (this.scenarioManager) {
        this.scenarioManager.isWaitingChoice = false;
    }
}


 performReturn(params) {
        if (this.scenarioManager.callStack.length === 0) return;
        const returnInfo = this.scenarioManager.callStack.pop();

        for (const key in params) {
            if (key.startsWith('f.') || key.startsWith('sf.')) {
                this.scenarioManager.stateManager.eval(`${key}="${params[key]}"`);
            }
        }
        
        const rawText = this.cache.text.get(returnInfo.file);
        if(!rawText) { console.error(`[return] 復帰先のシナリオ[${returnInfo.file}]が見つかりません。`); return; }

        this.scenarioManager.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
        this.scenarioManager.currentFile = returnInfo.file;
        this.scenarioManager.currentLine = returnInfo.line;
        
        rebuildScene(this, this.scenarioManager.stateManager.getState()); // ★ 画面を再構築
        
        this.scenarioManager.next();
    }

}
/**
 * ロードした状態に基づいて、シーンの表示を再構築するヘルパー関数
 * @param {ScenarioManager} manager - 操作対象のシナリオマネージャー
 * @param {Object} state - ロードした状態オブジェクト
 */
function rebuildScene(manager, state) {
    console.log("--- rebuildScene 開始 ---");
    const scene = manager.scene;

    // 1. 現在の表示をすべてクリア
    console.log("1. レイヤーをクリアします...");
    manager.layers.background.removeAll(true);
    manager.layers.character.removeAll(true);
    scene.characters = {}; // キャラクター管理リストもリセット
    manager.soundManager.stopBgm();
    console.log("...レイヤークリア完了");

    // 2. シナリオを復元
    console.log("2. シナリオ情報を復元します...");
    manager.currentFile = state.scenario.fileName;
    manager.currentLine = state.scenario.line;
    console.log(`...シナリオ情報: file=${manager.currentFile}, line=${manager.currentLine}`);

    if (!scene.cache.text.has(manager.currentFile)) {
        throw new Error(`シナリオファイル[${manager.currentFile}]がキャッシュにありません。`);
    }
    const rawText = scene.cache.text.get(manager.currentFile);
    manager.scenario = rawText.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
    console.log("...シナリオキャッシュOK、再構築完了");

    // 3. 背景を復元
    console.log("3. 背景を復元します...");
    if (state.layers.background) {
        if (!scene.textures.exists(state.layers.background)) {
            throw new Error(`背景テクスチャ[${state.layers.background}]がキャッシュにありません。`);
        }
        const bg = scene.add.image(scene.scale.width / 2, scene.scale.height / 2, state.layers.background);
        bg.setDisplaySize(scene.scale.width, scene.scale.height);
        manager.layers.background.add(bg);
    }
    console.log("...背景復元完了");
    
    // 4. キャラクターを復元
    console.log("4. キャラクターを復元します...");
    for (const name in state.layers.characters) {
        const charaData = state.layers.characters[name];
        console.log(`...キャラクター[${name}]を復元中...`);
        if (!scene.textures.exists(charaData.storage)) {
            throw new Error(`キャラクターテクスチャ[${charaData.storage}]がキャッシュにありません。`);
        }
        const chara = scene.add.image(charaData.x, charaData.y, charaData.storage);
        // ★★★ 必ずTintをリセットして明るい状態にする ★★★
        chara.setTint(0xffffff);

        manager.layers.character.add(chara);
        scene.characters[name] = chara; // 管理リストに再登録
    }
    console.log("...キャラクター復元完了");

    // 5. BGMを復元
   console.log("5. BGMを復元します...");
    if (state.sound.bgm) {
        manager.soundManager.playBgm(state.sound.bgm);
    }
    console.log("...BGM復元完了");
    
       // 6. メッセージウィンドウをリセット
    manager.messageWindow.setText('');

    // ★★★ 7. 話者とハイライトを復元 ★★★
   /* let speakerName = null;
    const line = manager.scenario[manager.currentLine];
    const speakerMatch = line.trim().match(/^([a-zA-Z0-9_]+):/);
    if (speakerMatch) {
        speakerName = speakerMatch[1];
    }
    manager.highlightSpeaker(speakerName);*/
    
    console.log("--- rebuildScene 正常終了 ---");
    
}

