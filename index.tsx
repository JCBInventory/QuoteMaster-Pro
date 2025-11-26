import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Root element not found!')
  document.body.innerHTML = '<div style="color: red; padding: 20px;">ERROR: Root element not found</div>'
} else {
  try {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  } catch (error) {
    console.error('React render error:', error)
    rootElement.innerHTML = `<div style="color: red; padding: 20px; background: #172554; font-family: monospace;">
      <h2>React Error:</h2>
      <pre>${error}</pre>
    </div>`
  }
}
