(() => {
  const root = document.querySelector('#dynamic-work');
  if (!root) return;

  const prepareImages = () => {
    root.querySelectorAll('.gallery img').forEach((image) => {
      image.loading = 'eager';
      image.decoding = 'sync';
      image.fetchPriority = 'high';
    });
  };

  prepareImages();
  new MutationObserver(prepareImages).observe(root, { childList: true, subtree: true });
})();
