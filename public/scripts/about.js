document.addEventListener('DOMContentLoaded', () => {
    const triggers = document.querySelectorAll('.expand-trigger');
    const contents = document.querySelectorAll('.expansion-content');
  
    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const targetId = trigger.getAttribute('data-target');
        const targetContent = document.getElementById(targetId);
  
        // Check if clicking an already active trigger (toggle off)
        const isActive = trigger.classList.contains('active');
  
        // Close all other sections
        triggers.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
  
        if (!isActive) {
          // Open the clicked section
          trigger.classList.add('active');
          targetContent.classList.add('active');
          
          // Smooth scroll to the expansion content if it's off-screen or for better UX
          setTimeout(() => {
              targetContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 300);
        }
      });
    });
  });
