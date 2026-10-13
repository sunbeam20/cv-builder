import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MAX_TOASTS, toast, useToastStore } from './toast'

const records = () => useToastStore.getState().toasts

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
})

describe('toast', () => {
  it('pushes transient notifications with a variant', () => {
    toast.success('Saved')
    expect(records()).toHaveLength(1)
    expect(records()[0]).toMatchObject({ message: 'Saved', variant: 'success' })
    expect(records()[0].duration).toBeGreaterThan(0)
  })

  it('creates a persistent loading toast that can be updated', () => {
    const id = toast.loading('Preparing PDF…')
    expect(records()[0]).toMatchObject({ variant: 'loading', duration: 0 })

    toast.update(id, { variant: 'success', message: 'PDF downloaded', duration: 2500 })
    expect(records()[0]).toMatchObject({ variant: 'success', message: 'PDF downloaded' })
  })

  it('dismisses a toast by id', () => {
    const id = toast.info('Hello')
    toast.dismiss(id)
    expect(records()).toHaveLength(0)
  })

  it('cancel action dismisses without running onConfirm', () => {
    const onConfirm = vi.fn()
    toast.confirm({ message: 'Delete?', onConfirm })
    const record = records()[0]
    expect(record.duration).toBe(0)
    expect(record.actions).toHaveLength(2)

    record.actions[0].onClick?.()
    expect(onConfirm).not.toHaveBeenCalled()
    expect(records()).toHaveLength(0)
  })

  it('primary action runs onConfirm and dismisses', () => {
    const onConfirm = vi.fn()
    toast.confirm({ message: 'Delete?', confirmLabel: 'Remove', onConfirm })
    const primary = records()[0].actions.find((a) => a.primary)
    expect(primary?.label).toBe('Remove')

    primary?.onClick?.()
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(records()).toHaveLength(0)
  })

  it('replaces a keyed toast instead of stacking on repeated pushes', () => {
    toast.loading('Preparing PDF…', { key: 'export' })
    toast.loading('Preparing DOCX…', { key: 'export' })
    expect(records()).toHaveLength(1)
    expect(records()[0].message).toBe('Preparing DOCX…')
  })

  it('keeps only one confirm toast at a time', () => {
    toast.confirm({ message: 'First?', onConfirm: () => {} })
    toast.confirm({ message: 'Second?', onConfirm: () => {} })
    expect(records()).toHaveLength(1)
    expect(records()[0].message).toBe('Second?')
  })

  it('caps the number of visible toasts', () => {
    for (let i = 0; i < MAX_TOASTS + 3; i += 1) toast.info(`Message ${i}`)
    expect(records()).toHaveLength(MAX_TOASTS)
    expect(records()[MAX_TOASTS - 1].message).toBe(`Message ${MAX_TOASTS + 2}`)
  })
})