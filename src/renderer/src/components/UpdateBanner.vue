<script setup lang="ts">
import { useUpdateStore } from '@renderer/store/update'
import { storeToRefs } from 'pinia'

const updateStore = useUpdateStore()
const { showDialog, updateState, updateProgress } = storeToRefs(updateStore)

console.log({ updateProgress: updateProgress.value, updateState: updateState.value })
</script>
<template>
  <v-card id="updaterBar" v-if="showDialog" color="info" rounded elevation="10">
    <v-card-item style="height: 100%;">
      <v-card-title>{{ $t(`update.${updateState}`) }}</v-card-title>
      <div v-if="updateState === 'announce'">
        <v-btn class="ma-2" min-width="120px" @click="updateStore.setShowDialog(false)">
          {{ $t('dismiss') }}
        </v-btn>
        <v-btn class="ma-2" min-width="120px" color="accent" @click="updateStore.downloadUpdate()">
          {{ $t('download') }}
        </v-btn>
      </div>
      <div v-if="updateState === 'download'" style="padding: 16px">
        <v-progress-linear :model-value="updateProgress" color="secondary" rounded height="40">
          {{ updateProgress + ' % ' }}
        </v-progress-linear>
      </div>
      <div v-if="updateState === 'install'">
        <v-btn class="ma-2" min-width="120px" @click="updateStore.setShowDialog(false)">
          {{ $t('not_now') }}
        </v-btn>
        <v-btn class="ma-2" min-width="120px" color="accent" @click="updateStore.installUpdate()">
          {{ $t('install') }}
        </v-btn>
      </div>
    </v-card-item>
  </v-card>
</template>
<style>
#updaterBar {
  position: fixed;
  flex-direction: column;
  text-align: center;
  bottom: 54px;
  left: 14px;
  display: flex;
  z-index: 99;
  height: 120px;
  width: 370px;
}

#updaterBar div {
  border-bottom: none;
}

#updaterText {
  font-size: 18px;
  /* color: #233543; */
  padding: 8px;
}

#updateProgress {
  padding: 8px;
}
</style>
