ring.js
======================
iphone 3GS上でサクサク動くcanvasライブラリ。  
mailChartアプリで必要な機能のみを実装。  
暫定仕様 : jQuery必要。 

実装機能一覧
------
1. (暫定) 簡易レイヤ機能
    * addLayer (現在上位レイヤ追加のみ対応)
    * draw
2. 角丸型の四角形表示
    * drawRoundedSquare
3. イメージ管理
    指定したjsonファイルに記載されたイメージを一括取得。イメージ名で表示。
    * loadImageResource : 初期化
    * drawImgResource
4. 複数行文字列表示
    入りきらない場合は、「...」となります。ワードラップ制御未搭載。
    * drawTextBox
5. フォーマット管理
    指定したjsonファイルに記載された文字種、色などの設定をフォーマット名で表示。  
    (CSSの読み込みは未搭載)
    * loadFormatAsset : 初期化
    * setFormatAsset

その他
------
基本的に、contextに追加した関数はdraw ..., set .... とする。(超暫定仕様)

ライセンス
------
MIT License
