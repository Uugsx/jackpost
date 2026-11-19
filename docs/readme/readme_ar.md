<br />
<img src="../../assets/images/logo-transparent.png" width="80"/>

### برونو - بيئة تطوير مفتوحة المصدر لاستكشاف واختبار واجهات برمجة التطبيقات (APIs).

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
| **العربية**
| [日本語](./readme_ja.md)
| [ქართული](./readme_ka.md)
| [हिन्दी](./readme_hi.md)

برونو هو عميل API جديد ومبتكر، يهدف إلى ثورة الحالة الحالية التي يمثلها برنامج Postman وأدوات مماثلة هناك.

يقوم برونو بتخزين مجموعاتك مباشرة في مجلد على نظام الملفات الخاص بك. نحن نستخدم لغة ترميز النص العادية، Jp، لحفظ معلومات حول طلبات واجهة برمجة التطبيقات (API).

يمكنك استخدام Git أو أي نظام تحكم في الإصدار الذي تفضله للتعاون على مجموعات API الخاصة بك.

برونو هو خاص بالاستخدام دون اتصال بالإنترنت. ليس هناك خطط لإضافة مزامنة السحابة إلى برونو أبدًا. نحن نقدر خصوصية بياناتك ونعتقد أنه يجب أن تظل على جهازك. اقرأ رؤيتنا على المدى الطويل [هنا](https://github.com/usejackpost/jackpost/discussions/269)

📢 شاهد حديثنا الأخير في مؤتمر India FOSS 3.0 [هنا](https://www.youtube.com/watch?v=7bSMFpbcPiY)

![jackpost](/assets/images/landing-2.png) <br /><br />


### التثبيت

برونو متاح كتنزيل ثنائي [على موقعنا على الويب](https://www.usejackpost.com/downloads) لأنظمة التشغيل Mac و Windows و Linux.

يمكنك أيضًا تثبيت برونو عبر مديري الحزم مثل Homebrew و Chocolatey و Scoop و Snap و Flatpak و Apt.

```sh
# على نظام Mac عبر Homebrew
brew install jackpost

# على نظام Windows عبر Chocolatey
choco install jackpost

# على نظام Windows عبر Scoop
scoop bucket add extras
scoop install jackpost

# على نظام Linux عبر Snap
snap install jackpost

# على نظام Linux عبر Flatpak
flatpak install com.usejackpost.Jackpost

# على نظام Linux عبر Apt
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

### التشغيل عبر منصات متعددة 🖥️

![jackpost](/assets/images/run-anywhere.png) <br /><br />

### التعاون عبر Git 👩‍💻🧑‍💻

أو أي نظام تحكم في الإصدار الذي تفضله

![jackpost](/assets/images/version-control.png) <br /><br />

### الروابط المهمة 📌

- [رؤيتنا على المدى الطويل](https://github.com/usejackpost/jackpost/discussions/269)
- [خارطة الطريق](https://github.com/usejackpost/jackpost/discussions/384)
- [التوثيق](https://docs.usejackpost.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/jackpost)
- [الموقع الإلكتروني](https://www.usejackpost.com)
- [التسعير](https://www.usejackpost.com/pricing)
- [التنزيل](https://www.usejackpost.com/downloads)
- [Github Sponsors](https://github.com/sponsors/helloanoop).

### عروض 🎥

- [الشهادات](https://github.com/usejackpost/jackpost/discussions/343)
- [مركز المعرفة](https://github.com/usejackpost/jackpost/discussions/386)
- [Scriptmania](https://github.com/usejackpost/jackpost/discussions/385)

### الدعم ❤️

إذا كنت تحب برونو وترغب في دعم عملنا مفتوح المصدر، فكر في رعايتنا عبر [Github Sponsors](https://github.com/sponsors/helloanoop).

### شارك الشهادات 📣

إذا كان برونو قد ساعدك في العمل وفرقك، فلا تنسى مشاركة [شهاداتك في مناقشتنا على GitHub](https://github.com/usejackpost/jackpost/discussions/343)

### نشر إلى مديري الحزم الجديدة

يرجى الرجوع [هنا](../../publishing.md) لمزيد من المعلومات.

### تواصل معنا 🌐

[𝕏 (تويتر)](https://twitter.com/use_jackpost) <br />
[الموقع الإلكتروني](https://www.usejackpost.com) <br />
[ديسكورد](https://discord.com/invite/KgcZUncpjq) <br />
[لينكدإن](https://www.linkedin.com/company/usejackpost)

### علامة تجارية

**الاسم**

`برونو` هو علامة تجارية تمتلكها [أنوب إم دي](https://www.helloanoop.com/)

**الشعار**

الشعار من [OpenMoji](https://openmoji.org/library/emoji-1F436/). الترخيص: CC [BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

### المساهمة 👩‍💻🧑‍💻

يسعدني أنك تتطلع لتحسين برونو. يرجى الاطلاع على [دليل المساهمة](../../contributing.md)

حتى إذا لم تكن قادرًا على التساهم بشكل مباشر من خلال الشيفرة، فلا تتردد في الإبلاغ عن الأخطاء وطلب الميزات التي يجب تنفيذها لحل حالتك.

### الكتّاب

<div align="center">
    <a href="https://github.com/usejackpost/jackpost/graphs/contributors">
        <img src="https://contrib.rocks/image?repo=usejackpost/jackpost" />
    </a>
</div>

### الرخصة 📄

[MIT](../../license.md)
