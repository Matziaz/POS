import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardPage } from '@interface/pages/DashboardPage'
import { InventoryPage } from '@interface/pages/InventoryPage'
import { SalesPage } from '@interface/pages/SalesPage'
import { SalesTerminalPage } from '@interface/pages/SalesTerminalPage'
import { AppLayout } from '@interface/components/layout'

export const App: React.FC = () => {
  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/inventario" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventario" element={<InventoryPage />} />
          <Route path="/ventas" element={<SalesPage />} />
          <Route path="/ventas/terminal" element={<SalesTerminalPage />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  )
}

export default App
