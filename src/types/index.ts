import { Drive } from 'drivelist'
import { WriteStep } from 'etcher-sdk/build/multi-write'

export enum RPC {
  ListDrives = 'list-drives',
  ListPartitions = 'list-partitions',
  Unmount = 'unmount',
  Mount = 'mount',
  ChooseFile = 'choose-file',
  ReadFile = 'read-file',
  GetSupportedBoards = 'get-supported-boards',
  ScanWifi = 'scan-wifi',
  FlashDevice = 'flash-device',
  CancelFlashing = 'cancel-flashing',
  SetSudoPassword = 'set-sudo-password',
  IsSudoPasswordSet = 'isset-sudo-password',
  GetPlatform = 'get-platform'
}

export type ImageInfo = {
  buildtime: string
  download: string
  file: string
  osname: string
  osvariant: string
  sha256: string
  size: number
  update: string
  version: string
}

export type SupportedBoard = {
  architecture: string
  board: string
  docs: string
  reflasher: boolean
  boardname: string
  cpu: string
  latestImages: ImageInfo[]
  model: string
  modelname: string
}

export type ReswarmConfig = {
  name: string
  board: {
    cpu: string
    docs: string
    board: string
    latestImages: ImageInfo[]
    model: string
    boardname: string
    modelname: string
    reflasher: boolean
    architecture: string
  }
  secret: string
  status: string
  password: string
  wlanssid: string
  swarm_key: number
  device_key: number
  swarm_name: string
  description: string
  architecture: string
  serial_number: string
  authentication: {
    key: string
    certificate: string
  }
  swarm_owner_name: string
  config_passphrase: string
  device_endpoint_url: string
  docker_registry_url: string
  docker_main_repository: string
  owner_account_key: number
}

export type FlashItem = {
  id: number
  fullPath: string
  reswarm?: {
    config?: ReswarmConfig
    board?: SupportedBoard
    wifiPassword?: string
    wifiSSID?: string
    showPassword?: boolean
  }
  flash: {
    state: WriteStep | 'idle' | 'failed' | 'downloading' | 'configuring' | 'starting'
    progress: number
    avgSpeed: number
    speed: number
    eta: number
  }
  fileDirectory: string
  fileName: string
  fileType: string
  drive?: Drive
}
