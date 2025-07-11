; === My Novel Engine 総合チュートリアル ===

; --- 変数の初期化 ---
[eval exp="f.love_meter = 0"]
[eval exp="sf.boot_count = (sf.play_count || 0) + 1"]
[eval exp="f.player_name = 'マスター'"]

; --- １．基本的な表示と演出 ---
[playbgm storage="ronpa_bgm" time=1000]
[bg storage="bg_school" time=1500]
[wait time=1500]

[chara_show name="yuna" pos="left" y=800 visible=false]
[move name="yuna" y=450 alpha=1 time=1000]
[wait time=1000]

[delay speed=80]
yuna:「ようこそ、&f.player_name！[br]これは、あなたと一緒に作ったゲームエンジンのチュートリアルです。」
[delay speed=50]
yuna:「このゲームを起動するのは、&sf.boot_count 回目ですね。」

[chara_show name="kaito" pos="right" time=1000]
[wait time=1000]

kaito:「僕の`[chara_show]`は、`time`属性でフェードインしたよ。」

yuna:「じゃあ、いくつか演出を見せるね。まずは揺れてみる。」

; --- ２．動的演出タグ ---

[shake name="yuna" time=500 power=10]
[vibrate time=300 power=0.01]
[wait time=500]
kaito:「わっ、びっくりした！」


[chara_jump name="kaito" height=50 time=600]
[wait time=600]
yuna:「次は、ジャンプ！」


[flip name="yuna" time=400]
[walk name="yuna" x=-200 time=2000]
[wait time=2000]
yuna:「じゃあ、私は向こうに歩いていくね。」
[chara_hide name="yuna"]

; --- ３．条件分岐と選択肢 ---
kaito:「さて、&f.player_name。僕に話しかけてみるかい？」
[link target="*talk_to_kaito" text="話しかける"]
[link target="*ignore_kaito" text="無視する"]
[p]
*talk_to_kaito
[eval exp="f.love_meter += 10"]
kaito:「話しかけてくれて嬉しいよ！ありがとう。」
[jump target="*choice_end"]

*ignore_kaito
[eval exp="f.love_meter -= 5"]
kaito:「そっか…ちょっと寂しいな。」
[jump target="*choice_end"]

*choice_end
[log exp="f.love_meter"]
[if exp="f.love_meter > 0"]
  kaito:「君は優しい人だね。」
[else]
  kaito:「次は話しかけてくれると嬉しいな。」
[endif]

; --- ４．画像とレイヤー操作 ---
kaito:「ここで、思い出の一枚絵を表示してみよう。」
[image storage="cg01" layer="cg" time=1000]
[wait time=1500]
[p]
[freeimage layer="cg"]
[bg storage="opening" time=1500]
[wait time=1500]

[chara_show name="yuna" pos="left"]
[chara_show name="kaito" pos="right"]

yuna:「見て！背景が動画になったよ！」
kaito:「すごい！この上で普通に会話が進められるんだね。」
[p]

; 再び静的な背景に戻す
[bg storage="bg_school" time=1500]
[wait time=1500]

yuna:「静止画にも問題なく戻れるね。完璧！」

; ↑動画の再生が終わると、自動的にこの行に進む

kaito:「ムービー、どうだった？」
[cm]
[wait time=500]
[freeimage layer="cg" time=1000]
[wait time=1000]
[chara_hide name="kaito"]

; --- ５．セーブ＆ロードとファイル呼び出し ---
[er layer="character"]
yuna:「この状態でセーブができます。メニューから試してみてね。」
yuna:「次に、`scene2.ks`をサブルーチンとして呼び出します。」

[fadeout time=500]
[wait time=500]
[call storage="scene2.ks"]
[fadein time=500]

yuna:「サブルーチンから戻ってきました。次はアクションシーンを呼び出します。」

[fadeout time=500]
[wait time=500]
[call storage="ActionScene"]
[fadein time=500]

yuna:「すべてのアクションから戻ってきました！[br]これにて、チュートリアルを終了します！」

[s]
