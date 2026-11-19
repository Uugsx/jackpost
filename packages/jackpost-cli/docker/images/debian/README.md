# Jackpost CLI — Debian

Debian slim variant of the Jackpost CLI Docker image.

**Base image:** `node:24.22.3-slim`

## Building

```bash
docker build -t usejackpost/cli:debian ./images/debian

# with specific Jackpost CLI version
docker build \
  --build-arg JACKPOST_VERSION=3.3.0 \
  -t usejackpost/cli:3.3.0-debian \
  ./images/debian
```

## Usage

```bash
# Run a collection
docker run -v $(pwd):/jackpost usejackpost/cli:debian run 

# with pinned version
docker run -v $(pwd):/jackpost usejackpost/cli:3.3.0-debian run 
```
