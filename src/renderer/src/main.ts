import { createApp } from 'vue'
import App from './App.vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { en, de } from './locales'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { createI18n, useI18n } from 'vue-i18n'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const i18n = createI18n({
  legacy: false, // Vuetify does not support the legacy mode of vue-i18n
  locale: 'en',
  fallbackLocale: 'de',
  messages: {
    en,
    de
  }
})

const vuetify = createVuetify({
  components,
  directives,
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n })
  },
  theme: {
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#233543',
          secondary: '#c7ae7f',
          accent: '#f9ae1e',
          error: '#e62828',
          info: '#98a6ac',
          success: '#49a078',
          warning: '#334d5c'
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#334d5c',
          secondary: '#c7ae7f',
          accent: '#f9ae1e',
          error: '#e62828',
          info: '#233543',
          success: '#49a078',
          warning: '#98a6ac'
        }
      }
    }
  }
})

createApp(App).use(i18n).use(vuetify).mount('#app')
