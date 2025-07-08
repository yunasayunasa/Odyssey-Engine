/**
 * [link] タグの処理
 * 選択肢ボタンを生成する
 * @param {Object} params - {target}
 */
export function handleLink(manager, params) {
    const target = params.target;
    const text = params.text;
    if (!target || !text){ console.warn('[link] target属性は必須です。'); return; }

    // ★★★ GameSceneのpendingChoicesに選択肢情報を追加 ★★★
    manager.scene.pendingChoices.push({ text: text, target: target });
    
    // ★★★ isWaitingChoiceにはしない！ ★★★
    // すぐに次の行（次の[link]タグ）に進む
  //  manager.next();
  manager.finishTagExecution();
}