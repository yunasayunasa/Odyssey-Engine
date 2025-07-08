/**
 * [jump] タグの処理
 * 指定されたラベルにジャンプする
 * @param {Object} params - {target}
 */
export function handleJump(manager, params) {
    const target = params.target;
    if (!target || !target.startsWith('*')) {
        console.warn('[jump] target属性は必須です。*から始まるラベル名を指定してください。');
       // manager.next();
       manager.finishTagExecution();
        return;
    }
    
    manager.jumpTo(target);
    // jumpToがnext()を呼ぶので、ここではnext()を呼ばない
}