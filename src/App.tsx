import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { InventoryPage } from '@interface/pages/InventoryPage'

export const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Navigate to="/inventario" replace />} />
          <Route path="/inventario" element={<InventoryPage />} />
        </Routes>
      </div>
    </HashRouter>
  )
}

export default App
