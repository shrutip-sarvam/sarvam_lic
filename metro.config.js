'use strict';
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver ?? {};
config.resolver.sourceExts = [
  ...(config.resolver.sourceExts ?? []),
  'css',
];

// Shim ESM-only packages that use import.meta (breaks Metro web bundler)
const shimDir = path.join(__dirname, '.metro-shims');
if (!fs.existsSync(shimDir)) fs.mkdirSync(shimDir);
const uuidShim = path.join(shimDir, 'uuid.js');
if (!fs.existsSync(uuidShim)) {
  fs.writeFileSync(uuidShim, [
    "'use strict';",
    "function v4() {",
    "  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {",
    "    return crypto.randomUUID();",
    "  }",
    "  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);",
    "}",
    "module.exports = { v4 };",
  ].join('\n'));
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'uuid') {
    return { filePath: uuidShim, type: 'sourceFile' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
