<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify/lib/framework.mjs'
import { useLocalStorage } from 'vue-composable'
import { ref } from 'vue'
import { langLocaleMap } from '@renderer/locales'

const i18nLocale = useI18n()
const theme = useTheme()

const availableLanguages = ref(['English', 'Deutsch'])

const { storage: darkMode } = useLocalStorage('darkMode', false, true)
const { storage: language } = useLocalStorage('language', 'English', true)

i18nLocale.locale.value = langLocaleMap[language.value]
watch(darkMode, (newVal) => {
  theme.global.name.value = newVal ? 'dark' : 'light'
})

watch(language, (newVal) => {
  i18nLocale.locale.value = langLocaleMap[newVal]
})
</script>

<template>
  <v-container>
    <v-list-item>
      <v-toolbar-title>
        {{ $t('settings') }}
      </v-toolbar-title>

      <v-list-item-subtitle>
        {{ $t('settings_subtitle') }}
      </v-list-item-subtitle>
    </v-list-item>

    <v-divider></v-divider>

    <v-list>
      <v-list-item>
        <v-select
          hide-details
          v-model="language"
          :label="$t('choose_language')"
          :items="availableLanguages"
          item-value="value"
          item-text="text"
          variant="underlined"
        ></v-select>
      </v-list-item>
      <v-list-item>
        <v-switch color="primary" v-model="darkMode" :label="`${$t('dark_mode')}`"></v-switch>
      </v-list-item>
    </v-list>
  </v-container>
</template>
