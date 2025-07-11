/**
 * [link] タグの処理
 * 選択肢ボタンを生成する
 * @param {Object} params - {target}
 */
export function handleLink(manager, params) {
    const target = params.target;
    const text = params.text;
    if (!target || !text){ console.warn('[link] target属性は必須です。'); return; }

     // ★★★ UISceneに選択肢情報を登録するよう依頼 ★
    manager.scene.scene.get('UIScene').addPendingChoice({ text, target });
    
    // 登録したら、すぐに次の行へ
    manager.next();
}