<br />
<img src="../../assets/images/logo-transparent.png" width="80"/>

### ბრუნო - ღია წყაროების IDE API-ების შესწავლისა და ტესტირებისათვის.

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
| [日本語](./readme_ja.md)
| **ქართული**
| [हिन्दी](./readme_hi.md)

ბრუნო არის ახალი და ინოვაციური API კლიენტი, რომელიც მიზნად ისახავს პოსტმანისა და მსგავსი ინსტრუმენტების არსებული მდგომარეობის რევოლუციას.

ბრუნო თქვენი კოლექციების შენახვას უშუალოდ თქვენს ფაილური სისტემის ერთ-ერთ საქაღალოში ახდენს. ჩვენ ვხმარობთ უბრალო ტექსტურ მარკაპ ენის, Jp-ს, API მოთხოვნების შესახებ ინფორმაციის შენახვისთვის.

თქვენ შეგიძლიათ გამოიყენოთ Git ან ნებისმიერი ვერსიის კონტროლის სისტემა თქვენი API კოლექციების გასაზიარებლად.

ბრუნო მხოლოდ ოფლაინ რეჟიმში მუშაობს. ბრუნოში ღრუბლური სინქრონიზაციის დამატების გეგმები არ არის. ჩვენ ვაფასებთ თქვენი მონაცემების პრივატობას და creemos, რომ ისინი თქვენს მოწყობილობაში უნდა დარჩეს. წაიკითხეთ ჩვენი გრძელვადიანი ხედვა [აქ](https://github.com/usejackpost/jackpost/discussions/269)

[დამატებით ბრუნო](https://www.usejackpost.com/downloads)

📢 შეიტყვეთ ჩვენი უახლესი საუბრის შესახებ India FOSS 3.0 კონფერენციაზე [აქ](https://www.youtube.com/watch?v=7bSMFpbcPiY)

![jackpost](../../assets/images/landing-2.png) <br /><br />

### ინსტალაცია

ბრუნო ხელმისაწვდომია როგორც ბინარული ჩამოტვირთვა [ჩვენ的网站上](https://www.usejackpost.com/downloads) Mac-ის, Windows-ისა და Linux-ისთვის.

თქვენ ასევე შეგიძლიათ დააინსტალიროთ ბრუნო პაკეტის მენეჯერების საშუალებით, როგორიცაა Homebrew, Chocolatey, Scoop, Snap, Flatpak და Apt.

```sh
# Mac-ზე Homebrew-ს საშუალებით
brew install jackpost

# Windows-ზე Chocolatey-ს საშუალებით
choco install jackpost

# Windows-ზე Scoop-ის საშუალებით
scoop bucket add extras
scoop install jackpost

# Windows-ზე winget-ის საშუალებით
winget install Jackpost.Jackpost

# Linux-ზე Snap-ის საშუალებით
snap install jackpost

# Linux-ზე Flatpak-ის საშუალებით
flatpak install com.usejackpost.Jackpost

# Linux-ზე Apt-ის საშუალებით
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

### პლატფორმებს შორის მუშაობა 🖥️

![jackpost](../../assets/images/run-anywhere.png) <br /><br />

### თანამშრომლობა Git-ის საშუალებით 👩‍💻🧑‍💻

ან ნებისმიერი ვერსიის კონტროლის სისტემის საშუალებით

![jackpost](../../assets/images/version-control.png) <br /><br />

### სპონსორები

#### ოქროს სპონსორები

<img src="../../assets/images/sponsors/samagata.png" width="150"/>

#### ვერცხლის სპონსორები

<img src="../../assets/images/sponsors/commit-company.png" width="70"/>

#### ბრინჯის სპონსორები

<a href="https://zuplo.link/jackpost">
    <img src="../../assets/images/sponsors/zuplo.png" width="120"/>
</a>

### მნიშვნელოვანი ბმულები 📌

- [ჩვენი გრძელვადიანი ხედვა](https://github.com/usejackpost/jackpost/discussions/269)
- [გეგმა](https://github.com/usejackpost/jackpost/discussions/384)
- [დოკუმენტაცია](https://docs.usejackpost.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/jackpost)
- [ვებსაიტი](https://www.usejackpost.com)
- [ფასები](https://www.usejackpost.com/pricing)
- [დამატება](https://www.usejackpost.com/downloads)
- [GitHub სპონსორები](https://github.com/sponsors/helloanoop).

### ვიტრინა 🎥

- [მოწონებები](https://github.com/usejackpost/jackpost/discussions/343)
- [მეცნიერების ჰაბი](https://github.com/usejackpost/jackpost/discussions/386)
- [Scriptmania](https://github.com/usejackpost/jackpost/discussions/385)

### მხარდაჭერა ❤️

თუ გიყვართ ბრუნო და გინდათ მხარი დაუჭიროთ ჩვენს ღია წყაროების მუშაობას, გაითვალისწინეთ ჩვენი დახმარება [GitHub სპონსორების საშუალებით](https://github.com/sponsors/helloanoop).

### გააზიარეთ მოწმობები 📣

თუ ბრუნო დაგეხმარათ თქვენს სამუშაოში და გუნდებში, გთხოვთ, არ დაგავიწყდეთ ჩვენი [მოწონებების გაზიარება ჩვენს GitHub განხილვაში](https://github.com/usejackpost/jackpost/discussions/343)

### ახალი პაკეტის მენეჯერებში გამოქვეყნება

იხილეთ [აქ](../../publishing.md) მეტი ინფორმაციისათვის.

### დაინტერესდით 🌐

[𝕎 (Twitter)](https://twitter.com/use_jackpost) <br />
[ვებსაიტი](https://www.usejackpost.com) <br />
[Discord](https://discord.com/invite/KgcZUncpjq) <br />
[LinkedIn](https://www.linkedin.com/company/usejackpost)

### სავაჭრო ნიშანი

**სახელი**

`ბრუნო` არის სავაჭრო ნიშანი, რომელსაც ფლობს [ანუპ მ. დ.](https://www.helloanoop.com/)

**ლოგო**

ლოგო არის [OpenMoji](https://openmoji.org/library/emoji-1F436/) სურათებიდან. ლიცენზია: CC [BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

### თანამშრომლობა 👩‍💻🧑‍💻

მიხარია, რომ დაინტერესებული ხართ ბრუნოს გაუმჯობესებით. გთხოვთ, გადახედეთ [თანამშრომლობის სახელმძღვანელოს](../../contributing.md)

თუნდაც ვერ მოახერხოთ კოდის საშუალებით კონტრიბუცია, ნუ ინანებთ პრობლემების და ფუნქციის მოთხოვნების ჩაწერას, რომლებიც უნდა განხორციელდეს თქვენი შემთხვევის გადასაჭრელად.

### ავტორები

<div align="center">
    <a href="https://github.com/usejackpost/jackpost/graphs/contributors">
        <img src="https://contrib.rocks/image?repo=usejackpost/jackpost" />
    </a>
</div>

### ლიცენზია 📄

[MIT](../../license.md)