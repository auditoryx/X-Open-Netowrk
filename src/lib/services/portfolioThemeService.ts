export interface PortfolioTheme {
  id: string;
  name: string;
  description: string;
  category: 'minimalist' | 'creative' | 'professional' | 'artistic' | 'modern' | 'classic';
  isPremium: boolean;
  preview: string;
  thumbnail: string;
  styles: {
    layout: 'grid' | 'masonry' | 'carousel' | 'list' | 'magazine';
    columns: 2 | 3 | 4 | 5;
    spacing: 'tight' | 'normal' | 'loose';
    borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
    shadow: 'none' | 'small' | 'medium' | 'large' | 'extra-large';
    animation: 'none' | 'fade' | 'slide' | 'zoom' | 'rotate';
    hoverEffect: 'none' | 'lift' | 'glow' | 'border' | 'overlay' | 'scale';
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingSize: 'small' | 'medium' | 'large' | 'extra-large';
    bodySize: 'small' | 'medium' | 'large';
    headingWeight: 300 | 400 | 500 | 600 | 700 | 800 | 900;
    bodyWeight: 300 | 400 | 500 | 600;
    lineHeight: 'tight' | 'normal' | 'relaxed' | 'loose';
  };
  components: {
    showTitles: boolean;
    showDescriptions: boolean;
    showTags: boolean;
    showDates: boolean;
    showCategories: boolean;
    showMetrics: boolean;
    showSharing: boolean;
    enableLightbox: boolean;
    enableFiltering: boolean;
    enableSorting: boolean;
  };
  customizations?: {
    headerStyle?: 'minimal' | 'featured' | 'hero' | 'split';
    navigationStyle?: 'tabs' | 'pills' | 'underline' | 'sidebar';
    footerStyle?: 'minimal' | 'detailed' | 'contact' | 'none';
    loadingStyle?: 'skeleton' | 'spinner' | 'fade' | 'none';
  };
}

export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  industry: string[];
  skillTypes: string[];
  sampleContent: {
    title: string;
    description: string;
    categories: string[];
    sampleItems: {
      title: string;
      description: string;
      type: 'image' | 'video' | 'audio' | 'document';
      category: string;
      tags: string[];
    }[];
  };
  themeId: string;
  isPopular: boolean;
  usageCount: number;
}

export interface CustomizationPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  settings: Partial<PortfolioTheme>;
  isUserCreated: boolean;
}

