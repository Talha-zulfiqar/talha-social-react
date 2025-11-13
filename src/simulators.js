// Small client-side simulators to make the app feel alive in demo mode.
// - increments notifications periodically
// - injects simulated incoming messages to conversations and increments unreadMessages

function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min }

function ensureKeys(){
  if(!localStorage.getItem('notifications')) localStorage.setItem('notifications','0')
  if(!localStorage.getItem('conversations')) localStorage.setItem('conversations', JSON.stringify({}))
  if(!localStorage.getItem('unreadMessages')) localStorage.setItem('unreadMessages','0')
}

function simulateNotification(){
  try{
    const n = parseInt(localStorage.getItem('notifications')||'0',10)
    localStorage.setItem('notifications', String(n+1))
    // dispatch so same-tab listeners update
    window.dispatchEvent(new Event('appDataChanged'))
  }catch(e){}
}

const CONTACTS = ["Alex","Mina","Sara","Omar"]

function simulateIncomingMessage(){
  try{
    const raw = localStorage.getItem('conversations')||'{}'
    const conv = JSON.parse(raw)
    const who = CONTACTS[randInt(0, CONTACTS.length-1)]
    const msg = { id: Date.now(), author: who, text: 'Hey — nice update!', time: Date.now() }
    conv[who] = conv[who] ? [...conv[who], msg] : [msg]
    localStorage.setItem('conversations', JSON.stringify(conv))
    const um = parseInt(localStorage.getItem('unreadMessages')||'0',10)
    localStorage.setItem('unreadMessages', String(um+1))
    window.dispatchEvent(new Event('appDataChanged'))
  }catch(e){}
}

export function startSimulators(){
  ensureKeys()
  // random notification every 20-45 seconds
  setInterval(simulateNotification, randInt(20000,45000))
  // random incoming message every 30-60 seconds
  setInterval(simulateIncomingMessage, randInt(30000,60000))
}

// auto-start in dev/demo
if(typeof window !== 'undefined'){
  // start after a slight delay so app has mounted
  setTimeout(()=>{
    try{ startSimulators() }catch(e){}
  }, 1500)
}
