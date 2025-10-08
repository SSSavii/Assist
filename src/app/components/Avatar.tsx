/* eslint-disable @next/next/no-img-element */
import React from 'react';

const getInitials = (firstName: string, lastName: string | null) => {
  const firstInitial = firstName ? firstName[0] : '';
  const lastInitial = lastName ? lastName[0] : '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

const avatarColors = [
  '#ef4444', '#f97316', '#eab308', 
  '#84cc16', '#22c55e', '#10b981', 
  '#06b6d4', '#3b82f6', '#8b5cf6', 
  '#d946ef', '#ec4899'
];

interface AvatarProps {
  firstName: string;
  lastName: string | null;
  photoUrl?: string; // ДОБАВЛЕНО
  className?: string;
  style?: React.CSSProperties;
}

const Avatar: React.FC<AvatarProps> = ({ firstName, lastName, photoUrl, className = '', style }) => {
  const initials = getInitials(firstName, lastName);

  const colorIndex = (firstName.charCodeAt(0) || 0) % avatarColors.length;
  const backgroundColor = avatarColors[colorIndex];

  return (
    <div
      className={`w-16 h-16 rounded-full flex items-center justify-center 
                  bg-gray-300 text-white font-bold text-lg border-2 border-white 
                  flex-shrink-0 overflow-hidden ${className}`}
      style={{ backgroundColor: photoUrl ? 'transparent' : backgroundColor, ...style }}
      title={`${firstName} ${lastName || ''}`}
    >
      {photoUrl ? (
        <img 
          src={photoUrl} 
          alt={`${firstName} ${lastName || ''}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Если аватарка не загрузилась, показываем инициалы
            const target = e.currentTarget;
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.style.backgroundColor = backgroundColor;
              target.parentElement.textContent = initials;
            }
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
};

export default Avatar;