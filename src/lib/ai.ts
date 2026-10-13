export interface AiSettings {
  apiKey: string
  model: string
  baseUrl: string
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  apiKey: '',
  model: 'gpt-4o-mini',
  baseUrl: 'https://api.openai.com/v1',
}

export interface ImproveRequest {
  text: string
  instruction?: string
  context?: string
}

const SYSTEM_PROMPT =
  'You are an expert resume writer. Rewrite the provided content to be concise, ' +
  'impact-driven and ATS-friendly. Start with strong action verbs and quantify results ' +
  'where plausible. Return ONLY the rewritten text, with no preamble, quotes or markdown.'

export const haveAiKey = (settings: AiSettings): boolean => settings.apiKey.trim().length > 0

export async function improveText(
  request: ImproveRequest,
  settings: AiSettings,
  signal?: AbortSignal,
): Promise<string> {
  if (!haveAiKey(settings)) {
    throw new Error('Add an API key in AI settings first.')
  }

  const parts: string[] = []
  if (request.context?.trim()) parts.push(`Context: ${request.context.trim()}`)
  if (request.instruction?.trim()) parts.push(`Instruction: ${request.instruction.trim()}`)
  parts.push(request.text.trim())

  const response = await fetch(`${settings.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: settings.model,
      temperature: 0.4,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: parts.join('\n\n') },
      ],
    }),
    signal,
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`AI request failed (${response.status}). ${detail.slice(0, 200)}`.trim())
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('AI returned an empty response.')
  return content
}
