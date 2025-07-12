export function handlePageBreak(manager, params) {
    if (manager.scene.pendingChoices.length > 0) {
        manager.isWaitingChoice = true;
        // ★★★ StateManagerに状態を保存 ★★★
        manager.stateManager.state.status.isWaitingChoice = true;
        manager.stateManager.state.status.pendingChoices = manager.scene.pendingChoices;
        
        manager.scene.displayChoiceButtons();
    } else {
        manager.isWaitingClick = true;
        // ★★★ StateManagerに状態を保存 ★★★
        manager.stateManager.state.status.isWaitingClick = true;
        
        manager.messageWindow.showNextArrow();
    }
}