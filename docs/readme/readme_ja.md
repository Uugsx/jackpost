<br />
<img src="../../assets/images/logo-transparent.png" width="80"/>

### Jackpost - API の検証・動作テストのためのオープンソース IDE.

[![GitHub version](https://badge.fury.io/gh/usejackpost%2Fjackpost.svg)](https://badge.fury.io/gh/usejackpost%2Fjackpost)
[![CI](https://github.com/usejackpost/jackpost/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/usejackpost/jackpost/actions/workflows/tests.yml)
[![Commit Activity](https://img.shields.io/github/commit-activity/m/usejackpost/jackpost)](https://github.com/usejackpost/jackpost/pulse)
[![X](https://img.shields.io/twitter/follow/use_jackpost?style=social&logo=x)](https://twitter.com/use_jackpost)
[![Website](https://img.shields.io/badge/Website-Visit-blue)](https://www.usejackpost.com)
[![Download](https://img.shields.io/badge/Download-Latest-brightgreen)](https://www.usejackpost.com/downloads)

[English](../../readme.md)
| [Українська](./readme_ua.md)
| [Русский](./readme_ru.md)
| [Türkçe](./readme_tr.md)
| [Deutsch](./readme_de.md)
| [Français](./readme_fr.md)
| [Português (BR)](./readme_pt_br.md)
| [한국어](./readme_kr.md)
| [বাংলা](./readme_bn.md)
| [Español](./readme_es.md)
| [Italiano](./readme_it.md)
| [Română](./readme_ro.md)
| [Polski](./readme_pl.md)
| [简体中文](./readme_cn.md)
| [正體中文](./readme_zhtw.md)
| [العربية](./readme_ar.md)
| **日本語**
| [ქართული](./readme_ka.md)
| [हिन्दी](./readme_hi.md)

Jackpost は革新的な API クライアントです。Postman を代表する API クライアントツールの現状に一石を投じることを目指しています。

Jackpost はローカルフォルダに直接コレクションを保存します。API リクエストの情報を保存するために Jp というプレーンテキストのマークアップ言語を採用しています。

Git や任意のバージョン管理システムを使って API コレクションを共同開発することもできます。

Jackpost はオフラインのみで利用できます。Jackpost にクラウド同期機能を追加する予定はありません。私たちはデータプライバシーを尊重しており、データはローカルに保存されるべきだと考えています。私たちの長期的なビジョンは[こちら](https://github.com/usejackpost/jackpost/discussions/269)をご覧ください。

[Jackpost をダウンロード](https://www.usejackpost.com/downloads)

📢 India FOSS 3.0 Conference での発表の様子は[こちら](https://www.youtube.com/watch?v=7bSMFpbcPiY)から

![jackpost](/assets/images/landing-2.png) <br /><br />

### インストール方法

Jackpost は[私たちのウェブサイト](https://www.usejackpost.com/downloads)からバイナリをダウンロードできます。Mac, Windows, Linux に対応しています。

Homebrew, Chocolatey, Scoop, Snap, Flatpak, Apt などのパッケージマネージャからもインストール可能です。

```sh
# MacでHomebrewを使ってインストール
brew install jackpost

# WindowsでChocolateyを使ってインストール
choco install jackpost

# WindowsでScoopを使ってインストール
scoop bucket add extras
scoop install jackpost

# Windowsでwingetを使ってインストール
winget install Jackpost.Jackpost

# LinuxでSnapを使ってインストール
snap install jackpost

# LinuxでFlatpakを使ってインストール
flatpak install com.usejackpost.Jackpost

# LinuxでAptを使ってインストール
sudo mkdir -p /etc/apt/keyrings
sudo apt update && sudo apt install gpg curl
curl -fsSL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x9FA6017ECABE0266" \
  | gpg --dearmor \
  | sudo tee /etc/apt/keyrings/jackpost.gpg > /dev/null
sudo chmod 644 /etc/apt/keyrings/jackpost.gpg
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/jackpost.gpg] http://debian.usejackpost.com/ jackpost stable" \
  | sudo tee /etc/apt/sources.list.d/jackpost.list
sudo apt update && sudo apt install jackpost
```

### マルチプラットフォームでの実行に対応 🖥️

![jackpost](/assets/images/run-anywhere.png) <br /><br />

### Git との連携が可能 👩‍💻🧑‍💻

または任意のバージョン管理システムにも対応しています。

![jackpost](/assets/images/version-control.png) <br /><br />

### スポンサー

#### ゴールドスポンサー

<img src="../../assets/images/sponsors/samagata.png" width="150"/>

#### シルバースポンサー

<img src="../../assets/images/sponsors/commit-company.png" width="70"/>

#### ブロンズスポンサー

<a href="https://zuplo.link/jackpost">
    <img src="../../assets/images/sponsors/zuplo.png" width="120"/>
</a>

### 主要リンク 📌

- [私たちの長期ビジョン](https://github.com/usejackpost/jackpost/discussions/269)
- [ロードマップ](https://github.com/usejackpost/jackpost/discussions/384)
- [ドキュメント](https://docs.usejackpost.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/jackpost)
- [ウェブサイト](https://www.usejackpost.com)
- [料金設定](https://www.usejackpost.com/pricing)
- [ダウンロード](https://www.usejackpost.com/downloads)
- [Github スポンサー](https://github.com/sponsors/helloanoop).

### Showcase 🎥

- [体験談](https://github.com/usejackpost/jackpost/discussions/343)
- [ナレッジベース](https://github.com/usejackpost/jackpost/discussions/386)
- [スクリプト集](https://github.com/usejackpost/jackpost/discussions/385)

### サポート ❤️

もし Jackpost を気に入っていただいて、オープンソースの活動を支援していただけるなら、[Github Sponsors](https://github.com/sponsors/helloanoop)でスポンサーになることを考えてみてください。

### 体験談のシェア 📣

Jackpost が職場やチームで役立っているのであれば、[GitHub discussion 上であなたの体験談](https://github.com/usejackpost/jackpost/discussions/343)をシェアしていただくようお願いします。

### 新しいパッケージマネージャへの公開

詳しくは[こちら](../publishing/publishing_ja.md)をご覧ください。

### 連絡先 🌐

[𝕏 (Twitter)](https://twitter.com/use_jackpost) <br />
[Website](https://www.usejackpost.com) <br />
[Discord](https://discord.com/invite/KgcZUncpjq) <br />
[LinkedIn](https://www.linkedin.com/company/usejackpost)

### 商標について

**名前**

`Jackpost`は[Anoop M D](https://www.helloanoop.com/)は取得している商標です。

**ロゴ**

ロゴの出典は[OpenMoji](https://openmoji.org/library/emoji-1F436/)です。CC [BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)でライセンスされています。

### 貢献するには 👩‍💻🧑‍💻

Jackpost を改善していただけるのは歓迎です。[コントリビュートガイド](../contributing/contributing_ja.md)をご覧ください。

もしコードによる貢献ができない場合でも、あなたのユースケースを解決するために遠慮なくバグ報告や機能リクエストを出してください。

### 開発者

<div align="center">
    <a href="https://github.com/usejackpost/jackpost/graphs/contributors">
        <img src="https://contrib.rocks/image?repo=usejackpost/jackpost" />
    </a>
</div>

### ライセンス 📄

[MIT](../../license.md)
