import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion } from 'framer-motion';
import api from "../utils/axiosConfig";

// Helper function to get default title based on slug
const getDefaultTitle = (slug) => {
  const titleMap = {
    'privacy-policy': 'Privacy Policy',
    'terms-of-service': 'Terms of Service',
    'about': 'about',
    // Add more slugs and titles as needed
  };
  return titleMap[slug] || slug.split('-').join(' ');
};

const PageEditor = ({ slug, onUpdate }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ]
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await api.get(`/pages/${slug}`);
        
        if (res.data.exists) {
          setContent(res.data.content || '');
          setTitle(res.data.title || getDefaultTitle(slug));
        } else {
          setContent(`## Introduction\nStart writing your content here...`);
          setTitle(getDefaultTitle(slug));
        }
      } catch (error) {
        console.error('Error fetching page:', error);
        setContent(`## Introduction\nStart writing your content here...`);
        setTitle(getDefaultTitle(slug));
      }
    };
    
    if (user?.role === 'admin') fetchPage();
  }, [slug, user]);

  const handleSave = async () => {
    try {
      await api.put(`/pages/${slug}`, 
        { title, content },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          Edit Page
        </button>
      ) : (
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
            placeholder={`${getDefaultTitle(slug)} Title`}
          />
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            className="bg-white rounded dark:bg-gray-800 dark:text-gray-200 mb-8
              [&_.ql-toolbar]:dark:bg-gray-700 [&_.ql-toolbar]:dark:border-gray-600
              [&_.ql-container]:dark:bg-gray-800 [&_.ql-container]:dark:border-gray-700"
            placeholder="Write your content here..."
          />
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PageEditor;