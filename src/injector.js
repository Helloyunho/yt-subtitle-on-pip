const script = document.createElement('script')
script.src = chrome.runtime.getURL('src/content.js')

document.documentElement.appendChild(script)
