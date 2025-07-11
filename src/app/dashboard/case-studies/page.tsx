'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { caseStudyService, CaseStudy, CaseStudyTemplate } from '@/lib/services/caseStudyService';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Star, 
  Search, 
  Filter,
  MoreVertical,
  Heart,
  Share2,
  ExternalLink,
  Tag,
  Calendar,
  TrendingUp,
  BarChart3,
  Image as ImageIcon,
  Video,
  FileText,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

type FilterType = 'all' | 'published' | 'draft' | 'featured';
type SortType = 'recent' | 'views' | 'likes' | 'title';

export default function CaseStudyManagementPage() {
  const { user } = useAuth();
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [templates, setTemplates] = useState<CaseStudyTemplate[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    if (!user?.uid) return;
    loadData();
  }, [user, filterType, sortType]);

  const loadData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      // Load case studies based on filter
      const filters: any = {};
      if (filterType === 'published') filters.status = 'published';
      if (filterType === 'draft') filters.status = 'draft';
      if (filterType === 'featured') filters.featured = true;

      const [studiesData, templatesData, analyticsData] = await Promise.all([
        caseStudyService.getCreatorCaseStudies(user.uid, filters),
        caseStudyService.getCaseStudyTemplates(),
        caseStudyService.getCaseStudyAnalytics(user.uid)
      ]);

      setCaseStudies(studiesData);
      setTemplates(templatesData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading case study data:', error);
      toast.error('Failed to load case studies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCaseStudy = async (templateId: string) => {
    if (!user?.uid) return;

    try {
      const template = templates.find(t => t.id === templateId);
      const caseStudyId = await caseStudyService.createCaseStudy(user.uid, {
        title: `New ${template?.name || 'Case Study'}`,
        category: template?.category || 'General',
      });

      toast.success('Case study created successfully!');
      setShowCreateModal(false);
      loadData();
      
      // Navigate to edit page
      window.location.href = `/dashboard/case-studies/${caseStudyId}/edit`;
    } catch (error) {
      console.error('Error creating case study:', error);
      toast.error('Failed to create case study');
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      await caseStudyService.toggleFeatured(id, featured);
      toast.success(featured ? 'Marked as featured' : 'Removed from featured');
      loadData();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update featured status');
    }
  };

  const handlePublishToggle = async (id: string, currentStatus: string) => {
    try {
      if (currentStatus === 'published') {
        await caseStudyService.unpublishCaseStudy(id);
        toast.success('Case study unpublished');
      } else {
        await caseStudyService.publishCaseStudy(id);
        toast.success('Case study published');
      }
      loadData();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update publish status');
    }
  };

  const handleDeleteCaseStudy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case study?')) return;

    try {
      await caseStudyService.deleteCaseStudy(id);
      toast.success('Case study deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting case study:', error);
      toast.error('Failed to delete case study');
    }
  };

  const filteredAndSortedCaseStudies = React.useMemo(() => {
    let filtered = caseStudies;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(cs =>
        cs.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cs.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cs.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
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
  }, [caseStudies, searchTerm, sortType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Case Studies</h1>
            <p className="text-gray-600 mt-2">Showcase your best work and success stories</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Case Study
          </button>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Case Studies</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalCaseStudies}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.publishedCaseStudies}</p>
                </div>
                <ExternalLink className="w-8 h-8 text-green-600" />
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
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search case studies..."
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
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="featured">Featured</option>
              </select>
            </div>

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
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCaseStudies.map((caseStudy) => (
            <CaseStudyCard
              key={caseStudy.id}
              caseStudy={caseStudy}
              onToggleFeatured={handleToggleFeatured}
              onTogglePublish={handlePublishToggle}
              onDelete={handleDeleteCaseStudy}
            />
          ))}
        </div>

        {filteredAndSortedCaseStudies.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No case studies found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first case study to showcase your work'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Case Study
              </button>
            )}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Create New Case Study</h2>
                <p className="text-gray-600 mt-1">Choose a template to get started</p>
              </div>

              <div className="p-6 space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleCreateCaseStudy(template.id)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Tag className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{template.category}</span>
                        </div>
                      </div>
                      <div className="text-sm text-blue-600 font-medium">
                        {template.sections.length} sections
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  onToggleFeatured: (id: string, featured: boolean) => void;
  onTogglePublish: (id: string, currentStatus: string) => void;
  onDelete: (id: string) => void;
}

function CaseStudyCard({ caseStudy, onToggleFeatured, onTogglePublish, onDelete }: CaseStudyCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-xl">
        {caseStudy.afterImages?.[0] ? (
          <Image
            src={caseStudy.afterImages[0]}
            alt={caseStudy.title}
            width={400}
            height={192}
            className="w-full h-full object-cover rounded-t-xl"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Image className="w-12 h-12 text-gray-300" />
          </div>
        )}
        
        {/* Status badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseStudy.status)}`}>
            {caseStudy.status}
          </span>
          {caseStudy.isFeatured && (
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
                <Link
                  href={`/dashboard/case-studies/${caseStudy.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                
                <button
                  onClick={() => onTogglePublish(caseStudy.id, caseStudy.status)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <ExternalLink className="w-4 h-4" />
                  {caseStudy.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                
                <button
                  onClick={() => onToggleFeatured(caseStudy.id, !caseStudy.isFeatured)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Star className="w-4 h-4" />
                  {caseStudy.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                </button>
                
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => onDelete(caseStudy.id)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
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
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{caseStudy.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{caseStudy.description}</p>

        {/* Tags */}
        {caseStudy.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {caseStudy.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
            {caseStudy.tags.length > 3 && (
              <span className="text-gray-400 text-xs">+{caseStudy.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {caseStudy.views}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {caseStudy.likes}
            </div>
          </div>
          <div className="text-xs">
            {new Date(caseStudy.updatedAt.toDate()).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
