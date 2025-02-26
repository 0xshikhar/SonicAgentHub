
interface CharacterData {
    name: string;
    description?: string;
    personality?: string[];
    background?: string;
    examples?: { user: string; agent: string }[];
    systemPrompt?: string;
}

export async function parseCharacterFile(file: File): Promise<CharacterData> {
    try {
        const fileContent = await readFileAsText(file);
        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        switch (fileExtension) {
            case 'json':
                return parseJsonCharacter(fileContent);
            case 'txt':
                return parseTxtCharacter(fileContent);
            case 'md':
                return parseMarkdownCharacter(fileContent);
            default:
                throw new Error('Unsupported file format');
        }
    } catch (error) {
        console.error('Error parsing character file:', error);
        throw error;
    }
}

function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

function parseJsonCharacter(content: string): CharacterData {
    try {
        const data = JSON.parse(content);

        // Validate required fields
        if (!data.name) {
            throw new Error('Character name is required in JSON format');
        }

        return {
            name: data.name,
            description: data.description || '',
            personality: Array.isArray(data.personality) ? data.personality : [],
            background: data.background || '',
            examples: Array.isArray(data.examples) ? data.examples : [],
            systemPrompt: data.systemPrompt || ''
        };
    } catch (error) {
        console.error('Error parsing JSON character:', error);
        throw new Error('Invalid JSON format');
    }
}

function parseTxtCharacter(content: string): CharacterData {
    // Simple parsing for TXT files - assumes first line is name
    const lines = content.split('\n').filter(line => line.trim() !== '');

    if (lines.length === 0) {
        throw new Error('Character file is empty');
    }

    const name = lines[0]?.trim() || '';
    const description = lines.slice(1).join('\n');

    return {
        name,
        description,
        systemPrompt: `You are ${name}, a character with the following description:\n\n${description}\n\nRespond as this character would, maintaining their personality and tone.`
    };
}

function parseMarkdownCharacter(content: string): CharacterData {
    const lines = content.split('\n');
    const result: CharacterData = {
        name: 'Unknown Character'
    };

    let currentSection = '';
    let examples: { user: string; agent: string }[] = [];
    let currentExample: { user?: string; agent?: string } = {};

    for (const line of lines) {
        // Check for headers
        if (line.startsWith('# ')) {
            result.name = line.substring(2).trim();
            currentSection = 'name';
        } else if (line.startsWith('## Description') || line.startsWith('## About')) {
            currentSection = 'description';
            result.description = '';
        } else if (line.startsWith('## Personality') || line.startsWith('## Traits')) {
            currentSection = 'personality';
            result.personality = [];
        } else if (line.startsWith('## Background') || line.startsWith('## History')) {
            currentSection = 'background';
            result.background = '';
        } else if (line.startsWith('## Examples') || line.startsWith('## Conversations')) {
            currentSection = 'examples';
            examples = [];
        } else if (line.startsWith('## System Prompt') || line.startsWith('## Prompt')) {
            currentSection = 'systemPrompt';
            result.systemPrompt = '';
        } else {
            // Process content based on current section
            switch (currentSection) {
                case 'description':
                    result.description = (result.description || '') + line + '\n';
                    break;
                case 'personality':
                    if (line.trim().startsWith('- ')) {
                        result.personality = [...(result.personality || []), line.trim().substring(2)];
                    }
                    break;
                case 'background':
                    result.background = (result.background || '') + line + '\n';
                    break;
                case 'examples':
                    if (line.trim().startsWith('User: ')) {
                        if (currentExample.user || currentExample.agent) {
                            examples.push({
                                user: currentExample.user || '',
                                agent: currentExample.agent || ''
                            });
                            currentExample = {};
                        }
                        currentExample.user = line.trim().substring(6);
                    } else if (line.trim().startsWith('Agent: ')) {
                        currentExample.agent = line.trim().substring(7);
                        if (currentExample.user && currentExample.agent) {
                            examples.push({
                                user: currentExample.user,
                                agent: currentExample.agent
                            });
                            currentExample = {};
                        }
                    }
                    break;
                case 'systemPrompt':
                    result.systemPrompt = (result.systemPrompt || '') + line + '\n';
                    break;
            }
        }
    }

    // Add any pending example
    if (currentExample.user || currentExample.agent) {
        examples.push({
            user: currentExample.user || '',
            agent: currentExample.agent || ''
        });
    }

    result.examples = examples;

    // Generate system prompt if not explicitly provided
    if (!result.systemPrompt) {
        result.systemPrompt = generateSystemPromptFromCharacter(result);
    }

    return result;
}

// function generateSystemPromptFromCharacter(character: CharacterData): string {
//     let prompt = `You are ${character.name}`;

//     if (character.description) {
//         prompt += `, ${character.description.trim()}`;
//     }

//     prompt += '.\n\n';

//     if (character.personality && character.personality.length > 0) {
//         prompt += 'Personality traits:\n';
//         character.personality.forEach(trait => {
//             prompt += `- ${trait}\n`;
//         });
//         prompt += '\n';
//     }

//     if (character.background) {
//         prompt += `Background: ${character.background.trim()}\n\n`;
//     }

//     prompt += 'Guidelines:\n';
//     prompt += '- Stay in character at all times\n';
//     prompt += '- Respond as this character would, maintaining their personality and tone\n';
//     prompt += '- Reference the character\'s background and traits in responses when relevant\n';

//     return prompt;
// }

export function generateSystemPromptFromCharacter(character: CharacterData): string {
    let prompt = `You are ${character.name}`;

    if (character.description) {
        prompt += `, ${character.description.trim()}`;
    }

    prompt += '.\n\n';

    if (character.personality && character.personality.length > 0) {
        prompt += 'Personality traits:\n';
        character.personality.forEach(trait => {
            prompt += `- ${trait}\n`;
        });
        prompt += '\n';
    }

    if (character.background) {
        prompt += `Background: ${character.background.trim()}\n\n`;
    }

    prompt += 'Guidelines:\n';
    prompt += '- Stay in character at all times\n';
    prompt += '- Respond as this character would, maintaining their personality and tone\n';
    prompt += '- Reference the character\'s background and traits in responses when relevant\n';

    if (character.examples && character.examples.length > 0) {
        prompt += '\nExample conversations:\n';
        character.examples.forEach(example => {
            prompt += `User: ${example.user}\n`;
            prompt += `You: ${example.agent}\n`;
        });
    }

    return prompt;
}
