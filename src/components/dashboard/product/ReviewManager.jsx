// src/components/dashboard/product/ReviewManager.jsx

import React, { useState, useEffect } from 'react';
import { Star, Plus, Trash2, FileText, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
// Fix: Adjust import path to point to root src folder
import { Input } from '../../../Forminput.jsx';

// --- INTERNAL MODAL COMPONENT ---
function ReviewModal({ isOpen, onClose, onSave, review }) {
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  useEffect(() => {
    if (review) {
      setAuthor(review.author);
      setRating(review.rating);
      setText(review.text);
    } else {
      setAuthor('');
      setRating(5);
      setText('');
    }
  }, [review, isOpen]);

  const handleSave = () => {
    if (!author || !text) {
      alert('Please fill in both Author Name and Review Text.');
      return;
    }
    onSave({
      id: review ? review.id : uuidv4(),
      author,
      rating: Number(rating),
      text,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {review ? 'Edit Review' : 'Add New Review'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <Input label="Author Name" value={author} onChange={setAuthor} placeholder="e.g., Emad A." required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="input"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
              <option value={3}>⭐⭐⭐ (3 Stars)</option>
              <option value={2}>⭐⭐ (2 Stars)</option>
              <option value={1}>⭐ (1 Star)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Review Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="input"
              placeholder="Paste the customer's review from WhatsApp here..."
            />
          </div>
        </div>
        <div className="p-5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="btn-primary">
            Save Review
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReviewManager({ reviews, onAdd, onEdit, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const openModal = (review = null) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleSave = (reviewData) => {
    if (editingReview) {
      onEdit(reviewData);
    } else {
      onAdd(reviewData);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
        <button type="button" className="btn-primary-sm" onClick={() => openModal(null)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center bg-gray-50">
          <Star className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h4 className="text-base font-semibold text-gray-900">No reviews yet</h4>
          <p className="text-sm text-gray-500 mt-1">
            Paste reviews from WhatsApp or other sources to build trust.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900">{review.author}</p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openModal(review)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => onDelete(review.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mt-3 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">
                "{review.text}"
              </p>
            </div>
          ))}
        </div>
      )}

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        review={editingReview}
        onSave={handleSave}
      />
    </div>
  );
}