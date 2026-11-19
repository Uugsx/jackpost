const path = require('path');
const { isFile, isDirectory } = require('./filesystem');
const { transformProxyConfig } = require('@jackpost/requests');

function transformJackpostConfigBeforeSave(jackpostConfig) {
  if (jackpostConfig && !jackpostConfig.opencollection) {
    const userVersion = jackpostConfig.version;
    jackpostConfig.version = '1'; // jp schema marker
    if (userVersion) {
      jackpostConfig.collectionVersion = userVersion;
    } else {
      delete jackpostConfig.collectionVersion;
    }
  }

  // remove exists from importPaths and protoFiles
  if (jackpostConfig.protobuf?.importPaths) {
    jackpostConfig.protobuf.importPaths = jackpostConfig.protobuf.importPaths.map((importPath) => {
      delete importPath.exists;
      return importPath;
    });
  }
  if (jackpostConfig.protobuf?.protoFiles) {
    jackpostConfig.protobuf.protoFiles = jackpostConfig.protobuf.protoFiles.map((protoFile) => {
      delete protoFile.exists;
      return protoFile;
    });
  }

  // Clean up proxy config before saving
  if (jackpostConfig.proxy) {
    // Remove disabled: false (optional field)
    if (jackpostConfig.proxy.disabled === false) {
      delete jackpostConfig.proxy.disabled;
    }
    // Remove auth.disabled: false (optional field)
    if (jackpostConfig.proxy.config?.auth?.disabled === false) {
      delete jackpostConfig.proxy.config.auth.disabled;
    }
  }

  return jackpostConfig;
}

async function transformJackpostConfigAfterRead(jackpostConfig, collectionPathname) {
  if (jackpostConfig && !jackpostConfig.opencollection) {
    if (jackpostConfig.collectionVersion) {
      jackpostConfig.version = jackpostConfig.collectionVersion;
    } else {
      delete jackpostConfig.version;
    }
    delete jackpostConfig.collectionVersion;
  }

  // add exists to importPaths and protoFiles by checking actual file/directory existence
  if (jackpostConfig.protobuf?.importPaths) {
    jackpostConfig.protobuf.importPaths = await Promise.all(jackpostConfig.protobuf.importPaths.map(async (importPath) => {
      try {
        // Resolve the relative path against the collection pathname
        const absolutePath = path.resolve(collectionPathname, importPath.path);
        // Check if it's a directory
        const exists = isDirectory(absolutePath);
        return {
          ...importPath,
          exists
        };
      } catch (error) {
        return {
          ...importPath,
          exists: false
        };
      }
    }));
  }

  if (jackpostConfig.protobuf?.protoFiles) {
    jackpostConfig.protobuf.protoFiles = await Promise.all(jackpostConfig.protobuf.protoFiles.map(async (protoFile) => {
      try {
        // Resolve the relative path against the collection pathname
        const absolutePath = path.resolve(collectionPathname, protoFile.path);
        // Check if it's a file
        const exists = isFile(absolutePath);
        return {
          ...protoFile,
          exists
        };
      } catch (error) {
        return {
          ...protoFile,
          exists: false
        };
      }
    }));
  }

  // Migrate proxy configuration from old format to new format
  if (jackpostConfig.proxy) {
    jackpostConfig.proxy = transformProxyConfig(jackpostConfig.proxy);
  }

  return jackpostConfig;
}

module.exports = {
  transformJackpostConfigBeforeSave,
  transformJackpostConfigAfterRead
};
