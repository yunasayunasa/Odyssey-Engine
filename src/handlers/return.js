export async function handleReturn(manager, params) {
    const gameScene = manager.scene;
    if (manager.callStack.length === 0) { console.warn('[return] 呼び出し元がありません。'); manager.next(); return; }
    
    const returnInfo = manager.callStack.pop();

    // ★★★ GameSceneに、復帰処理を直接命令する ★★★
    await gameScene.performReturn(params, returnInfo);
}