import { useEffect } from "react"
import { useContactStore } from "@interface/store/contactStore"
import type {
  ContactView,
  CreateContactInput,
  DeleteContactInput,
  UpdateContactInput,
} from "@interface/store/contactStore"

export interface UseContactsReturn {
  contacts: ContactView[]
  isLoading: boolean
  error: string | null
  clearError: () => void
  refetch: () => Promise<void>
  createContact: (input: CreateContactInput) => Promise<void>
  updateContact: (input: UpdateContactInput) => Promise<void>
  deleteContact: (input: DeleteContactInput) => Promise<void>
}

export function useContacts(): UseContactsReturn {
  const store = useContactStore()

  useEffect(() => {
    store.fetchContacts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    contacts: store.contacts,
    isLoading: store.isLoading,
    error: store.error,
    clearError: store.clearError,
    refetch: store.fetchContacts,
    createContact: store.createContact,
    updateContact: store.updateContact,
    deleteContact: store.deleteContact,
  }
}
