import { toPng } from 'html-to-image'
import { downloadBlob, slug } from '../lib/helpers'

export async function exportPng(node: HTMLElement, fullName: string): Promise<void> {
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
  })
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  downloadBlob(blob, `${slug(fullName)}_CV.png`)
}
