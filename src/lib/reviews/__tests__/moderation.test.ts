import { moderateReview, moderateReviewText, moderateReviewRating } from '../moderation';

describe('Review Moderation', () => {
  describe('moderateReviewText', () => {
    it('approves appropriate text', () => {
      const result = moderateReviewText('Great service, very professional and timely delivery!');
      expect(result.isAppropriate).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.flags).toHaveLength(0);
    });

    it('flags inappropriate text', () => {
      const result = moderateReviewText('This is spam spam spam with terrible quality');
      expect(result.isAppropriate).toBe(false);
      expect(result.flags.length).toBeGreaterThan(0);
    });

    it('flags text that is too short', () => {
      const result = moderateReviewText('Bad');
      expect(result.flags).toContain('Review too short');
    });

    it('flags excessive punctuation', () => {
      const result = moderateReviewText('Amazing service!!!!!!! So good!!!!!!!');
      expect(result.flags).toContain('Excessive punctuation');
    });
  });

  describe('moderateReviewRating', () => {
    it('flags rating-text mismatch (high rating, negative text)', () => {
      const result = moderateReviewRating(5, 'This was terrible and awful service');
      expect(result.isAppropriate).toBe(false);
      expect(result.flags).toContain('High rating with negative text');
    });

    it('flags rating-text mismatch (low rating, positive text)', () => {
      const result = moderateReviewRating(1, 'Amazing and excellent service, love it!');
      expect(result.isAppropriate).toBe(false);
      expect(result.flags).toContain('Low rating with positive text');
    });

    it('approves consistent rating and text', () => {
      const result = moderateReviewRating(5, 'Excellent service, very professional');
      expect(result.isAppropriate).toBe(true);
    });
  });

  describe('moderateReview', () => {
    it('approves good review', () => {
      const result = moderateReview({
        rating: 5,
        text: 'Excellent service with professional delivery. Highly recommended!',
        authorId: 'user123'
      });
      expect(result.isAppropriate).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('flags problematic review', () => {
      const result = moderateReview({
        rating: 5,
        text: 'Bad terrible spam',
        authorId: 'user123'
      });
      expect(result.isAppropriate).toBe(false);
      expect(result.flags.length).toBeGreaterThan(0);
    });
  });
});