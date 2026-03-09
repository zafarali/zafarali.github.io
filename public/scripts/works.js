document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('work-overlay');
    const overlayBody = overlay.querySelector('.overlay-body');
    const closeBtn = overlay.querySelector('.close-btn');
    const tiles = document.querySelectorAll('.work-tile');

    let activeId = null;

    const openOverlay = (id) => {
        const template = document.getElementById(`content-${id}`);
        if (!template) return;

        if (overlay.classList.contains('active')) {
            // Transition between contents
            overlayBody.style.opacity = '0';
            setTimeout(() => {
                overlayBody.innerHTML = template.innerHTML;
                overlayBody.style.opacity = '1';
            }, 200);
        } else {
            overlayBody.innerHTML = template.innerHTML;
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
