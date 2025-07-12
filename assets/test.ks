[bg storage="bg_school"]

; ★ 背景レイヤーで動画の再生を開始。nowaitで即座に次に進む
[video storage="opening" layer="background" loop=true nowait=true mute=true]

[chara_show name="yuna" pos="left" time=500]
[chara_show name="kaito" pos="right" time=500]
[wait time=500]

yuna:「見て！私たちの後ろで、動画が流れているよ！」
kaito:「すごい！これなら、ゲーム画面を背景に解説もできるね。」
[p]

yuna:「会話が終わったら、動画を止めてみよう。」
[p]

; ★ 背景の動画を停止する
[stopvideo layer="background"]

kaito:「うん、ちゃんと止まったね。完璧だ！」
[s]