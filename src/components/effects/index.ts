// Effects Components Index
export { 
  ScrollReveal, 
  FadeInOnScroll, 
  SlideUpOnScroll, 
  StaggerReveal 
} from './ScrollReveal';

export { 
  default as ScrollTrigger, 
  ScrollProgressTrigger, 
  ScrollVisibilityTrigger, 
  useScrollTrigger 
} from './ScrollTrigger';

export { 
  default as ParallaxSection, 
  ParallaxBackground, 
  ParallaxText, 
  ParallaxContainer 
} from './ParallaxSection';

export { 
  default as BackgroundEffects, 
  FloatingElements 
} from './BackgroundEffects';

// Re-export hooks for convenience
export { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
export { useScrollAnimation } from '@/hooks/useScrollAnimation';
export { useParallax, useElementParallax } from '@/hooks/useParallax';