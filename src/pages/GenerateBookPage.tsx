import React, { useState } from 'react';
import { Book } from '../types';
import Button from '../components/Button';

interface GenerateBookPageProps {
  onBookGenerated: (book: Partial<Book>) => void;
}

const GenerateBookPage: React.FC<GenerateBookPageProps> = ({ onBookGenerated }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddBook = () => {
    if (!title || !author) return;
    
    onBookGenerated({
      title,
      author,
      notes: notes || undefined
    });
    
    // Reset form
    setTitle('');
    setAuthor('');
    setNotes('');
  };
  
  const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2";
  const inputStyles = "w-full bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-xl p-3 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-primary-500 transition-all";

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="title" className={labelStyles}>Book Title:</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputStyles}
          placeholder="Enter book title"
          aria-label="Book title"
        />
      </div>
      
      <div>
        <label htmlFor="author" className={labelStyles}>Author:</label>
        <input
          id="author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className={inputStyles}
          placeholder="Enter author name"
          aria-label="Author name"
        />
      </div>
      
      <div>
        <label htmlFor="notes" className={labelStyles}>Notes (optional):</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputStyles} h-24`}
          placeholder="Add any notes about this book"
          aria-label="Book notes"
        />
      </div>
      
      <Button onClick={handleAddBook} className="w-full">
        Add Book
      </Button>
    </div>
  );
};

export default GenerateBookPage;