/**
 * [p] タグの処理 (クリック待ち)
 */
export function handlePageBreak(manager, params) {
    // もし[link]タグで溜まっている選択肢があれば、それを表示する
    if (manager.scene.pendingChoices.length > 0) {
        manager.isWaitingChoice = true;
        manager.scene.displayChoiceButtons();
        // 選択肢を表示して待つので、ここで処理は終わり
        // ★★★ 選択肢を表示したら、ここで処理を中断する ★★★
        // finishTagExecution() は呼ばない！クリックを待つ。
    } else {
        manager.isWaitingClick = true;
        manager.messageWindow.showNextArrow();
        // ★★★ クリック待ちなので、こちらもfinishTagExecution()は呼ばない！ ★★★
    }
}
