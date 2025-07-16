import { CaseStudy } from './caseStudyService';

export interface ContentAnalysis {
  overallScore: number; // 0-100
  strengths: string[];
  improvements: string[];
  categories: {
    clarity: { score: number; feedback: string };
    engagement: { score: number; feedback: string };
    professionalism: { score: number; feedback: string };
    completeness: { score: number; feedback: string };
    visualImpact: { score: number; feedback: string };
  };
  recommendations: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    implementation: string;
  }[];
  seoOptimization: {
    score: number;
    keywords: string[];
    suggestions: string[];
  };
  readabilityScore: number;
  estimatedReadTime: string;
}

export interface PortfolioOptimization {
  portfolioScore: number;
  categoryBalance: { [category: string]: number };
  diversityScore: number;
  qualityScore: number;
  recommendations: {
    addMoreOf: string[];
    improveAreas: string[];
    featuredSuggestions: string[];
  };
}

class ContentAnalysisService {
  // Analyze a single case study
  async analyzeCaseStudy(caseStudy: CaseStudy): Promise<ContentAnalysis> {
    try {
      // Calculate individual category scores
      const clarity = this.analyzeClarityScore(caseStudy);
      const engagement = this.analyzeEngagementScore(caseStudy);
      const professionalism = this.analyzeProfessionalismScore(caseStudy);
      const completeness = this.analyzeCompletenessScore(caseStudy);
      const visualImpact = this.analyzeVisualImpactScore(caseStudy);

      // Calculate overall score
      const overallScore = (
        clarity.score + 
        engagement.score + 
        professionalism.score + 
        completeness.score + 
        visualImpact.score
      ) / 5;

      // Generate recommendations
      const recommendations = this.generateRecommendations(caseStudy, {
        clarity,
        engagement,
        professionalism,
        completeness,
        visualImpact
      });

      // SEO analysis
      const seoOptimization = this.analyzeSEO(caseStudy);

      // Readability analysis
      const readabilityScore = this.calculateReadabilityScore(caseStudy);
      const estimatedReadTime = this.calculateReadTime(caseStudy);

      // Identify strengths and improvements
      const { strengths, improvements } = this.identifyStrengthsAndImprovements({
        clarity,
        engagement,
        professionalism,
        completeness,
        visualImpact
      });

      return {
        overallScore: Math.round(overallScore),
        strengths,
        improvements,
        categories: {
          clarity,
          engagement,
          professionalism,
          completeness,
          visualImpact
        },
        recommendations,
        seoOptimization,
        readabilityScore,
        estimatedReadTime
      };
    } catch (error) {
      console.error('Error analyzing case study:', error);
      throw new Error('Failed to analyze case study content');
    }
  }

