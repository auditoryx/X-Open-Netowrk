'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { portfolioService, PortfolioItem, ProjectCaseStudy } from '@/lib/services/portfolioService';
import { creatorAnalyticsService } from '@/lib/services/creatorAnalyticsService';
import { 
  Plus, 
  Upload, 
  Edit2, 
  Trash2, 
  Eye, 
  Heart, 
  Share2,
  Star,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  ExternalLink,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

type TabType = 'portfolio' | 'case-studies' | 'analytics' | 'settings';

export default function PortfolioManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [caseStudies, setCaseStudies] = useState<ProjectCaseStudy[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [newItemData, setNewItemData] = useState({
    title: '',
    description: '',
    category: 'image' as PortfolioItem['category'],
    tags: [] as string[],
    isFeatured: false
  });

  useEffect(() => {
    if (!user?.uid) return;
    loadPortfolioData();
  }, [user]);

  const loadPortfolioData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const [items, studies, stats] = await Promise.all([
        portfolioService.getPortfolioItems(user.uid),
        portfolioService.getCaseStudies(user.uid),
        portfolioService.getPortfolioStats?.(user.uid) || Promise.resolve(null)
      ]);

      setPortfolioItems(items);
      setCaseStudies(studies);
      setPortfolioStats(stats);
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      toast.error('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user?.uid) return;
    
    setUploading(true);
    try {
      const mediaData = await portfolioService.uploadMedia(file, user.uid, newItemData.category);
      
      const itemId = await portfolioService.createPortfolioItem(user.uid, {
        ...newItemData,
        mediaUrl: mediaData.mediaUrl,
        thumbnailUrl: mediaData.thumbnailUrl
      });

      toast.success('Portfolio item uploaded successfully!');
      setShowAddModal(false);
      setNewItemData({
        title: '',
        description: '',
        category: 'image',
        tags: [],
        isFeatured: false
      });
      loadPortfolioData();
    } catch (error) {
      console.error('Error uploading portfolio item:', error);
      toast.error('Failed to upload portfolio item');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user?.uid || !confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await portfolioService.deletePortfolioItem(itemId);
      toast.success('Portfolio item deleted successfully');
      loadPortfolioData();
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast.error('Failed to delete portfolio item');
    }
  };

  const handleToggleFeatured = async (itemId: string, currentStatus: boolean) => {
    try {
      await portfolioService.updatePortfolioItem(itemId, { isFeatured: !currentStatus });
      toast.success(`Item ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
      loadPortfolioData();
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const getCategoryIcon = (category: PortfolioItem['category']) => {
    switch (category) {
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'audio':
        return <Music className="w-5 h-5" />;
      case 'document':
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const renderPortfolioGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Add New Item Card */}
      <div 
        onClick={() => setShowAddModal(true)}
        className="bg-neutral-800 border-2 border-dashed border-neutral-600 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-colors"
      >
        <Plus className="w-12 h-12 text-neutral-400 mb-4" />
        <h3 className="text-lg font-medium text-neutral-300 mb-2">Add New Item</h3>
        <p className="text-sm text-neutral-500 text-center">Upload your latest work to showcase your skills</p>
      </div>

      {/* Portfolio Items */}
      {portfolioItems.map((item) => (
        <div key={item.id} className="bg-neutral-800 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-colors">
          {/* Media Preview */}
          <div className="relative aspect-video bg-neutral-700">
            {item.category === 'image' ? (
              <Image 
                src={item.thumbnailUrl || item.mediaUrl} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {getCategoryIcon(item.category)}
                <span className="ml-2 text-neutral-400 capitalize">{item.category}</span>
              </div>
            )}
            
            {/* Featured Badge */}
            {item.isFeatured && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-medium">
                Featured
              </div>
            )}

            {/* Actions */}
            <div className="absolute top-2 right-2 flex gap-1">
              <button 
                onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                className="bg-black/50 text-white p-1 rounded hover:bg-black/70 transition-colors"
              >
                <Star className={`w-4 h-4 ${item.isFeatured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              </button>
              <button 
                onClick={() => setEditingItem(item)}
                className="bg-black/50 text-white p-1 rounded hover:bg-black/70 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDeleteItem(item.id)}
                className="bg-red-500/80 text-white p-1 rounded hover:bg-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-white mb-2 truncate">{item.title}</h3>
            <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{item.description}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="bg-neutral-700 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-xs text-neutral-500">+{item.tags.length - 3} more</span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-neutral-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {item.metadata?.viewCount || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {item.metadata?.likeCount || 0}
                </span>
              </div>
              <button className="text-brand-400 hover:text-brand-300 flex items-center gap-1">
                <ExternalLink className="w-4 h-4" />
                View
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Total Items</h3>
            <Image className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{portfolioStats?.totalItems || 0}</p>
          <p className="text-sm text-gray-400">{portfolioStats?.featuredItems || 0} featured</p>
        </div>

        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Total Views</h3>
            <Eye className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold">{portfolioStats?.totalViews || 0}</p>
          <div className="flex items-center mt-1">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-500">12% this month</span>
          </div>
        </div>

        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Engagement</h3>
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold">{portfolioStats?.totalLikes || 0}</p>
          <p className="text-sm text-gray-400">likes & shares</p>
        </div>

        <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Case Studies</h3>
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold">{portfolioStats?.caseStudiesCount || 0}</p>
          <p className="text-sm text-gray-400">success stories</p>
        </div>
      </div>

      {/* Portfolio Performance Chart */}
      <div className="bg-neutral-800 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
        <div className="h-64 flex items-center justify-center text-neutral-400">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4" />
            <p>Analytics charts will be displayed here</p>
            <p className="text-sm">Track views, engagement, and conversion metrics</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 text-white">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-neutral-800 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Portfolio Manager</h1>
          <p className="text-gray-400">Showcase your best work and track performance</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-neutral-800 rounded-lg p-1 mb-6">
        {([
          { id: 'portfolio', label: 'Portfolio', icon: Image },
          { id: 'case-studies', label: 'Case Studies', icon: Award },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === id 
                ? 'bg-brand-500 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-neutral-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'portfolio' && renderPortfolioGrid()}
      {activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'case-studies' && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Case Studies Coming Soon</h3>
          <p className="text-gray-400">Create detailed project showcases with before/after examples</p>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Portfolio Item</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newItemData.title}
                  onChange={(e) => setNewItemData({ ...newItemData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-500"
                  placeholder="Portfolio item title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newItemData.description}
                  onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-500 h-24 resize-none"
                  placeholder="Describe your work..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={newItemData.category}
                  onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value as PortfolioItem['category'] })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="document">Document</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload File</label>
                <input
                  type="file"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="w-full px-3 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-500 file:text-white hover:file:bg-brand-600"
                  accept={
                    newItemData.category === 'image' ? 'image/*' :
                    newItemData.category === 'video' ? 'video/*' :
                    newItemData.category === 'audio' ? 'audio/*' :
                    '*/*'
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={newItemData.isFeatured}
                  onChange={(e) => setNewItemData({ ...newItemData, isFeatured: e.target.checked })}
                  className="rounded border-white/10 text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="featured" className="text-sm text-gray-300">Feature this item</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!newItemData.title || uploading}
                className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Uploading...' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
