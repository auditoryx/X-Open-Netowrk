'use client';

import Image from 'next/image';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { enhancedPortfolioService, MediaPortfolioItem, ProjectShowcase } from '@/lib/services/enhancedPortfolioService';
import { 
  Upload, 
  Play, 
  Pause, 
  Volume2, 
  Heart, 
  MessageCircle, 
  Share, 
  Eye,
  Star,
  Filter,
  Search,
  Grid,
  List,
  Plus,
  Edit,
  Trash2,
  Download,
  ExternalLink,
  Music,
  Video,
  Image as ImageIcon,
  FileText,
  Award,
  TrendingUp,
  Users,
  Clock,
  Tag,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'audio' | 'video' | 'image' | 'document';
type SortType = 'recent' | 'views' | 'likes' | 'title';

export default function EnhancedPortfolioPage() {
  const { user } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState<MediaPortfolioItem[]>([]);
  const [showcases, setShowcases] = useState<ProjectShowcase[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'portfolio' | 'showcases'>('portfolio');

  useEffect(() => {
    if (!user?.uid) return;
    loadData();
  }, [user, filterType, sortType]);

  const loadData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const [portfolioData, showcaseData, analyticsData] = await Promise.all([
        enhancedPortfolioService.getCreatorPortfolio(user.uid, {
          category: filterType !== 'all' ? filterType : undefined,
          limit: 50
        }),
        enhancedPortfolioService.getCreatorShowcases(user.uid),
        enhancedPortfolioService.getPortfolioAnalytics(user.uid)
      ]);

      setPortfolioItems(portfolioData);
      setShowcases(showcaseData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      toast.error('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!user?.uid || !files.length) return;

    const primaryFile = files[0];
    const additionalFiles = Array.from(files).slice(1);

    try {
      const itemId = await enhancedPortfolioService.createPortfolioItem(
        user.uid,
        {
          title: `New ${primaryFile.type.split('/')[0]} upload`,
          description: 'Upload description here...',
          category: enhancedPortfolioService['getFileType'](primaryFile),
          status: 'draft'
        },
        primaryFile,
        additionalFiles
      );

      toast.success('Portfolio item uploaded successfully!');
      setShowUploadModal(false);
      loadData();
    } catch (error) {
      console.error('Error uploading portfolio item:', error);
      toast.error('Failed to upload portfolio item');
    }
  };

  const handleToggleLike = async (itemId: string) => {
    if (!user?.uid) return;

    try {
      await enhancedPortfolioService.toggleLike(itemId, user.uid);
      loadData(); // Refresh to show updated likes
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleToggleFeatured = async (itemId: string, featured: boolean) => {
    try {
      // Implementation would go here
      toast.success(featured ? 'Marked as featured' : 'Removed from featured');
      loadData();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update featured status');
    }
  };

  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = portfolioItems;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.category === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortType) {
        case 'views':
          return b.views - a.views;
        case 'likes':
          return b.likes - a.likes;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'recent':
        default:
          return b.updatedAt.toMillis() - a.updatedAt.toMillis();
      }
    });

    return filtered;
  }, [portfolioItems, searchTerm, filterType, sortType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Portfolio</h1>
            <p className="text-gray-600 mt-2">Showcase your best work with professional media portfolio</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Media
          </button>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalItems}</p>
                </div>
                <Music className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.totalViews}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Likes</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.totalLikes}</p>
                </div>
                <Heart className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.engagementRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setSelectedTab('portfolio')}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  selectedTab === 'portfolio'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Media Portfolio ({portfolioItems.length})
              </button>
              <button
                onClick={() => setSelectedTab('showcases')}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  selectedTab === 'showcases'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Project Showcases ({showcases.length})
              </button>
            </nav>
          </div>

          {/* Filters and Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search portfolio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Media</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                  <option value="image">Images</option>
                  <option value="document">Documents</option>
                </select>

                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value as SortType)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="views">Most Viewed</option>
                  <option value="likes">Most Liked</option>
                  <option value="title">Alphabetical</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {selectedTab === 'portfolio' ? (
          <PortfolioGrid
            items={filteredAndSortedItems}
            viewMode={viewMode}
            onToggleLike={handleToggleLike}
            onToggleFeatured={handleToggleFeatured}
          />
        ) : (
          <ShowcaseGrid showcases={showcases} />
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadModal
            onClose={() => setShowUploadModal(false)}
            onUpload={handleFileUpload}
          />
        )}
      </div>
    </div>
  );
}

interface PortfolioGridProps {
  items: MediaPortfolioItem[];
  viewMode: ViewMode;
  onToggleLike: (itemId: string) => void;
  onToggleFeatured: (itemId: string, featured: boolean) => void;
}

function PortfolioGrid({ items, viewMode, onToggleLike, onToggleFeatured }: PortfolioGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio items found</h3>
        <p className="text-gray-600 mb-4">Upload your first media file to start building your portfolio</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <PortfolioListItem
              key={item.id}
              item={item}
              onToggleLike={onToggleLike}
              onToggleFeatured={onToggleFeatured}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <PortfolioCard
          key={item.id}
          item={item}
          onToggleLike={onToggleLike}
          onToggleFeatured={onToggleFeatured}
        />
      ))}
    </div>
  );
}

interface PortfolioCardProps {
  item: MediaPortfolioItem;
  onToggleLike: (itemId: string) => void;
  onToggleFeatured: (itemId: string, featured: boolean) => void;
}

function PortfolioCard({ item, onToggleLike, onToggleFeatured }: PortfolioCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getMediaIcon = (category: string) => {
    switch (category) {
      case 'audio': return <Music className="w-8 h-8" />;
      case 'video': return <Video className="w-8 h-8" />;
      case 'image': return <ImageIcon className="w-8 h-8" />;
      case 'document': return <FileText className="w-8 h-8" />;
      default: return <FileText className="w-8 h-8" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      {/* Media Preview */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-xl">
        {item.category === 'image' && item.primaryMedia.url ? (
          <Image
            src={item.primaryMedia.url}
            alt={item.title}
            className="w-full h-full object-cover rounded-t-xl"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            {getMediaIcon(item.category)}
          </div>
        )}
        
        {/* Play button for audio/video */}
        {(item.category === 'audio' || item.category === 'video') && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-all rounded-t-xl"
          >
            <div className="bg-white bg-opacity-90 rounded-full p-3 hover:bg-opacity-100 transition-all">
              {isPlaying ? (
                <Pause className="w-6 h-6 text-gray-800" />
              ) : (
                <Play className="w-6 h-6 text-gray-800" />
              )}
            </div>
          </button>
        )}

        {/* Status and Featured badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
            {item.status}
          </span>
          {item.isFeatured && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Star className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>

        {/* Menu */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
              <div className="py-1">
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => onToggleFeatured(item.id, !item.isFeatured)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Star className="w-4 h-4" />
                  {item.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <div className="border-t border-gray-100">
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

        {/* Duration for audio/video */}
        {item.primaryMedia.duration && (
          <div className="flex items-center gap-1 mb-3 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            {Math.floor(item.primaryMedia.duration / 60)}:{String(item.primaryMedia.duration % 60).padStart(2, '0')}
          </div>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-gray-400 text-xs">+{item.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Engagement */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onToggleLike(item.id)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              <Heart className="w-4 h-4" />
              {item.likes}
            </button>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              {item.views}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MessageCircle className="w-4 h-4" />
              {item.comments.length}
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Share className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PortfolioListItem({ item, onToggleLike, onToggleFeatured }: PortfolioCardProps) {
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        {/* Media Icon */}
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          {item.category === 'audio' && <Music className="w-6 h-6 text-gray-600" />}
          {item.category === 'video' && <Video className="w-6 h-6 text-gray-600" />}
          {item.category === 'image' && <ImageIcon className="w-6 h-6 text-gray-600" />}
          {item.category === 'document' && <FileText className="w-6 h-6 text-gray-600" />}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900">{item.title}</h3>
            {item.isFeatured && (
              <Star className="w-4 h-4 text-yellow-500" />
            )}
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              item.status === 'published' ? 'bg-green-100 text-green-800' :
              item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {item.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {item.views}
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {item.likes}
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {item.comments.length}
          </div>
          <div className="text-xs">
            {new Date(item.updatedAt.toDate()).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowcaseGrid({ showcases }: { showcases: ProjectShowcase[] }) {
  if (showcases.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No project showcases yet</h3>
        <p className="text-gray-600 mb-4">Create your first project showcase to highlight your best work</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Create Showcase
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {showcases.map((showcase) => (
        <div key={showcase.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-2">{showcase.title}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{showcase.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {showcase.views}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {showcase.inquiries} inquiries
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface UploadModalProps {
  onClose: () => void;
  onUpload: (files: FileList) => void;
}

function UploadModal({ onClose, onUpload }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files);
    }
  }, [onUpload]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Upload Media</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Support for audio, video, images, and documents
            </p>
            
            <input
              type="file"
              multiple
              accept="audio/*,video/*,image/*,.pdf,.doc,.docx"
              onChange={(e) => e.target.files && onUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
            >
              Choose Files
            </label>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p><strong>Supported formats:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Audio: MP3, WAV, FLAC, AAC</li>
              <li>Video: MP4, MOV, AVI, WebM</li>
              <li>Images: JPG, PNG, GIF, WebP</li>
              <li>Documents: PDF, DOC, DOCX</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
