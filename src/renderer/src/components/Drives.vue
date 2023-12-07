<template>
  <v-container>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="title">
          {{ $t('flash_drives') }}
        </v-list-item-title>

        <v-list-item-subtitle>
          {{ $t('sd_cards_and_drives') }}
        </v-list-item-subtitle>
      </v-list-item-content>

      <v-tooltip bottom>
        <!-- <template v-slot:activator="{ on }">
          <v-btn icon color="primary" @click="listDrives" :disabled="panyActiveFlash">
            <v-icon v-on="on"> mdi-refresh </v-icon>
          </v-btn>
        </template> -->
        <span>{{ $t('refresh_drive_list') }}</span>
      </v-tooltip>
    </v-list-item>

    <v-divider></v-divider>

    <v-list dense nav>
      <!-- <v-list-item v-for="item in drives" :key="item.iden" link>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon left color="primary" v-on="on" v-if="!item['sdcard'] && !item['corrupt']">
              mdi-usb
            </v-icon>
            <v-icon left color="accent" v-on="on" v-if="item['sdcard'] && !item['corrupt']">
              mdi-sd
            </v-icon>
            <v-icon left color="red" v-on="on" v-if="item['corrupt']"> mdi-alert </v-icon>
          </template>
          <span>{{ item }}</span>
        </v-tooltip>

        <v-list-item-content>
          <v-list-item-title>
            {{ item.path }}
            {{
              item.partitions.map((part) => part.label).filter((lbl) => lbl != '').length === 0
                ? ' '
                : `${
                    ' - (' +
                    item.partitions
                      .map((part) => part.label)
                      .filter((lbl) => lbl != '')
                      .join(', ') +
                    ')'
                  }`
            }}
          </v-list-item-title>
          <v-list-item-subtitle> {{ item.name }} - {{ item.sizeGiB }} GiB </v-list-item-subtitle>
        </v-list-item-content>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-simple-checkbox
              id="driveCheck"
              class="pr-3"
              v-on="on"
              v-model="item.usable"
              :ripple="false"
              :disabled="panyActiveFlash"
            >
            </v-simple-checkbox>
          </template>
          <span>{{ $t('include_drive_for_flashing') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              id="mountButton"
              color="primary"
              x-small
              @click="mountDrive(item.iden)"
              :disabled="panyActiveFlash"
            >
              <v-icon v-on="on" size="10"> mdi-eject mdi-rotate-180 </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('mount') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              id="unmountButton"
              color="primary"
              x-small
              @click="unmountDrive(item.iden)"
              :disabled="panyActiveFlash"
            >
              <v-icon v-on="on" size="10"> mdi-eject mdi-rotate-0 </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('unmount') }}</span>
        </v-tooltip>
      </v-list-item> -->
    </v-list>

    <v-list-item>
      <!-- <v-switch
        v-model="useAllDrives"
        :label="`${useAllDrives ? $t('use_all_drives') : $t('use_sd_cards_only')}`"
        :disabled="panyActiveFlash"
      ></v-switch> -->
    </v-list-item>
  </v-container>
</template>
