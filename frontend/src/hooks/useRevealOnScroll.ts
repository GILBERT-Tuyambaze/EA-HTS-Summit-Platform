import { useEffect } from 'react';

const useRevealOnScroll = (callback?: (element: HTMLElement) => void) => {
  useEffect(() => {
    const revealedElements = new WeakSet<HTMLElement>();

    // If user prefers reduced motion, reveal everything immediately
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll<HTMLElement>('.reveal').forEach((element) => {
        element.classList.add('visible');
        callback?.(element);
      });
      return;
    }

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
        threshold: 0.08,
        rootMargin: '0px 0px -20px 0px',
      },
    );

    const observeElement = (element: HTMLElement) => {
      if (revealedElements.has(element)) return;

      // Check if element is already within the viewport on mount/appearance
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < windowHeight && rect.bottom > 0) {
        revealedElements.add(element);
        element.classList.add('visible');
        callback?.(element);
        return;
      }

      observer.observe(element);
    };

    // Observe initial static elements
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    elements.forEach(observeElement);

    // Watch for dynamically added .reveal elements (such as async partners, data updates)
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.classList.contains('reveal')) {
              observeElement(node);
            }
            node.querySelectorAll<HTMLElement>('.reveal').forEach(observeElement);
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, [callback]);
};

export default useRevealOnScroll;
