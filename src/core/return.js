/**
 * [return] タグの処理
 * サブルーチンを終了し、呼び出し元に戻る
 */
export async function handleReturn(manager, params) {
    if (manager.callStack.length === 0) {
        console.warn('[return] 呼び出し元がありません。シナリオを停止します。');
        manager.isEnd = true;
        return;
    }
    
    // ★ 1. コールスタックから戻り先の情報を取得
    const returnInfo = manager.callStack.pop();
    console.log("コールスタックからポップ:", returnInfo);

    // ★ 2. 元のシナリオファイルをロードし直す
    await manager.loadScenario(returnInfo.file);

    // ★ 3. 保存しておいた行番号に戻す
    manager.currentLine = returnInfo.line;

    // ★ 4. 戻ってきた場所から実行を再開
    //manager.next();
    manager.finishTagExecution();
}