# Getting Start

Through this chapter, you will know how to quickly start using Vexip UI.

> Before starting, you need to have learned [Vue3](https://v3.cn.vuejs.org/).

## Install Vexip UI

### Using Template

Vexip UI provides some templates for quick start and you can use them with the following command:

```sh
# 使用 pnpm
pnpm create vexip

# 使用 yarn
yarn create vexip
```

Then follow the prompts.

You can also specify template and some other dependencies with additional options, see [create-vexip](https://github.com/vexip-ui/create-vexip) for more details.

:::info
The template project is configured with the relevant plugins, you can still read the following content to understand how they work.
:::

### In Existing Project

Run following command in your project:

```sh
# pnpm
pnpm add vexip-ui

# yarn
yarn add vexip-ui
```

## Import Directly

Vexip UI already has the ability of tree-shaking. You can directly import components where you need to use them, and only those components you used will be packaged.

```vue
<template>
  <Button>Get Stared</Button>
</template>

<script setup lang="ts">
import 'vexip-ui/css/preset.css'
import 'vexip-ui/css/button.css'

import { Button } from 'vexip-ui'
</script>
```

But you can see that you need to import style files for each component separately by this way.

For the high compression ratio and convenience, you can directly import all styles at the top level:

```ts
import 'vexip-ui/css/index.css'
```

If you also don't care about the package size at all, or you use almost all components, you can choose to import all components globally:

```ts
import 'vexip-ui/css/index.css'

import { createApp } from 'vue'
import { install } from 'vexip-ui'
import App from './app.vue'

createApp(App).use(install)
```

## Import Automatically

When on demand import, we can automatically import styles via some plugins.

### Vite

On demand import can more concise with the help of the Vite plugin [vite-plugin-style-import](https://github.com/anncwb/vite-plugin-style-import).

Install plugin:

```sh
pnpm i -D vite-plugin-style-import
```

Add following in `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createStyleImportPlugin } from 'vite-plugin-style-import'

export default defineConfig({
  plugins: [
    vue(),
    createStyleImportPlugin({
      include: ['**/*.ts', '**/*.vue'],
      libs: [
        {
          libraryName: 'vexip-ui',
          esModule: true,
          base: 'vexip-ui/css/preset.css',
          resolveStyle: name => `vexip-ui/css/${name}.css`
        }
      ]
    })
  ]
})
```

If you think this alos too complicated to import components, you can try to use [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components) and [unplugin-auto-import](https://github.com/antfu/unplugin-vue-components) to complete the automatic import.

Install plugins:

```sh
pnpm i -D unplugin-vue-components unplugin-auto-import @vexip-ui/plugins
```

Add following in `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { VexipUIResolver } from '@vexip-ui/plugins'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        VexipUIResolver()
      ]
    }),
    AutoImport({
      resolvers: [
        VexipUIResolver()
      ]
    })
  ]
})
```

Then you can use components directly like this:

```vue
<template>
  <Button type="primary" @click="handleClick">
    Button
  </Button>
  <div
    v-loading="active"
    style="position: relative; width: 400px; padding-top: 60px; background-color: #fab00577;"
  ></div>
  <Icon><IUser></IUser></Icon>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const active = ref(true)

function handleClick() {
  Message.info('Clicked Button')
}
</script>
```

:::warning
The icon components need to be prefixed with `I` when auto import, such as `User` -> `IUser`.
:::

However, when only Resolver is used, the icon components can only be used via tag type. If you want to use it via prop, you still need to import them by yourself.

The configuration can be extended to support the auto import including using icon components via prop:

```ts
export default defineConfig(async () => ({
  plugins: [
    vue(),
    Components({
      resolvers: [
        VexipUIResolver()
      ]
    }),
    AutoImport({
      vueTemplate: true,
      resolvers: [
        VexipUIResolver()
      ],
      imports: [
        {
          '@vexip-ui/icons': Object.keys(await import('@vexip-ui/icons'))
            // The following processing is to make the name of icon components
            // also starts with 'I' when using via prop
            .map(name => name.match(/^I[0-9]/) ? name : [name, `I${name}`])
        }
      ]
    })
  ]
}))
```

So far, all components including icon components can be imported automatically.

### Webpack

On demand import can more concise with the help of the Webpack plugin [babel-plugin-import](https://github.com/ant-design/babel-plugin-import).

Install plugin:

```sh
pnpm i -D babel-plugin-import
```

Add following in `babel.config.js`:

```js
module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    [
      'import',
      {
        libraryName: 'vexip-ui',
        transformToDefaultImport: false,
        customName: () => 'vexip-ui',
        styleLibraryDirectory: 'css',
        style: name => `${name}.css`
      }
    ]
  ]
}
```

Due to plugin limitations, you still need to manually import `vexip-ui/css/preset.css`.

## Global Types Infer

If the components are imported globally, add the `compilerOptions.types` option in your project's `tsconfig.json` file to quickly get global types infer:

```json
{
  "compilerOptions": {
    "types": ["vexip-ui/types"]
  }
}
```

## Full Compoennts List

You can check full components list [here](https://github.com/vexip-ui/vexip-ui/blob/main/components/index.ts#L120).
