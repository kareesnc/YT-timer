class Storage {
  static STORAGE_KEY_INPUT = 'storedInput'
  static STORAGE_KEY_TYPE = 'storedType'

  static storedInput() {
    return localStorage.getItem(Storage.STORAGE_KEY_INPUT)
  }

  static storedType() {
    return localStorage.getItem(Storage.STORAGE_KEY_TYPE)
  }

  static storeData(input, type) {
    localStorage.setItem(Storage.STORAGE_KEY_INPUT, input)
    localStorage.setItem(Storage.STORAGE_KEY_TYPE, type)
  }

  static clearStorage() {
    localStorage.removeItem(Storage.STORAGE_KEY_INPUT)
    localStorage.removeItem(Storage.STORAGE_KEY_TYPE)
  }
}