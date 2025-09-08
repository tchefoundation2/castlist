import React, { useState, useEffect } from 'react';
import { Guide, Page } from '../types';
import { getGuideById } from '../services/supabaseService';
import { logActivity } from '../services/activityService';
import Loader from '../components/Loader';
import Button from '../components/Button';

type CardTheme = 'gradient' | 'modern' | 'classic';
const THEMES: CardTheme[] = ['gradient', 'modern', 'classic'];

// Helper function to wrap text on canvas
function wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, currentY);
    // Return the Y position for the start of the NEXT block of text.
    return currentY + lineHeight;
}

// Function to generate the share card image with different themes and optional cover art
const generateShareCard = (guide: Guide, theme: CardTheme, coverImageUrl: string | null): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return reject(new Error('Could not get canvas context'));
        }

        const width = 1200;
        const height = 630;
        canvas.width = width;
        canvas.height = height;
        
        // --- Theme Styles ---
        let bgColor: string | CanvasGradient = '#FFFFFF';
        let titleColor = '#111827';
        let descColor = '#374151';
        let authorColor = '#4B5563';
        let brandColor = '#6B7280';
        let titleFont = 'bold 72px sans-serif';
        let descFont = '40px sans-serif';
        let authorFont = 'italic 32px sans-serif';

        switch (theme) {
            case 'gradient':
                const gradient = ctx.createLinearGradient(0, 0, width, height);
                gradient.addColorStop(0, '#F4E6FF');
                gradient.addColorStop(1, '#E9D0FF');
                bgColor = gradient;
                titleColor = '#2E0F50';
                descColor = '#6020A0';
                authorColor = '#4F1B82';
                brandColor = '#7828C8';
                break;
            case 'modern':
                bgColor = '#111827';
                titleColor = '#F9FAFB';
                descColor = '#D1D5DB';
                authorColor = '#9CA3AF';
                brandColor = '#E5E7EB';
                break;
            case 'classic':
                bgColor = '#FFFFFF';
                titleColor = '#1F2937';
                descColor = '#4B5563';
                authorColor = '#6B7280';
                brandColor = '#9CA3AF';
                titleFont = 'bold 80px serif';
                descFont = '42px serif';
                authorFont = 'italic 34px serif';
                break;
        }
        
        const drawContent = (coverImage: HTMLImageElement | null) => {
            // Draw background
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);

            if (coverImage) {
                 // --- Two-column layout with image ---
                const imgPadding = 60;
                const imgAreaX = width * 0.55;
                const imgAreaWidth = width - imgAreaX - imgPadding;
                const imgAreaHeight = height - imgPadding * 2;

                const hRatio = imgAreaWidth / coverImage.width;
                const vRatio = imgAreaHeight / coverImage.height;
                const ratio = Math.min(hRatio, vRatio);
                const imgDrawWidth = coverImage.width * ratio;
                const imgDrawHeight = coverImage.height * ratio;
                const imgDrawX = imgAreaX + (imgAreaWidth - imgDrawWidth) / 2;
                const imgDrawY = imgPadding + (imgAreaHeight - imgDrawHeight) / 2;
                
                // Add a subtle shadow to the book cover
                ctx.shadowColor = 'rgba(0,0,0,0.15)';
                ctx.shadowBlur = 20;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 8;
                ctx.drawImage(coverImage, imgDrawX, imgDrawY, imgDrawWidth, imgDrawHeight);
                ctx.shadowColor = 'transparent'; // Reset shadow

                const textX = 60;
                const textMaxWidth = width * 0.55 - 90;

                ctx.fillStyle = titleColor;
                ctx.font = titleFont;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                const titleYEnd = wrapText(ctx, guide.title, textX, 80, textMaxWidth, 85);

                ctx.fillStyle = descColor;
                ctx.font = descFont;
                wrapText(ctx, guide.description, textX, titleYEnd + 15, textMaxWidth, 50);
            } else {
                 // --- Text-only layout ---
                const textX = 60;
                ctx.fillStyle = titleColor;
                ctx.font = titleFont;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                const titleYEnd = wrapText(ctx, guide.title, textX, 80, 1080, 85);

                ctx.fillStyle = descColor;
                ctx.font = descFont;
                wrapText(ctx, guide.description, textX, titleYEnd + 10, 1080, 50);
            }

            // --- Footer ---
            ctx.fillStyle = authorColor;
            ctx.font = authorFont;
            ctx.textBaseline = 'bottom';
            ctx.textAlign = 'left';
            ctx.fillText(`by @${guide.authorUsername}`, 60, height - 60);
            
            ctx.fillStyle = brandColor;
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('Shared from Castlist', width - 60, height - 60);

            resolve(canvas.toDataURL('image/png'));
        };
        
        if (coverImageUrl) {
            let settled = false;
            const timeout = setTimeout(() => {
                if (!settled) {
                    settled = true;
                    console.warn("Image load timed out after 10 seconds. Falling back to text-only card.");
                    drawContent(null);
                }
            }, 10000); // 10-second timeout

            const image = new Image();
            image.crossOrigin = 'anonymous';
            
            image.onload = () => {
                if (!settled) {
                    settled = true;
                    clearTimeout(timeout);
                    drawContent(image);
                }
            };
            image.onerror = (err) => {
                 if (!settled) {
                    settled = true;
                    clearTimeout(timeout);
                    console.error("Failed to load cover image, drawing text-only card.", err);
                    drawContent(null); // Fallback to text-only card
                }
            };
            
            // Use a CORS proxy to prevent cross-origin issues
            const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(coverImageUrl)}`;
            image.src = proxiedUrl;
        } else {
            drawContent(null);
        }
    });
};

interface ShareOptionsPageProps {
  guideId: number;
  setPage: (page: Page, id?: number) => void;
  onBack: () => void;
}

const ShareOptionsPage: React.FC<ShareOptionsPageProps> = ({ guideId, onBack }) => {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('modern');
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string | null>(null);
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  
  useEffect(() => {
    const fetchGuide = async () => {
      setIsLoading(true);
      const fetchedGuide = await getGuideById(guideId);
      setGuide(fetchedGuide || null);
      if (fetchedGuide) {
          const firstCover = fetchedGuide.books.find(b => b.coverUrl)?.coverUrl;
          setSelectedCoverUrl(firstCover || null);
      }
      setIsLoading(false);
    };
    fetchGuide();
  }, [guideId]);
  
  useEffect(() => {
    if (guide) {
      const generate = async () => {
        setIsGenerating(true);
        setCardImage(null);
        try {
          const imageUrl = await generateShareCard(guide, selectedTheme, selectedCoverUrl);
          setCardImage(imageUrl);
        } catch (error) {
          console.error("Failed to generate share card:", error);
        } finally {
          setIsGenerating(false);
        }
      };
      generate();
    }
  }, [guide, selectedTheme, selectedCoverUrl]);

  const handleConfirmShare = async () => {
    if (!guide) return;
    await logActivity('Shared', guide.title);
    alert("Sharing is simulated! In a real app, your card would be cast.");
    onBack();
  };

  if (isLoading) {
    return <div className="flex justify-center mt-20"><Loader text="Loading guide..."/></div>;
  }
  
  if (!guide) {
      return <div className="text-center text-gray-500 mt-20">Guide not found.</div>;
  }

  const availableCovers = guide.books.filter(b => b.coverUrl);

  return (
    <div className="animate-fadeIn">
        <div className="mb-6 border border-gray-200/80 dark:border-gray-700/80 rounded-3xl overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800 shadow-lg">
            {isGenerating ? (
                <div className="w-full aspect-[1.91/1] flex flex-col items-center justify-center">
                    <Loader text="Generating preview..."/>
                </div>
            ) : (
                cardImage && <img src={cardImage} alt="Share card preview" className="w-full h-auto block" />
            )}
        </div>

        {availableCovers.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 mb-6">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 text-center">Select a Cover</p>
                <div className="flex space-x-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div
                      onClick={() => setSelectedCoverUrl(null)}
                      className={`flex-shrink-0 w-20 h-28 rounded-lg flex items-center justify-center cursor-pointer transition-all border-4 bg-gray-50 dark:bg-gray-700 ${!selectedCoverUrl ? 'border-primary-500' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'}`}
                    >
                      <div className="w-full h-full rounded-md flex flex-col items-center justify-center text-center p-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                         </svg>
                         <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Text Only</span>
                      </div>
                    </div>
                    {availableCovers.map(book => (
                        <div
                            key={book.id}
                            onClick={() => setSelectedCoverUrl(book.coverUrl!)}
                            className={`flex-shrink-0 w-20 h-28 rounded-lg cursor-pointer transition-all border-4 ${selectedCoverUrl === book.coverUrl ? 'border-primary-500' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'}`}
                        >
                            <img
                                src={book.coverUrl}
                                alt={`Cover of ${book.title}`}
                                className="w-full h-full object-cover rounded-md shadow-sm"
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 text-center">Choose a Theme</p>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map(theme => (
                <Button
                  key={theme}
                  variant={selectedTheme === theme ? 'primary' : 'secondary'}
                  onClick={() => setSelectedTheme(theme)}
                  className="capitalize w-full"
                >
                  {theme}
                </Button>
              ))}
            </div>
        </div>

        <div className="mt-8">
            <Button onClick={handleConfirmShare} className="w-full" disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Confirm Share'}
            </Button>
        </div>
    </div>
  );
};

export default ShareOptionsPage;