import React from 'react';

interface ShortcutCardProps {
  title: string;
  url: string;
  description?: string;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ShortcutCard: React.FC<ShortcutCardProps> = ({
  title,
  url,
  description,
  canEdit,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-2">{description}</p>}
      <div className="flex items-center justify-between">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700"
        >
          Ouvrir le lien
        </a>
        {canEdit && (
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="text-yellow-500 hover:text-yellow-700"
            >
              Modifier
            </button>
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortcutCard;