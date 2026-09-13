import { parse } from 'node-html-parser'

export function stripToPlainText(html: string): string {
  const root = parse(html)
  root.querySelectorAll('script, style').forEach((el) => el.remove())
  const text = root.textContent ?? ''
  return text.replace(/\s+/g, ' ').trim()
}
