<br />
<img src="../../assets/images/logo-transparent.png" width="80"/>

### Jackpost - API'leri keşfetmek ve test etmek için açık kaynaklı IDE.

[![GitHub sürümü](https://badge.fury.io/gh/usejackpost%2Fjackpost.svg)](https://badge.fury.io/gh/usejackpost%2Fjackpost)
[![CI](https://github.com/usejackpost/jackpost/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/usejackpost/jackpost/actions/workflows/tests.yml)
[![Commit Activity](https://img.shields.io/github/commit-activity/m/usejackpost/jackpost)](https://github.com/usejackpost/jackpost/pulse)
[![X](https://img.shields.io/twitter/follow/use_jackpost?style=social&logo=x)](https://twitter.com/use_jackpost)
[![Web Sitesi](https://img.shields.io/badge/Website-Visit-blue)](https://www.usejackpost.com)
[![İndir](https://img.shields.io/badge/Download-Latest-brightgreen)](https://www.usejackpost.com/downloads)

[English](../../readme.md)
| [Українська](./readme_ua.md)
| [Русский](./readme_ru.md)
| **Türkçe**
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
| [ქართული](./readme_ka.md)
| [हिन्दी](./readme_hi.md)

Jackpost, Postman ve benzeri araçlar tarafından temsil edilen statükoda devrim yaratmayı amaçlayan yeni ve yenilikçi bir API istemcisidir.

Jackpost koleksiyonlarınızı doğrudan dosya sisteminizdeki bir klasörde saklar. API istekleri hakkındaki bilgileri kaydetmek için düz bir metin biçimlendirme dili olan Jp kullanıyoruz.

API koleksiyonlarınız üzerinde işbirliği yapmak için Git veya seçtiğiniz herhangi bir sürüm kontrolünü kullanabilirsiniz.

Jackpost yalnızca çevrimdışıdır. Jackpost'ya bulut senkronizasyonu eklemek gibi bir planımız yok. Veri gizliliğinize değer veriyoruz ve cihazınızda kalması gerektiğine inanıyoruz. Uzun vadeli vizyonumuzu okuyun [burada](https://github.com/usejackpost/jackpost/discussions/269)

📢 Hindistan FOSS 3.0 Konferansındaki son konuşmamızı izleyin [burada](https://www.youtube.com/watch?v=7bSMFpbcPiY)

![jackpost](/assets/images/landing-2.png) <br /><br />

### Kurulum

Jackpost Mac, Windows ve Linux için ikili indirme olarak [web sitemizde](https://www.usejackpost.com/downloads) mevcuttur.

Jackpost'yu Homebrew, Chocolatey, Scoop, Snap ve Apt gibi paket yöneticileri aracılığıyla da yükleyebilirsiniz.

```sh
# Homebrew aracılığıyla Mac'te
brew install jackpost

# Chocolatey aracılığıyla Windows'ta
choco install jackpost

# Scoop aracılığıyla Windows'ta
scoop bucket add extras
scoop install jackpost

# Snap aracılığıyla Linux'ta
snap install jackpost

# Apt aracılığıyla Linux'ta
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

### Birden fazla platformda çalıştırın 🖥️

![jackpost](/assets/images/run-anywhere.png) <br /><br />

### Git üzerinden katkıda bulunun 👩‍💻🧑‍💻

Veya seçtiğiniz herhangi bir sürüm kontrol sistemi

![jackpost](/assets/images/version-control.png) <br /><br />

### Önemli Bağlantılar 📌

- [Uzun Vadeli Vizyonumuz](https://github.com/usejackpost/jackpost/discussions/269)
- [Yol Haritası](https://github.com/usejackpost/jackpost/discussions/384)
- [Dokümantasyon](https://docs.usejackpost.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/jackpost)
- [Web sitesi](https://www.usejackpost.com)
- [Fiyatlandırma](https://www.usejackpost.com/pricing)
- [İndir](https://www.usejackpost.com/downloads)
- [GitHub Sponsorları](https://github.com/sponsors/helloanoop).

### Vitrin 🎥

- [Görüşler](https://github.com/usejackpost/jackpost/discussions/343)
- [Bilgi Merkezi](https://github.com/usejackpost/jackpost/discussions/386)
- [Scriptmania](https://github.com/usejackpost/jackpost/discussions/385)

### Destek ❤️

Jackpost'yu seviyorsanız ve açık kaynak çalışmalarımızı desteklemek istiyorsanız, [GitHub Sponsorları](https://github.com/sponsors/helloanoop) aracılığıyla bize sponsor olmayı düşünün.

### Referansları Paylaşın 📣

Jackpost işinizde ve ekiplerinizde size yardımcı olduysa, lütfen [github tartışmamızdaki referanslarınızı](https://github.com/usejackpost/jackpost/discussions/343) paylaşmayı unutmayın.

### Yeni Paket Yöneticilerine Yayınlama

Daha fazla bilgi için lütfen [buraya](../publishing/publishing_tr.md) bakın.

### Katkıda Bulunun 👩‍💻🧑‍💻

Jackpost'yu geliştirmek istemenize sevindim. Lütfen [katkıda bulunma kılavuzuna](../contributing/contributing_tr.md) göz atın

Kod yoluyla katkıda bulunamasanız bile, lütfen kullanım durumunuzu çözmek için uygulanması gereken hataları ve özellik isteklerini bildirmekten çekinmeyin.

### Katkıda Bulunanlar

<div align="center">
    <a href="https://github.com/usejackpost/jackpost/graphs/contributors">
        <img src="https://contrib.rocks/image?repo=usejackpost/jackpost" />
    </a>
</div>

### İletişimde Kalın 🌐

[𝕏 (Twitter)](https://twitter.com/use_jackpost) <br />
[Website](https://www.usejackpost.com) <br />
[Discord](https://discord.com/invite/KgcZUncpjq) <br />
[LinkedIn](https://www.linkedin.com/company/usejackpost)

### Ticari Marka

**İsim**

`Jackpost` [Anoop M D](https://www.helloanoop.com/) tarafından sahip olunan bir ticari markadır.

**Logo**

Logo [OpenMoji](https://openmoji.org/library/emoji-1F436/) adresinden alınmıştır. Lisans: CC [BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

### Lisans 📄

[MIT](../../license.md)
