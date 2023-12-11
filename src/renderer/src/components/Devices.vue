<script setup lang="ts">
import type { SupportedBoard } from 'src/types'
import { storeToRefs } from 'pinia'
import { useDrivesStore } from '@renderer/store/drives'
import { Drive } from 'drivelist'
import { watch } from 'vue'
import { cutInfoString } from '../utils'
import { useBoardStore } from '@renderer/store/boards'
import { useWifiStore } from '@renderer/store/wifi'
import { useFlashStore } from '@renderer/store/flash'
import FlashDevice from '@renderer/components/FlashDevice.vue'
import FlashDisplay from '@renderer/components/FlashDisplay.vue'
import prettyBytes from 'pretty-bytes'

const drivesStore = useDrivesStore()
const boardStore = useBoardStore()
const wifiStore = useWifiStore()
const flashStore = useFlashStore()

const { drives } = storeToRefs(drivesStore)
const { boards } = storeToRefs(boardStore)
const { accessPoints } = storeToRefs(wifiStore)
const { flashItems } = storeToRefs(flashStore)

// Update drive of flashitem if drive list changes
watch(drives, (updatedDl) => {
  flashItems.value.forEach((fi) => {
    if (fi.drive) {
      const driveInList = updatedDl.find((dr) => dr.device === fi.drive?.device)
      fi.drive = driveInList
    } else {
      fi.drive = updatedDl?.[0]
    }
  })
})
</script>
<template>
  <v-container>
    <div class="header">
      <div>
        <v-list-item-title class="title">
          {{ $t('device') }}
        </v-list-item-title>

        <v-list-item-subtitle>
          {{ $t('devices_list_subtitle') }}
        </v-list-item-subtitle>
      </div>
      <v-tooltip bottom>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            @click="flashStore.addItem"
            icon="mdi-plus"
            fixed
            elevation="10"
            color="accent"
            fab
          >
          </v-btn>
        </template>
        <span>{{ $t('add_device') }}</span>
      </v-tooltip>
    </div>

    <v-divider style="margin-top: 20px"></v-divider>

    <v-expansion-panels value="0">
      <v-expansion-panel v-for="flashItem in flashItems">
        <!-- -------------------- Header of Device -------------------- -->

        <v-expansion-panel-title>
          <template v-slot>
            <div class="infobox-container">
              <div v-if="flashItem.reswarm" class="infoBox infoBoxA">
                <div class="textHead">
                  {{ $t('device') }}
                </div>
                <div class="textDesc deviceName">
                  {{
                    cutInfoString(
                      flashItem.reswarm?.configFile?.name ?? '',
                      20,
                      $t('no_device_name')
                    )
                  }}
                </div>
                <div class="textMain">
                  {{ cutInfoString(flashItem.reswarm?.configFile?.description ?? '', 20, '') }}
                </div>
              </div>

              <div v-if="flashItem.reswarm" class="infoBox infoBoxA">
                <div class="textHead">
                  {{ $t('swarm') }}
                </div>
                <div class="textDesc">
                  {{
                    cutInfoString(
                      flashItem.reswarm?.configFile?.swarm_name ?? '',
                      25,
                      $t('no_swarm')
                    )
                  }}
                </div>
                <div class="textMain">
                  {{
                    cutInfoString(
                      flashItem.reswarm?.configFile?.swarm_owner_name ?? '',
                      25,
                      $t('no_swarm_owner')
                    )
                  }}
                </div>
              </div>

              <div v-if="!flashItem.reswarm" class="infoBox infoBoxB">
                <div class="textHead">
                  {{ $t('image') }}
                </div>
                <div class="textDesc">
                  {{ cutInfoString(flashItem.fileDirectory, 50) }}
                </div>
                <div class="textMain">
                  {{ cutInfoString(flashItem.fileName, 50) }}
                </div>
              </div>

              <div class="infoBox">
                <div class="textHead">
                  {{ $t('drive') }}
                </div>
                <div class="textDesc" v-bind:class="{ textAlert: !flashItem.drive }">
                  {{
                    flashItem.drive
                      ? cutInfoString(flashItem.drive.description, 25, $t('name_unknown'))
                      : $t('unavailable')
                  }}
                </div>
                <div class="textMain" v-bind:class="{ textAlert: !flashItem.drive }">
                  {{
                    flashItem.drive
                      ? cutInfoString(
                          flashItem.drive.device +
                            ' (' +
                            prettyBytes(flashItem.drive.size ?? 0) +
                            ')',
                          25
                        )
                      : $t('no_drive')
                  }}
                </div>
              </div>

              <div v-if="flashItem.reswarm" class="infoBox infoBoxA">
                <div class="textHead">
                  {{ $t('board') }}
                </div>
                <div class="textDesc" v-bind:class="{ textAlert: !flashItem.reswarm.board }">
                  {{
                    flashItem.reswarm.board
                      ? cutInfoString(flashItem.reswarm.board.architecture, 25)
                      : $t('board')
                  }}
                </div>
                <div class="textMain" v-bind:class="{ textAlert: !flashItem.reswarm.board }">
                  {{
                    flashItem.reswarm.board
                      ? cutInfoString(flashItem.reswarm.board.modelname, 25)
                      : $t('choose_board')
                  }}
                </div>
              </div>
            </div>

            <div class="buttons-container">
              <div class="editButtons">
                <v-btn size="small" variant="outlined" height="40" color="accent" min-width="140px">
                  <v-icon> mdi-pencil </v-icon>
                  {{ $t('edit') }}
                </v-btn>
              </div>

              <div class="actionButtons">
                <v-btn
                  style="margin-right: 16px"
                  v-if="flashItem.reswarm"
                  class="testDeviceButton"
                  size="small"
                  variant="outlined"
                  height="40"
                  color="accent"
                >
                  <v-icon> mdi-play </v-icon>
                  {{ $t('test_device') }}
                </v-btn>

                <v-btn
                  size="small"
                  variant="outlined"
                  @click.native.stop="flashStore.flashDevice(flashItem)"
                  height="40"
                  color="accent"
                  min-width="140px"
                >
                  <v-icon> mdi-flash </v-icon>
                  {{ $t('flash') }}
                </v-btn>
              </div>
            </div>

            <div>
              <div id="removeButton">
                <v-btn
                  @click.native.stop="flashStore.removeItem(flashItem)"
                  variant="plain"
                  icon="mdi-close-circle"
                  color="error"
                >
                </v-btn>
              </div>
            </div>

            <!-- -------------------- Header of Device (flashing active) -------------------- -->

            <div id="flashDeviceBar">
              <FlashDevice :id="flashItem.id" />
            </div>
          </template>
        </v-expansion-panel-title>

        <!-- -------------------- Body of Device (inactive) -------------------- -->

        <v-expansion-panel-text>
          <div style="margin-top: 16px">
            <v-select
              v-if="flashItem.flash.state === 'idle'"
              v-model="flashItem.drive"
              :items="drives"
              :label="$t('select_drive')"
              :item-title="(el: Drive) => `${el.device} - (${prettyBytes(el.size ?? 0)})`"
              :item-value="(el) => el"
              :no-data-text="$t('no_drives_available')"
              variant="outlined"
            ></v-select>

            <v-select
              v-if="flashItem.reswarm && flashItem.flash.state === 'idle'"
              v-model="flashItem.reswarm.board"
              :label="$t('choose_board_and_os')"
              :items="boards"
              :item-title="(el: SupportedBoard) => el.modelname"
              :item-value="(el) => el"
              variant="outlined"
            ></v-select>

            <v-combobox
              v-if="flashItem.reswarm && flashItem.flash.state === 'idle'"
              v-model="flashItem.reswarm.wifiSSID"
              :label="$t('specify_wlan_or_lan')"
              item-title="ssid"
              item-value="ssid"
              :items="accessPoints"
              variant="outlined"
              :return-object="false"
            ></v-combobox>

            <v-text-field
              v-if="flashItem.reswarm && flashItem.flash.state === 'idle'"
              v-model="flashItem.reswarm.wifiPassword"
              :label="$t('wlan_password')"
              :append-icon="flashItem.reswarm.showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="flashItem.reswarm.showPassword ? 'text' : 'password'"
              name="input-password"
              outlined
              @click:append="flashItem.reswarm.showPassword = !flashItem.reswarm.showPassword"
            ></v-text-field>
          </div>

          <!-- -------------------- Body of Device (flashing active) -------------------- -->

          <div v-show="flashItem.flash.state !== 'idle'">
            <FlashDisplay :id="flashItem.id"> </FlashDisplay>

            <div class="d-flex justify-center">
              <v-btn
                small
                color="secondary"
                height="40"
                :disabled="flashItem.flash.state !== 'flashing'"
              >
                <v-icon left> mdi-cancel </v-icon>
                {{ $t('cancel_writing') }}
              </v-btn>

              <v-spacer></v-spacer>

              <!-- <v-btn
                small
                color="secondary"
                height="40"
                @click="resetDevice(item)"
                v-if="item.flash.state == 'finish' && !flashProtocol[item.serial_number].success"
              >
                <v-icon left> mdi-refresh </v-icon>
                {{ $t('try_again') }}
              </v-btn> -->

              <v-spacer></v-spacer>

              <!-- <v-btn
                small
                color="secondary"
                height="40"
                :disabled="item.flash.state != 'finish'"
                @click="exportDevice(item)"
              >
                <v-icon left> mdi-export </v-icon>
                {{ $t('export_log_report') }}
              </v-btn> -->
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>
<style>
.v-expansion-panel-title {
  display: block !important;
}

