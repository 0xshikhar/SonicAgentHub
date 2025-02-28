/**
 * Standard response type for server actions
 */
export interface ActionResponse<T = unknown> {
    /**
     * The data returned by the action if successful
     */
    data: T | null

    /**
     * The error message if the action failed
     */
    error: string | null
} 