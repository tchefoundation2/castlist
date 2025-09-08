import React, { useState } from 'react';
import { Guide, Book, User } from '../types';
import { createGuide, updateGuide } from '../services/supabaseService';
import Button from './Button';
import Modal from './Modal';
import GenerateBookPage from '../pages/GenerateBookPage';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

interface GuideFormProps {
  user: User;
  onSave: (guide: Guide) => void;
  onCancel: () => void;
  existingGuide?: Guide;
}

const GuideForm: React.FC<GuideFormProps> = ({ user, onSave, onCancel, existingGuide }) => {
  const [title, setTitle] = useState(existingGuide?.title || '');
  const [description, setDescription] = useState(existingGuide?.description || '');
  const [tags, setTags] = useState(existingGuide?.tags?.join(', ') || '');
  const [books, setBooks] = useState<Book[]>(existingGuide?.books && existingGuide.books.length > 0 ? existingGuide.books : [{ id: Date.now(), title: '', author: '', likes: 0, dislikes: 0 }]);
  const [isPublic, setIsPublic] = useState<boolean>(existingGuide?.isPublic ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const { trigger } = useHapticFeedback();

  const handleBookChange = <T,>(index: number, field: keyof Book, value: T) => {
    const newBooks = [...books];
    newBooks[index] = { ...newBooks[index], [field]: value };
    setBooks(newBooks);
  };

  const addBook = () => {
    trigger('light');
    setBooks([...books, { id: Date.now(), title: '', author: '', notes: '', coverUrl: '', purchaseLink: '', likes: 0, dislikes: 0 }]);
  };
  
  const addGeneratedBook = (generatedBook: Partial<Book>) => {
    trigger('light');
    const newBookWithDefaults = {
        id: Date.now(),
        title: generatedBook.title || '',
        author: generatedBook.author || '',
        notes: generatedBook.notes || '',
        coverUrl: '',
        purchaseLink: '',
        likes: 0,
        dislikes: 0,
    };

    setBooks(prevBooks => {
        // Replace the initial empty book if it's the only one
        if (prevBooks.length === 1 && !prevBooks[0].title && !prevBooks[0].author) {
            return [newBookWithDefaults];
        }
        return [...prevBooks, newBookWithDefaults]; // Otherwise, append
    });
  };

  const removeBook = (index: number) => {
    trigger('light');
    if (books.length > 1) {
      const newBooks = books.filter((_, i) => i !== index);
      setBooks(newBooks);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    trigger('medium');

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);

    const guideData = {
        title,
        description,
        books: books.filter(b => b.title && b.author),
        isPublic,
        tags: tagsArray,
    };

    try {
      if (existingGuide) {
        const updatedGuide = await updateGuide(existingGuide.id, guideData);
        onSave(updatedGuide);
      } else {
        const newGuide = await createGuide(guideData as any, user);
        onSave(newGuide);
      }
    } catch (error) {
      console.error("Failed to save guide", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const inputStyles = "w-full bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-xl p-3 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-primary-500 transition-all";
  const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2";

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-4">
        <div>
          <label htmlFor="title" className={labelStyles}>Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputStyles} placeholder="e.g., Intro to Stoicism" required />
        </div>

        <div>
          <label htmlFor="description" className={labelStyles}>Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputStyles} h-24`} placeholder="A brief summary of this guide" required />
        </div>

        <div>
          <label htmlFor="tags" className={labelStyles}>Tags</label>
          <input id="tags" name="tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputStyles} placeholder="Add tags (separated by comma)" />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 px-2">Books</h3>
        <div className="space-y-4">
          {books.map((book, index) => (
            <div key={book.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 relative">
               {books.length > 1 && (
                <button type="button" onClick={() => removeBook(index)} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full text-white font-bold text-lg flex items-center justify-center leading-none pb-0.5 shadow-md hover:bg-red-600 transition-colors">&times;</button>
               )}
              <div className="space-y-3">
                 <input id={`book-title-${index}`} name={`book-title-${index}`} type="text" value={book.title} onChange={(e) => handleBookChange(index, 'title', e.target.value)} className={inputStyles} placeholder="Book Title" required />
                 <input id={`book-author-${index}`} name={`book-author-${index}`} type="text" value={book.author} onChange={(e) => handleBookChange(index, 'author', e.target.value)} className={inputStyles} placeholder="Author" required />
                 <textarea id={`book-notes-${index}`} name={`book-notes-${index}`} value={book.notes || ''} onChange={(e) => handleBookChange(index, 'notes', e.target.value)} className={`${inputStyles} h-20 text-sm`} placeholder="Optional notes..." />
                 <input id={`book-cover-${index}`} name={`book-cover-${index}`} type="url" value={book.coverUrl || ''} onChange={(e) => handleBookChange(index, 'coverUrl', e.target.value)} className={inputStyles} placeholder="Cover URL (optional)" />
                 <input id={`book-purchase-${index}`} name={`book-purchase-${index}`} type="url" value={book.purchaseLink || ''} onChange={(e) => handleBookChange(index, 'purchaseLink', e.target.value)} className={inputStyles} placeholder="Purchase Link (optional)" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button type="button" onClick={() => setIsGeneratorOpen(true)} variant="secondary" className="w-full">✨ Generate with AI</Button>
          <Button type="button" onClick={addBook} variant="secondary" className="w-full">Add Another Book</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80">
        <label htmlFor="isPublic" className="flex items-center justify-between cursor-pointer">
          <span className="font-medium text-gray-800 dark:text-gray-200">Make Guide Public?</span>
          <div className="relative">
            <input id="isPublic" type="checkbox" className="sr-only" checked={isPublic} onChange={() => setIsPublic(!isPublic)} />
            <div className={`block w-14 h-8 rounded-full transition-colors ${isPublic ? 'bg-primary-700' : 'bg-gray-200 dark:bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white dark:bg-gray-300 w-6 h-6 rounded-full transition-transform ${isPublic ? 'transform translate-x-6' : ''}`}></div>
          </div>
        </label>
      </div>


      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>{existingGuide ? 'Update Guide' : 'Create Guide'}</Button>
      </div>
    </form>

    <Modal isOpen={isGeneratorOpen} onClose={() => setIsGeneratorOpen(false)} title="Generate Book Ideas">
        <GenerateBookPage onBookGenerated={addGeneratedBook} />
    </Modal>
    </>
  );
};

export default GuideForm;