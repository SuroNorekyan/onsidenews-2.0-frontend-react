export const scrollToTop = () => {
  // Small delay ensures scroll happens after DOM updates
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 500);
};
