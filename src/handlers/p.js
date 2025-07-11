export function handlePageBreak(manager, params) {
    // ★★★ UISceneに選択肢の表示を依頼 ★★★
    const choiceCount = manager.scene.scene.get('UIScene').getPendingChoiceCount();
    if (choiceCount > 0) {
        manager.isWaitingChoice = true;
        manager.scene.scene.get('UIScene').displayChoices();
        // 待機状態に入るので、nextは呼ばない
    } else {
        manager.isWaitingClick = true;
        manager.messageWindow.showNextArrow();
        // 待機状態に入るので、nextは呼ばない
    }
}