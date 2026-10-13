import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_AI_SETTINGS, haveAiKey, improveText } from './ai'

const settings = { ...DEFAULT_AI_SETTINGS, apiKey: 'sk-test', model: 'gpt-4o-mini' }

const okResponse = (content: string) =>
  ({
    ok: true,
    json: async () => ({ choices: [{ message: { content } }] }),
  }) as Response

afterEach(() => {
  vi.restoreAllMocks()
})

describe('haveAiKey', () => {
  it('is false when the key is blank', () => {
    expect(haveAiKey({ ...DEFAULT_AI_SETTINGS, apiKey: '  ' })).toBe(false)
  })

  it('is true when a key is present', () => {
    expect(haveAiKey(settings)).toBe(true)
  })
})

describe('improveText', () => {
  it('throws without an api key', async () => {
    await expect(
      improveText({ text: 'hello' }, { ...DEFAULT_AI_SETTINGS }),
    ).rejects.toThrow(/api key/i)
  })

  it('posts to the chat completions endpoint and returns the content', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse('Improved text.'))
    vi.stubGlobal('fetch', fetchMock)

    const result = await improveText(
      { text: 'did stuff', context: 'Engineer at Acme', instruction: 'Be concise' },
      settings,
    )

    expect(result).toBe('Improved text.')
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.openai.com/v1/chat/completions')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer sk-test')
    const body = JSON.parse(init.body as string)
    expect(body.model).toBe('gpt-4o-mini')
    expect(body.messages[1].content).toContain('Engineer at Acme')
    expect(body.messages[1].content).toContain('Be concise')
    expect(body.messages[1].content).toContain('did stuff')
  })

  it('throws a helpful error on a failed response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      } as Response),
    )

    await expect(improveText({ text: 'x' }, settings)).rejects.toThrow(/401/)
  })
})
