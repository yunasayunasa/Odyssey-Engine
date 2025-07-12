/**
 * [p] タグの処理 (クリック待ち or 選択肢表示)
 */
export function handlePageBreak(manager, params) {
    // 溜まっている選択肢があるか、GameSceneに確認
    if (manager.scene.pendingChoices.length > 0) {
        console.log("[p]ハンドラ: 選択肢を表示します。");
        manager.isWaitingChoice = true;
        manager.scene.displayChoiceButtons();
        
        // ★★★ 選択肢を表示したら、ハンドラの役目は終わりなので、必ずreturnする ★★★
        return;
    }
    
    // 選択肢がなければ、通常のクリック待ち
    console.log("[p]ハンドラ: 通常のクリック待ちに入ります。");
    manager.isWaitingClick = true;
    manager.messageWindow.showNextArrow();
    // こちらも、これ以上何もしないので、暗黙的にreturnされる
}