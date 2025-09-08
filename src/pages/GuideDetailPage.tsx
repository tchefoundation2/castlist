import React, { useState, useEffect } from 'react';
import { Guide, Page, User } from '../types';
import {
  getGuideById,
  deleteGuide,
  isGuideLiked,
  likeGuide,
  unlikeGuide,
  isGuideDisliked,
  dislikeGuide,
  undislikeGuide,
  getBookLikeStatusForGuide,
  likeBook,
  unlikeBook,
  getBookDislikeStatusForGuide,
  dislikeBook,
  undislikeBook
} from '../services/supabaseService';
import { logActivity } from '../services/activityService';
import Loader from '../components/Loader';
import Button from '../components/Button';
import Modal from '../components/Modal';

interface GuideDetailPageProps {
  guideId: number;
  user: User;
  setPage: (page: Page, id?: number) => void;
  onBack: () => void;
  onDelete: () => void;
}

const GuideDetailPage: React.FC<GuideDetailPageProps> = ({ guideId, user, setPage, onDelete }) => {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [bookLikeStatus, setBookLikeStatus] = useState<Record<number, boolean>>({});
  const [bookDislikeStatus, setBookDislikeStatus] = useState<Record<number, boolean>>({});


  useEffect(() => {
    const fetchGuide = async () => {
      setIsLoading(true);
      const fetchedGuide = await getGuideById(guideId);
      
      if (fetchedGuide) {
        const [likedStatus, dislikedStatus, bookLikes, bookDislikes] = await Promise.all([
          isGuideLiked(guideId),
          isGuideDisliked(guideId),
          getBookLikeStatusForGuide(fetchedGuide),
          getBookDislikeStatusForGuide(fetchedGuide),
        ]);

        setGuide(fetchedGuide);
        setIsLiked(likedStatus);
        setIsDisliked(dislikedStatus);
        setBookLikeStatus(bookLikes);
        setBookDislikeStatus(bookDislikes);
      } else {
        setGuide(null);
      }
      setIsLoading(false);
    };
    fetchGuide();
  }, [guideId]);
  
  const isOwner = guide?.authorUsername === user.username;

  const handleShare = () => {
    if (!guide) return;
    setPage(Page.ShareOptions, guide.id);
  };

  const handleDelete = async () => {
    if (!guide) return;
    setIsDeleting(true);
    await deleteGuide(guide.id);
    setIsDeleting(false);
    setDeleteModalOpen(false);
    onDelete();
  };
  
  const handleLikeToggle = async () => {
    if (!guide) return;
    const originalGuide = { ...guide };
    const originallyLiked = isLiked;
    const originallyDisliked = isDisliked;

    // Optimistic UI update
    setGuide(g => g ? { ...g, likes: originallyLiked ? g.likes - 1 : g.likes + 1, dislikes: (originallyDisliked ? g.dislikes -1 : g.dislikes)} : null);
    setIsLiked(!originallyLiked);
    if(originallyDisliked) setIsDisliked(false);


    try {
      if (originallyLiked) {
        await unlikeGuide(guide.id);
      } else {
        await likeGuide(guide.id);
        await logActivity('Liked', guide.title);
      }
    } catch (error) {
      console.error('Failed to update like status:', error);
      // Revert on error
      setGuide(originalGuide);
      setIsLiked(originallyLiked);
      setIsDisliked(originallyDisliked);
    }
  };

  const handleDislikeToggle = async () => {
    if (!guide) return;
    const originalGuide = { ...guide };
    const originallyLiked = isLiked;
    const originallyDisliked = isDisliked;

    // Optimistic UI update
    setGuide(g => g ? { ...g, dislikes: originallyDisliked ? g.dislikes - 1 : g.dislikes + 1, likes: (originallyLiked ? g.likes -1 : g.likes)} : null);
    setIsDisliked(!originallyDisliked);
    if(originallyLiked) setIsLiked(false);


    try {
      if (originallyDisliked) {
        await undislikeGuide(guide.id);
      } else {
        await dislikeGuide(guide.id);
        await logActivity('Disliked', guide.title);
      }
    } catch (error) {
      console.error('Failed to update dislike status:', error);
       // Revert on error
      setGuide(originalGuide);
      setIsLiked(originallyLiked);
      setIsDisliked(originallyDisliked);
    }
  };
  
  const handleBookLikeToggle = async (bookId: number) => {
    if (!guide) return;
    const originalGuide = { ...guide };
    const originallyLiked = !!bookLikeStatus[bookId];
    const originallyDisliked = !!bookDislikeStatus[bookId];

    // Optimistic UI update
    setBookLikeStatus(prev => ({ ...prev, [bookId]: !originallyLiked }));
    if(!originallyLiked && originallyDisliked) setBookDislikeStatus(prev => ({...prev, [bookId]: false}));

    setGuide(g => g ? {
        ...g,
        books: g.books.map(b => b.id === bookId ? {
            ...b,
            likes: originallyLiked ? b.likes - 1 : b.likes + 1,
            dislikes: (!originallyLiked && originallyDisliked) ? b.dislikes - 1 : b.dislikes
        } : b)
    } : null);

    try {
      if (originallyLiked) {
        await unlikeBook(bookId);
      } else {
        await likeBook(bookId);
      }
    } catch (error) {
      console.error('Failed to update book like status:', error);
      // Revert on error
      setGuide(originalGuide);
      setBookLikeStatus(prev => ({ ...prev, [bookId]: originallyLiked }));
      if(!originallyLiked && originallyDisliked) setBookDislikeStatus(prev => ({...prev, [bookId]: true}));
    }
  };

  const handleBookDislikeToggle = async (bookId: number) => {
    if (!guide) return;
     const originalGuide = { ...guide };
    const originallyLiked = !!bookLikeStatus[bookId];
    const originallyDisliked = !!bookDislikeStatus[bookId];

    // Optimistic UI update
    setBookDislikeStatus(prev => ({ ...prev, [bookId]: !originallyDisliked }));
    if(!originallyDisliked && originallyLiked) setBookLikeStatus(prev => ({...prev, [bookId]: false}));

    setGuide(g => g ? {
        ...g,
        books: g.books.map(b => b.id === bookId ? {
            ...b,
            dislikes: originallyDisliked ? b.dislikes - 1 : b.dislikes + 1,
            likes: (!originallyDisliked && originallyLiked) ? b.likes - 1 : b.likes
        } : b)
    } : null);

    try {
      if (originallyDisliked) {
        await undislikeBook(bookId);
      } else {
        await dislikeBook(bookId);
      }
    } catch (error) {
      console.error('Failed to update book dislike status:', error);
      // Revert on error
      setGuide(originalGuide);
      setBookDislikeStatus(prev => ({ ...prev, [bookId]: originallyDisliked }));
      if(!originallyDisliked && originallyLiked) setBookLikeStatus(prev => ({...prev, [bookId]: true}));
    }
  };

  if (isLoading) {
    return <div className="flex justify-center mt-20"><Loader /></div>;
  }

  if (!guide) {
    return <div className="text-center text-gray-500 mt-20">Guide not found.</div>;
  }
  
  const HeartIcon = ({ filled, small = false }: { filled: boolean; small?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={small ? "h-5 w-5" : "h-6 w-6"} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
  );

  const ThumbsDownIcon = ({ filled, small = false }: { filled: boolean; small?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${small ? "h-5 w-5" : "h-6 w-6"} transform -scale-y-100`} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
    </svg>
  );


  return (
    <div className="animate-fadeIn">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">{guide.title}</h2>

      <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-5 mb-6">
        <div className="flex items-center mb-4">
            <img src={guide.authorPfpUrl} alt={guide.authorUsername} className="w-11 h-11 rounded-full mr-3" />
            <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{guide.authorUsername}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Created on {new Date(guide.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{guide.description}</p>
        {guide.tags && guide.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                {guide.tags.map((tag, index) => (
                    <span key={index} className="bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                        {tag}
                    </span>
                ))}
            </div>
        )}
      </div>

      <div className="space-y-4 mb-8">
        {guide.books.map((book, index) => (
          <div key={book.id} className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 transition-shadow hover:shadow-md">
            {book.coverUrl && (
                <img src={book.coverUrl} alt={`Cover of ${book.title}`} className="w-24 h-36 object-cover rounded-lg flex-shrink-0 self-center sm:self-start shadow-sm" />
            )}
            <div className="flex-grow flex flex-col">
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{index + 1}. {book.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">by {book.author}</p>
              {book.notes && <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-xl italic mb-3">"{book.notes}"</p>}
              <div className="mt-auto pt-2 flex items-center justify-between">
                 {book.purchaseLink ? (
                    <a href={book.purchaseLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-700 bg-primary-100 hover:bg-primary-200 dark:text-primary-300 dark:bg-primary-900/50 dark:hover:bg-primary-900/80 rounded-lg transition-colors">
                        Buy Now
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                ) : <div />}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBookDislikeToggle(book.id)}
                    className={`flex items-center space-x-2 px-3 py-1.5 font-semibold rounded-full focus:outline-none focus:ring-2 transition-all duration-200 ease-in-out transform active:scale-95 text-sm ${bookDislikeStatus[book.id] ? 'bg-blue-100 text-blue-600 focus:ring-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 focus:ring-gray-300'}`}
                  >
                    <ThumbsDownIcon filled={!!bookDislikeStatus[book.id]} small={true} />
                    <span>{book.dislikes}</span>
                  </button>
                  <button
                    onClick={() => handleBookLikeToggle(book.id)}
                    className={`flex items-center space-x-2 px-3 py-1.5 font-semibold rounded-full focus:outline-none focus:ring-2 transition-all duration-200 ease-in-out transform active:scale-95 text-sm ${bookLikeStatus[book.id] ? 'bg-red-100 text-red-600 focus:ring-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 focus:ring-gray-300'}`}
                  >
                    <HeartIcon filled={!!bookLikeStatus[book.id]} small={true} />
                    <span>{book.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col space-y-3">
        <div className="flex items-stretch space-x-3">
            <button
              onClick={handleDislikeToggle}
              className={`flex items-center justify-center space-x-2 px-4 py-3 font-semibold rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 ease-in-out transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isDisliked ? 'bg-blue-100 text-blue-600 focus:ring-blue-200' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-300'}`}
            >
              <ThumbsDownIcon filled={isDisliked} />
              <span>{guide.dislikes}</span>
            </button>
            <Button onClick={handleShare} variant="primary" className="flex-1">Share to Farcaster</Button>
            <button
              onClick={handleLikeToggle}
              className={`flex items-center justify-center space-x-2 px-4 py-3 font-semibold rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 ease-in-out transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isLiked ? 'bg-red-100 text-red-600 focus:ring-red-200' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-300'}`}
            >
              <HeartIcon filled={isLiked} />
              <span>{guide.likes}</span>
            </button>
        </div>

        {isOwner && (
          <div className="flex space-x-3">
             <Button onClick={() => setPage(Page.EditGuide, guide.id)} variant="secondary" className="flex-1">Edit</Button>
             <Button onClick={() => setDeleteModalOpen(true)} variant="danger" className="flex-1">Delete</Button>
          </div>
        )}
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Deletion">
        <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to permanently delete this guide? This action cannot be undone.</p>
        <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>Delete</Button>
        </div>
      </Modal>

    </div>
  );
};

export default GuideDetailPage;