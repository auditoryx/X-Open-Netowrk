'use client';

import React, { useState, useEffect } from 'react';
import { portfolioThemeService, PortfolioTheme, PortfolioTemplate, CustomizationPreset } from '@/lib/services/portfolioThemeService';
import { 
  Palette, 
  Grid, 
  List, 
  Image, 
  Video, 
  Music,
  Crown,
  Check,
  Eye,
  Settings,
  Sparkles,
  Download,
  Share2,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PortfolioThemeSelectorProps {
  currentThemeId?: string;
  onThemeSelect: (theme: PortfolioTheme) => void;
  onCustomize?: (theme: PortfolioTheme, customizations: Partial<PortfolioTheme>) => void;
}

export default function PortfolioThemeSelector({ 
  currentThemeId, 
  onThemeSelect,
  onCustomize 
}: PortfolioThemeSelectorProps) {
  const [themes, setThemes] = useState<PortfolioTheme[]>([]);
  const [templates, setTemplates] = useState<PortfolioTemplate[]>([]);
  const [presets, setPresets] = useState<CustomizationPreset[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<PortfolioTheme | null>(null);
  const [activeTab, setActiveTab] = useState<'themes' | 'templates' | 'customize'>('themes');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (currentThemeId && themes.length > 0) {
      const currentTheme = themes.find(t => t.id === currentThemeId);
      if (currentTheme) {
        setSelectedTheme(currentTheme);
      }
    }
  }, [currentThemeId, themes]);

  const loadData = async () => {
    try {
      const [themesData, templatesData, presetsData] = await Promise.all([
        Promise.resolve(portfolioThemeService.getThemes()),
        Promise.resolve(portfolioThemeService.getTemplates()),
        Promise.resolve(portfolioThemeService.getCustomizationPresets())
      ]);

      setThemes(themesData);
      setTemplates(templatesData);
      setPresets(presetsData);
    } catch (error) {
      console.error('Error loading theme data:', error);
      toast.error('Failed to load themes');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = (theme: PortfolioTheme) => {
    setSelectedTheme(theme);
    onThemeSelect(theme);
    toast.success(`Theme "${theme.name}" selected`);
  };

  const handleTemplateSelect = (template: PortfolioTemplate) => {
    const theme = themes.find(t => t.id === template.themeId);
    if (theme) {
      handleThemeSelect(theme);
    }
  };

  const applyPreset = (preset: CustomizationPreset) => {
    if (!selectedTheme || !onCustomize) return;

    const customizedTheme = portfolioThemeService.applyPreset(selectedTheme, preset);
    setSelectedTheme(customizedTheme);
    onCustomize(selectedTheme, preset.settings);
    toast.success(`Applied "${preset.name}" preset`);
  };

  const getThemeIcon = (category: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      minimalist: Grid,
      creative: Sparkles,
      professional: List,
      artistic: Palette,
      modern: Video,
      classic: Image
    };
    const IconComponent = icons[category] || Grid;
    return <IconComponent className="w-5 h-5" />;
  };

  const getIndustryIcon = (industry: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Music: Music,
      Audio: Music,
      Design: Palette,
      Video: Video,
      Photography: Image
    };
    const IconComponent = icons[industry] || Grid;
    return <IconComponent className="w-4 h-4" />;
  };

  const filteredThemes = themes.filter(theme => {
    const matchesCategory = categoryFilter === 'all' || theme.category === categoryFilter;
    const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         theme.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', ...Array.from(new Set(themes.map(t => t.category)))];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Themes</h2>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('themes')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'themes'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Palette className="w-4 h-4 inline mr-2" />
            Themes
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'templates'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Grid className="w-4 h-4 inline mr-2" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('customize')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'customize'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={!selectedTheme}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Customize
          </button>
        </div>

        {/* Filters */}
        {activeTab === 'themes' && (
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search themes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'themes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={selectedTheme?.id === theme.id}
              onSelect={handleThemeSelect}
              onPreview={() => setShowPreview(true)}
            />
          ))}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={handleTemplateSelect}
            />
          ))}
        </div>
      )}

      {activeTab === 'customize' && selectedTheme && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customization Presets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {presets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  onApply={applyPreset}
                />
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme Preview</h3>
            <ThemePreview theme={selectedTheme} />
          </div>
        </div>
      )}

      {/* Selected Theme Info */}
      {selectedTheme && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900">Selected Theme: {selectedTheme.name}</h4>
              <p className="text-blue-700 text-sm">{selectedTheme.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ThemeCardProps {
  theme: PortfolioTheme;
  isSelected: boolean;
  onSelect: (theme: PortfolioTheme) => void;
  onPreview: () => void;
}

function ThemeCard({ theme, isSelected, onSelect, onPreview }: ThemeCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow border-2 transition-all hover:shadow-lg ${
      isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
    }`}>
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
          <span className="text-gray-500 text-sm">Theme Preview</span>
          {theme.isPremium && (
            <Crown className="w-5 h-5 text-yellow-500 absolute top-2 right-2" />
          )}
        </div>
        
        {isSelected && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white p-1 rounded-full">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{theme.name}</h3>
          <div className="flex items-center space-x-1">
            {React.createElement(portfolioThemeService.getThemes().find(t => t.category === theme.category) ? Palette : Grid, 
              { className: "w-4 h-4 text-gray-500" }
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3">{theme.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            theme.isPremium 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {theme.isPremium ? 'Premium' : 'Free'}
          </span>
          <span className="text-xs text-gray-500 capitalize">{theme.category}</span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onSelect(theme)}
            className={`flex-1 px-4 py-2 rounded transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isSelected ? 'Selected' : 'Select'}
          </button>
          <button
            onClick={onPreview}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: PortfolioTemplate;
  onSelect: (template: PortfolioTemplate) => void;
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{template.description}</p>
          </div>
          {template.isPopular && (
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
              Popular
            </span>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Industries</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {template.industry.slice(0, 3).map((industry) => (
                <span key={industry} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {React.createElement(getIndustryIcon(industry), { className: "w-3 h-3 mr-1" })}
                  {industry}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sample Content</span>
            <div className="mt-1">
              <p className="text-sm text-gray-700">{template.sampleContent.categories.join(', ')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{template.usageCount} uses</span>
          <button
            onClick={() => onSelect(template)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}

interface PresetCardProps {
  preset: CustomizationPreset;
  onApply: (preset: CustomizationPreset) => void;
}

function PresetCard({ preset, onApply }: PresetCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <h4 className="font-medium text-gray-900 mb-2">{preset.name}</h4>
      <p className="text-gray-600 text-sm mb-3">{preset.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{preset.category}</span>
        <button
          onClick={() => onApply(preset)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

interface ThemePreviewProps {
  theme: PortfolioTheme;
}

function ThemePreview({ theme }: ThemePreviewProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4 border-b">
        <h4 className="font-medium text-gray-900">Live Preview: {theme.name}</h4>
      </div>
      <div className="p-6" style={{ 
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.typography.bodyFont 
      }}>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="aspect-square rounded"
              style={{ 
                backgroundColor: theme.colors.surface,
                borderRadius: portfolioThemeService.getThemes().find(t => t.id === theme.id)?.styles.borderRadius === 'full' ? '50%' : '8px'
              }}
            />
          ))}
        </div>
        <div className="mt-4">
          <h3 style={{ 
            fontFamily: theme.typography.headingFont,
            fontWeight: theme.typography.headingWeight,
            color: theme.colors.text 
          }}>
            Portfolio Title
          </h3>
          <p style={{ color: theme.colors.textSecondary }}>
            This is how your portfolio description will look with this theme.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function moved outside component
function getIndustryIcon(industry: string) {
  const icons: { [key: string]: React.ComponentType<any> } = {
    Music: Music,
    Audio: Music,
    Design: Palette,
    Video: Video,
    Photography: Image
  };
  return icons[industry] || Grid;
}
