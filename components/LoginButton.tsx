import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';

export default function LoginButton() {
    const { login, ready, authenticated, logout, user } = usePrivy();
    const [error, setError] = useState<string | null>(null);

    if (!ready) return null;

    if (authenticated) {
        return null; // Or show a different state for authenticated users
    }

    const handleLogin = async () => {
        try {
            setError(null);
            await login();
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to login. Please try again.');
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div>
            <button
                onClick={handleLogin}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
                Connect Wallet
            </button>

            {/* if wallet connected, show wallet address */}
            {user && (
                <p className="text-white text-sm">{user?.wallet?.address}</p>
                // also show disconnect button
            )}

            {/* if authenticated, show disconnect button */}
            {authenticated && (
                <button
                    onClick={handleLogout}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
                    Disconnect
                </button>
            )}

            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>
    );
} 