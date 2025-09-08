import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Book } from '../types';
import Button from '../components/Button';
import Loader from '../components/Loader';

interface GenerateBookPageProps {
  onBookGenerated: (book: Partial<Book>) => void;
}

interface GeneratedBook {
  title: string;
  author: string;
  notes: string;
}

const GenerateBookPage: React.FC<GenerateBookPageProps> = ({ onBookGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GeneratedBook[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Based on the following topic, suggest 5 book recommendations. For each book, provide a title, author, and a short note (one sentence) explaining why it fits the topic. Topic: "${prompt}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                author: { type: Type.STRING },
                notes: { type: Type.STRING, description: "A short, one-sentence reason for recommending this book." }
              },
              required: ["title", "author", "notes"]
            }
          },
        },
      });
      
      const jsonStr = response.text?.trim() || '[]';
      const recommendedBooks: GeneratedBook[] = JSON.parse(jsonStr);
      setResults(recommendedBooks);

    } catch (err) {
      console.error("Error generating book recommendations:", err);
      setError("Sorry, something went wrong while generating ideas. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBook = (book: GeneratedBook) => {
    onBookGenerated(book);
  };
  
  const labelStyles = "block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2";
  const inputStyles = "w-full bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-xl p-3 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-primary-500 transition-all";

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="prompt" className={labelStyles}>Describe the books you're looking for:</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className={`${inputStyles} h-24`}
          placeholder="e.g., 'Classic sci-fi books about space exploration'"
          aria-label="Book recommendation prompt"
        />
      </div>
      <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">
        Generate Ideas
      </Button>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {isLoading && (
        <div className="pt-4">
            <Loader text="Generating..."/>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3 pt-4 max-h-64 overflow-y-auto pr-2">
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">Suggestions:</h3>
          {results.map((book, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="font-bold text-gray-800 dark:text-gray-100">{book.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">by {book.author}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">"{book.notes}"</p>
              </div>
              <Button onClick={() => handleAddBook(book)} variant="secondary" className="px-3 py-1.5 text-sm flex-shrink-0">
                Add
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerateBookPage;