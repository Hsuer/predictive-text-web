export function setLocalStorage (key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch(e) {
    console.warn("setLocalStorage Failed!")
  }
}

export function getLocalStorage (key) {
  try {
    return window.localStorage.getItem(key)
  } catch(e) {
    console.warn("getLocalStorage Failed!")
  }
}