.v-expansion-panel-title__icon {
  display: none !important;
}

.buttons-container {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.infobox-container {
  display: flex;
}

.v-expansion-panels {
  max-height: 355px;
  overflow: auto;
}
.header {
  display: flex;
  justify-content: space-between;
}

.mdi-plus {
  color: white;
}

#device-list {
  position: relative;
  max-height: 80px;
  overflow: visible;
}

#flash-button-wrapper {
  position: fixed;
  bottom: 42px;
  left: 0px;
  z-index: 4;
  width: 100%;
}

#auth-footnote {
  font-size: 70%;
}

#flashButton {
  padding-left: 80px;
  margin-top: 13px;
  margin-bottom: 13px;
  width: 160px;
  max-width: 160px;
  display: inline-block;
  /* position: absolute;
  bottom: 33px;
  right: 68px; */
}

#removeButton {
  position: absolute;
  top: 4px;
  right: -4px;
}

#transparentButton {
  background-color: transparent;
}

#flashDeviceBar {
  /* margin: 0px;
  padding-bottom: 2px; */
  position: absolute;
  bottom: 4px;
  left: 160px;
  right: 160px;
  /* width: 710px; */
  /* align-content: center; */
  /* width: 100%; */
}

.textHead {
  /* font-size: 12px; */
  font-weight: 500;
  padding-bottom: 2px;
}

.textDesc {
  /* font-size: 12px; */
  line-height: 1.5;
}

.textMain {
  padding-top: 1px;
}

.textAlert {
  color: #e62828;
}

.infoBox {
  padding: 4px;
  margin: 1px;
  border-style: none;
  border-width: 3px;
  border-radius: 5px;
}

.infoBoxAlert {
  border-style: dashed;
  border-color: #e62828;
  border-width: 2px;
  border-radius: 0px;
}

.infoBoxA {
  width: 190px;
  max-width: 190px;
  display: inline-block;
}

.infoBoxB {
  width: 380px;
  max-width: 380px;
  display: inline-block;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(50px);
}

.bar-prog {
  pointer-events: none;
}
</style>
