<br />
<img src="assets/images/logo-transparent.png" width="80"/>

### Jackpost - Opensource IDE for exploring and testing APIs.

[![GitHub version](https://badge.fury.io/gh/usejackpost%2Fjackpost.svg)](https://badge.fury.io/gh/usejackpost%2Fjackpost)
[![CI](https://github.com/usejackpost/jackpost/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/usejackpost/jackpost/actions/workflows/tests.yml)
[![Commit Activity](https://img.shields.io/github/commit-activity/m/usejackpost/jackpost)](https://github.com/usejackpost/jackpost/pulse)
[![X](https://img.shields.io/twitter/follow/use_jackpost?style=social&logo=x)](https://twitter.com/use_jackpost)
[![Website](https://img.shields.io/badge/Website-Visit-blue)](https://www.usejackpost.com)
[![Download](https://img.shields.io/badge/Download-Latest-brightgreen)](https://www.usejackpost.com/downloads)

**English**
| [Українська](docs/readme/readme_ua.md)
| [Русский](docs/readme/readme_ru.md)
| [Türkçe](docs/readme/readme_tr.md)
| [Deutsch](docs/readme/readme_de.md)
| [Français](docs/readme/readme_fr.md)
| [Português (BR)](docs/readme/readme_pt_br.md)
| [한국어](docs/readme/readme_kr.md)
| [বাংলা](docs/readme/readme_bn.md)
| [Español](docs/readme/readme_es.md)
| [Italiano](docs/readme/readme_it.md)
| [Română](docs/readme/readme_ro.md)
| [Polski](docs/readme/readme_pl.md)
| [简体中文](docs/readme/readme_cn.md)
| [正體中文](docs/readme/readme_zhtw.md)
| [العربية](docs/readme/readme_ar.md)
| [日本語](docs/readme/readme_ja.md)
| [ქართული](docs/readme/readme_ka.md)
| [Nederlands](docs/readme/readme_nl.md)
| [فارسی](docs/readme/readme_fa.md)
| [हिन्दी](docs/readme/readme_hi.md)

Jackpost is a new and innovative API client, aimed at revolutionizing the status quo represented by Postman and similar tools out there.

Jackpost stores your collections directly in a folder on your filesystem. We use a plain text markup language, Jp, to save information about API requests.

You can use Git or any version control of your choice to collaborate over your API collections.

Jackpost is offline-only. There are no plans to add cloud-sync to Jackpost, ever. We value your data privacy and believe it should stay on your device. Read our long-term vision [here](https://github.com/usejackpost/jackpost/discussions/269)

[Download Jackpost](https://www.usejackpost.com/downloads)

📢 Watch our recent talk at India FOSS 3.0 Conference [here](https://www.youtube.com/watch?v=7bSMFpbcPiY)

![jackpost](assets/images/landing-2-dark.png#gh-light-mode-only)
![jackpost](assets/images/landing-2-light.png#gh-dark-mode-only) <br /><br />

## Commercial Versions ✨

Majority of our features are free and open source.
We strive to strike a harmonious balance between [open-source principles and sustainability](https://github.com/usejackpost/jackpost/discussions/269)

You can explore our [paid versions](https://www.usejackpost.com/pricing) to see if there are additional features that you or your team may find useful! <br/>

## Table of Contents

- [Installation](#installation)
- [Jackpost CLI](#jackpost-cli)
- [Run with Docker](#run-with-docker)
- [Features](#features)
  - [Run across multiple platforms 🖥️](#run-across-multiple-platforms-%EF%B8%8F)
  - [Collaborate via Git 👩‍💻🧑‍💻](#collaborate-via-git-%E2%80%8D%E2%80%8D)
- [Important Links 📌](#important-links-)
- [Showcase 🎥](#showcase-)
- [Share Testimonials 📣](#share-testimonials-)
- [Publishing to New Package Managers](#publishing-to-new-package-managers)
- [Stay in touch 🌐](#stay-in-touch-)
- [Trademark](#trademark)
- [Contribute 👩‍💻🧑‍💻](#contribute-%E2%80%8D%E2%80%8D)
- [Authors](#authors)
- [License 📄](#license-)

## Installation

Jackpost is available as binary download [on our website](https://www.usejackpost.com/downloads) for Mac, Windows and Linux.

You can also install Jackpost via package managers like Homebrew, Chocolatey, Scoop, Snap, Flatpak and Apt.

```sh
# On Mac via Homebrew
brew install jackpost

# On Windows via Chocolatey
choco install jackpost

# On Windows via Scoop
scoop bucket add extras
scoop install jackpost

# On Windows via winget
winget install Jackpost.Jackpost

# On Linux via Snap
snap install jackpost

# On Linux via Flatpak
flatpak install com.usejackpost.Jackpost

# On Arch Linux via AUR
yay -S jackpost

# On Linux via Apt
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

## Jackpost CLI

The **Jackpost CLI** lets you run your API collections from the command line, which is ideal for automated testing and CI/CD pipelines. Install it from npm using the package manager of your choice:

```sh
npm install -g @jackpost/cli
```

Navigate to the directory containing your collection and run it:

```sh
# Run every request in the collection
jp run

# Run a single request
jp run request.jp

# Run a folder against a specific environment
jp run folder --env Local
```

For the full command reference, see the [Jackpost CLI documentation](https://docs.usejackpost.com/jp-cli/overview).

## Run with Docker

Official Docker images for the **Jackpost CLI** let you run API collections in CI/CD pipelines and locally without installing Node.js or npm on the host. Images are published to both [Docker Hub](https://hub.docker.com/r/usejackpost/cli) and the [GitHub Container Registry](https://ghcr.io/usejackpost/cli) on every CLI release, with `alpine` and `debian` variants for `linux/amd64` and `linux/arm64`.

```sh
# Pull from Docker Hub
docker pull usejackpost/cli:latest

# Or pull from the GitHub Container Registry
docker pull ghcr.io/usejackpost/cli:latest

# Run a collection by mounting the current directory
docker run -v $(pwd):/jackpost usejackpost/cli run
```

For variants, tag matrix, environment files, and CI examples (GitHub Actions, GitLab CI, Jenkins), see the full [Jackpost CLI Docker documentation](https://docs.usejackpost.com/jp-cli/docker).

## Features

### Run across multiple platforms 🖥️

![jackpost](assets/images/run-anywhere.png) <br /><br />

### Collaborate via Git 👩‍💻🧑‍💻

Or any version control system of your choice

![jackpost](assets/images/version-control.png) <br /><br />

## Important Links 📌

- [Our Long Term Vision](https://github.com/usejackpost/jackpost/discussions/269)
- [Roadmap](https://www.usejackpost.com/roadmap)
- [Documentation](https://docs.usejackpost.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/jackpost)
- [Website](https://www.usejackpost.com)
- [Pricing](https://www.usejackpost.com/pricing)
- [Download](https://www.usejackpost.com/downloads)

## Showcase 🎥

- [Testimonials](https://github.com/usejackpost/jackpost/discussions/343)
- [Knowledge Hub](https://github.com/usejackpost/jackpost/discussions/386)
- [Scriptmania](https://github.com/usejackpost/jackpost/discussions/385)

## Share Testimonials 📣

If Jackpost has helped you at work and your teams, please don't forget to share your [testimonials on our GitHub discussion](https://github.com/usejackpost/jackpost/discussions/343)

## Publishing to New Package Managers

Please see [here](publishing.md) for more information.

## Stay in touch 🌐

[𝕏 (Twitter)](https://twitter.com/use_jackpost) <br />
[Website](https://www.usejackpost.com) <br />
[Discord](https://discord.com/invite/KgcZUncpjq) <br />
[LinkedIn](https://www.linkedin.com/company/usejackpost)

## Trademark

**Name**

`Jackpost` is a trademark held by [Anoop M D](https://www.helloanoop.com/)

**Logo**

The logo is sourced from [OpenMoji](https://openmoji.org/library/emoji-1F436/). License: CC [BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

## Contribute 👩‍💻🧑‍💻

I am happy that you are looking to improve jackpost. Please check out the [contributing guide](contributing.md)

Even if you are not able to make contributions via code, please don't hesitate to file bugs and feature requests that needs to be implemented to solve your use case.

## Authors

<div align="center">
    <a href="https://github.com/usejackpost/jackpost/graphs/contributors">
        <img src="https://contrib.rocks/image?repo=usejackpost/jackpost" />
    </a>
</div>

## License 📄

[MIT](license.md)
