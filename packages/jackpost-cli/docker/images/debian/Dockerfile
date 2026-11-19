FROM node:24.22.3-slim

LABEL maintainer="Jackpost <support@usejackpost.com>"

ARG JACKPOST_VERSION
ENV JACKPOST_VERSION=${JACKPOST_VERSION}

LABEL org.opencontainers.image.source="https://github.com/Uugsx/jackpost"
LABEL org.opencontainers.image.description="Jackpost CLI - Open source IDE for exploring and testing APIs"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.title="Jackpost CLI"
LABEL org.opencontainers.image.version="${JACKPOST_VERSION}"
LABEL org.opencontainers.image.url="https://www.usejackpost.com"
LABEL org.opencontainers.image.documentation="https://docs.usejackpost.com/jp-cli/overview"

ENV LC_ALL="en_US.UTF-8" \
    LANG="en_US.UTF-8" \
    LANGUAGE="en_US.UTF-8"

# If JACKPOST_VERSION is provided, validate it is a valid semver before installing
RUN if [ -n "$JACKPOST_VERSION" ]; then \
        if ! echo "$JACKPOST_VERSION" | grep -qE "^[0-9]+\.[0-9]+\.[0-9]+$"; then \
            echo "\033[0;31mA valid semver Jackpost version is required in the JACKPOST_VERSION build-arg (e.g. 1.16.0)\033[0m"; \
            exit 1; \
        fi; \
    fi && \
    npm install -g @jackpost/cli${JACKPOST_VERSION:+@${JACKPOST_VERSION}}

WORKDIR /jackpost

USER node

ENTRYPOINT ["jp"]
CMD []
