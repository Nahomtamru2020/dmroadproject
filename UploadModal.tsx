import React, { useState } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface UploadModalProps {
  type: string;
  onClose: () => void;
}

export function UploadModal({ type, onClose }: UploadModalProps) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [authorRole, setAuthorRole] = useState('Foreman');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
        console.log("Starting upload...");
      const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`);
      console.log("Uploading file to storage...");
      await uploadBytes(storageRef, file);
      console.log("Upload to storage complete, getting URL...");
      const url = await getDownloadURL(storageRef);
      console.log("URL obtained:", url);
      
      console.log("Adding document to firestore...");
      await addDoc(collection(db, 'documents'), {
        date: new Date().toISOString().split('T')[0],
        content,
        authorRole,
        documentUrl: url,
        createdAt: serverTimestamp()
      });
      console.log("Document added to firestore successfully.");
      alert('Document added successfully!');
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      alert('Error adding document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-xl w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 uppercase">Add {type}</h2>
        <input 
          type="text" 
          placeholder="Content / Title" 
          className="w-full p-2 border border-slate-300 rounded mb-4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <select 
          className="w-full p-2 border border-slate-300 rounded mb-4"
          value={authorRole}
          onChange={(e) => setAuthorRole(e.target.value)}
          required
        >
          <option value="Foreman">Foreman</option>
          <option value="Site Engineer">Site Engineer</option>
          <option value="Office Engineer">Office Engineer</option>
        </select>
        <input 
          type="file" 
          accept="image/*,application/pdf" 
          // @ts-ignore - capture attribute is supported on mobile browsers
          capture="environment" 
          className="w-full p-2 border border-slate-300 rounded mb-4"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        <div className="flex gap-2">
          <button type="submit" disabled={uploading} className="flex-1 bg-slate-900 text-white py-2">
            {uploading ? 'Uploading...' : 'Submit'}
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-200 py-2">Cancel</button>
        </div>
      </form>
    </div>
  );
}
