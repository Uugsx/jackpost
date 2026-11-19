// eslint.config.js
const { defineConfig } = require('eslint/config');
const globals = require('globals');
const { fixupPluginRules } = require('@eslint/compat');
const eslintPluginDiff = require('eslint-plugin-diff');

let stylistic;

const runESMImports = async () => {
  stylistic = await import('@stylistic/eslint-plugin').then((d) => d.default);
};

const isFixMode = process.argv.some((arg) => arg === '--fix' || arg === '--fix-dry-run');

const mainLintFiles = [
  './eslint.config.js',
  'tests/**/*.{ts,js}',
  'playwright/**/*.{js,ts}',
  'packages/jackpost-app/**/*.{js,jsx,ts}',
  'packages/jackpost-app/plugins/**/*.{js,cjs,mjs}',
  'packages/jackpost-app/src/test-utils/mocks/codemirror.js',
  'packages/jackpost-cli/**/*.js',
  'packages/jackpost-common/**/*.ts',
  'packages/jackpost-converters/**/*.js',
  'packages/jackpost-electron/**/*.js',
  'packages/jackpost-filestore/**/*.ts',
  'packages/jackpost-io/**/*.ts',
  'packages/jackpost-schema-types/**/*.ts',
  'packages/jackpost-js/**/*.js',
  'packages/jackpost-lang/**/*.js',
  'packages/jackpost-requests/**/*.ts',
  'packages/jackpost-requests/**/*.js',
  'packages/jackpost-tests/**/*.{js,ts}',
  'packages/jackpost-sqlite/**/*.{js,ts}'
];

module.exports = runESMImports().then(() => defineConfig([
  // Global ignores - must be a standalone object with ONLY ignores
  {
    ignores: [
      '**/node_modules/**/*',
      '**/dist/**/*',
      '**/*.jp',
      'packages/jackpost-js/src/sandbox/bundle-browser-rollup.js',
      'packages/jackpost-app/public/static/**/*',
      'packages/jackpost-app/.next/**/*',
      'packages/jackpost-electron/web/**/*'
    ]
  },
  {
    plugins: {
      'diff': fixupPluginRules(eslintPluginDiff),
      '@stylistic': stylistic
    },
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    files: mainLintFiles,
    rules: {
      ...stylistic.configs.customize({
        indent: 2,
        quotes: 'single',
        semi: true,
        jsx: true
      }).rules,
      '@stylistic/comma-dangle': ['error', 'never'],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/curly-newline': ['error', {
        multiline: true,
        minElements: 2,
        consistent: true
      }],
      '@stylistic/function-paren-newline': ['off'],
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/arrow-spacing': ['error', { before: true, after: true }],
      '@stylistic/function-call-spacing': ['error', 'never'],
      '@stylistic/multiline-ternary': ['off'],
      '@stylistic/padding-line-between-statements': ['off'],
      '@stylistic/semi-style': ['error', 'last'],
      '@stylistic/max-len': ['off'],
      '@stylistic/jsx-one-expression-per-line': ['off'],
      '@stylistic/max-statements-per-line': ['off'],
      '@stylistic/no-mixed-operators': ['off'],
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
      'no-debugger': 'warn',
      'eqeqeq': isFixMode ? 'off' : ['warn', 'always'],
      'prefer-const': isFixMode ? 'off' : 'warn',
      'no-var': 'warn',
      'no-unreachable': 'warn',
      'no-duplicate-imports': 'warn',
      'no-self-compare': 'warn',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-use-before-define': ['warn', { functions: false }]
    }
  },
  {
    files: ['packages/jackpost-app/**/*.{js,jsx,ts}'],
    ignores: ['**/*.config.js', '**/public/**/*', '**/plugins/**/*'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        global: false,
        require: false,
        Buffer: false,
        process: false,
        ipcRenderer: false,
        __JACKPOST_BENCHMARK__: false
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'no-undef': 'error'
    }
  },
  {
    // Rsbuild/rspack plugins are Node build tooling (CommonJS + ESM), not browser UI.
    files: ['packages/jackpost-app/plugins/**/*.{js,cjs,mjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      'no-undef': 'error'
    }
  },
  {
    files: ['packages/jackpost-app/**/*.{js,jsx,ts}'],
    ignores: ['**/*.config.js', '**/public/**/*', '**/plugins/**/*'],
    plugins: { 'react-hooks': require('eslint-plugin-react-hooks') },
    rules: {
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },
  {
    // It prevents lint errors when using CommonJS exports (module.exports) in Jest mocks.
    files: ['packages/jackpost-app/src/test-utils/mocks/codemirror.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      'no-undef': 'error'
    }
  },
  {
    // Storybook config files use CommonJS with __dirname and module.exports
    files: ['packages/jackpost-app/storybook/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-undef': 'error'
    }
  },
  {
    files: ['packages/jackpost-cli/**/*.js'],
    ignores: ['**/*.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      parserOptions: {
        ecmaVersion: 'latest'
      }
    },
    rules: {
      'no-undef': 'error'
    }
  },
  {
    files: ['packages/jackpost-common/**/*.ts'],
    ignores: ['**/*.config.js', '**/dist/**/*'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './packages/jackpost-common/tsconfig.json'
      }
    },
    rules: {
      'no-undef': 'error'
    }
  },
  {
    files: ['packages/jackpost-converters/**/*.js'],
    ignores: ['**/*.config.js', '**/dist/**/*'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      'no-undef': 'error',
      'no-case-declarations': 'error'
    }
  },
  {
    files: ['packages/jackpost-electron/**/*.js'],
    ignores: ['**/*.config.js', '**/web/**/*'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      'no-undef': 'error'
    }
  },
  {
    files: ['packages/jackpost-filestore/**/*.ts'],
    ignores: ['**/*.config.js', '**/dist/**/*'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './packages/jackpost-filestore/tsconfig.json'
      }
    },
    rules: {
      'no-undef': 'error'
    }
  },
  {
    files: ['packages/jackpost-io/**/*.ts'],
    ignores: ['**/*.config.js', '**/dist/**/*'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './packages/jackpost-io/tsconfig.json'
      }
    },
    rules: {
      'no-undef': 'error'
    }
  },
  {
    files: ['packages/jackpost-js/**/*.js'],
    ignores: ['**/*.config.js', '**/dist/**/*'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        window: false,
        self: false,
        HTMLElement: false,
        typeDetectGlobalObject: false
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      'no-undef': 'error'
    }
  },
  {
    files: ['packages/jackpost-lang/**/*.js'],
    ignores: ['**/*.config.js', '**/dist/**/*'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      'no-undef': 'error'
    }
  },
  {
    files: ['packages/jackpost-requests/**/*.ts'],
    ignores: ['**/*.config.js', '**/dist/**/*'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './packages/jackpost-requests/tsconfig.json'
      }
    },
    rules: {
      'no-undef': 'error'
    }
  },
  {
    files: ['packages/jackpost-requests/**/*.js'],
    ignores: ['**/*.config.js', '**/dist/**/*'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      'no-undef': 'error'
    }
  }
]));
