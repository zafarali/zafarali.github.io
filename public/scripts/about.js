document.addEventListener('DOMContentLoaded', () => {
    const introContainer = document.querySelector('.animating-intro-text');
    const triggers = document.querySelectorAll('.expand-trigger');
    const contents = document.querySelectorAll('.expansion-content');
    const backTrigger = document.querySelector('.back-trigger');

    // Utility to wrap text nodes in spans for animation
    function wrapWords(element) {
        const textNodes = [];
        const aTags = [];
        
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
            acceptNode: function(node) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'A') {
                        return NodeFilter.FILTER_REJECT; // Don't look inside A tags
                    }
                    if (node.classList.contains('trigger-target') || node.classList.contains('expand-trigger')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }, false);
        
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        const elementWalker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, {
            acceptNode: function(node) {
                if (node.tagName === 'A') return NodeFilter.FILTER_ACCEPT;
                return NodeFilter.FILTER_SKIP;
            }
        }, false);
        
        let el;
        while(el = elementWalker.nextNode()) {
            aTags.push(el);
        }

        textNodes.forEach(node => {
            if (!node.nodeValue.trim()) return;
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
        
        aTags.forEach(a => {
            a.classList.add('word');
        });
    }

    if (introContainer) {
        wrapWords(introContainer);
    }

    let isExpanded = false;
    let currentActiveTrigger = null;

    function handleExpand(trigger) {
        if (isExpanded) return;
        isExpanded = true;
        currentActiveTrigger = trigger;

        const targetId = trigger.getAttribute('data-target');
        const targetContent = document.getElementById(targetId).querySelector('.expansion-inner');
        
        if (backTrigger) backTrigger.style.pointerEvents = 'none';
        
        // FLIP: First
        const firstRect = trigger.getBoundingClientRect();
        
        const introWords = introContainer.querySelectorAll('.word, .expand-trigger:not(.active)');
        introWords.forEach(word => {
            if (word === trigger) return;
            word.style.transitionDelay = `${Math.random() * 0.25}s`;
            word.classList.add('word-hide');
        });

        const activeContainer = document.createElement('span');
        activeContainer.className = 'active-expansion';
        
        const paragraphs = targetContent.querySelectorAll('p');
        paragraphs.forEach((p, index) => {
            const pSpan = document.createElement('span');
            pSpan.className = 'expansion-p';
            pSpan.innerHTML = p.innerHTML; 
            if (index > 0) {
                activeContainer.appendChild(document.createElement('br'));
                activeContainer.appendChild(document.createElement('br'));
            }
            activeContainer.appendChild(pSpan);
        });

        // Search for the trigger text inside activeContainer to place the original button
        const triggerText = trigger.textContent.trim();
        const textWalker = document.createTreeWalker(activeContainer, NodeFilter.SHOW_TEXT, null, false);
        let matchedTarget = null;
        let tNode;
        while (tNode = textWalker.nextNode()) {
            const idx = tNode.nodeValue.toLowerCase().indexOf(triggerText.toLowerCase());
            if (idx !== -1) {
                const span = document.createElement('span');
                span.className = 'trigger-target';
                const val = tNode.nodeValue;
                const before = val.substring(0, idx);
                const after = val.substring(idx + triggerText.length);
                
                const parent = tNode.parentNode;
                if (before) parent.insertBefore(document.createTextNode(before), tNode);
                parent.insertBefore(span, tNode);
                if (after) parent.insertBefore(document.createTextNode(after), tNode);
                
                parent.removeChild(tNode);
                matchedTarget = span;
                break;
            }
        }

        wrapWords(activeContainer);

        setTimeout(() => {
            introContainer.style.display = 'none';
            introContainer.parentNode.insertBefore(activeContainer, introContainer.nextSibling);

            const targetWords = activeContainer.querySelectorAll('.word');
            targetWords.forEach(w => {
                w.classList.add('word-hide');
                w.style.transitionDelay = '0s';
            });

            trigger.classList.add('active');

            if (matchedTarget) {
                matchedTarget.parentNode.replaceChild(trigger, matchedTarget);
                trigger.classList.remove('word-hide');
            } else {
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
            
            trigger.getBoundingClientRect();
            
            // FLIP: Play
            trigger.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            trigger.style.transform = 'translate(0, 0) scale(1, 1)';

            setTimeout(() => {
                 if (backTrigger) backTrigger.style.pointerEvents = 'auto';
            }, 600);

            let delay = 0.2;
            targetWords.forEach(w => {
                setTimeout(() => {
                    w.classList.remove('word-hide');
                }, delay * 1000);
                delay += 0.04;
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
        
        const firstRect = trigger.getBoundingClientRect();
        
        const expandedWords = activeContainer.querySelectorAll('.word');
        expandedWords.forEach(w => {
            w.style.transitionDuration = '0.2s';
            w.style.transitionDelay = `${Math.random() * 0.1}s`;
            w.classList.add('word-hide');
        });

        setTimeout(() => {
            introContainer.style.display = 'inline';
            activeContainer.remove();

            if (trigger._placeholder) {
                trigger._placeholder.parentNode.insertBefore(trigger, trigger._placeholder);
            }

            const lastRect = trigger.getBoundingClientRect();
            const deltaX = firstRect.left - lastRect.left;
            const deltaY = firstRect.top - lastRect.top;
            const scaleX = firstRect.width / (lastRect.width || 1);
            const scaleY = firstRect.height / (lastRect.height || 1);
            
            trigger.style.transition = 'none';
            trigger.style.transformOrigin = 'top left';
            trigger.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
            
            trigger.getBoundingClientRect();
            
            trigger.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            trigger.style.transform = 'translate(0, 0) scale(1, 1)';
            
            const introWords = introContainer.querySelectorAll('.word, .expand-trigger');
            introWords.forEach(w => {
                w.style.transitionDuration = '0.3s';
                w.style.transitionDelay = `${Math.random() * 0.3 + 0.1}s`;
                w.classList.remove('word-hide');
            });
            
            currentActiveTrigger = null;
            
            setTimeout(() => {
                 if (backTrigger) backTrigger.style.pointerEvents = 'auto';
            }, 500);
        }, 200);
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
