; === scene2.ks ===
; このシナリオで使うアセットを宣言
@asset image key=cg_secret path=assets/event_cg_01.jpg
@asset sound key=se_surprise path=assets/smash.mp3

*start
kaito:「やあ、ここはscene2.ksだよ。」
[image storage="cg_secret"]
[playse storage="se_surprise"]
[p]
kaito:「このシナリオ専用のアセットが表示・再生されたかな？」
[p]

[return]