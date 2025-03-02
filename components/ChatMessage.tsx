import React from 'react';

interface ChatMessageProps {
    role: 'user' | 'assistant' | 'system';
    content: string;
    id: string;
}

export function ChatMessage({ role, content, id }: ChatMessageProps) {
    const isThinking = role === 'assistant' && content === '...';
    
    return (
        <div
            key={id}
            className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
            <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
            >
                {role === 'user' ? (
                    <div>{content}</div>
                ) : isThinking ? (
                    <ThinkingAnimation />
                ) : (
                    <FormattedContent content={content} />
                )}
            </div>
        </div>
    );
}

function ThinkingAnimation() {
    return (
        <div className="flex items-center space-x-1 h-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
    );
}

interface FormattedContentProps {
    content: string;
}

function FormattedContent({ content }: FormattedContentProps) {
    // Split by newlines to handle lists and paragraphs
    const lines = content.split('\n');
    
    return (
        <div className="message-content">
            {lines.map((line, lineIndex) => {
                // Check if line is empty
                if (line.trim() === '') {
                    return <br key={`br-${lineIndex}`} />;
                }

                // Check if line is a numbered list item (e.g., "1. Item")
                const numberedListMatch = line.match(/^(\d+)\.\s+(.+)$/);
                if (numberedListMatch) {
                    const [, number, text] = numberedListMatch;
                    return (
                        <div key={`list-${lineIndex}`} className="flex items-start mb-1">
                            <span className="mr-2 font-medium">{number}.</span>
                            <div className="flex-1">{formatBoldText(text || '')}</div> 
                        </div>
                    );
                }

                // Check if line is a bullet list item
                if (line.trim().startsWith('• ') || line.trim().startsWith('* ')) {
                    const text = line.trim().substring(2);
                    return (
                        <div key={`bullet-${lineIndex}`} className="flex items-start mb-1">
                            <span className="mr-2">•</span>
                            <div className="flex-1">{formatBoldText(text || '')}</div>
                        </div>
                    );
                }

                // Regular paragraph
                return <p key={`p-${lineIndex}`} className="mb-1">{formatBoldText(line || '')}</p>;
            })}
        </div>
    );
}

function formatBoldText(text: string) {
    if (!text.includes('**')) {
        return <span>{text}</span>;
    }

    const parts = [];
    let lastIndex = 0;
    let boldOpen = false;
    let currentIndex = 0;

    while (currentIndex < text.length) {
        const asteriskIndex = text.indexOf('**', currentIndex);
        if (asteriskIndex === -1) break;

        if (!boldOpen) {
            // Add text before the bold marker
            if (asteriskIndex > lastIndex) {
                parts.push(
                    <span key={`text-${lastIndex}`}>
                        {text.substring(lastIndex, asteriskIndex)}
                    </span>
                );
            }
            lastIndex = asteriskIndex + 2; // Skip the **
            boldOpen = true;
        } else {
            // Add the bold text
            parts.push(
                <strong key={`bold-${lastIndex}`} className="font-bold">
                    {text.substring(lastIndex, asteriskIndex)}
                </strong>
            );
            lastIndex = asteriskIndex + 2; // Skip the **
            boldOpen = false;
        }
        currentIndex = asteriskIndex + 2;
    }

    // Add any remaining text
    if (lastIndex < text.length) {
        parts.push(
            <span key={`text-${lastIndex}`}>
                {text.substring(lastIndex)}
            </span>
        );
    }

    return <>{parts}</>;
} 