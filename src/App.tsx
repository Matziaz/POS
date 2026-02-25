import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { InventoryPage } from '@interface/pages/InventoryPage'
import { SalesPage } from '@interface/pages/SalesPage'
import { AppLayout } from '@interface/components/layout'

export const App: React.FC = () => {
  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/inventario" replace />} />
          <Route path="/inventario" element={<InventoryPage />} />
          <Route path="/ventas" element={<SalesPage />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  )
}

export default App
