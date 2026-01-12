'use client';

export default function infiniteScroll(
  listing: HTMLElement,
  callback: () => void,
): () => void {
  const offset = 24;
  let ticking = false;
  function scrollListener(): void {
    const load =
      listing.scrollTop + listing.clientHeight >= listing.scrollHeight - offset;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (load) {
          callback();
        }
        ticking = false;
      });

      ticking = true;
    }
  }

  listing.addEventListener('scroll', scrollListener, { passive: true });

  return () => listing.removeEventListener('scroll', scrollListener);
}
