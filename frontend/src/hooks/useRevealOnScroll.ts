import { useEffect } from 'react';

const useRevealOnScroll = (callback?: (element: HTMLElement) => void) => {
  useEffect(() => {
    const revealedElements = new WeakSet<HTMLElement>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          if (revealedElements.has(element)) return;
          revealedElements.add(element);
          element.classList.add('visible');
          callback?.(element);
          observer.unobserve(element);
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      },
    );

    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, [callback]);
};

export default useRevealOnScroll;
