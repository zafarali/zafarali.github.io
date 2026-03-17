document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('work-overlay');
    const overlayBody = overlay.querySelector('.overlay-body');
    const closeBtn = overlay.querySelector('.close-btn');
    const tiles = document.querySelectorAll('.work-tile');

    let activeId = null;
    let currentSlideIndex = 0;

    const showSlide = (container, index) => {
        const slides = container.querySelectorAll('.slide');
        const dots = container.querySelectorAll('.dot');
        if (!slides.length) return;
        if (index >= slides.length) currentSlideIndex = 0;
        if (index < 0) currentSlideIndex = slides.length - 1;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[currentSlideIndex].classList.add('active');
        if (dots[currentSlideIndex]) dots[currentSlideIndex].classList.add('active');
    };

    overlayBody.addEventListener('click', (e) => {
        const container = e.target.closest('.project-slideshow');
        if (!container) return;

        if (e.target.closest('.prev-slide')) {
            currentSlideIndex--;
            showSlide(container, currentSlideIndex);
        } else if (e.target.closest('.next-slide')) {
            currentSlideIndex++;
            showSlide(container, currentSlideIndex);
        } else if (e.target.closest('.dot')) {
            currentSlideIndex = parseInt(e.target.dataset.index, 10);
            showSlide(container, currentSlideIndex);
        }
    });

    const openOverlay = (id) => {
        const template = document.getElementById(`content-${id}`);
        if (!template) return;

        currentSlideIndex = 0;

        if (overlay.classList.contains('active')) {
            // Transition between contents
            overlayBody.style.opacity = '0';
            setTimeout(() => {
                overlayBody.innerHTML = template.innerHTML;
                const container = overlayBody.querySelector('.project-slideshow');
                if (container) showSlide(container, 0);
                overlayBody.style.opacity = '1';
            }, 200);
        } else {
            overlayBody.innerHTML = template.innerHTML;
            const container = overlayBody.querySelector('.project-slideshow');
            if (container) showSlide(container, 0);
            overlay.classList.add('active');
        }
        activeId = id;
    };

    const closeOverlay = () => {
        overlay.classList.remove('active');
        activeId = null;
    };

    tiles.forEach(tile => {
        tile.addEventListener('click', (e) => {
            e.preventDefault();
            const id = tile.dataset.id;
            if (id === activeId) {
                closeOverlay();
            } else {
                openOverlay(id);
            }
        });
    });

    closeBtn.addEventListener('click', closeOverlay);

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOverlay();
    });
});
