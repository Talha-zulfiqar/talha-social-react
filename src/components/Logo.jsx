import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'

// Small, responsive Logo component used in the NavBar
export default function Logo(){
  return (
    <Link to="/feed" aria-label="Social App" className="flex items-center gap-2 h-auto logo-link">
      <span className="flex items-center justify-center p-0 logo-icon-wrap">
        <img src={logo} alt="Social App" className="logo-icon object-contain" />
      </span>
    </Link>
  )
}
