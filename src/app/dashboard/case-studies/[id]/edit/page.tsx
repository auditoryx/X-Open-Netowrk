'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { caseStudyService, CaseStudy } from '@/lib/services/caseStudyService';
import { portfolioService } from '@/lib/services/portfolioService';
import { 
  Save, 
  Eye, 
  ExternalLink, 
  Upload, 
  X, 
  Plus,
  GripVertical,
  Image as ImageIcon,
  Video,
  FileText,
  BarChart3,
  MessageSquare,
  Star,
  ArrowLeft,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CaseStudyEditorProps {
  params: Promise<{ id: string }>;
}

type SectionType = 'text' | 'image' | 'video' | 'metrics' | 'testimonial';

interface Section {
  id: string;
  type: SectionType;
  title: string;
  content: any;
  order: number;
}

export default function CaseStudyEditor({ params }: CaseStudyEditorProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [showAddSection, setShowAddSection] = useState(false);
  const [id, setId] = useState<string | null>(null);

  // Resolve params promise
  useEffect(() => {
    params.then(({ id }) => setId(id));
  }, [params]);

  useEffect(() => {
    if (!user?.uid || !id) return;
    loadCaseStudy();
  }, [user, id]);

  const loadCaseStudy = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await caseStudyService.getCaseStudy(id);
      if (data) {
        setCaseStudy(data);
        // Convert case study data to sections
        const initialSections = convertCaseStudyToSections(data);
        setSections(initialSections);
      } else {
        toast.error('Case study not found');
        router.push('/dashboard/case-studies');
      }
    } catch (error) {
      console.error('Error loading case study:', error);
      toast.error('Failed to load case study');
    } finally {
      setLoading(false);
    }
  };

  const convertCaseStudyToSections = (cs: CaseStudy): Section[] => {
    const sections: Section[] = [];
    let order = 0;

    // Overview section
    sections.push({
      id: 'overview',
      type: SCHEMA_FIELDS.REVIEW.TEXT,
      title: 'Project Overview',
      content: { text: cs.description },
      order: order++
    });

    // Challenge section
    if (cs.challenge) {
      sections.push({
        id: 'challenge',
        type: SCHEMA_FIELDS.REVIEW.TEXT,
        title: 'Challenge',
        content: { text: cs.challenge },
        order: order++
      });
    }

    // Solution section
    if (cs.solution) {
      sections.push({
        id: 'solution',
        type: SCHEMA_FIELDS.REVIEW.TEXT,
        title: 'Solution',
        content: { text: cs.solution },
        order: order++
      });
    }

    // Before images
    if (cs.beforeImages && cs.beforeImages.length > 0) {
      sections.push({
        id: 'before',
        type: 'image',
        title: 'Before',
        content: { images: cs.beforeImages },
        order: order++
      });
    }

    // Process images
    if (cs.processImages && cs.processImages.length > 0) {
      sections.push({
        id: 'process',
        type: 'image',
        title: 'Process',
        content: { images: cs.processImages },
        order: order++
      });
    }

    // After images
    if (cs.afterImages && cs.afterImages.length > 0) {
      sections.push({
        id: 'after',
        type: 'image',
        title: 'Results',
        content: { images: cs.afterImages },
        order: order++
      });
    }

    // Video section
    if (cs.videoUrl) {
      sections.push({
        id: 'video',
        type: 'video',
        title: 'Demo Video',
        content: { url: cs.videoUrl },
        order: order++
      });
    }

    // Results section
    if (cs.results) {
      sections.push({
        id: 'results',
        type: SCHEMA_FIELDS.REVIEW.TEXT,
        title: 'Results & Impact',
        content: { text: cs.results },
        order: order++
      });
    }

    // Metrics section
    if (cs.metrics && Object.keys(cs.metrics).length > 0) {
      sections.push({
        id: 'metrics',
        type: 'metrics',
        title: 'Key Metrics',
        content: cs.metrics,
        order: order++
      });
    }

    // Testimonial section
    if (cs.testimonial) {
      sections.push({
        id: 'testimonial',
        type: 'testimonial',
        title: 'Client Testimonial',
        content: cs.testimonial,
        order: order++
      });
    }

    return sections;
  };

  const convertSectionsToCaseStudy = (): Partial<CaseStudy> => {
    const updates: Partial<CaseStudy> = {};
    const beforeImages: string[] = [];
    const processImages: string[] = [];
    const afterImages: string[] = [];

    sections.forEach(section => {
      switch (section.id) {
        case 'overview':
          updates.description = section.content.text || '';
          break;
        case 'challenge':
          updates.challenge = section.content.text || '';
          break;
        case 'solution':
          updates.solution = section.content.text || '';
          break;
        case 'results':
          updates.results = section.content.text || '';
          break;
        case 'before':
          beforeImages.push(...(section.content.images || []));
          break;
        case 'process':
          processImages.push(...(section.content.images || []));
          break;
        case 'after':
          afterImages.push(...(section.content.images || []));
          break;
        case 'video':
          updates.videoUrl = section.content.url;
          break;
        case 'metrics':
          updates.metrics = section.content;
          break;
        case 'testimonial':
          updates.testimonial = section.content;
          break;
      }
    });

    if (beforeImages.length > 0) updates.beforeImages = beforeImages;
    if (processImages.length > 0) updates.processImages = processImages;
    if (afterImages.length > 0) updates.afterImages = afterImages;

    return updates;
  };

  const handleSave = async () => {
    if (!caseStudy) return;

    setSaving(true);
    try {
      const updates = convertSectionsToCaseStudy();
      await caseStudyService.updateCaseStudy(caseStudy.id, updates);
      toast.success('Case study saved successfully');
    } catch (error) {
      console.error('Error saving case study:', error);
      toast.error('Failed to save case study');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!caseStudy) return;

    try {
      // Save first
      await handleSave();
      
      // Then publish
      await caseStudyService.publishCaseStudy(caseStudy.id);
      toast.success('Case study published successfully');
      
      // Reload to get updated status
      loadCaseStudy();
    } catch (error) {
      console.error('Error publishing case study:', error);
      toast.error('Failed to publish case study');
    }
  };

  const handleImageUpload = async (files: FileList, sectionId: string) => {
    if (!files.length) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => 
        portfolioService.uploadMedia(file, `case-studies/${caseStudy?.id}`)
      );
      
      const urls = await Promise.all(uploadPromises);
      
      // Update section with new images
      setSections(prev => prev.map(section => {
        if (section.id === sectionId) {
          const existingImages = section.content.images || [];
          return {
            ...section,
            content: {
              ...section.content,
              images: [...existingImages, ...urls]
            }
          };
        }
        return section;
      }));

      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const addSection = (type: SectionType) => {
    const newSection: Section = {
      id: `section_${Date.now()}`,
      type,
      title: getDefaultSectionTitle(type),
      content: getDefaultSectionContent(type),
      order: sections.length
    };

    setSections(prev => [...prev, newSection]);
    setActiveSection(newSection.id);
    setShowAddSection(false);
  };

  const getDefaultSectionTitle = (type: SectionType): string => {
    switch (type) {
      case 'text': return 'New Section';
      case 'image': return 'Images';
      case 'video': return 'Video';
      case 'metrics': return 'Metrics';
      case 'testimonial': return 'Testimonial';
      default: return 'Section';
    }
  };

  const getDefaultSectionContent = (type: SectionType): any => {
    switch (type) {
      case 'text': return { text: '' };
      case 'image': return { images: [] };
      case 'video': return { url: '' };
      case 'metrics': return { duration: '', budget: '', roi: '' };
      case 'testimonial': return { quote: '', clientName: '', clientTitle: '' };
      default: return {};
    }
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const removeSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Case study not found</h2>
          <Link
            href="/dashboard/case-studies"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to case studies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/case-studies"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{caseStudy.title}</h1>
                <p className="text-sm text-gray-600">
                  {caseStudy.status === 'published' ? 'Published' : 'Draft'} • 
                  Last updated {new Date(caseStudy.updatedAt.toDate()).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddSection(true)}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>

              <button
                onClick={handlePublish}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                {caseStudy.status === 'published' ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Case Study Structure</h3>
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-900 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getSectionIcon(section.type)}
                      <div>
                        <p className="font-medium text-sm">{section.title}</p>
                        <p className="text-xs text-gray-500 capitalize">{section.type}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={caseStudy.title}
                      onChange={(e) => setCaseStudy(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={caseStudy.category}
                      onChange={(e) => setCaseStudy(prev => prev ? { ...prev, category: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="General">General</option>
                      <option value="Creative">Creative</option>
                      <option value="Technical">Technical</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={caseStudy.tags.join(', ')}
                    onChange={(e) => setCaseStudy(prev => prev ? { 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    } : null)}
                    placeholder="Enter tags separated by commas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Sections */}
              {sections.map((section) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  isActive={activeSection === section.id}
                  onUpdate={updateSection}
                  onRemove={removeSection}
                  onImageUpload={handleImageUpload}
                  uploading={uploading}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Section</h2>
              
              <div className="space-y-3">
                {[
                  { type: 'text' as SectionType, label: 'Text Section', description: 'Add paragraphs, headings, or formatted text', icon: FileText },
                  { type: 'image' as SectionType, label: 'Image Gallery', description: 'Upload and showcase images', icon: ImageIcon },
                  { type: 'video' as SectionType, label: 'Video', description: 'Embed a video demonstration', icon: Video },
                  { type: 'metrics' as SectionType, label: 'Metrics', description: 'Display key performance indicators', icon: BarChart3 },
                  { type: 'testimonial' as SectionType, label: 'Testimonial', description: 'Add client feedback and quotes', icon: MessageSquare },
                ].map(({ type, label, description, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => addSection(type)}
                    className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddSection(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getSectionIcon(type: SectionType) {
  switch (type) {
    case 'text':
      return <FileText className="w-4 h-4" />;
    case 'image':
      return <ImageIcon className="w-4 h-4" />;
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'metrics':
      return <BarChart3 className="w-4 h-4" />;
    case 'testimonial':
      return <MessageSquare className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
}

interface SectionEditorProps {
  section: Section;
  isActive: boolean;
  onUpdate: (sectionId: string, updates: Partial<Section>) => void;
  onRemove: (sectionId: string) => void;
  onImageUpload: (files: FileList, sectionId: string) => void;
  uploading: boolean;
}

function SectionEditor({ section, isActive, onUpdate, onRemove, onImageUpload, uploading }: SectionEditorProps) {
  const renderSectionContent = () => {
    switch (section.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <textarea
              value={section.content.text || ''}
              onChange={(e) => onUpdate(section.id, { 
                content: { ...section.content, text: e.target.value }
              })}
              placeholder="Enter your content here..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && onImageUpload(e.target.files, section.id)}
                className="hidden"
                id={`upload-${section.id}`}
              />
              <label
                htmlFor={`upload-${section.id}`}
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload images</p>
              </label>
            </div>

            {section.content.images && section.content.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {section.content.images.map((url: string, index: number) => (
                  <div key={index} className="relative group">
                    <Image
                      src={url}
                      alt={`Upload ${index + 1}`}
                      width={200}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        const newImages = section.content.images.filter((_: any, i: number) => i !== index);
                        onUpdate(section.id, {
                          content: { ...section.content, images: newImages }
                        });
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <input
              type="url"
              value={section.content.url || ''}
              onChange={(e) => onUpdate(section.id, {
                content: { ...section.content, url: e.target.value }
              })}
              placeholder="Enter video URL (YouTube, Vimeo, etc.)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {section.content.url && (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">Video preview will appear here</p>
              </div>
            )}
          </div>
        );

      case 'metrics':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                type="text"
                value={section.content.duration || ''}
                onChange={(e) => onUpdate(section.id, {
                  content: { ...section.content, duration: e.target.value }
                })}
                placeholder="e.g., 2 weeks"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
              <input
                type="text"
                value={section.content.budget || ''}
                onChange={(e) => onUpdate(section.id, {
                  content: { ...section.content, budget: e.target.value }
                })}
                placeholder="e.g., $5,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ROI</label>
              <input
                type="text"
                value={section.content.roi || ''}
                onChange={(e) => onUpdate(section.id, {
                  content: { ...section.content, roi: e.target.value }
                })}
                placeholder="e.g., 300% increase"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Satisfaction</label>
              <select
                value={section.content.satisfaction || ''}
                onChange={(e) => onUpdate(section.id, {
                  content: { ...section.content, satisfaction: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select rating</option>
                {[1, 2, 3, 4, 5].map(rating => (
                  <option key={rating} value={rating}>{rating} Star{rating !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
              <textarea
                value={section.content.quote || ''}
                onChange={(e) => onUpdate(section.id, {
                  content: { ...section.content, quote: e.target.value }
                })}
                placeholder="Enter the client testimonial..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={section.content.clientName || ''}
                  onChange={(e) => onUpdate(section.id, {
                    content: { ...section.content, clientName: e.target.value }
                  })}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Title</label>
                <input
                  type="text"
                  value={section.content.clientTitle || ''}
                  onChange={(e) => onUpdate(section.id, {
                    content: { ...section.content, clientTitle: e.target.value }
                  })}
                  placeholder="CEO, Company Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      default:
        return <p>Section type not supported</p>;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all ${
      isActive ? 'ring-2 ring-blue-500 border-blue-500' : ''
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getSectionIcon(section.type)}
            <input
              type="text"
              value={section.title}
              onChange={(e) => onUpdate(section.id, { title: e.target.value })}
              className="font-semibold text-lg bg-transparent border-none focus:outline-none focus:ring-0 p-0"
            />
          </div>
          <button
            onClick={() => onRemove(section.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {renderSectionContent()}
      </div>
    </div>
  );
}
