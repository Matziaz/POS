import React, { useEffect, useState } from "react";
import { Button } from "@interface/components/ui/button";
import { BusinessContextSelector } from "@interface/components/configuration";
import type { RetailContext } from "@core/entities";

interface InitialSetupPageProps {
  onCompleted: () => Promise<void> | void;
}

export const InitialSetupPage: React.FC<InitialSetupPageProps> = ({ onCompleted }) => {
  const [retailContext, setRetailContext] = useState<RetailContext>("");
  const [availableContexts, setAvailableContexts] = useState<string[]>([]);
  const [isLoadingContexts, setIsLoadingContexts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadContexts = async () => {
      try {
        if (!window.electronAPI) {
          throw new Error("Electron API no disponible");
        }

        const rows = await window.electronAPI.configurationListContexts();
        if (!isMounted) return;

        const normalized = rows
          .map((value) => value.trim().toLowerCase())
          .filter((value, index, list) => !!value && list.indexOf(value) === index);

        setAvailableContexts(normalized);
        setRetailContext((current) => current || normalized[0] || "");
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los contextos desde BD");
      } finally {
        if (isMounted) setIsLoadingContexts(false);
      }
    };

    void loadContexts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!window.electronAPI) {
      setError("Electron API no disponible");
      return;
    }

    if (!retailContext) {
      setError("No hay contexto de negocio seleccionado");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await window.electronAPI.configurationSaveInitial({
        retailContext,
      });

      await onCompleted();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar la configuracion inicial");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-muted/30 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-2xl rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Configuracion inicial</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Selecciona el contexto base de tu negocio para habilitar el sistema.
        </p>

        {error && (
          <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {isLoadingContexts ? (
            <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              Cargando tipos de negocio desde base de datos...
            </div>
          ) : availableContexts.length === 0 ? (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              No hay tipos de negocio cargados en la tabla app_configuration.
            </div>
          ) : (
            <BusinessContextSelector
              value={retailContext}
              options={availableContexts}
              onChange={setRetailContext}
            />
          )}

          <Button type="submit" disabled={isSubmitting || isLoadingContexts || availableContexts.length === 0} className="mt-2">
            {isSubmitting ? "Guardando..." : "Guardar y continuar"}
          </Button>
        </form>
      </div>
    </main>
  );
};
