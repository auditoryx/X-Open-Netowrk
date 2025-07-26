/**
 * Review moderation utilities
 */

const INAPPROPRIATE_WORDS = [
  // Common inappropriate words (basic list)
  'spam', 'fake', 'scam', 'terrible', 'worst', 'horrible', 'awful',
  'hate', 'stupid', 'dumb', 'useless', 'worthless'
  // Add more as needed
];

const SPAM_PATTERNS = [
  /(.)\1{4,}/, // Repeated characters (aaaaa)
  /^[A-Z\s!]{10,}$/, // All caps
  /(http|www\.|@)/i, // URLs or emails
  /\b(\d{3}[\-\.\s]?\d{3}[\-\.\s]?\d{4})\b/, // Phone numbers
];

export interface ModerationResult {
  isAppropriate: boolean;
  confidence: number;
  flags: string[];
  suggestions?: string[];
}

/**
 * Analyze review text for inappropriate content
 */
export function moderateReviewText(text: string): ModerationResult {
  const flags: string[] = [];
  let confidence = 1.0;

  // Check for inappropriate words
  const lowerText = text.toLowerCase();
  const foundInappropriateWords = INAPPROPRIATE_WORDS.filter(word => 
    lowerText.includes(word)
  );
  
  if (foundInappropriateWords.length > 0) {
    flags.push(`Contains inappropriate words: ${foundInappropriateWords.join(', ')}`);
    confidence -= INAPPROPRIATE_WORD_PENALTY * foundInappropriateWords.length; // Penalize more for multiple bad words
  }

  // Check for spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      flags.push('Contains spam patterns');
      confidence -= INAPPROPRIATE_WORD_PENALTY;
      break;
    }
  }

  // Check text length (too short or too long)
  if (text.trim().length < 10) {
    flags.push('Review too short');
    confidence -= 0.2;
  } else if (text.length > 1000) {
    flags.push('Review too long');
    confidence -= 0.1;
  }

  // Check for excessive punctuation
  const punctuationCount = (text.match(/[!?]/g) || []).length;
  if (punctuationCount > 5) {
    flags.push('Excessive punctuation');
    confidence -= 0.1;
  }

  return {
    isAppropriate: confidence > 0.5,
    confidence: Math.max(0, confidence),
    flags,
    suggestions: flags.length > 0 ? [
      'Consider revising your review to be more constructive',
      'Focus on specific aspects of the service',
      'Keep your review professional and helpful'
    ] : undefined
  };
}

/**
 * Analyze review rating for suspicious patterns
 */
export function moderateReviewRating(rating: number, text: string): ModerationResult {
  const flags: string[] = [];
  let confidence = 1.0;

  // Check for rating-text mismatch
  const lowerText = text.toLowerCase();
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible'];

  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

  if (rating >= 4 && negativeCount > positiveCount) {
    flags.push('High rating with negative text');
    confidence -= 0.3;
  } else if (rating <= 2 && positiveCount > negativeCount) {
    flags.push('Low rating with positive text');
    confidence -= 0.3;
  }

  return {
    isAppropriate: confidence > 0.7,
    confidence: Math.max(0, confidence),
    flags
  };
}

/**
 * Comprehensive review moderation
 */
export function moderateReview(review: {
  rating: number;
  text: string;
  authorId?: string;
}): ModerationResult {
  const textResult = moderateReviewText(review.text);
  const ratingResult = moderateReviewRating(review.rating, review.text);

  const combinedFlags = [...textResult.flags, ...ratingResult.flags];
  const averageConfidence = (textResult.confidence + ratingResult.confidence) / 2;

  return {
    isAppropriate: textResult.isAppropriate && ratingResult.isAppropriate,
    confidence: averageConfidence,
    flags: combinedFlags,
    suggestions: textResult.suggestions
  };
}