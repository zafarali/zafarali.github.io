document.addEventListener('DOMContentLoaded', () => {
    const introContainer = document.querySelector('.animating-intro-text');
    const triggers = document.querySelectorAll('.expand-trigger');
    const contents = document.querySelectorAll('.expansion-content');
    const backTrigger = document.querySelector('.back-trigger');

    // Utility to wrap text nodes in spans for animation
    function wrapWords(element) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        textNodes.forEach(node => {
            if (!node.nodeValue.trim()) return;
            // Split by words but preserve punctuation attached to words.
            const words = node.nodeValue.split(/(\s+)/);
            const fragment = document.createDocumentFragment();
            words.forEach(word => {
                if (word.trim()) {
                    const span = document.createElement('span');
                    span.className = 'word';
                    span.textContent = word;
                    fragment.appendChild(span);
                } else {
                    fragment.appendChild(document.createTextNode(word));
                }
            });
            node.parentNode.replaceChild(fragment, node);
        });
    }

    // Pre-wrap words in the intro container and all expansion contents
    if (introContainer) {
        wrapWords(introContainer);
    }
    
    contents.forEach(content => {
        wrapWords(content.querySelector('.expansion-inner'));
    });

    let isExpanded = false;
    let currentActiveTrigger = null;

    function handleExpand(trigger) {
        if (isExpanded) return;
        isExpanded = true;
        currentActiveTrigger = trigger;

        const targetId = trigger.getAttribute('data-target');
        const targetContent = document.getElementById(targetId).querySelector('.expansion-inner');
        
        // Disable pointer events on back trigger during animation
        if (backTrigger) backTrigger.style.pointerEvents = 'none';
        
        // FLIP: First
        const firstRect = trigger.getBoundingClientRect();
        
        // Hide all original intro words randomly
        const introWords = introContainer.querySelectorAll('.word, .expand-trigger:not(.active)');
        introWords.forEach(word => {
            if (word === trigger) return; // Keep our active trigger visible
            word.style.transitionDelay = `${Math.random() * 0.25}s`;
            word.classList.add('word-hide');
        });

        const activeContainer = document.createElement('span');
        activeContainer.className = 'active-expansion';
        
        // Copy inner contents to activeContainer.
        // The original design uses <p> tags, but since we are inserting into <h1> inline, 
        // we'll replace <p> tags with inline blocks and breaks.
        const paragraphs = targetContent.querySelectorAll('p');
        paragraphs.forEach((p, index) => {
            const pSpan = document.createElement('span');
            pSpan.className = 'expansion-p';
            pSpan.innerHTML = p.innerHTML; // Copies the newly wrapped span.word
            if (index > 0) {
                activeContainer.appendChild(document.createElement('br'));
                activeContainer.appendChild(document.createElement('br'));
            }
            activeContainer.appendChild(pSpan);
        });

        // Add a slight delay to let intro hide gracefully
        setTimeout(() => {
            introContainer.style.display = 'none';
            introContainer.parentNode.insertBefore(activeContainer, introContainer.nextSibling);

            // Hide the active expansion container words initially
            const targetWords = activeContainer.querySelectorAll('.word');
            targetWords.forEach(w => {
                w.classList.add('word-hide');
                w.style.transitionDelay = '0s'; // reset delay
            });

            // Patch our trigger into the new text replacing the matching anchor word
            const triggerText = trigger.textContent.trim().toLowerCase();
            let matchedWordSpan = null;
            
            for (let word of targetWords) {
                // Strip punctuation when matching
                const cleanedWord = word.textContent.trim().toLowerCase().replace(/[.,!?;:]/g, '');
                if (cleanedWord === triggerText || word.textContent.trim().toLowerCase() === triggerText) {
                    matchedWordSpan = word;
                    break;
                }
            }
            
            trigger.classList.add('active');

            if (matchedWordSpan) {
                // Keep punctuation from original word if present, maybe append to trigger?
                // For simplicity, just replace it.
                matchedWordSpan.parentNode.replaceChild(trigger, matchedWordSpan);
                trigger.classList.remove('word-hide');
            } else {
                // Fallback: insert at the beginning of the first paragraph
                const firstP = activeContainer.querySelector('.expansion-p');
                if (firstP) firstP.insertBefore(trigger, firstP.firstChild);
            }

            // FLIP: Last
            const lastRect = trigger.getBoundingClientRect();
            
            // FLIP: Invert
            const deltaX = firstRect.left - lastRect.left;
            const deltaY = firstRect.top - lastRect.top;
            const scaleX = firstRect.width / (lastRect.width || 1);
            const scaleY = firstRect.height / (lastRect.height || 1);
            
            trigger.style.transition = 'none';
            trigger.style.transformOrigin = 'top left';
            trigger.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
            
            // Force reflow
            trigger.getBoundingClientRect();
            
            // FLIP: Play
            trigger.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            trigger.style.transform = 'translate(0, 0) scale(1, 1)';

            // Wait until FLIP completes to allow re-expanding back
            setTimeout(() => {
                 if (backTrigger) backTrigger.style.pointerEvents = 'auto';
            }, 600);

            // Typewriter Fade In the rest of the words around the trigger
            let delay = 0.2; // Start after short delay
            targetWords.forEach(w => {
                if (w !== matchedWordSpan) {
                    setTimeout(() => {
                        w.classList.remove('word-hide');
                    }, delay * 1000);
                    delay += 0.04;
                }
            });

        }, 350);
    }
    
    function handleReset() {
        if (!isExpanded || !currentActiveTrigger) return;
        isExpanded = false;
        
        if (backTrigger) backTrigger.style.pointerEvents = 'none';

        const activeContainer = document.querySelector('.active-expansion');
        if (!activeContainer) return;
        
        const trigger = currentActiveTrigger;
        trigger.classList.remove('active');
        
        // FLIP: First (from the expanded position)
        const firstRect = trigger.getBoundingClientRect();
        
        // Hide the expanded words smoothly
        const expandedWords = activeContainer.querySelectorAll('.word');
        expandedWords.forEach(w => {
            w.style.transitionDelay = `${Math.random() * 0.15}s`;
            w.classList.add('word-hide');
        });

        setTimeout(() => {
            // Restore intro container visibility
            introContainer.style.display = 'inline';
            
            activeContainer.remove();

            // Put trigger back where it belongs
            if (trigger._placeholder) {
                trigger._placeholder.parentNode.insertBefore(trigger, trigger._placeholder);
            }

            // FLIP: Last (back to original layout)
            const lastRect = trigger.getBoundingClientRect();
            const deltaX = firstRect.left - lastRect.left;
            const deltaY = firstRect.top - lastRect.top;
            const scaleX = firstRect.width / (lastRect.width || 1);
            const scaleY = firstRect.height / (lastRect.height || 1);
            
            trigger.style.transition = 'none';
            trigger.style.transformOrigin = 'top left';
            trigger.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
            
            // Force reflow
            trigger.getBoundingClientRect();
            
            // FLIP: Play
            trigger.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            trigger.style.transform = 'translate(0, 0) scale(1, 1)';
            
            // Fade the intro words back in randomly
            const introWords = introContainer.querySelectorAll('.word, .expand-trigger');
            introWords.forEach(w => {
                w.style.transitionDelay = `${Math.random() * 0.3 + 0.1}s`;
                w.classList.remove('word-hide');
            });
            
            currentActiveTrigger = null;
            
            setTimeout(() => {
                 if (backTrigger) backTrigger.style.pointerEvents = 'auto';
            }, 500);
        }, 300);
    }

    triggers.forEach(trigger => {
        const placeholder = document.createElement('span');
        placeholder.className = 'trigger-placeholder';
        placeholder.style.display = 'none';
        trigger.parentNode.insertBefore(placeholder, trigger);
        trigger._placeholder = placeholder;

        trigger.addEventListener('click', () => {
            if (!isExpanded) {
                handleExpand(trigger);
            }
        });
    });

    if (backTrigger) {
        backTrigger.addEventListener('click', handleReset);
    }
});
