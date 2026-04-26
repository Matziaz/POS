import React, { useCallback, useEffect, useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardPage } from '@interface/pages/DashboardPage'
import { ReportsPage } from '@interface/pages/ReportsPage'
import { InventoryPage } from '@interface/pages/InventoryPage'
import { SalesPage } from '@/interface/pages/SalesPage'
import { SalesTerminalPage } from '@interface/pages/SalesTerminalPage'
import { CashClosurePage } from '@interface/pages/CashClosurePage'
import { AdminPage } from '@interface/pages/AdminPage'
import { InitialSetupPage } from '@interface/pages/InitialSetupPage'
import { AppLayout } from '@interface/components/layout'
import { Button } from '@interface/components/ui/button'
import { ContactsPage } from './interface/pages/ContactsPage'

type CashClosurePreCloseReminderView = {
  businessDate: string
  triggeredAt: string
  scheduledTime: string
}

export const App: React.FC = () => {
  const [isCheckingSetup, setIsCheckingSetup] = useState(true)
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [globalReminder, setGlobalReminder] = useState<CashClosurePreCloseReminderView | null>(null)

  const refreshSetupStatus = useCallback(async () => {
    try {
      if (!window.electronAPI) {
        setIsSetupComplete(true)
        return
      }

      const ready = await window.electronAPI.configurationIsSetupComplete()
      setIsSetupComplete(ready)
    } catch {
      setIsSetupComplete(false)
    } finally {
      setIsCheckingSetup(false)
    }
  }, [])

  useEffect(() => {
    void refreshSetupStatus()
  }, [refreshSetupStatus])

  useEffect(() => {
    if (!isSetupComplete || !window.electronAPI?.onCashClosurePreCloseReminder) {
      return
    }

    let cancelled = false

    const syncPendingReminder = async () => {
      const pending = await window.electronAPI?.cashClosureGetPendingReminder?.()
      if (!cancelled && pending) {
        setGlobalReminder(pending)
      }
    }

    void syncPendingReminder()

    const reminderPoll = window.setInterval(() => {
      void syncPendingReminder()
    }, 10_000)

    const unsubscribe = window.electronAPI.onCashClosurePreCloseReminder((payload) => {
      setGlobalReminder(payload)
    })

    return () => {
      cancelled = true
      window.clearInterval(reminderPoll)
      unsubscribe()
    }
  }, [isSetupComplete])

  if (isCheckingSetup) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
        <div className="rounded-lg border bg-card px-6 py-4 text-sm text-muted-foreground">
          Cargando configuracion inicial...
        </div>
      </main>
    )
  }

  if (!isSetupComplete) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/setup" element={<InitialSetupPage onCompleted={refreshSetupStatus} />} />
          <Route path="*" element={<Navigate to="/setup" replace />} />
        </Routes>
      </HashRouter>
    )
  }

  return (
    <HashRouter>
      <AppLayout>
        {globalReminder && (
          <div className="sticky top-14 z-40 mx-4 mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                Recordatorio de corte: corresponde cerrar la caja del dia {globalReminder.businessDate} (programado {globalReminder.scheduledTime}).
              </span>
              <Button variant="outline" size="sm" onClick={() => setGlobalReminder(null)}>
                Ocultar
              </Button>
            </div>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Navigate to="/inventario" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reportes" element={<ReportsPage />} />
          <Route path="/inventario" element={<InventoryPage />} />
          <Route path="/inventario/restaurar" element={<AdminPage initialSection="restore" />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/ventas" element={<SalesPage />} />
          <Route path="/ventas/terminal" element={<SalesTerminalPage />} />
          <Route path="/caja/cierre" element={<CashClosurePage />} />
          <Route path="/contactos" element={<ContactsPage />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  )
}

export default App
