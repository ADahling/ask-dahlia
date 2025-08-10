export interface HeroImage {
  src: string;
  lqip: string; // Low Quality Image Placeholder (base64)
  alt: string;
  objectPosition: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  defaultOverlay?: number;
  defaultBloom?: number;
}

export const heroImages: Record<string, HeroImage> = {
  'minimal-dark': {
    src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2874&auto=format&fit=crop',
    lqip: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQQG/8QAGBAAAwEBAAAAAAAAAAAAAAAAAAECEUH/2gAMAwEAAhEDEQA/AJupfqnHcrGKNJQP0mNyHHwfD9eCUGUCtBcJZNg//9k=',
    alt: 'Clean minimalist workspace',
    objectPosition: {
      mobile: 'center center',
      tablet: 'center center',
      desktop: 'center center'
    },
    defaultOverlay: 0.65,
    defaultBloom: 0.08
  },
  'abstract-gradient': {
    src: 'https://images.unsplash.com/photo-1636955816868-fcb881e57954?q=80&w=2940&auto=format&fit=crop',
    lqip: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQMG/8QAGBAAAwEBAAAAAAAAAAAAAAAAAAECEUH/2gAMAwEAAhEDEQA/AJoqhGjHSLJJGH6q18p+Y+H7QJRYTqKpCEhOlOvP/9k=',
    alt: 'Abstract gradient background',
    objectPosition: {
      mobile: 'center center',
      tablet: 'center center',
      desktop: 'center center'
    },
    defaultOverlay: 0.55,
    defaultBloom: 0.12
  },
  'geometric-pattern': {
    src: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2940&auto=format&fit=crop',
    lqip: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQQG/8QAGBAAAwEBAAAAAAAAAAAAAAAAAAECEUH/2gAMAwEAAhEDEQA/AJwqpHlHcrGKNJQP0mNyHHwfD9eCUGUCtBcJZNg//9k=',
    alt: 'Geometric pattern design',
    objectPosition: {
      mobile: 'center center',
      tablet: 'center center',
      desktop: 'center center'
    },
    defaultOverlay: 0.60,
    defaultBloom: 0.10
  },
  'solid-gradient': {
    src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23000000"/><stop offset="50%" style="stop-color:%23111111"/><stop offset="100%" style="stop-color:%23000000"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23grad)"/></svg>',
    lqip: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAUG/8QAGBAAAwEBAAAAAAAAAAAAAAAAAAECEUH/2gAMAwEAAhEDEQA/AJwqmGnGZLGKNJQP0mNyHHwfD9eCUGUCtBcJZNg//9k=',
    alt: 'Solid gradient background',
    objectPosition: {
      mobile: 'center center',
      tablet: 'center center',
      desktop: 'center center'
    },
    defaultOverlay: 0.40,
    defaultBloom: 0.15
  }
};

export const defaultHeroImage = 'minimal-dark';

export const getHeroImage = (variant?: string): HeroImage => {
  return heroImages[variant || defaultHeroImage] || heroImages[defaultHeroImage];
};
