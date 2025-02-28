import { z } from 'zod'

/**
 * A simple implementation of type-safe server actions
 * @param schema The zod schema to validate the input
 * @param handler The action handler function
 */
export function action<TInput, TOutput>(
    schema: z.Schema<TInput>,
    handler: (input: TInput) => Promise<TOutput>
) {
    return async (input: TInput): Promise<TOutput> => {
        // Validate the input
        const result = schema.safeParse(input)

        if (!result.success) {
            throw new Error(`Invalid input: ${result.error.message}`)
        }

        // Call the handler with the validated input
        return handler(result.data)
    }
} 