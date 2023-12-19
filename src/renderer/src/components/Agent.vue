<script setup lang="ts">
import { useAgentStore } from '@renderer/store/agent'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { watch, nextTick } from 'vue'

const logger = ref()
const agentStore = useAgentStore()
const { logs, active, flashItem: activeItem, dockerInfoDialog } = storeToRefs(agentStore)

watch(logs, () => {
  nextTick(() => {
    if (logger.value?.$el) {
      logger.value.$el?.lastElementChild?.scrollIntoView()
    }
  })
})
</script>
<template>
  <v-dialog scrollable persistent v-model="active">
    <v-card min-height="180px">
      <v-toolbar color="primary" class="d-flex justify-left">
        <v-card-text>
          {{ $t('agent.currently_running', { name: activeItem?.reswarm?.config?.name }) }}
        </v-card-text>
      </v-toolbar>

      <v-card-text>
        <v-container class="terminal" ref="logger" pt-4>
          <div v-html="item" v-for="(item, index) in logs" :key="index"></div>
        </v-container>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn ref="agentStopButton" @click="agentStore.stopDevice()" variant="text">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    max-width="560px"
    v-model="dockerInfoDialog"
    @update:model-value="agentStore.setDockerInfoDialog(false)"
  >
    <v-card min-height="260px">
      <v-toolbar color="primary">
        <v-card-text class="headline white--text">
          {{ $t('docker_is_not_running') }}
        </v-card-text>
        <v-spacer> </v-spacer>
        <v-btn @click="agentStore.setDockerInfoDialog(false)" icon color="white">
          <v-icon> mdi-close </v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="">
        <div class="mt-8 mb-4" style="font-size: 16px">
          <div style="margin-bottom: 16px;">
            <p v-html="$t('docker_is_required')"></p>
            <i18n-t keypath="docker_please_follow_instructions" tag="p">
              <template v-slot:anchor>
                <a href="https://docs.docker.com/get-docker/" target="_blank">{{
                  $t('here').toLowerCase()
                }}</a>
              </template>
            </i18n-t>
          </div>
          <p v-html="$t('make_sure_docker_is_running')"></p>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<style>
.terminal {
  font-family: 'Courier New', Courier, 'Lucida Sans Typewriter', 'Lucida Typewriter', monospace;
  font-size: 13px;
}
</style>
