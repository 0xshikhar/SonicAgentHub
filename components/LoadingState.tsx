export default function LoadingState() {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-[#131B31] p-8 rounded-2xl shadow-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-white mt-4">Connecting to wallet...</p>
            </div>
        </div>
    );
} 