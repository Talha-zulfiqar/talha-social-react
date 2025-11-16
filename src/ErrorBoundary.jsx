import React from 'react'

export default class ErrorBoundary extends React.Component{
  constructor(props){
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error){
    return { error }
  }
  componentDidCatch(error, info){
    // log to console and to localStorage so it's visible across reloads
    console.error('Uncaught error in component tree', error, info)
    try{ localStorage.setItem('lastError', JSON.stringify({message: error && error.message, stack: error && error.stack})) }catch{}
  }
  render(){
    if(this.state.error){
      return (
        <div style={{padding:24}}>
          <h2>Something went wrong</h2>
          <pre style={{whiteSpace:'pre-wrap',background:'#fff',padding:12,borderRadius:8,overflow:'auto'}}>{this.state.error && this.state.error.toString()}</pre>
          <div style={{marginTop:12}}>Open console for details.</div>
        </div>
      )
    }
    return this.props.children
  }
}