  // Analyze entire portfolio
  async analyzePortfolio(caseStudies: CaseStudy[]): Promise<PortfolioOptimization> {
    try {
      // Calculate portfolio metrics
      const portfolioScore = this.calculatePortfolioScore(caseStudies);
      const categoryBalance = this.analyzeCategoryBalance(caseStudies);
      const diversityScore = this.calculateDiversityScore(caseStudies);
      const qualityScore = this.calculateQualityScore(caseStudies);

      // Generate recommendations
      const recommendations = this.generatePortfolioRecommendations(
        caseStudies,
        categoryBalance,
        diversityScore,
        qualityScore
      );

      return {
        portfolioScore,
        categoryBalance,
        diversityScore,
        qualityScore,
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing portfolio:', error);
      throw new Error('Failed to analyze portfolio');
    }
  }

  // Content optimization suggestions
  async getOptimizationSuggestions(content: string, type: 'title' | 'description' | 'challenge' | 'solution'): Promise<{
    suggestions: string[];
    score: number;
    improvements: string[];
  }> {
    try {
      const suggestions = this.generateContentSuggestions(content, type);
      const score = this.scoreContent(content, type);
      const improvements = this.identifyContentImprovements(content, type);

      return {
        suggestions,
        score,
        improvements
      };
    } catch (error) {
      console.error('Error generating optimization suggestions:', error);
      return {
        suggestions: [],
        score: 0,
        improvements: []
      };
    }
  }

  // Auto-generate tags based on content
  generateTags(caseStudy: CaseStudy): string[] {
    const content = [
      caseStudy.title,
      caseStudy.description,
      caseStudy.challenge,
      caseStudy.solution,
      caseStudy.results
    ].join(' ').toLowerCase();

    const keywords = this.extractKeywords(content);
    const industryTags = this.identifyIndustryTags(content);
    const skillTags = this.identifySkillTags(content);

    return [...new Set([...keywords, ...industryTags, ...skillTags])].slice(0, 10);
  }

  // Private helper methods
  private analyzeClarityScore(caseStudy: CaseStudy): { score: number; feedback: string } {
    let score = 70; // Base score
    let feedback = '';

    // Check for clear problem statement
    if (caseStudy.challenge && caseStudy.challenge.length > 50) {
      score += 10;
    } else {
      feedback += 'Add a clearer problem statement. ';
    }

    // Check for clear solution description
    if (caseStudy.solution && caseStudy.solution.length > 100) {
      score += 10;
    } else {
      feedback += 'Expand on your solution description. ';
    }

    // Check for clear results
    if (caseStudy.results && caseStudy.results.length > 50) {
      score += 10;
    } else {
      feedback += 'Provide clearer results and outcomes. ';
    }

    if (!feedback) {
      feedback = 'Content is clear and well-structured.';
    }

    return { score: Math.min(100, score), feedback: feedback.trim() };
  }

  private analyzeEngagementScore(caseStudy: CaseStudy): { score: number; feedback: string } {
    let score = 60; // Base score
    let feedback = '';

    // Check for engaging title
    if (caseStudy.title.length > 10 && caseStudy.title.length < 80) {
      score += 15;
    } else {
      feedback += 'Optimize title length (10-80 characters). ';
    }

    // Check for storytelling elements
    if (this.hasStorytellingElements(caseStudy)) {
      score += 15;
    } else {
      feedback += 'Add more storytelling elements. ';
    }

    // Check for client testimonial
    if (caseStudy.testimonial?.quote) {
      score += 10;
    } else {
      feedback += 'Include client testimonial for credibility. ';
    }

    if (!feedback) {
      feedback = 'Content is engaging and compelling.';
    }

    return { score: Math.min(100, score), feedback: feedback.trim() };
  }

  private analyzeProfessionalismScore(caseStudy: CaseStudy): { score: number; feedback: string } {
    let score = 75; // Base score
    let feedback = '';

    // Check for professional language
    if (this.usesProfessionalLanguage(caseStudy)) {
      score += 10;
    } else {
      feedback += 'Use more professional language. ';
    }

    // Check for metrics and data
    if (caseStudy.metrics && Object.keys(caseStudy.metrics).length > 0) {
      score += 15;
    } else {
      feedback += 'Include quantifiable metrics and data. ';
    }

    if (!feedback) {
      feedback = 'Content maintains high professional standards.';
    }

    return { score: Math.min(100, score), feedback: feedback.trim() };
  }

  private analyzeCompletenessScore(caseStudy: CaseStudy): { score: number; feedback: string } {
    let score = 0;
    let feedback = '';
    const missingElements = [];

    // Required elements check
    if (caseStudy.title) score += 10;
    else missingElements.push(SCHEMA_FIELDS.BOOKING.TITLE);

    if (caseStudy.description) score += 15;
    else missingElements.push(SCHEMA_FIELDS.SERVICE.DESCRIPTION);

    if (caseStudy.challenge) score += 20;
    else missingElements.push('challenge');

    if (caseStudy.solution) score += 20;
    else missingElements.push('solution');

    if (caseStudy.results) score += 20;
    else missingElements.push('results');

    if (caseStudy.afterImages && caseStudy.afterImages.length > 0) score += 15;
    else missingElements.push('result images');

    if (missingElements.length > 0) {
      feedback = `Missing: ${missingElements.join(', ')}.`;
    } else {
      feedback = 'Case study is complete with all essential elements.';
    }

    return { score, feedback };
  }

  private analyzeVisualImpactScore(caseStudy: CaseStudy): { score: number; feedback: string } {
    let score = 30; // Base score
    let feedback = '';

    const totalImages = (caseStudy.beforeImages?.length || 0) + 
                       (caseStudy.afterImages?.length || 0) + 
                       (caseStudy.processImages?.length || 0);

    // Image quantity check
    if (totalImages >= 5) {
      score += 25;
    } else if (totalImages >= 3) {
      score += 15;
    } else if (totalImages >= 1) {
      score += 10;
    } else {
      feedback += 'Add more visual content. ';
    }

    // Before/after comparison
    if (caseStudy.beforeImages?.length && caseStudy.afterImages?.length) {
      score += 20;
    } else {
      feedback += 'Include before/after comparison. ';
    }

    // Process documentation
    if (caseStudy.processImages?.length) {
      score += 15;
    } else {
      feedback += 'Show your process with images. ';
    }

    // Video content
    if (caseStudy.videoUrl) {
      score += 10;
    } else {
      feedback += 'Consider adding a demo video. ';
    }

    if (!feedback) {
      feedback = 'Excellent visual presentation and documentation.';
    }

    return { score: Math.min(100, score), feedback: feedback.trim() };
  }

  private generateRecommendations(
    caseStudy: CaseStudy, 
    scores: any
  ): ContentAnalysis['recommendations'] {
    const recommendations = [];

    // Title optimization
    if (caseStudy.title.length < 20) {
      recommendations.push({
        title: 'Enhance Title',
        description: 'Make your title more descriptive and engaging',
        priority: 'high' as const,
        implementation: 'Include the problem solved and outcome achieved in your title'
      });
    }

    // Visual content
    const totalImages = (caseStudy.beforeImages?.length || 0) + 
                       (caseStudy.afterImages?.length || 0) + 
                       (caseStudy.processImages?.length || 0);
    
    if (totalImages < 3) {
      recommendations.push({
        title: 'Add More Visuals',
        description: 'Increase visual impact with more images',
        priority: 'high' as const,
        implementation: 'Upload before/after images, process shots, and final results'
      });
    }

    // Metrics
    if (!caseStudy.metrics || Object.keys(caseStudy.metrics).length === 0) {
      recommendations.push({
        title: 'Include Metrics',
        description: 'Add quantifiable results and data',
        priority: 'medium' as const,
        implementation: 'Include project duration, budget, ROI, or performance improvements'
      });
    }

    // Testimonial
    if (!caseStudy.testimonial?.quote) {
      recommendations.push({
        title: 'Add Client Testimonial',
        description: 'Include client feedback for credibility',
        priority: 'medium' as const,
        implementation: 'Request and add a quote from your satisfied client'
      });
    }

    return recommendations;
  }

  private analyzeSEO(caseStudy: CaseStudy): ContentAnalysis['seoOptimization'] {
    const content = [
      caseStudy.title,
      caseStudy.description,
      caseStudy.challenge,
      caseStudy.solution,
      caseStudy.results
    ].join(' ');

    const keywords = this.extractKeywords(content);
    const score = this.calculateSEOScore(caseStudy);
    const suggestions = this.generateSEOSuggestions(caseStudy);

    return {
      score,
      keywords: keywords.slice(0, 10),
      suggestions
    };
  }

  private calculateReadabilityScore(caseStudy: CaseStudy): number {
    const content = [
      caseStudy.description,
      caseStudy.challenge,
      caseStudy.solution,
      caseStudy.results
    ].join(' ');

    // Simplified readability calculation
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;

    // Score based on average sentence length (optimal: 15-20 words)
    if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
      return 90;
    } else if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) {
      return 75;
    } else {
      return 60;
    }
  }

  private calculateReadTime(caseStudy: CaseStudy): string {
    const content = [
      caseStudy.title,
      caseStudy.description,
      caseStudy.challenge,
      caseStudy.solution,
      caseStudy.results
    ].join(' ');

    const words = content.split(/\s+/).length;
    const readingSpeed = 200; // words per minute
    const minutes = Math.ceil(words / readingSpeed);

    return `${minutes} min read`;
  }

  // Additional helper methods
  private identifyStrengthsAndImprovements(scores: any): { strengths: string[]; improvements: string[] } {
    const strengths = [];
    const improvements = [];

    Object.entries(scores).forEach(([category, data]: [string, any]) => {
      if (data.score >= 80) {
        strengths.push(`Strong ${category}: ${data.feedback}`);
      } else if (data.score < 60) {
        improvements.push(`Improve ${category}: ${data.feedback}`);
      }
    });

    return { strengths, improvements };
  }

  private calculatePortfolioScore(caseStudies: CaseStudy[]): number {
    if (caseStudies.length === 0) return 0;

    const totalScore = caseStudies.reduce((sum, cs) => {
      // Simplified scoring based on completeness
      let score = 0;
      if (cs.title) score += 10;
      if (cs.description) score += 15;
      if (cs.challenge) score += 20;
      if (cs.solution) score += 20;
      if (cs.results) score += 20;
      if (cs.afterImages?.length) score += 15;
      return sum + score;
    }, 0);

    return Math.round(totalScore / (caseStudies.length * 100) * 100);
  }

  private analyzeCategoryBalance(caseStudies: CaseStudy[]): { [category: string]: number } {
    const categories = caseStudies.reduce((acc, cs) => {
      acc[cs.category] = (acc[cs.category] || 0) + 1;
      return acc;
    }, {} as { [category: string]: number });

    return categories;
  }

  private calculateDiversityScore(caseStudies: CaseStudy[]): number {
    const categories = new Set(caseStudies.map(cs => cs.category));
    const uniqueCategories = categories.size;
    
    // Score based on category diversity
    if (uniqueCategories >= 4) return 100;
    if (uniqueCategories >= 3) return 80;
    if (uniqueCategories >= 2) return 60;
    return 40;
  }

  private calculateQualityScore(caseStudies: CaseStudy[]): number {
    if (caseStudies.length === 0) return 0;

    const publishedStudies = caseStudies.filter(cs => cs.status === 'published');
    const avgViews = publishedStudies.reduce((sum, cs) => sum + cs.views, 0) / publishedStudies.length;
    const avgLikes = publishedStudies.reduce((sum, cs) => sum + cs.likes, 0) / publishedStudies.length;

    // Simplified quality score based on engagement
    return Math.min(100, (avgViews + avgLikes * 2) / 2);
  }

  private generatePortfolioRecommendations(
    caseStudies: CaseStudy[],
    categoryBalance: { [category: string]: number },
    diversityScore: number,
    qualityScore: number
  ): PortfolioOptimization['recommendations'] {
    const addMoreOf = [];
    const improveAreas = [];
    const featuredSuggestions = [];

    // Diversity recommendations
    if (diversityScore < 80) {
      addMoreOf.push('Different project categories to show versatility');
    }

    // Quality recommendations
    if (qualityScore < 60) {
      improveAreas.push('Visual presentation and content quality');
    }

    // Featured suggestions
    const topPerforming = caseStudies
      .filter(cs => cs.status === 'published')
      .sort((a, b) => (b.views + b.likes * 2) - (a.views + a.likes * 2))
      .slice(0, 3);

    topPerforming.forEach(cs => {
      if (!cs.isFeatured) {
        featuredSuggestions.push(cs.title);
      }
    });

    return {
      addMoreOf,
      improveAreas,
      featuredSuggestions
    };
  }

  // Simple helper implementations
  private hasStorytellingElements(caseStudy: CaseStudy): boolean {
    const content = [caseStudy.description, caseStudy.challenge, caseStudy.solution].join(' ');
    const storytellingWords = ['discovered', 'realized', 'overcame', 'achieved', 'transformed', 'journey'];
    return storytellingWords.some(word => content.toLowerCase().includes(word));
  }

  private usesProfessionalLanguage(caseStudy: CaseStudy): boolean {
    const content = [caseStudy.description, caseStudy.challenge, caseStudy.solution].join(' ');
    const professionalWords = ['strategy', 'implementation', 'optimization', 'analysis', 'solution'];
    return professionalWords.some(word => content.toLowerCase().includes(word));
  }

  private extractKeywords(content: string): string[] {
    // Simple keyword extraction (in production, use a proper NLP library)
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'have', 'will', 'been', 'from', 'they', 'were'].includes(word));

    const frequency = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as { [word: string]: number });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private identifyIndustryTags(content: string): string[] {
    const industries = ['technology', 'healthcare', 'finance', 'education', 'retail', 'manufacturing'];
    return industries.filter(industry => content.includes(industry));
  }

  private identifySkillTags(content: string): string[] {
    const skills = ['design', 'development', 'marketing', 'consulting', 'photography', 'writing'];
    return skills.filter(skill => content.includes(skill));
  }

  private generateContentSuggestions(content: string, type: string): string[] {
    // Simplified content suggestions
    const suggestions = [];
    
    if (content.length < 50) {
      suggestions.push('Expand content with more detail');
    }
    
    if (type === 'title' && content.length > 80) {
      suggestions.push('Shorten title for better readability');
    }
    
    return suggestions;
  }

  private scoreContent(content: string, type: string): number {
    // Simplified content scoring
    let score = 70;
    
    if (content.length > 50) score += 15;
    if (content.length > 100) score += 15;
    
    return Math.min(100, score);
  }

  private identifyContentImprovements(content: string, type: string): string[] {
    const improvements = [];
    
    if (content.length < 30) {
      improvements.push('Add more descriptive content');
    }
    
    return improvements;
  }

  private calculateSEOScore(caseStudy: CaseStudy): number {
    let score = 50;
    
    if (caseStudy.title.length >= 30 && caseStudy.title.length <= 60) score += 15;
    if (caseStudy.description.length >= 150) score += 15;
    if (caseStudy.tags.length >= 3) score += 20;
    
    return Math.min(100, score);
  }

  private generateSEOSuggestions(caseStudy: CaseStudy): string[] {
    const suggestions = [];
    
    if (caseStudy.title.length < 30) {
      suggestions.push('Expand title with descriptive keywords');
    }
    
    if (caseStudy.tags.length < 5) {
      suggestions.push('Add more relevant tags');
    }
    
    return suggestions;
  }
}

export const contentAnalysisService = new ContentAnalysisService();
