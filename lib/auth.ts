import Cookies from 'js-cookie'

/**
 * Checks if a wallet is connected by looking for the wallet-connected cookie
 * This function should only be used on the client side
 */
export function isWalletConnected(): boolean {
    if (typeof window === 'undefined') {
        return false
    }

    return Cookies.get('wallet-connected') === 'true'
}

/**
 * Sets the wallet-connected cookie
 * This function should only be used on the client side
 */
export function setWalletConnected(isConnected: boolean): void {
    if (typeof window === 'undefined') {
        return
    }

    if (isConnected) {
        Cookies.set('wallet-connected', 'true', {
            expires: 1, // Expires in 1 day
            path: '/',
            sameSite: 'strict'
        })
    } else {
        Cookies.remove('wallet-connected', { path: '/' })
    }
} 