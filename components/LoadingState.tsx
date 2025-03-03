interface LoadingStateProps {
    variant?: 'fullscreen' | 'inline';
    text?: string;
}

export default function LoadingState({ 
    variant = 'fullscreen',
    text = 'Loading...'
}: LoadingStateProps) {
    if (variant === 'inline') {
        return (
            <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                {text && <p className="ml-2 text-sm">{text}</p>}
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
            <div className="bg-[#131B31] p-8 rounded-2xl shadow-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-white mt-4">{text}</p>
            </div>
        </div>
    );
} 