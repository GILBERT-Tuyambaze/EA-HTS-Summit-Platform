import { useEffect } from 'react';

const useSmoothAnchorScroll = () => {
  useEffect(() => {
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    if (!anchors.length) return;

    const handleClick = (event: MouseEvent) => {
      const anchor = event.currentTarget as HTMLAnchorElement;
      const target = document.querySelector<HTMLElement>(anchor.hash);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    };

    anchors.forEach((anchor) => anchor.addEventListener('click', handleClick));
    return () => anchors.forEach((anchor) => anchor.removeEventListener('click', handleClick));
  }, []);
};

export default useSmoothAnchorScroll;
