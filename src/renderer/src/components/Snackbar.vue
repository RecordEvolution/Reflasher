<script setup lang="ts">
import { useSnackStore } from '@renderer/store/snack'
import { storeToRefs } from 'pinia'

const snackbar = useSnackStore()
const { visible, text, color } = storeToRefs(snackbar)
</script>

<template>
  <v-snackbar :color="color" v-model="visible" multi-line>
    {{ $t(text) }}

    <template v-slot:actions>
      <v-btn variant="text" @click="snackbar.setVisible(false)">Close</v-btn>
    </template>
  </v-snackbar>
</template>
