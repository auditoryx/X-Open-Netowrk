'use client';

import React, { useState, useEffect } from 'react';
import { testimonialService, Testimonial, TestimonialAnalytics } from '@/lib/services/testimonialService';
import { 
  Star, 
  Plus, 
  Send, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Search, 
  Filter,
  Download,
  TrendingUp,
  MessageSquare,
  Users,
  Award,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TestimonialManagerProps {
  creatorId: string;
}

export default function TestimonialManager({ creatorId }: TestimonialManagerProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [analytics, setAnalytics] = useState<TestimonialAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [creatorId, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [testimonialsData, analyticsData] = await Promise.all([
        testimonialService.getCreatorTestimonials(creatorId, {
          status: statusFilter === 'all' ? undefined : statusFilter,
          limit: 50
        }),
        testimonialService.getTestimonialAnalytics(creatorId)
      ]);

      setTestimonials(testimonialsData.testimonials);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (testimonialId: string, status: Testimonial['status']) => {
    try {
      await testimonialService.updateTestimonial(testimonialId, { status });
      await loadData();
      toast.success(`Testimonial ${status}`);
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast.error('Failed to update testimonial');
    }
  };

  const handleTogglePublic = async (testimonialId: string, isPublic: boolean) => {
    try {
      await testimonialService.updateTestimonial(testimonialId, { isPublic });
      await loadData();
      toast.success(`Testimonial ${isPublic ? 'published' : 'made private'}`);
    } catch (error) {
      console.error('Error updating testimonial visibility:', error);
      toast.error('Failed to update testimonial');
    }
  };

  const handleToggleFeatured = async (testimonialId: string, isFeatured: boolean) => {
    try {
      await testimonialService.updateTestimonial(testimonialId, { isFeatured });
      await loadData();
      toast.success(`Testimonial ${isFeatured ? 'featured' : 'unfeatured'}`);
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast.error('Failed to update testimonial');
    }
  };

  const handleDelete = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await testimonialService.deleteTestimonial(testimonialId);
      await loadData();
      toast.success('Testimonial deleted');
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: Testimonial['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Testimonial['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Testimonials</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalTestimonials}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageRating.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.responseRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.featuredTestimonials}</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search testimonials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              Request Testimonial
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Testimonials</h3>
          
          {filteredTestimonials.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h4>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Start by requesting testimonials from your clients'}
              </p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                Request Your First Testimonial
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{testimonial.title}</h4>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < testimonial.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(testimonial.status)}`}>
                          {testimonial.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">
                        by {testimonial.clientName} • {new Date(testimonial.createdAt).toLocaleDateString()}
                      </p>
                      
                      <p className="text-gray-800 mb-3">{testimonial.content}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {testimonial.views} views
                        </span>
                        {testimonial.isPublic && (
                          <span className="text-green-600 font-medium">Public</span>
                        )}
                        {testimonial.isFeatured && (
                          <span className="text-purple-600 font-medium">Featured</span>
                        )}
                        {testimonial.isVerified && (
                          <span className="flex items-center text-blue-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {testimonial.status === 'pending' && (
                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleStatusUpdate(testimonial.id, 'approved')}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(testimonial.id, 'rejected')}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleTogglePublic(testimonial.id, !testimonial.isPublic)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        {testimonial.isPublic ? 'Make Private' : 'Make Public'}
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(testimonial.id, !testimonial.isFeatured)}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm hover:bg-purple-200 transition-colors"
                      >
                        {testimonial.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
