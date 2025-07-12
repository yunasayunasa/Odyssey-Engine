/**
 * [p] タグの処理
 * 通常のクリック待ち、または選択肢の表示を行う。
 * このタグは常にプレイヤーの入力を待つため、シナリオの進行を停止させる。
 * @param {ScenarioManager} manager
 * @param {Object} params - パラメータ（未使用）
 */
export function handlePageBreak(manager, params) {
    // [link]タグによって選択肢が溜まっている場合
    if (manager.scene.pendingChoices && manager.scene.pendingChoices.length > 0) {
        console.log("選択肢を表示して、プレイヤーの選択を待機します。");
        
        // 1. 状態を「選択肢待ち」に設定する
        manager.isWaitingChoice = true;
        
        // 2. 溜まっていた選択肢をボタンとして表示する
        manager.scene.displayChoiceButtons();
        // manager.isWaitingClick = true;
        
        // ★ isWaitingClick は true にしない
        
    } else {
        // 通常のクリック待ちの場合
        console.log("通常のクリック待機状態に入ります。");
        
        // 1. 状態を「クリック待ち」に設定する
        manager.isWaitingClick = true;
        
        // 2. 次のクリックを促す矢印などを表示する
        manager.messageWindow.showNextArrow();
    }
    
    // ★★★ このハンドラは常にプレイヤーの入力を待つので、 ★★★
    // ★★★ manager.next() や finishTagExecution() は絶対に呼ばない ★★★
}