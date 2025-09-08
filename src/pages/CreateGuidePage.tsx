import React from 'react';
import { Guide, User } from '../types';
import GuideForm from '../components/GuideForm';

interface CreateGuidePageProps {
  user: User;
  onSave: (guide: Guide) => void;
  onCancel: () => void;
}

const CreateGuidePage: React.FC<CreateGuidePageProps> = ({ user, onSave, onCancel }) => {
    
  return (
    <div className="animate-fadeIn">
      <GuideForm user={user} onSave={onSave} onCancel={onCancel} />
    </div>
  );
};

export default CreateGuidePage;