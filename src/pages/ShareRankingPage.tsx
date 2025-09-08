import React, { useState, useEffect } from 'react';
import { Guide, Page } from '../types';
import { getPublicGuides } from '../services/supabaseService';
import { logActivity } from '../services/activityService';
import Loader from '../components/Loader';
import Button from '../components/Button';

type CardTheme = 'gradient' | 'modern' | 'classic';
const THEMES: CardTheme[] = ['gradient', 'modern', 'classic'];

// Helper function to draw medals on the canvas
const drawMedal = (ctx: CanvasRenderingContext2D, x: number, y: number, rank: number) => {
    let color: string;
    if (rank === 1) color = '#FFD700'; // Gold
    else if (rank === 2) color = '#C0C0C0'; // Silver
    else if (rank === 3) color = '#CD7F32'; // Bronze
    else return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2, false);
    ctx.fillStyle = color;
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = rank === 1 ? '#A36B00' : rank === 2 ? '#6C757D' : '#8C5A2D';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rank.toString(), x, y + 2);
    ctx.restore();
};


const generateRankingCard = (guides: Guide[], theme: CardTheme): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));

        const width = 1200;
        const height = 630;
        canvas.width = width;
        canvas.height = height;

        // Theme Styles
        let bgColor: string | CanvasGradient = '#FFFFFF';
        let titleColor = '#111827';
        let textColor = '#374151';
        let authorColor = '#6B7280';
        let brandColor = '#6B7280';
        let titleFont = 'bold 72px sans-serif';
        let listFont = '48px sans-serif';
        let authorFont = 'italic 30px sans-serif';

        switch (theme) {
            case 'gradient':
                const gradient = ctx.createLinearGradient(0, 0, width, height);
                gradient.addColorStop(0, '#F4E6FF');
                gradient.addColorStop(1, '#E9D0FF');
                bgColor = gradient;
                titleColor = '#2E0F50';
                textColor = '#6020A0';
                authorColor = '#4F1B82';
                brandColor = '#7828C8';
                break;
            case 'modern':
                bgColor = '#111827';
                titleColor = '#F9FAFB';
                textColor = '#D1D5DB';
                authorColor = '#9CA3AF';
                brandColor = '#E5E7EB';
                break;
            case 'classic':
                bgColor = '#FFFFFF';
                titleColor = '#1F2937';
                textColor = '#4B5563';
                authorColor = '#6B7280';
                brandColor = '#9CA3AF';
                titleFont = 'bold 80px serif';
                listFont = '50px serif';
                authorFont = 'italic 32px serif';
                break;
        }

        // Draw background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // Draw Title
        ctx.fillStyle = titleColor;
        ctx.font = titleFont;
        ctx.textAlign = 'center';
        ctx.fillText('Top 5 Reading Guides', width / 2, 90);

        // Draw List
        let yPos = 180;
        const itemHeight = 85;
        guides.slice(0, 5).forEach((guide, index) => {
            const rank = index + 1;
            const xPos = 120;
            
            // Draw medal or rank number
            if (rank <= 3) {
                drawMedal(ctx, xPos - 40, yPos, rank);
            } else {
                ctx.fillStyle = textColor;
                ctx.font = 'bold 48px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`#${rank}`, xPos - 40, yPos + 5);
            }
            
            // Draw guide title and author
            ctx.fillStyle = textColor;
            ctx.font = listFont;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            const maxTitleWidth = 650;
            let title = guide.title;
            if (ctx.measureText(title).width > maxTitleWidth) {
                while (ctx.measureText(title + '...').width > maxTitleWidth) {
                    title = title.slice(0, -1);
                }
                title += '...';
            }
            ctx.fillText(title, xPos + 20, yPos - 12);
            
            ctx.fillStyle = authorColor;
            ctx.font = authorFont;
            ctx.fillText(`by @${guide.authorUsername}`, xPos + 25, yPos + 22);

            // Draw likes
            ctx.fillStyle = '#E11D48';
            ctx.font = 'bold 40px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`❤️ ${guide.likes}`, width - 100, yPos);

            yPos += itemHeight;
        });

        // Footer
        ctx.fillStyle = brandColor;
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('Shared from Castlist', width - 60, height - 40);

        resolve(canvas.toDataURL('image/png'));
    });
};


interface ShareRankingPageProps {
  setPage: (page: Page, id?: string) => void;
  onBack: () => void;
}

const ShareRankingPage: React.FC<ShareRankingPageProps> = ({ onBack }) => {
  const [guides, setGuides] = useState<Guide[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('modern');
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      setIsLoading(true);
      const publicGuides = await getPublicGuides();
      const sorted = [...publicGuides].sort((a, b) => b.likes - a.likes);
      setGuides(sorted);
      setIsLoading(false);
    };
    fetchGuides();
  }, []);

  useEffect(() => {
    if (guides) {
      const generate = async () => {
        setIsGenerating(true);
        setCardImage(null);
        try {
          const imageUrl = await generateRankingCard(guides, selectedTheme);
          setCardImage(imageUrl);
        } catch (error) {
          console.error("Failed to generate share card:", error);
        } finally {
          setIsGenerating(false);
        }
      };
      generate();
    }
  }, [guides, selectedTheme]);

  const handleConfirmShare = () => {
    if (!guides) return;
    logActivity('Shared', 'the global ranking');
    alert("Sharing is simulated! In a real app, your card would be cast.");
    onBack();
  };

  if (isLoading) {
    return <div className="flex justify-center mt-20"><Loader text="Loading rankings..."/></div>;
  }
  
  if (!guides) {
      return <div className="text-center text-gray-500 mt-20">No guides found.</div>;
  }

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

export default ShareRankingPage;