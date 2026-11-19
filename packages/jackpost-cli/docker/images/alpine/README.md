# Jackpost CLI — Alpine

Alpine Linux variant of the Jackpost CLI Docker image.

**Base image:** `node:24.22.3-alpine`

## Building

```bash
docker build -t usejackpost/cli:alpine ./images/alpine

# with specific Jackpost CLI version
docker build \
  --build-arg JACKPOST_VERSION=3.3.0 \
  -t usejackpost/cli:3.3.0-alpine \
  ./images/alpine
```

## Usage

```bash
# Run a collection
docker run -v $(pwd):/jackpost usejackpost/cli:alpine run

# with pinned version
docker run -v $(pwd):/jackpost usejackpost/cli:3.3.0-alpine run
```
