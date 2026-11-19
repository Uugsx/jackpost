#!/bin/bash

# Remove out directory
rm -rf packages/jackpost-electron/out

# Remove web directory
rm -rf packages/jackpost-electron/web

# Create a new web directory
mkdir packages/jackpost-electron/web

# Copy build
cp -r packages/jackpost-app/dist/* packages/jackpost-electron/web


# Update static paths
sed -i'' -e 's@/static/@static/@g' packages/jackpost-electron/web/**.html
sed -i'' -e 's@/static/font@../../static/font@g' packages/jackpost-electron/web/static/css/**.**.css

# Remove sourcemaps
find packages/jackpost-electron/web -name '*.map' -type f -delete

if [ "$1" == "snap" ]; then
  echo "Building snap distribution"
  npm run dist:snap --workspace=packages/jackpost-electron 
elif [ "$1" == "mac" ]; then
  echo "Building mac distribution"
  npm run dist:mac --workspace=packages/jackpost-electron
elif [ "$1" == "win" ]; then
  echo "Building windows distribution"
  npm run dist:win --workspace=packages/jackpost-electron
elif [ "$1" == "deb" ]; then
  echo "Building debian distribution"
  npm run dist:deb --workspace=packages/jackpost-electron
elif [ "$1" == "rpm" ]; then
  echo "Building rpm distribution"
  npm run dist:rpm --workspace=packages/jackpost-electron
elif [ "$1" == "linux" ]; then
  echo "Building linux distribution"
  npm run dist:linux --workspace=packages/jackpost-electron
else
  echo "Please pass a build distribution type"
fi