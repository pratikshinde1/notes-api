import React from 'react';
import { MdOutlinePushPin, MdCreate, MdDelete } from 'react-icons/md';

export default function NoteCard({
  title, date, content, tags, isPinned, onEdit, onDelete, onPinNote, onClick
}) {
  // Prevent event propagation to avoid triggering onClick of the parent element
  const handleEditClick = (event) => {
    event.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    onDelete();
  };

  const handlePinClick = (event) => {
    event.stopPropagation();
    onPinNote();
  };

  return (
    <div className='border rounded-lg p-4 bg-white hover:shadow-lg transition duration-300 ease-in-out' onClick={onClick}>
      <div className='flex justify-between items-start'>
        <div>
          <h5 className='text-lg font-semibold text-gray-800'>{title}</h5>
          <p className='text-sm text-gray-500'>{date}</p>
        </div>
        <button
          className={`p-2 rounded-full ${isPinned ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}
          onClick={handlePinClick}
          aria-label="Pin Note"
        >
          <MdOutlinePushPin />
        </button>
      </div>

      <p className='text-sm text-gray-600 mt-3 mb-2'>
        {content?.slice(0, 100)}{content.length > 100 ? '...' : ''}
      </p>

      <div className='flex justify-between items-center'>
        <div className='flex flex-wrap gap-1'>
          {tags.map(tag => (
            <span key={tag} className='text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full'>
              #{tag}
            </span>
          ))}
        </div>
        <div className='flex gap-2'>
          <button
            className='p-2 rounded-full hover:bg-green-100 text-green-600'
            onClick={handleEditClick}
            aria-label="Edit Note"
          >
            <MdCreate />
          </button>
          <button
            className='p-2 rounded-full hover:bg-red-100 text-red-600'
            onClick={handleDeleteClick}
            aria-label="Delete Note"
          >
            <MdDelete />
          </button>
        </div>
      </div>
    </div>
  );
}