class PortfolioThemeService {
  private readonly DEFAULT_THEMES: PortfolioTheme[] = [
    {
      id: 'minimal-grid',
      name: 'Minimal Grid',
      description: 'Clean and simple grid layout perfect for showcasing visual work',
      category: 'minimalist',
      isPremium: false,
      preview: '/themes/minimal-grid-preview.jpg',
      thumbnail: '/themes/minimal-grid-thumb.jpg',
      styles: {
        layout: 'grid',
        columns: 3,
        spacing: 'normal',
        borderRadius: 'small',
        shadow: 'small',
        animation: 'fade',
        hoverEffect: 'lift'
      },
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#0ea5e9',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0'
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        headingSize: 'large',
        bodySize: 'medium',
        headingWeight: 600,
        bodyWeight: 400,
        lineHeight: 'normal'
      },
      components: {
        showTitles: true,
        showDescriptions: true,
        showTags: true,
        showDates: true,
        showCategories: true,
        showMetrics: false,
        showSharing: true,
        enableLightbox: true,
        enableFiltering: true,
        enableSorting: true
      },
      customizations: {
        headerStyle: 'minimal',
        navigationStyle: 'tabs',
        footerStyle: 'minimal',
        loadingStyle: 'skeleton'
      }
    },
    {
      id: 'creative-masonry',
      name: 'Creative Masonry',
      description: 'Dynamic masonry layout for creative professionals',
      category: 'creative',
      isPremium: false,
      preview: '/themes/creative-masonry-preview.jpg',
      thumbnail: '/themes/creative-masonry-thumb.jpg',
      styles: {
        layout: 'masonry',
        columns: 3,
        spacing: 'loose',
        borderRadius: 'medium',
        shadow: 'medium',
        animation: 'zoom',
        hoverEffect: 'scale'
      },
      colors: {
        primary: '#7c3aed',
        secondary: '#a855f7',
        accent: '#ec4899',
        background: '#faf7ff',
        surface: '#ffffff',
        text: '#1f2937',
        textSecondary: '#6b7280',
        border: '#e5e7eb'
      },
      typography: {
        headingFont: 'Poppins',
        bodyFont: 'Inter',
        headingSize: 'extra-large',
        bodySize: 'medium',
        headingWeight: 700,
        bodyWeight: 400,
        lineHeight: 'relaxed'
      },
      components: {
        showTitles: true,
        showDescriptions: true,
        showTags: true,
        showDates: false,
        showCategories: true,
        showMetrics: true,
        showSharing: true,
        enableLightbox: true,
        enableFiltering: true,
        enableSorting: true
      },
      customizations: {
        headerStyle: 'hero',
        navigationStyle: 'pills',
        footerStyle: 'detailed',
        loadingStyle: 'fade'
      }
    },
    {
      id: 'professional-list',
      name: 'Professional List',
      description: 'Business-focused list layout with detailed information',
      category: 'professional',
      isPremium: false,
      preview: '/themes/professional-list-preview.jpg',
      thumbnail: '/themes/professional-list-thumb.jpg',
      styles: {
        layout: 'list',
        columns: 2,
        spacing: 'tight',
        borderRadius: 'none',
        shadow: 'none',
        animation: 'slide',
        hoverEffect: 'border'
      },
      colors: {
        primary: '#059669',
        secondary: '#064e3b',
        accent: '#10b981',
        background: '#ffffff',
        surface: '#f9fafb',
        text: '#111827',
        textSecondary: '#4b5563',
        border: '#d1d5db'
      },
      typography: {
        headingFont: 'Roboto',
        bodyFont: 'Open Sans',
        headingSize: 'medium',
        bodySize: 'medium',
        headingWeight: 500,
        bodyWeight: 400,
        lineHeight: 'normal'
      },
      components: {
        showTitles: true,
        showDescriptions: true,
        showTags: false,
        showDates: true,
        showCategories: true,
        showMetrics: true,
        showSharing: false,
        enableLightbox: false,
        enableFiltering: true,
        enableSorting: true
      },
      customizations: {
        headerStyle: 'featured',
        navigationStyle: 'underline',
        footerStyle: 'contact',
        loadingStyle: 'spinner'
      }
    },
    {
      id: 'artistic-magazine',
      name: 'Artistic Magazine',
      description: 'Magazine-style layout for artistic portfolios',
      category: 'artistic',
      isPremium: true,
      preview: '/themes/artistic-magazine-preview.jpg',
      thumbnail: '/themes/artistic-magazine-thumb.jpg',
      styles: {
        layout: 'magazine',
        columns: 4,
        spacing: 'normal',
        borderRadius: 'large',
        shadow: 'large',
        animation: 'rotate',
        hoverEffect: 'overlay'
      },
      colors: {
        primary: '#dc2626',
        secondary: '#991b1b',
        accent: '#f59e0b',
        background: '#fffbeb',
        surface: '#ffffff',
        text: '#1c1917',
        textSecondary: '#78716c',
        border: '#e7e5e4'
      },
      typography: {
        headingFont: 'Playfair Display',
        bodyFont: 'Source Sans Pro',
        headingSize: 'extra-large',
        bodySize: 'large',
        headingWeight: 700,
        bodyWeight: 400,
        lineHeight: 'loose'
      },
      components: {
        showTitles: true,
        showDescriptions: true,
        showTags: true,
        showDates: true,
        showCategories: true,
        showMetrics: false,
        showSharing: true,
        enableLightbox: true,
        enableFiltering: true,
        enableSorting: true
      },
      customizations: {
        headerStyle: 'split',
        navigationStyle: 'sidebar',
        footerStyle: 'detailed',
        loadingStyle: 'fade'
      }
    },
    {
      id: 'modern-carousel',
      name: 'Modern Carousel',
      description: 'Interactive carousel layout with smooth transitions',
      category: 'modern',
      isPremium: true,
      preview: '/themes/modern-carousel-preview.jpg',
      thumbnail: '/themes/modern-carousel-thumb.jpg',
      styles: {
        layout: 'carousel',
        columns: 3,
        spacing: 'loose',
        borderRadius: 'full',
        shadow: 'extra-large',
        animation: 'zoom',
        hoverEffect: 'glow'
      },
      colors: {
        primary: '#6366f1',
        secondary: '#4f46e5',
        accent: '#06b6d4',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        border: '#475569'
      },
      typography: {
        headingFont: 'Montserrat',
        bodyFont: 'Nunito',
        headingSize: 'large',
        bodySize: 'medium',
        headingWeight: 800,
        bodyWeight: 500,
        lineHeight: 'tight'
      },
      components: {
        showTitles: true,
        showDescriptions: false,
        showTags: true,
        showDates: false,
        showCategories: false,
        showMetrics: true,
        showSharing: true,
        enableLightbox: true,
        enableFiltering: false,
        enableSorting: false
      },
      customizations: {
        headerStyle: 'hero',
        navigationStyle: 'pills',
        footerStyle: 'none',
        loadingStyle: 'fade'
      }
    },
    {
      id: 'classic-portfolio',
      name: 'Classic Portfolio',
      description: 'Timeless design perfect for traditional portfolios',
      category: 'classic',
      isPremium: false,
      preview: '/themes/classic-portfolio-preview.jpg',
      thumbnail: '/themes/classic-portfolio-thumb.jpg',
      styles: {
        layout: 'grid',
        columns: 2,
        spacing: 'normal',
        borderRadius: 'small',
        shadow: 'medium',
        animation: 'fade',
        hoverEffect: 'lift'
      },
      colors: {
        primary: '#1f2937',
        secondary: '#374151',
        accent: '#9ca3af',
        background: '#ffffff',
        surface: '#f9fafb',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb'
      },
      typography: {
        headingFont: 'Georgia',
        bodyFont: 'Times New Roman',
        headingSize: 'medium',
        bodySize: 'medium',
        headingWeight: 600,
        bodyWeight: 400,
        lineHeight: 'normal'
      },
      components: {
        showTitles: true,
        showDescriptions: true,
        showTags: false,
        showDates: true,
        showCategories: true,
        showMetrics: false,
        showSharing: false,
        enableLightbox: true,
        enableFiltering: true,
        enableSorting: true
      },
      customizations: {
        headerStyle: 'minimal',
        navigationStyle: 'underline',
        footerStyle: 'minimal',
        loadingStyle: 'skeleton'
      }
    }
  ];

  private readonly TEMPLATES: PortfolioTemplate[] = [
    {
      id: 'audio-producer',
      name: 'Audio Producer Portfolio',
      description: 'Perfect for music producers and audio engineers',
      industry: ['Music', 'Audio', 'Entertainment'],
      skillTypes: ['Audio Production', 'Mixing', 'Mastering', 'Sound Design'],
      sampleContent: {
        title: 'Professional Audio Production',
        description: 'Bringing your musical vision to life with professional audio production, mixing, and mastering services.',
        categories: ['Beats', 'Mixing', 'Mastering', 'Sound Design'],
        sampleItems: [
          {
            title: 'Hip-Hop Beat Collection',
            description: 'Custom beats for modern hip-hop artists',
            type: 'audio',
            category: 'Beats',
            tags: ['hip-hop', 'trap', 'beats', 'custom']
          },
          {
            title: 'Podcast Mixing & Mastering',
            description: 'Professional audio treatment for podcast episodes',
            type: 'audio',
            category: 'Mixing',
            tags: ['podcast', 'mixing', 'mastering', 'voice']
          },
          {
            title: 'Commercial Sound Design',
            description: 'Sound effects and audio branding for commercials',
            type: 'audio',
            category: 'Sound Design',
            tags: ['commercial', 'sound-effects', 'branding']
          }
        ]
      },
      themeId: 'minimal-grid',
      isPopular: true,
      usageCount: 245
    },
    {
      id: 'graphic-designer',
      name: 'Graphic Designer Showcase',
      description: 'Visual portfolio for graphic designers and creatives',
      industry: ['Design', 'Marketing', 'Branding'],
      skillTypes: ['Logo Design', 'Web Design', 'Print Design', 'Branding'],
      sampleContent: {
        title: 'Creative Visual Solutions',
        description: 'Crafting memorable brand experiences through innovative graphic design and visual storytelling.',
        categories: ['Logos', 'Web Design', 'Print', 'Branding'],
        sampleItems: [
          {
            title: 'Tech Startup Logo Suite',
            description: 'Complete brand identity for emerging tech company',
            type: 'image',
            category: 'Logos',
            tags: ['logo', 'branding', 'tech', 'startup']
          },
          {
            title: 'E-commerce Website Design',
            description: 'Modern, conversion-focused web design',
            type: 'image',
            category: 'Web Design',
            tags: ['web-design', 'ecommerce', 'ui', 'modern']
          },
          {
            title: 'Event Poster Series',
            description: 'Eye-catching posters for music festival',
            type: 'image',
            category: 'Print',
            tags: ['poster', 'event', 'music', 'festival']
          }
        ]
      },
      themeId: 'creative-masonry',
      isPopular: true,
      usageCount: 387
    },
    {
      id: 'video-editor',
      name: 'Video Editor Reel',
      description: 'Video portfolio for editors and motion graphics artists',
      industry: ['Video', 'Film', 'Marketing', 'Entertainment'],
      skillTypes: ['Video Editing', 'Motion Graphics', 'Color Grading', 'Animation'],
      sampleContent: {
        title: 'Visual Storytelling Through Video',
        description: 'Professional video editing and motion graphics services for brands, creators, and filmmakers.',
        categories: ['Commercial', 'Social Media', 'Documentary', 'Motion Graphics'],
        sampleItems: [
          {
            title: 'Brand Commercial Edit',
            description: '30-second commercial for luxury fashion brand',
            type: 'video',
            category: 'Commercial',
            tags: ['commercial', 'fashion', 'luxury', 'editing']
          },
          {
            title: 'Instagram Reel Series',
            description: 'Viral-worthy content for social media campaigns',
            type: 'video',
            category: 'Social Media',
            tags: ['instagram', 'social-media', 'viral', 'short-form']
          },
          {
            title: 'Documentary Feature Edit',
            description: 'Long-form documentary storytelling',
            type: 'video',
            category: 'Documentary',
            tags: ['documentary', 'storytelling', 'long-form']
          }
        ]
      },
      themeId: 'modern-carousel',
      isPopular: true,
      usageCount: 156
    },
    {
      id: 'photographer',
      name: 'Photography Portfolio',
      description: 'Image-focused portfolio for photographers',
      industry: ['Photography', 'Events', 'Portrait', 'Commercial'],
      skillTypes: ['Portrait Photography', 'Event Photography', 'Product Photography', 'Editing'],
      sampleContent: {
        title: 'Capturing Moments That Matter',
        description: 'Professional photography services specializing in portraits, events, and commercial work.',
        categories: ['Portraits', 'Events', 'Products', 'Lifestyle'],
        sampleItems: [
          {
            title: 'Executive Portrait Session',
            description: 'Professional headshots for C-suite executives',
            type: 'image',
            category: 'Portraits',
            tags: ['portrait', 'executive', 'professional', 'headshot']
          },
          {
            title: 'Wedding Photography',
            description: 'Complete wedding day coverage',
            type: 'image',
            category: 'Events',
            tags: ['wedding', 'event', 'celebration', 'couples']
          },
          {
            title: 'Product Photography',
            description: 'E-commerce product photography for fashion brand',
            type: 'image',
            category: 'Products',
            tags: ['product', 'ecommerce', 'fashion', 'commercial']
          }
        ]
      },
      themeId: 'artistic-magazine',
      isPopular: true,
      usageCount: 298
    }
  ];

  private readonly CUSTOMIZATION_PRESETS: CustomizationPreset[] = [
    {
      id: 'dark-mode',
      name: 'Dark Mode',
      description: 'Dark theme variant for any layout',
      category: 'Color Schemes',
      settings: {
        colors: {
          primary: '#3b82f6',
          secondary: '#1e40af',
          accent: '#06b6d4',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f1f5f9',
          textSecondary: '#cbd5e1',
          border: '#475569'
        }
      },
      isUserCreated: false
    },
    {
      id: 'high-contrast',
      name: 'High Contrast',
      description: 'Accessibility-focused high contrast theme',
      category: 'Accessibility',
      settings: {
        colors: {
          primary: '#000000',
          secondary: '#333333',
          accent: '#0066cc',
          background: '#ffffff',
          surface: '#f5f5f5',
          text: '#000000',
          textSecondary: '#333333',
          border: '#000000'
        },
        styles: {
          borderRadius: 'none',
          shadow: 'large'
        }
      },
      isUserCreated: false
    },
    {
      id: 'compact-mobile',
      name: 'Mobile Compact',
      description: 'Optimized for mobile viewing',
      category: 'Mobile',
      settings: {
        styles: {
          columns: 2,
          spacing: 'tight',
          borderRadius: 'small'
        },
        typography: {
          headingSize: 'medium',
          bodySize: 'small'
        },
        components: {
          showDescriptions: false,
          showTags: false,
          showDates: false
        }
      },
      isUserCreated: false
    }
  ];

  getThemes(): PortfolioTheme[] {
    return this.DEFAULT_THEMES;
  }

  getTheme(themeId: string): PortfolioTheme | null {
    return this.DEFAULT_THEMES.find(theme => theme.id === themeId) || null;
  }

  getThemesByCategory(category: PortfolioTheme['category']): PortfolioTheme[] {
    return this.DEFAULT_THEMES.filter(theme => theme.category === category);
  }

  getFreeThemes(): PortfolioTheme[] {
    return this.DEFAULT_THEMES.filter(theme => !theme.isPremium);
  }

  getPremiumThemes(): PortfolioTheme[] {
    return this.DEFAULT_THEMES.filter(theme => theme.isPremium);
  }

  getTemplates(): PortfolioTemplate[] {
    return this.TEMPLATES;
  }

  getTemplate(templateId: string): PortfolioTemplate | null {
    return this.TEMPLATES.find(template => template.id === templateId) || null;
  }

  getTemplatesByIndustry(industry: string): PortfolioTemplate[] {
    return this.TEMPLATES.filter(template => 
      template.industry.some(ind => 
        ind.toLowerCase().includes(industry.toLowerCase())
      )
    );
  }

  getPopularTemplates(): PortfolioTemplate[] {
    return this.TEMPLATES.filter(template => template.isPopular);
  }

  getCustomizationPresets(): CustomizationPreset[] {
    return this.CUSTOMIZATION_PRESETS;
  }

  getPresetsByCategory(category: string): CustomizationPreset[] {
    return this.CUSTOMIZATION_PRESETS.filter(preset => preset.category === category);
  }

  applyTheme(baseTheme: PortfolioTheme, customizations?: Partial<PortfolioTheme>): PortfolioTheme {
    if (!customizations) return baseTheme;

    return {
      ...baseTheme,
      ...customizations,
      styles: { ...baseTheme.styles, ...customizations.styles },
      colors: { ...baseTheme.colors, ...customizations.colors },
      typography: { ...baseTheme.typography, ...customizations.typography },
      components: { ...baseTheme.components, ...customizations.components },
      customizations: { ...baseTheme.customizations, ...customizations.customizations }
    };
  }

  applyPreset(theme: PortfolioTheme, preset: CustomizationPreset): PortfolioTheme {
    return this.applyTheme(theme, preset.settings);
  }

  generateThemeCSS(theme: PortfolioTheme): string {
    return `
      :root {
        --portfolio-primary: ${theme.colors.primary};
        --portfolio-secondary: ${theme.colors.secondary};
        --portfolio-accent: ${theme.colors.accent};
        --portfolio-background: ${theme.colors.background};
        --portfolio-surface: ${theme.colors.surface};
        --portfolio-text: ${theme.colors.text};
        --portfolio-text-secondary: ${theme.colors.textSecondary};
        --portfolio-border: ${theme.colors.border};
        
        --portfolio-heading-font: ${theme.typography.headingFont};
        --portfolio-body-font: ${theme.typography.bodyFont};
        --portfolio-heading-weight: ${theme.typography.headingWeight};
        --portfolio-body-weight: ${theme.typography.bodyWeight};
        
        --portfolio-border-radius: ${this.getBorderRadiusValue(theme.styles.borderRadius)};
        --portfolio-shadow: ${this.getShadowValue(theme.styles.shadow)};
        --portfolio-spacing: ${this.getSpacingValue(theme.styles.spacing)};
      }
      
      .portfolio-grid {
        display: grid;
        grid-template-columns: repeat(${theme.styles.columns}, 1fr);
        gap: var(--portfolio-spacing);
        ${theme.styles.layout === 'masonry' ? 'grid-auto-rows: masonry;' : ''}
      }
      
      .portfolio-item {
        border-radius: var(--portfolio-border-radius);
        box-shadow: var(--portfolio-shadow);
        background: var(--portfolio-surface);
        border: 1px solid var(--portfolio-border);
        transition: all 0.3s ease;
      }
      
      .portfolio-item:hover {
        ${this.getHoverEffectCSS(theme.styles.hoverEffect)}
      }
      
      .portfolio-title {
        font-family: var(--portfolio-heading-font);
        font-weight: var(--portfolio-heading-weight);
        color: var(--portfolio-text);
        font-size: ${this.getFontSizeValue(theme.typography.headingSize)};
      }
      
      .portfolio-description {
        font-family: var(--portfolio-body-font);
        font-weight: var(--portfolio-body-weight);
        color: var(--portfolio-text-secondary);
        font-size: ${this.getFontSizeValue(theme.typography.bodySize)};
        line-height: ${this.getLineHeightValue(theme.typography.lineHeight)};
      }
    `;
  }

  private getBorderRadiusValue(borderRadius: PortfolioTheme['styles']['borderRadius']): string {
    const values = {
      none: '0',
      small: '0.25rem',
      medium: '0.5rem',
      large: '1rem',
      full: '9999px'
    };
    return values[borderRadius];
  }

  private getShadowValue(shadow: PortfolioTheme['styles']['shadow']): string {
    const values = {
      none: 'none',
      small: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      medium: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      large: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      'extra-large': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
    };
    return values[shadow];
  }

  private getSpacingValue(spacing: PortfolioTheme['styles']['spacing']): string {
    const values = {
      tight: '0.5rem',
      normal: '1rem',
      loose: '2rem'
    };
    return values[spacing];
  }

  private getHoverEffectCSS(hoverEffect: PortfolioTheme['styles']['hoverEffect']): string {
    const effects = {
      none: '',
      lift: 'transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);',
      glow: 'box-shadow: 0 0 20px var(--portfolio-primary);',
      border: 'border-color: var(--portfolio-primary);',
      overlay: 'position: relative; &::after { content: ""; position: absolute; inset: 0; background: var(--portfolio-primary); opacity: 0.1; }',
      scale: 'transform: scale(1.05);'
    };
    return effects[hoverEffect];
  }

  private getFontSizeValue(size: 'small' | 'medium' | 'large' | 'extra-large'): string {
    const values = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.25rem',
      'extra-large': '1.5rem'
    };
    return values[size];
  }

  private getLineHeightValue(lineHeight: PortfolioTheme['typography']['lineHeight']): string {
    const values = {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    };
    return values[lineHeight];
  }
}

export const portfolioThemeService = new PortfolioThemeService();
