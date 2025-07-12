/**
 * [jump] タグの処理
 * シナリオ内の別ラベル、または別のPhaserシーンへジャンプする
 * @param {ScenarioManager} manager
 * @param {Object} params - { storage, target }
 */
export function handleJump(manager, params) {
    const { storage, target } = params;

    if (storage) {
        // --- 別シーンへのジャンプ ---
        console.log(`別シーン[${storage}]へジャンプします。`);
        
        // ★★★ SystemSceneにシーン遷移をリクエストする ★★★
        manager.scene.scene.get('SystemScene').events.emit('request-scene-transition', {
            to: storage,
            from: 'GameScene' // どのシーンからのリクエストか伝える
        });
        
        // シーン遷移が始まるので、この後のScenarioManagerのループは止める必要がある。
        // そのため、ここでは何もせずに関数を終了する。

    } else if (target && target.startsWith('*')) {
        // --- ラベルへのジャンプ ---
        manager.jumpTo(target);
        
        // ★★★ next()はここでは呼ばない！ ★★★
        // この関数の終了後、ScenarioManagerのメインループがnext()を呼び出すので、
        // 処理の流れが一本化され、安全になる。

    } else {
        console.warn('[jump] 有効なstorage属性またはtarget属性が指定されていません。');
        // 何もせず、メインループに任せて次の行へ進む
    }
}