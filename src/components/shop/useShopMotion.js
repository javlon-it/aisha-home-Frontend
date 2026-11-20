import {useEffect, useRef} from 'react';

const revealSelector = [
  '.aisha-page-header',
  '.aisha-catalog-toolbar',
  '.aisha-results-heading',
  '.aisha-cart-item',
  '.aisha-order-summary',
  '.aisha-empty-state',
  '.aisha-loading-state',
  '.aisha-error-state',
  '.aisha-product-photo',
  '.aisha-product-information',
  '.aisha-order-card',
  '.aisha-detail-card',
  '.aisha-order-skeleton',
  '.aisha-checkout-form',
  '.home-categories .home-section-heading',
  '.home-category-card',
  '.home-featured > .home-section-heading',
  '.home-featured .catalog-card',
  '.home-shopping-heading',
  '.home-shopping-steps > li',
  '.home-brand-story .home-story-image',
  '.home-brand-story .home-story-copy',
  '.home-final-cta',
  '.catalog-section > .eyebrow',
  '.catalog-section > h1',
  '.catalog-section > p',
  '.catalog-toolbar',
  '.catalog-filters',
  '.catalog-result-heading',
  '.catalog-grid > .catalog-card',
  '.product-layout .product-photo',
  '.product-layout > div:last-child',
  '.product-details',
  '.order-item',
  '.checkout-grid > *',
  '.catalog-section > .order-summary',
  '.order-detail > h1',
  '.order-detail > p',
  '.catalog-section > .empty-state',
  '.catalog-section > [role="alert"]',
  '.catalog-section > [role="status"]',
  '.shop-footer',
].join(',');

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useShopMotion(pathname) {
  const mainRef = useRef(null);
  const previousPath = useRef(pathname);

  useEffect(() => {
    const main = mainRef.current;
    if (!main || previousPath.current === pathname) return undefined;

    previousPath.current = pathname;
    if (reducedMotion()) return undefined;

    main.classList.remove('aisha-route-enter');
    void main.offsetWidth;
    main.classList.add('aisha-route-enter');
    return undefined;
  }, [pathname]);

  useEffect(() => {
    const root = mainRef.current;
    const footer = document.querySelector('.shop-footer');
    if (!root) return undefined;

    let intersectionObserver;
    let mutationObserver;
    let disposed = false;
    let scrollFrame = 0;
    const pending = new Set();

    const showIfInView = (element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        element.classList.add('aisha-motion-visible');
        element.classList.remove('aisha-motion-pending');
        intersectionObserver?.unobserve(element);
        pending.delete(element);
      }
    };

    const reveal = (element) => {
      if (element.classList.contains('aisha-motion-item')) return;
      element.classList.add('aisha-motion-item');
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
        element.classList.add('aisha-motion-visible');
        return;
      }
      element.classList.add('aisha-motion-pending');
      pending.add(element);
      intersectionObserver.observe(element);
    };

    const collect = (node) => {
      if (!(node instanceof Element)) return;
      if (node.matches(revealSelector)) reveal(node);
      node.querySelectorAll(revealSelector).forEach(reveal);
    };

    const revealNearViewport = () => {
      scrollFrame = 0;
      if (document.visibilityState === 'hidden' || !pending.size) return;
      pending.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top > window.innerHeight + 120 || rect.bottom < -120) return;
        element.classList.add('aisha-motion-visible');
        element.classList.remove('aisha-motion-pending');
        intersectionObserver?.unobserve(element);
        pending.delete(element);
      });
    };

    const onScroll = () => {
      if (!scrollFrame && pending.size) scrollFrame = window.requestAnimationFrame(revealNearViewport);
    };

    const connect = () => {
      if (disposed || document.visibilityState === 'hidden') return;
      if (reducedMotion() || !('IntersectionObserver' in window)) {
        pending.forEach((element) => element.classList.remove('aisha-motion-pending', 'aisha-motion-item'));
        pending.clear();
        intersectionObserver?.disconnect();
        mutationObserver?.disconnect();
        intersectionObserver = undefined;
        mutationObserver = undefined;
        return;
      }

      try {
        if (!intersectionObserver) {
          intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(({isIntersecting, target}) => {
              if (!isIntersecting) return;
              target.classList.add('aisha-motion-visible');
              target.classList.remove('aisha-motion-pending');
              intersectionObserver.unobserve(target);
              pending.delete(target);
            });
          }, {threshold: 0.12, rootMargin: '120px 0px'});

          collect(root);
          collect(footer);
          mutationObserver = new MutationObserver((records) => {
            records.forEach(({addedNodes}) => addedNodes.forEach(collect));
          });
          mutationObserver.observe(root, {childList: true, subtree: true});
        }

        pending.forEach(showIfInView);
      } catch {
        pending.forEach((element) => element.classList.remove('aisha-motion-pending', 'aisha-motion-item'));
        pending.clear();
        intersectionObserver?.disconnect();
        mutationObserver?.disconnect();
        intersectionObserver = undefined;
        mutationObserver = undefined;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') connect();
    };
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionPreferenceChange = () => connect();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('scroll', onScroll, {passive: true});
    motionPreference.addEventListener?.('change', onMotionPreferenceChange);
    connect();

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('scroll', onScroll);
      motionPreference.removeEventListener?.('change', onMotionPreferenceChange);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      intersectionObserver?.disconnect();
      mutationObserver?.disconnect();
      pending.forEach((element) => element.classList.remove('aisha-motion-pending', 'aisha-motion-item'));
    };
  }, []);

  return mainRef;
}
