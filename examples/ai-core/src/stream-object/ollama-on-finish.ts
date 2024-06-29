#! /usr/bin/env -S pnpm tsx

import { streamObject } from 'ai'
import { ollama } from 'ollama-ai-provider'
import { z } from 'zod'

import { buildProgram } from '../tools/command'

async function main(model: Parameters<typeof ollama>[0]) {
  const result = await streamObject({
    model: ollama(model),
    onFinish({ error, object, usage }) {
      console.log()
      console.log('onFinish')
      console.log('Token usage:', usage)

      // handle type validation failure (when the object does not match the schema):
      if (object === undefined) {
        console.error('Error:', error)
      } else {
        console.log('Final object:', JSON.stringify(object, null, 2))
      }
    },
    prompt:
      'Generate 3 character descriptions for a fantasy role playing game.',
    schema: z.object({
      characters: z.array(
        z.object({
          class: z
            .string()
            .describe('Character class, e.g. warrior, mage, or thief.'),
          description: z.string(),
          name: z.string(),
        }),
      ),
    }),
  })

  for await (const partialObject of result.partialObjectStream) {
    console.clear()
    console.log(partialObject)
  }
}

buildProgram('mistral', main).catch(console.error)