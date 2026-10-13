import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createMedicine, doseKey, type Medicine } from './model'

export const STORAGE_KEY = 'medicine-reminder-v1'

interface MedicineState {
  medicines: Medicine[]
  taken: Record<string, boolean>
  addMedicine: (input: { name: string; dosage?: string; times?: string[]; remaining?: number }) => void
  updateMedicine: (id: string, patch: Partial<Pick<Medicine, 'name' | 'dosage' | 'times' | 'remaining'>>) => void
  removeMedicine: (id: string) => void
  toggleDose: (medicineId: string, date: string, time: string) => void
  resetToday: (date: string) => void
  clearAll: () => void
}

export const useMedicineStore = create<MedicineState>()(
  persist(
    immer((set) => ({
      medicines: [],
      taken: {},

      addMedicine: (input) =>
        set((state) => {
          if (!input.name.trim()) return
          state.medicines.push(createMedicine(input))
        }),

      updateMedicine: (id, patch) =>
        set((state) => {
          const medicine = state.medicines.find((item) => item.id === id)
          if (!medicine) return
          if (patch.name !== undefined) medicine.name = patch.name.trim()
          if (patch.dosage !== undefined) medicine.dosage = patch.dosage.trim()
          if (patch.times !== undefined) medicine.times = [...patch.times].sort()
          if (patch.remaining !== undefined) medicine.remaining = Math.max(0, Math.round(patch.remaining))
        }),

      removeMedicine: (id) =>
        set((state) => {
          const index = state.medicines.findIndex((item) => item.id === id)
          if (index !== -1) state.medicines.splice(index, 1)
          for (const key of Object.keys(state.taken)) {
            if (key.startsWith(`${id}|`)) delete state.taken[key]
          }
        }),

      toggleDose: (medicineId, date, time) =>
        set((state) => {
          const key = doseKey(medicineId, date, time)
          const medicine = state.medicines.find((item) => item.id === medicineId)
          if (state.taken[key]) {
            delete state.taken[key]
            if (medicine) medicine.remaining += 1
          } else {
            state.taken[key] = true
            if (medicine && medicine.remaining > 0) medicine.remaining -= 1
          }
        }),

      resetToday: (date) =>
        set((state) => {
          for (const key of Object.keys(state.taken)) {
            if (key.includes(`|${date}|`)) delete state.taken[key]
          }
        }),

      clearAll: () =>
        set((state) => {
          state.medicines = []
          state.taken = {}
        }),
    })),
    { name: STORAGE_KEY, storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)
