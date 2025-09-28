import React, { useState } from 'react';
import { PlusIcon, XIcon } from './Icons';

interface TagInputProps {
    tags: string[];
    setTags: (tags: string[]) => void;
    suggestions: string[];
    placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, setTags, suggestions, placeholder="Ajouter un tag..." }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAddTag = (tagToAdd: string) => {
        const newTag = tagToAdd.trim().toLowerCase();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag(inputValue);
            setInputValue('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const unusedSuggestions = suggestions.filter(s => !tags.includes(s.toLowerCase()));

    return (
        <div>
            <div className="flex flex-wrap items-center gap-2 p-2 border border-border-light dark:border-border-dark rounded-md bg-card-light dark:bg-primary-light/10">
                {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 px-2 py-1 bg-secondary/20 text-secondary dark:text-secondary rounded-full text-sm font-semibold capitalize">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="text-secondary hover:text-red-500">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-grow bg-transparent focus:outline-none min-w-[120px] p-1"
                />
            </div>
            {unusedSuggestions.length > 0 && (
                 <div className="flex flex-wrap gap-2 mt-2">
                    {unusedSuggestions.map(suggestion => (
                         <button
                            type="button"
                            key={suggestion}
                            onClick={() => handleAddTag(suggestion)}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-primary-light/20 text-text-muted dark:text-text-muted-dark rounded-md text-xs hover:bg-gray-200 dark:hover:bg-primary-light/30"
                        >
                            <PlusIcon className="w-3 h-3" />
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
