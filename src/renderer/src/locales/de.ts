import { de } from 'vuetify/locale'

export default {
  $vuetify: { ...de },
  drives: 'Laufwerke',
  settings: 'Einstellungen',
  settings_subtitle: 'Design, Flash Parameter und Sprache',
  dismiss: 'Ignorieren',
  download: 'Herunterladen',
  not_now: 'Später',
  install: 'Installieren',
  speed: 'Geschwindigkeit',
  device: 'Gerät',
  devices: 'Geräte',
  add_device: 'Gerät hinzufügen',
  no_device_name: 'Kein Gerätename',
  no_devices_in_list: 'Keine Geräte in der Liste',
  devices_list_subtitle: 'Füge ein Gerät hinzu durch Auswahl einer Reswarm oder Image Datei',
  swarm: 'Schwarm',
  no_swarm: 'Kein Schwarm',
  no_swarm_owner: 'Kein Schwarmeigentümer',
  drive: 'Laufwerk',
  no_drive: 'Kein Laufwerk',
  no_drives_available: 'Keine Laufwerke verfügbar',
  select_drive: 'Wähle Laufwerk aus',
  selected_drive_no_longer_available: 'Das ausgewählte Laufwerk ist nicht mehr verfügbar',
  flash_drives: 'Flash Laufwerke',
  refresh_drive_list: 'Liste der Laufwerke erneuern',
  include_drive_for_flashing: 'Laufwerk beim Flashen berücksichtigen',
  use_all_drives: 'Benutze alle Laufwerke',
  board: 'Board',
  choose_board: 'Wähle Board',
  choose_board_and_os: 'Wähle Hardware Board und OS Image aus',
  specify_wlan_or_lan: 'Wähle SSID oder lokales Netzwerk',
  cancel_writing: 'Schreiben abbrechen',
  try_again: 'Nochmals versuchen',
  export_log_report: 'Log Report exportieren',
  wlan_password: 'WiFi Passwort',
  test_device: 'Gerät Testen',
  flash: 'Flash',
  flash_all: 'Alle Geräte flashen',
  flashing_failed: 'Flashing fehlgeschlagen',
  hardware: 'Hardware',
  image: 'Image',
  choose_image: 'Wähle Image aus',
  unavailable: 'Nicht verfügbar',
  name_unknown: 'Name unbekannt',
  edit: 'Bearbeiten',
  here: 'Hier',
  details: 'Details',
  submit: 'Bestätigen',
  mount: 'Einhängen',
  unmount: 'Aushängen',
  step: 'Schritt',
  completed: 'Fortschritt',
  eta: 'ETA',
  authentication_required: 'Authentifizierung erforderlich',
  authentication_explanation:
    'Bitte geben Sie Ihr Administrator Passwort für diesen Computer im unteren Feld ein, um dem Reflasher zu erlauben die ausgewählten Laufwerke zu überschreiben und alle Partition zu löschen',
  admin_password: 'Administrator Passwort',
  sd_cards_and_drives: 'SD Karten und USB Laufwerke',
  use_sd_cards_only: 'Benutze ausschließlich SD Karten',
  ready_to_use: 'Fertig und einsatzbereit',
  dark_mode: 'Dark mode',
  specify_read_block_size: 'Leseblockgröße auswählen (bytes)',
  specify_write_block_size: 'Schreibblockgröße auswählen (bytes)',
  choose_language: 'Sprache auswählen',
  environment_variables: 'Umgebungsvariablen',
  environment_variables_not_set:
    'Die folgende Umgebungsvariable ist ungültig oder nicht definiert: | Die folgenden Umgebungsvariablen sind ungültig oder nicht definiert:',
  please_ensure_environment_variables:
    'Um den Reflasher zu benutzen, stellen Sie bitte sicher, dass diese Umgebungsvariable richtig definiert wurde. | Um den Reflasher verwenden zu können, stellen Sie bitte sicher, dass die Umgebungsvariablen richtig definiert wurden.',
  exit_reflasher: 'Reflasher beenden',
  update_reagent: 'REagent aktualisieren',
  download_reagent: 'REagent herunterladen',
  docker_is_not_running: 'Docker läuft nicht',
  what_is_reagent_explanation:
    'Der REagent ist die Anwendung, die für die Verwaltung von Reswarm Anwendungen auf einem Reswarm Gerät verantwortlich ist.',
  in_order_to_test_agent_is_required:
    'Um das Gerät auf Ihrem lokalen Computer testen zu können, müssen Sie die REagent herunterladen.',
  agent_update_available:
    'Ein Update für das REagent ist verfügbar! Fahren Sie mit dem Herunterladen des Updates fort.',
  docker_is_required: '<strong>Docker ist erforderlich</strong>, um Ihr Record Evolution Gerät zu testen',
  make_sure_docker_is_running:
    'Wenn Sie Docker bereits installiert haben, stellen Sie sicher, dass der <strong>Docker Daemon</strong> im Hintergrund läuft.',
  docker_please_follow_instructions:
    'Bitte folgen Sie den Anweisungen {anchor} um Docker zu installieren.',
  improve_flash_performance: 'Den Flashingprozess verbessern',
  recommendations_regarding_flashing:
    'Hier sind einige Empfehlungen und Richtlinien für Probleme mit niedriger Schreib-/Lesegeschwindigkeit und/oder fehlgeschlagenem Flashing-Prozess:',
  if_flashing_keeps_failing:
    'Wenn das Flashen weiterhin fehlschlägt, versuchen Sie, die Größe des Schreibblocks zu verringern.',
  avoid_usb_2: 'Vermeiden Sie die Verwendung eines USB 2.0-Hubs',
  using_old_hardware: 'Verwenden Sie alte Hardware?',
  check_speed_drive: 'Kontrollieren Sie die angegebene Geschwindigkeit Ihres Flash-Laufwerks',
  check_documentation: 'Lesen Sie die Dokumentation',
  update: {
    announce: 'Reflasher Update verfügbar',
    download: 'Lade Reflasher Update',
    install: 'Beenden und Update installieren ?'
  },
  agent: {
    currently_running: 'Derzeit läuft: {name}'
  },
  flashing_state: {
    inactive: 'Inaktiv',
    flashing: 'Schreiben...',
    starting: 'Initialisieren...',
    downloading: 'Image herunterladen...',
    downloadwait: 'Warten auf Download...',
    decompressing: 'Image entpacken...',
    'extract-iso': 'Installer entpacken...',
    'recreate-iso': 'Installer Konfigurieren...',
    verifying: 'Validieren...',
    mount: 'Laufwerk einhängen...',
    unmount: 'Laufwerk aushängen...',
    configure: 'Konfigurieren...',
    finish: 'Fertigstellen'
  }
}
