// Inline Babel plugin: rewrites `import.meta` → `{ env: { MODE: process.env.NODE_ENV } }`
// Fixes zustand v5 + other Vite-targeted packages that use import.meta.env in Metro web bundles.
const importMetaPlugin = ({ types: t }) => ({
  visitor: {
    MetaProperty(path) {
      if (
        path.node.meta.name === 'import' &&
        path.node.property.name === 'meta'
      ) {
        path.replaceWith(
          t.objectExpression([
            t.objectProperty(
              t.identifier('env'),
              t.objectExpression([
                t.objectProperty(
                  t.identifier('MODE'),
                  t.memberExpression(
                    t.memberExpression(t.identifier('process'), t.identifier('env')),
                    t.identifier('NODE_ENV')
                  )
                ),
                t.objectProperty(
                  t.identifier('DEV'),
                  t.binaryExpression(
                    '!==',
                    t.memberExpression(
                      t.memberExpression(t.identifier('process'), t.identifier('env')),
                      t.identifier('NODE_ENV')
                    ),
                    t.stringLiteral('production')
                  )
                ),
                t.objectProperty(
                  t.identifier('PROD'),
                  t.binaryExpression(
                    '===',
                    t.memberExpression(
                      t.memberExpression(t.identifier('process'), t.identifier('env')),
                      t.identifier('NODE_ENV')
                    ),
                    t.stringLiteral('production')
                  )
                ),
              ])
            ),
          ])
        );
      }
    },
  },
});

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
          reanimated: false,
        },
      ],
    ],
    plugins: [
      importMetaPlugin,
      ...(process.env.EXPO_PLATFORM === 'web' ? [] : ['react-native-reanimated/plugin']),
    ],
  };
};
