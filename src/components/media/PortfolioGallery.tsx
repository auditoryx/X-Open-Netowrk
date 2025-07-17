'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  filename: string;
  uploadedAt: string;
  size: number;
  description?: string;
  tags?: string[];
  featured?: boolean;
}

interface PortfolioGalleryProps {
  userId?: string;
  editable?: boolean;
  maxItems?: number;
  layout?: 'grid' | 'masonry' | 'carousel';
  className?: string;
}

export default function PortfolioGallery({
  userId,
  editable = false,
  maxItems = 50,
  layout = 'grid',
  className = ''
}: PortfolioGalleryProps) {
  const { data: session } = useSession();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  const currentUserId = userId || session?.user?.id;
  const canEdit = editable && session?.user?.id === currentUserId;

  useEffect(() => {
    if (currentUserId) {
      loadMediaItems();
    }
  }, [currentUserId]);

  const loadMediaItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/media/portfolio/user/${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        setMediaItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to load media items:', error);
      toast.error('Failed to load portfolio items');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/media/portfolio/item/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMediaItems(prev => prev.filter(item => item.id !== itemId));
        toast.success('Item deleted successfully');
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleUpdateItem = async (itemId: string, updates: Partial<MediaItem>) => {
    try {
      const response = await fetch(`/api/media/portfolio/item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setMediaItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        ));
        toast.success('Item updated successfully');
      } else {
        throw new Error('Failed to update item');
      }
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update item');
    }
  };

  const handleSetFeatured = async (itemId: string, featured: boolean) => {
    if (featured) {
      // Remove featured status from other items
      setMediaItems(prev => prev.map(item => ({ ...item, featured: false })));
    }
    
    await handleUpdateItem(itemId, { featured });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMediaItem = (item: MediaItem) => {
    const commonClasses = "w-full h-48 object-cover rounded-lg";
    
    switch (item.type) {
      case 'image':
        return (
          <img
            src={item.url}
            alt={item.filename}
            className={commonClasses}
            loading="lazy"
          />
        );
      case 'video':
        return (
          <video
            src={item.url}
            className={commonClasses}
            controls
            preload="metadata"
          />
        );
      case 'audio':
        return (
          <div className="w-full h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
            <div className="text-4xl mb-4">🎵</div>
            <audio src={item.url} controls className="w-full" />
          </div>
        );
      default:
        return (
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Unsupported media type</span>
          </div>
        );
    }
  };

  const renderGridLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {mediaItems.map((item) => (
        <div key={item.id} className="relative group">
          <div className="relative">
            {renderMediaItem(item)}
            
            {/* Featured badge */}
            {item.featured && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                Featured
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="bg-white text-gray-800 px-3 py-1 rounded-lg text-sm hover:bg-gray-100"
                >
                  View
                </button>
                {canEdit && (
                  <>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Item info */}
          <div className="mt-3">
            <h4 className="font-medium text-gray-900 truncate">{item.filename}</h4>
            <p className="text-sm text-gray-500">{formatFileSize(item.size)}</p>
            {item.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
            )}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{item.tags.length - 3}
                  </span>
                )}
              </div>
            )}
            
            {canEdit && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleSetFeatured(item.id, !item.featured)}
                  className={`text-xs px-2 py-1 rounded ${
                    item.featured
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {item.featured ? 'Remove Featured' : 'Set Featured'}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Portfolio ({mediaItems.length})
        </h2>
        {canEdit && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Media
          </button>
        )}
      </div>

      {/* Empty state */}
      {mediaItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📸</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No media items yet</h3>
          <p className="text-gray-600 mb-4">
            {canEdit ? 'Upload your first media item to showcase your work' : 'This portfolio is empty'}
          </p>
          {canEdit && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              Upload Media
            </button>
          )}
        </div>
      )}

      {/* Media grid */}
      {mediaItems.length > 0 && renderGridLayout()}

      {/* View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">{selectedItem.filename}</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                {selectedItem.type === 'image' && (
                  <img src={selectedItem.url} alt={selectedItem.filename} className="max-w-full h-auto" />
                )}
                {selectedItem.type === 'video' && (
                  <video src={selectedItem.url} controls className="max-w-full h-auto" />
                )}
                {selectedItem.type === 'audio' && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎵</div>
                    <audio src={selectedItem.url} controls className="w-full" />
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Size:</strong> {formatFileSize(selectedItem.size)}</p>
                <p><strong>Uploaded:</strong> {new Date(selectedItem.uploadedAt).toLocaleDateString()}</p>
                {selectedItem.description && (
                  <p><strong>Description:</strong> {selectedItem.description}</p>
                )}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div>
                    <strong>Tags:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedItem.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <EditMediaModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onUpdate={handleUpdateItem}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadMediaModal
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={loadMediaItems}
        />
      )}
    </div>
  );
}

// Edit Modal Component
function EditMediaModal({ 
  item, 
  onClose, 
  onUpdate 
}: { 
  item: MediaItem; 
  onClose: () => void; 
  onUpdate: (id: string, updates: Partial<MediaItem>) => void;
}) {
  const [description, setDescription] = useState(item.description || '');
  const [tags, setTags] = useState(item.tags?.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(item.id, {
      description,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Edit Media Item</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe this media item..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="music, beats, hip-hop..."
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Upload Modal Component
function UploadMediaModal({ 
  onClose, 
  onUploadComplete 
}: { 
  onClose: () => void; 
  onUploadComplete: () => void;
}) {
  const handleUploadComplete = () => {
    onUploadComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-full overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Upload Media</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-4">
            {/* MediaUpload component would be imported and used here */}
            <p className="text-gray-600">Upload component would be integrated here</p>
          </div>
        </div>
      </div>
    </div>
  );
}