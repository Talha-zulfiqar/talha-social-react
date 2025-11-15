import { useEffect, useState } from 'react'

export default function useTheme(){
  const [theme, setTheme] = useState(()=>{
    try{ return localStorage.getItem('theme') || 'light' }catch{ return 'light' }
  })

  useEffect(()=>{
    try{ document.documentElement.setAttribute('data-theme', theme) }catch{}
    try{ localStorage.setItem('theme', theme) }catch{}
  },[theme])

  return [theme, setTheme]
}
