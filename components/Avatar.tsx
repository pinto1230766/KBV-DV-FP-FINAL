import React from 'react';

interface AvatarProps {
    item: { nom: string; photoUrl?: string | null };
    size?: string;
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ item, size = 'w-10 h-10', className }) => {
    const initials = item.nom
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    if (item.photoUrl) {
        return <img src={item.photoUrl} alt={item.nom} className={`${size} rounded-full object-cover flex-shrink-0 ${className}`} />;
    }

    return (
        <div className={`${size} rounded-full bg-primary-light dark:bg-primary flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}>
            {initials}
        </div>
    );
};
