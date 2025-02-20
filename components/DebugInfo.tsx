export default function DebugInfo() {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <div className="fixed bottom-4 right-4 bg-black/80 p-4 rounded-lg text-xs text-white">
            <p>PRIVY_APP_ID: {process.env.NEXT_PUBLIC_PRIVY_APP_ID ? '✓' : '✗'}</p>
            <p>NODE_ENV: {process.env.NODE_ENV}</p>
        </div>
    );
} 