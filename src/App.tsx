import React from 'react'

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold">POS Adaptable 🚀</h1>
      <p className="text-gray-600 mt-2">Squad, la estructura está lista. ¡Empecemos a construir!</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h2 className="font-bold">Sprint 1 Tasks</h2>
          <ul className="text-sm mt-2 space-y-1">
            <li>✅ Estructura de proyecto</li>
            <li>⏳ Entidades de dominio</li>
            <li>⏳ Persistencia local</li>
            <li>⏳ Lógica de ventas</li>
            <li>⏳ Interfaz CLI/Web</li>
            <li>⏳ Testing en RPi</li>
          </ul>
        </div>
        
        <div className="border rounded p-4">
          <h2 className="font-bold">Documentation</h2>
          <ul className="text-sm mt-2 space-y-1">
            <li>📖 <a href="#" className="text-blue-600">DEVELOPMENT.md</a></li>
            <li>📋 <a href="#" className="text-blue-600">PRODUCT_OWNER_GUIDE.md</a></li>
            <li>🏗️ <a href="#" className="text-blue-600">decisiones-arquitectura.md</a></li>
            <li>💡 <a href="#" className="text-blue-600">vision.md</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
