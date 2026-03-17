document.addEventListener('DOMContentLoaded', () => {
    const scrollToWorksBtn = document.getElementById('scroll-to-works');
    const backToTopBtn = document.getElementById('back-to-top');
    const worksSection = document.getElementById('works');
    const landingSection = document.getElementById('landing');

    if (scrollToWorksBtn && worksSection) {
        scrollToWorksBtn.addEventListener('click', () => {
            worksSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Use scroll listener to toggle the back-to-top button
        // This is more reliable for showing the button after a certain scroll depth
        const handleScroll = () => {
            if (window.scrollY > window.innerHeight * 0.5) {
                backToTopBtn.classList.remove('hidden');
            } else {
                backToTopBtn.classList.add('hidden');
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check initial state
    }
});
