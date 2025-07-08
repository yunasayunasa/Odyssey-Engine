// 画面サイズを引数に取り、各位置の座標を返すオブジェクト
export const Layout = {
    // 縦向き (portrait) のレイアウト
    portrait: {
        width: 720,
        height: 1280,
        character: {
            // Y座標は共通にしておくと綺麗に見える
            left:   { x: 180, y: 800 },
            center: { x: 360, y: 800 },
            right:  { x: 540, y: 800 }
        }
    },
    // 横向き (landscape) のレイアウト
    landscape: {
        width: 1280,
        height: 720,
        character: {
            left:   { x: 280, y: 450 },
            center: { x: 640, y: 450 },
            right:  { x: 1000, y: 450 }
        }
    }
};