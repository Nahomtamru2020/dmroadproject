import { useState } from 'react';
import { X } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

interface ReportDetailsModalProps {
  report: any;
  collectionName: string;
  onClose: () => void;
  user: any;
  initialIsEditing?: boolean;
}

export function ReportDetailsModal({ report, collectionName, onClose, user, initialIsEditing = false }: ReportDetailsModalProps) {
  const [content, setContent] = useState(report.content || '');
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, collectionName, report.id), { content });
      setIsEditing(false);
      alert('Report updated!');
    } catch (error) {
      console.error(error);
      alert('Error updating report.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, collectionName, report.id), {
        comments: arrayUnion({
          text: comment,
          user: user?.email || 'Anonymous',
          timestamp: new Date().toISOString()
        })
      });
      setComment('');
      alert('Comment added!');
    } catch (error) {
      console.error(error);
      alert('Error adding comment.');
    } finally {
      setSaving(false);
    }
  };

  const handleCommentReaction = async (commentIndex: number, type: 'like' | 'love') => {
    const comments = [...(report.comments || [])];
    const commentToUpdate = { ...comments[commentIndex] };
    
    if (!commentToUpdate.reactions) {
      commentToUpdate.reactions = [];
    }
    
    commentToUpdate.reactions.push({
      user: user?.email || 'Anonymous',
      type
    });
    comments[commentIndex] = commentToUpdate;

    try {
      await updateDoc(doc(db, collectionName, report.id), {
        comments: comments
      });
    } catch (error) {
      console.error(error);
      alert('Error updating reaction');
    }
  };

  const handleReaction = async (type: 'like' | 'love') => {
    try {
      await updateDoc(doc(db, collectionName, report.id), {
        reactions: arrayUnion({
          user: user?.email || 'Anonymous',
          type
        })
      });
    } catch (error) {
      console.error(error);
      alert('Error adding reaction.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[200]">
      <div className="bg-white p-6 rounded-t-xl sm:rounded-sm shadow-2xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b-2 border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Site Documentation</h2>
            <button onClick={onClose} className="p-2 lg:hidden"><X size={24} /></button>
        </div>
        
        <div className="flex justify-between items-center mb-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Date: {report.date}</p>
             <span className="text-[10px] font-black px-2 py-0.5 bg-amber-100 text-amber-700 uppercase tracking-widest">{collectionName}</span>
        </div>
        
        {isEditing ? (
          <textarea
            className="w-full p-2 border border-slate-300 rounded mb-4 h-32"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        ) : (
          <p className="text-sm text-slate-800 mb-4 p-2 bg-slate-50 border border-slate-100">{content}</p>
        )}
        
        <div className="flex gap-2 mb-4">
          {isEditing ? (
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-sky-600 text-white py-2">
              {saving ? 'Saving...' : 'Save'}
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex-1 bg-slate-900 text-white py-2">Edit</button>
          )}
          <button onClick={onClose} className="flex-1 bg-gray-200 py-2">Close</button>
        </div>

        <div className="flex gap-2 my-2">
          <button onClick={() => handleReaction('like')} className="text-xs bg-slate-100 px-2 py-1 rounded">👍 Like ({report.reactions?.filter((r: any) => r.type === 'like').length || 0})</button>
          <button onClick={() => handleReaction('love')} className="text-xs bg-slate-100 px-2 py-1 rounded">❤️ Love ({report.reactions?.filter((r: any) => r.type === 'love').length || 0})</button>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold text-sm mb-2 uppercase">Comments</h3>
          {report.comments?.map((c: any, i: number) => (
            <div key={i} className="text-xs mb-2 p-2 bg-slate-50 rounded">
              <span className="font-bold">{c.user}</span>: {c.text}
              <div className="flex gap-2 mt-1">
                <button onClick={() => handleCommentReaction(i, 'like')} className="hover:text-sky-600">👍 ({c.reactions?.filter((r: any) => r.type === 'like').length || 0})</button>
                <button onClick={() => handleCommentReaction(i, 'love')} className="hover:text-red-600">❤️ ({c.reactions?.filter((r: any) => r.type === 'love').length || 0})</button>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              className="flex-1 p-2 border border-slate-300 rounded"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button onClick={handleAddComment} disabled={saving} className="bg-sky-600 text-white px-4 py-2">Post</button>
          </div>
        </div>
      </div>
    </div>
  );
}
