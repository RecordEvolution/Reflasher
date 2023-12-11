<script setup lang="ts">
import prettyBytes from 'pretty-bytes'
import { useDrivesStore } from '../store/drives'

const store = useDrivesStore()
</script>
<template>
  <v-container>
    <v-list-item>
      <v-toolbar-title class="title">
        {{ $t('flash_drives') }}
      </v-toolbar-title>

      <v-list-item-subtitle>
        {{ $t('sd_cards_and_drives') }}
      </v-list-item-subtitle>

      <template v-slot:append>
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              variant="plain"
              v-bind:="props"
              icon="mdi-refresh"
              @click="store.fetchDrives"
            ></v-btn>
          </template>
          <span>{{ $t('refresh_drive_list') }}</span>
        </v-tooltip>
      </template>
    </v-list-item>

    <v-divider></v-divider>

    <v-list dense nav>
      <v-list-item v-for="item in store.drives" :key="item.device">
        <div class="drive-item">
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <v-icon left color="primary" v-bind="props" v-if="item['busType'] === 'USB'">
                mdi-usb
              </v-icon>
              <v-icon
                left
                color="accent"
                v-bind="props"
                v-if="item['busType'] === 'SD' || item['busType'] === 'MMC'"
              >
                mdi-sd
              </v-icon>
            </template>
            <span>{{ item }}</span>
          </v-tooltip>

          <div>
            <v-list-item-title>
              {{ item.device }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ item.description }}
            </v-list-item-subtitle>
            <v-list-item-subtitle>{{ prettyBytes(item.size ?? 0) }}</v-list-item-subtitle>
          </div>

          <div class="drive-actions">
            <v-tooltip location="bottom" v-if="!item.mountpoints.length">
              <template v-slot:activator="{ props }">
                <v-btn
                  id="mountButton"
                  color="primary"
                  icon="mdi-eject mdi-rotate-180"
                  size="x-small"
                  variant="text"
                  v-bind="props"
                >
                </v-btn>
              </template>
              <span>{{ $t('mount') }}</span>
            </v-tooltip>

            <v-tooltip location="bottom" v-if="item.mountpoints.length">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-eject"
                  id="unmountButton"
                  color="primary"
                  size="x-small"
                  variant="text"
                  v-bind="props"
                  @click="store.unmountDrive(item)"
                >
                </v-btn>
              </template>
              <span>{{ $t('unmount') }}</span>
            </v-tooltip>
          </div>
        </div>
      </v-list-item>
    </v-list>
  </v-container>
</template>
<style>
.drive-item {
  display: flex;
  gap: 10px;
}

.drive-actions {
  display: flex;
  flex: 1;
  justify-content: flex-end;
  gap: 5px;
}
</style>
