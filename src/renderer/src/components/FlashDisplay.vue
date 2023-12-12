<script setup lang="ts">
import humanizeDuration from 'humanize-duration'
import { useFlashStore } from '@renderer/store/flash'
import { storeToRefs } from 'pinia'
import { use } from 'echarts/core'
import { GaugeChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { watch } from 'vue'
import { computed } from 'vue'
import { ref } from 'vue'
import prettyBytes from 'pretty-bytes'

use([TitleComponent, TooltipComponent, LegendComponent, GaugeChart, CanvasRenderer])

const props = defineProps({
  id: Number
})

const flashStore = useFlashStore()
const { flashItemById } = storeToRefs(flashStore)

const flashItem = computed(() => flashItemById.value(props.id ?? 0))
const progressLabel = ref()
const etaLabel = ref()
const speedLabel = ref()
const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms'
    }
  }
})

watch(
  flashItem,
  (newVal) => {
    progressLabel.value = newVal?.flash?.progress.toFixed(2) + '%'
    etaLabel.value = shortEnglishHumanizer(Math.round(newVal?.flash.eta ?? 0) * 1000)
    speedLabel.value = prettyBytes(newVal?.flash.speed ?? 0) + '/s'
  },
  { deep: true }
)
</script>
<template>
  <v-container>
    <div class="flex-justify-center mt-n5 mb-5">
      <v-row>
        <v-col cols="3">
          <v-text-field
            :label="$t('completed')"
            variant="outlined"
            v-model="progressLabel"
            readonly
          >
          </v-text-field>
        </v-col>

        <v-col cols="1"> </v-col>

        <v-col cols="3">
          <v-text-field :label="$t('speed')" variant="outlined" v-model="speedLabel" readonly>
          </v-text-field>
        </v-col>

        <v-col cols="1"> </v-col>

        <v-col cols="3">
          <v-text-field :label="$t('eta')" variant="outlined" v-model="etaLabel" readonly>
          </v-text-field>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>
