import React, { useState, useEffect } from 'react';
import { Guide, User } from '../types';
import GuideForm from '../components/GuideForm';
import { getGuideById } from '../services/supabaseService';
import Loader from '../components/Loader';

interface EditGuidePageProps {
  user: User;
  guideId: number;
  onSave: (guide: Guide) => void;
  onCancel: () => void;
}

const EditGuidePage: React.FC<EditGuidePageProps> = ({ user, guideId, onSave, onCancel }) => {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      setIsLoading(true);
      const fetchedGuide = await getGuideById(guideId);
      // Ensure the logged-in user is the author
      if (fetchedGuide && fetchedGuide.authorUsername === user.username) {
        setGuide(fetchedGuide);
      }
      setIsLoading(false);
    };
    fetchGuide();
  }, [guideId, user.username]);
  
  if (isLoading) {
    return <div className="flex justify-center mt-20"><Loader /></div>;
  }
  
  if (!guide) {
      return <div className="text-center text-gray-500 mt-20">Guide not found or you don't have permission to edit it.</div>;
  }

  return (
    <div className="animate-fadeIn">
      <GuideForm user={user} onSave={onSave} onCancel={onCancel} existingGuide={guide} />
    </div>
  );
};

export default EditGuidePage;