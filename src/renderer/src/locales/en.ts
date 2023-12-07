export default {
  badge: 'Badge',
  open: 'Open',
  close: 'Close',
  confirmEdit: {
    ok: 'OK',
    cancel: 'Cancel'
  },
  dataIterator: {
    noResultsText: 'No matching records found',
    loadingText: 'Loading items...'
  },
  dataTable: {
    itemsPerPageText: 'Rows per page:',
    ariaLabel: {
      sortDescending: 'Sorted descending.',
      sortAscending: 'Sorted ascending.',
      sortNone: 'Not sorted.',
      activateNone: 'Activate to remove sorting.',
      activateDescending: 'Activate to sort descending.',
      activateAscending: 'Activate to sort ascending.'
    },
    sortBy: 'Sort by'
  },
  dataFooter: {
    itemsPerPageText: 'Items per page:',
    itemsPerPageAll: 'All',
    nextPage: 'Next page',
    prevPage: 'Previous page',
    firstPage: 'First page',
    lastPage: 'Last page',
    pageText: '{0}-{1} of {2}'
  },
  dateRangeInput: {
    divider: 'to'
  },
  datePicker: {
    itemsSelected: '{0} selected',
    range: {
      title: 'Select dates',
      header: 'Enter dates'
    },
    title: 'Select date',
    header: 'Enter date',
    input: {
      placeholder: 'Enter date'
    }
  },
  noDataText: 'No data available',
  carousel: {
    prev: 'Previous visual',
    next: 'Next visual',
    ariaLabel: {
      delimiter: 'Carousel slide {0} of {1}'
    }
  },
  calendar: {
    moreEvents: '{0} more'
  },
  input: {
    clear: 'Clear {0}',
    prependAction: '{0} prepended action',
    appendAction: '{0} appended action',
    otp: 'Please enter OTP character {0}'
  },
  fileInput: {
    counter: '{0} files',
    counterSize: '{0} files ({1} in total)'
  },
  timePicker: {
    am: 'AM',
    pm: 'PM'
  },
  pagination: {
    ariaLabel: {
      root: 'Pagination Navigation',
      next: 'Next page',
      previous: 'Previous page',
      page: 'Go to page {0}',
      currentPage: 'Page {0}, Current page',
      first: 'First page',
      last: 'Last page'
    }
  },
  stepper: {
    next: 'Next',
    prev: 'Previous'
  },
  rating: {
    ariaLabel: {
      item: 'Rating {0} of {1}'
    }
  },
  loading: 'Loading...',
  infiniteScroll: {
    loadMore: 'Load more',
    empty: 'No more'
  },
  drives: 'Drives',
  settings: 'Settings',
  settings_subtitle: 'Themes, flash parameters and language',
  dismiss: 'Dismiss',
  download: 'Download',
  not_now: 'Not now',
  install: 'Install',
  device: 'Device | Devices',
  add_device: 'Add device',
  no_device_name: 'No device name',
  no_devices_in_list: 'No devices in list',
  devices_list_subtitle: 'Add device by selecting a Reswarm or image file',
  swarm: 'Swarm',
  no_swarm: 'No Swarm',
  no_swarm_owner: 'No Swarm owner',
  drive: 'Drive',
  no_drive: 'No drive',
  no_drives_available: 'No drives available',
  select_drive: 'Select flash drive',
  selected_drive_no_longer_available: 'The selected drive is no longer available',
  flash_drives: 'Flash drives',
  refresh_drive_list: 'Refresh list of external drives',
  include_drive_for_flashing: 'Include drive for flashing',
  use_all_drives: 'Use all drives',
  board: 'Board',
  choose_board: 'Choose board',
  choose_board_and_os: 'Choose hardware board and OS image',
  specify_wlan_or_lan: 'Specify WiFi SSID or choose a local network',
  cancel_writing: 'Cancel writing',
  try_again: 'Try again',
  export_log_report: 'Export Log Report',
  wlan_password: 'WiFi Password',
  test_device: 'Test Device',
  flash: 'Flash',
  flash_all: 'Flash all',
  flashing_failed: 'Flashing failed',
  hardware: 'Hardware',
  image: 'Image',
  choose_image: 'Choose image',
  unavailable: 'Unavailable',
  name_unknown: 'Name unknown',
  edit: 'Edit',
  here: 'Here',
  details: 'Details',
  submit: 'Submit',
  mount: 'Mount',
  unmount: 'Unmount',
  step: 'Step',
  completed: 'Completed',
  eta: 'ETA',
  authentication_required: 'Authentication required',
  authentication_explanation:
    'To allow the Reflasher to erase your selected drives and overwrite any partitions on these, please enter your admin password for this computer in the field below.',
  admin_password: 'Admin password',
  sd_cards_and_drives: 'SD cards and USB flash drives',
  use_sd_cards_only: 'Use SD cards only',
  ready_to_use: 'Ready to use',
  dark_mode: 'Dark mode',
  specify_read_block_size: 'Specify Read Blocksize (bytes)',
  specify_write_block_size: 'Specify Write Blocksize (bytes)',
  choose_language: 'Choose language',
  environment_variables: 'Environment variables',
  environment_variables_not_set:
    'The following environment variable is invalid or not set: | The following environment variables are invalid or not set:',
  please_ensure_environment_variables:
    'In order to use the Reflasher, please ensure that this environment variable has been properly defined. | In order to use the Reflasher, please ensure that these environment variables have been properly defined.',
  exit_reflasher: 'Exit Reflasher',
  update_reagent: 'Update REagent',
  download_reagent: 'Download REagent',
  docker_is_not_running: 'Docker is not running',
  what_is_reagent_explanation:
    'The REagent is the application that is responsible for the management of Reswarm apps on a Reswarm device.',
  in_order_to_test_agent_is_required:
    'In order to test the device on your local computer, downloading the REagent is required.',
  agent_update_available:
    'An update is available for the REagent! Continue by downloading the update.',
  docker_is_required:
    '<strong>Docker is required</strong>, in order to test your Reswarm Device locally.',
  make_sure_docker_is_running:
    'If you have already installed Docker, make sure the <strong>Docker daemon</strong> is running in the background.',
  docker_please_follow_instructions:
    'Please follow the intructions {anchor} in order to install Docker.',
  improve_flash_performance: 'Improve flashing performance',
  recommendations_regarding_flashing:
    'Here are some recommendations and guidelines regarding problems with low write/read speed and/or failing flashing process:',
  if_flashing_keeps_failing: 'If flashing keeps failing, try to decrease the write block size.',
  avoid_usb_2: 'Avoid using an USB 2.0 Hub',
  using_old_hardware: 'Are you using old hardware?',
  check_speed_drive: 'Verify the specified speed of your flash drive',
  check_documentation: 'Check the documentation',
  update: {
    announce: 'New Reflasher release available',
    download: 'Downloading Reflasher release',
    install: 'Quit and install new version ?'
  },
  flashing_state: {
    inactive: 'Inactive',
    write: 'Writing...',
    download: 'Downloading image...',
    downloadwait: 'Waiting for download...',
    extract: 'Extracting image...',
    'extract-iso': 'Extracting Installer...',
    'recreate-iso': 'Configuring Installer...',
    validate: 'Validating...',
    mount: 'Mounting drive...',
    unmount: 'Unmounting drive...',
    configure: 'Configuring drive...',
    finish: 'Finish'
  }
}
