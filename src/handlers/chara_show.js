import { Layout } from '../core/Layout.js';

/**
 * [chara_show] タグの処理
 * @param {Object} params - {name, face, storage, pos, x, y, time}
 */
export function handleCharaShow(manager, params) {
    // --- 1. 必要なパラメータを取得 ---
    const name = params.name;
    if (!name) {
        console.warn('[chara_show] name属性は必須です。');
       // manager.next();
       manager.finishTagExecution();
        return;
    }

    const def = manager.characterDefs[name];
    if (!def) {
        console.warn(`キャラクター[${name}]の定義が見つかりません。`);
        //manager.next();
        manager.finishTagExecution();
        return;
    }

    // --- 2. 表示する画像(storage)を決定 ---
    // face属性が指定されていれば、それを優先する
    const face = params.face || 'normal';
    const storage = def.face[face]; // "normal" や "angry" に対応する画像キーを取得

    if (!storage) {
        console.warn(`キャラクター[${name}]の表情[${face}]のstorageが見つかりません。asset_define.jsonを確認してください。`);
        //manager.next();
        manager.finishTagExecution();
        return;
    }

       // --- 2. 座標を決定 ---
    let x, y;
    const pos = params.pos;
    const orientation = manager.scene.scale.isPortrait ? 'portrait' : 'landscape';

    // ★★★ 1. まずはpos属性に基づいて、デフォルトの座標を決める ★★★
    if (pos && Layout[orientation].character[pos]) {
        x = Layout[orientation].character[pos].x;
        y = Layout[orientation].character[pos].y;
    } else {
        // posがなければ、中央をデフォルトとする
        x = Layout[orientation].character.center.x;
        y = Layout[orientation].character.center.y;
    }

    // ★★★ 2. x, y属性があれば、それで座標を上書きする ★★★
    if (params.x !== undefined) {
        x = Number(params.x);
    }
    if (params.y !== undefined) {
        y = Number(params.y);
    }

    // --- 4. 表示処理 ---
    const time = Number(params.time) || 0;

    if (manager.scene.characters[name]) {
        manager.scene.characters[name].destroy();
    }

    const chara = manager.scene.add.image(x, y, storage);
    chara.setAlpha(0);
    manager.layers.character.add(chara);
    manager.scene.characters[name] = chara;

    // ★★★ 状態を更新 ★★★
    // ★★★ ここから状態更新 ★★★
    const charaData = {
        name: name,
        face: params.face || 'normal',
        storage: storage,
        pos: params.pos,
        x: x,
        y: y
    };
    manager.stateManager.updateChara(name, charaData);

    // --- 5. アニメーション ---
    if (time > 0) {
        manager.scene.tweens.add({
            targets: chara,
            alpha: 1,
            duration: time,
            ease: 'Linear',
            onComplete: () => manager.finishTagExecution()
                //manager.next()
        });
    } else {
        chara.setAlpha(1);
        manager.finishTagExecution();
       // manager.next();
    }
}