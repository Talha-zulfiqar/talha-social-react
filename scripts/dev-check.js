#!/usr/bin/env node
const { spawn } = require('child_process')

console.log('== dev-check starting ==')
console.log('Node version:', process.version)
console.log('CWD:', process.cwd())
console.log('HOST env:', process.env.HOST || '<none>')
console.log('PORT env:', process.env.PORT || '<none>')
console.log('USE_POLLING env:', process.env.USE_POLLING || '<none>')

// On Windows spawn with args sometimes throws EINVAL when using shell:false and
// passing a command executable directly. To be cross-platform we spawn the
// full command string with shell:true which delegates to the platform shell
// (cmd.exe on Windows, /bin/sh on Unix). stdio:'inherit' streams output.
try{
  const cmdStr = 'npx vite --host 127.0.0.1 --port 5173 --logLevel info'
  console.log('Running:', cmdStr)
  const child = spawn(cmdStr, { stdio: 'inherit', shell: true })
  child.on('exit', code => {
    console.log('vite process exited with code', code)
    process.exit(code || 0)
  })
  child.on('error', err => {
    console.error('Failed to start vite process:', err)
    process.exit(1)
  })
}catch(err){
  console.error('dev-check wrapper error', err)
  process.exit(1)
}
