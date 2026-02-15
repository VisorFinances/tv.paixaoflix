// Advanced Navigation System for D-Pad, Keyboard, and Touch
class NavigationSystem {
    constructor() {
        this.currentFocus = null;
        this.focusableElements = [];
        this.sections = [];
        this.currentSection = 0;
        this.currentRow = 0;
        this.currentCol = 0;
        this.isNavigating = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.longPressTimer = null;
        
        this.init();
    }
    
    init() {
        this.setupFocusableElements();
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();
        this.setupDPadNavigation();
        this.setupAccessibility();
        this.setupAutoFocus();
        
        console.log('🎮 Sistema de navegação inicializado');
    }
    
    setupFocusableElements() {
        // Find all focusable elements
        this.updateFocusableElements();
        
        // Watch for dynamic content changes
        const observer = new MutationObserver(() => {
            this.updateFocusableElements();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    updateFocusableElements() {
        this.focusableElements = Array.from(document.querySelectorAll('.focusable, button, [tabindex="0"]'));
        this.sections = this.groupElementsBySection();
        
        // Remove elements that are hidden or disabled
        this.focusableElements = this.focusableElements.filter(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && 
                   style.visibility !== 'hidden' && 
                   !el.disabled &&
                   el.offsetParent !== null;
        });
    }
    
    groupElementsBySection() {
        const sections = {};
        
        this.focusableElements.forEach(element => {
            const section = element.closest('.content-section, .hero-section, .sidebar-nav, .main-header');
            if (section) {
                const sectionId = section.id || section.className;
                if (!sections[sectionId]) {
                    sections[sectionId] = [];
                }
                sections[sectionId].push(element);
            }
        });
        
        return sections;
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Prevent default for navigation keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', ' '].includes(e.key)) {
                e.preventDefault();
            }
            
            switch (e.key) {
                case 'ArrowUp':
                    this.navigateUp();
                    break;
                case 'ArrowDown':
                    this.navigateDown();
                    break;
                case 'ArrowLeft':
                    this.navigateLeft();
                    break;
                case 'ArrowRight':
                    this.navigateRight();
                    break;
                case 'Tab':
                    this.navigateNext(e.shiftKey);
                    break;
                case 'Enter':
                case ' ':
                    this.activateCurrent();
                    break;
                case 'Escape':
                    this.navigateBack();
                    break;
                case 'Home':
                    this.navigateToBeginning();
                    break;
                case 'End':
                    this.navigateToEnd();
                    break;
                case 'PageUp':
                    this.navigatePageUp();
                    break;
                case 'PageDown':
                    this.navigatePageDown();
                    break;
            }
        });
    }
    
    setupTouchNavigation() {
        let touchStartTime = 0;
        let lastTouchTime = 0;
        
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            
            // Start long press timer
            this.longPressTimer = setTimeout(() => {
                this.handleLongPress(e);
            }, 500);
        });
        
        document.addEventListener('touchmove', (e) => {
            // Clear long press timer if finger moves
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        });
        
        document.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            
            // Clear long press timer
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
            
            // Handle double tap
            if (touchEndTime - lastTouchTime < 300) {
                this.handleDoubleTap(e);
            }
            
            lastTouchTime = touchEndTime;
            
            // Handle swipe if it was a quick touch
            if (touchDuration < 300) {
                this.handleSwipe(e);
            }
        });
    }
    
    setupDPadNavigation() {
        // Gamepad support for Smart TVs and gaming controllers
        window.addEventListener('gamepadconnected', (e) => {
            console.log('🎮 Gamepad conectado:', e.gamepad.id);
            this.setupGamepadLoop();
        });
        
        // Custom D-pad events for Smart TVs
        window.addEventListener('dpadup', () => this.navigateUp());
        window.addEventListener('dpaddown', () => this.navigateDown());
        window.addEventListener('dpadleft', () => this.navigateLeft());
        window.addEventListener('dpadright', () => this.navigateRight());
        window.addEventListener('dpadcenter', () => this.activateCurrent());
        window.addEventListener('dpadback', () => this.navigateBack());
    }
    
    setupGamepadLoop() {
        const gamepadLoop = () => {
            const gamepads = navigator.getGamepads();
            
            for (let i = 0; i < gamepads.length; i++) {
                const gamepad = gamepads[i];
                if (!gamepad) continue;
                
                // D-pad navigation
                if (gamepad.axes[0] < -0.5) this.navigateLeft();
                if (gamepad.axes[0] > 0.5) this.navigateRight();
                if (gamepad.axes[1] < -0.5) this.navigateUp();
                if (gamepad.axes[1] > 0.5) this.navigateDown();
                
                // Button navigation
                if (gamepad.buttons[0].pressed) this.activateCurrent(); // A button
                if (gamepad.buttons[1].pressed) this.navigateBack(); // B button
                if (gamepad.buttons[12].pressed) this.navigateUp(); // D-pad up
                if (gamepad.buttons[13].pressed) this.navigateDown(); // D-pad down
                if (gamepad.buttons[14].pressed) this.navigateLeft(); // D-pad left
                if (gamepad.buttons[15].pressed) this.navigateRight(); // D-pad right
            }
            
            requestAnimationFrame(gamepadLoop);
        };
        
        gamepadLoop();
    }
    
    setupAccessibility() {
        // Screen reader support
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch (e.key) {
                    case 'ArrowUp':
                        this.navigateUp();
                        break;
                    case 'ArrowDown':
                        this.navigateDown();
                        break;
                    case 'ArrowLeft':
                        this.navigateLeft();
                        break;
                    case 'ArrowRight':
                        this.navigateRight();
                        break;
                }
            }
        });
        
        // Voice control support (if available)
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.setupVoiceControl();
        }
    }
    
    setupVoiceControl() {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'pt-BR';
            
            recognition.onresult = (event) => {
                const last = event.results.length - 1;
                const command = event.results[last][0].transcript.toLowerCase();
                
                this.handleVoiceCommand(command);
            };
            
            // Start voice control on specific trigger
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'v') {
                    recognition.start();
                    console.log('🎤 Controle por voz ativado');
                }
            });
            
        } catch (error) {
            console.log('Controle por voz não suportado');
        }
    }
    
    setupAutoFocus() {
        // Auto-focus first element when page loads
        window.addEventListener('load', () => {
            const firstFocusable = this.focusableElements[0];
            if (firstFocusable) {
                this.focusElement(firstFocusable);
            }
        });
        
        // Auto-focus when modal opens
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('active')) {
                        const firstFocusable = node.querySelector('.focusable, button, [tabindex="0"]');
                        if (firstFocusable) {
                            setTimeout(() => this.focusElement(firstFocusable), 100);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Navigation methods
    navigateUp() {
        if (this.isNavigating) return;
        this.isNavigating = true;
        
        const current = this.getCurrentFocus();
        if (!current) {
            this.focusFirstInCurrentSection();
            this.isNavigating = false;
            return;
        }
        
        // Try to find element above
        const above = this.findElementAbove(current);
        if (above) {
            this.focusElement(above);
        } else {
            // Try to go to previous section
            this.navigateToPreviousSection();
        }
        
        setTimeout(() => this.isNavigating = false, 100);
    }
    
    navigateDown() {
        if (this.isNavigating) return;
        this.isNavigating = true;
        
        const current = this.getCurrentFocus();
        if (!current) {
            this.focusFirstInCurrentSection();
            this.isNavigating = false;
            return;
        }
        
        // Try to find element below
        const below = this.findElementBelow(current);
        if (below) {
            this.focusElement(below);
        } else {
            // Try to go to next section
            this.navigateToNextSection();
        }
        
        setTimeout(() => this.isNavigating = false, 100);
    }
    
    navigateLeft() {
        if (this.isNavigating) return;
        this.isNavigating = true;
        
        const current = this.getCurrentFocus();
        if (!current) {
            this.focusFirstInCurrentSection();
            this.isNavigating = false;
            return;
        }
        
        // Try to find element to the left
        const left = this.findElementLeft(current);
        if (left) {
            this.focusElement(left);
        } else {
            // Try to scroll horizontally in category rows
            this.scrollHorizontal(current, 'left');
        }
        
        setTimeout(() => this.isNavigating = false, 100);
    }
    
    navigateRight() {
        if (this.isNavigating) return;
        this.isNavigating = true;
        
        const current = this.getCurrentFocus();
        if (!current) {
            this.focusFirstInCurrentSection();
            this.isNavigating = false;
            return;
        }
        
        // Try to find element to the right
        const right = this.findElementRight(current);
        if (right) {
            this.focusElement(right);
        } else {
            // Try to scroll horizontally in category rows
            this.scrollHorizontal(current, 'right');
        }
        
        setTimeout(() => this.isNavigating = false, 100);
    }
    
    navigateNext(reverse = false) {
        const currentIndex = this.focusableElements.indexOf(this.getCurrentFocus());
        let nextIndex;
        
        if (reverse) {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : this.focusableElements.length - 1;
        } else {
            nextIndex = currentIndex < this.focusableElements.length - 1 ? currentIndex + 1 : 0;
        }
        
        if (this.focusableElements[nextIndex]) {
            this.focusElement(this.focusableElements[nextIndex]);
        }
    }
    
    navigateBack() {
        // Close modals, go back in history, or escape current context
        const modal = document.querySelector('.video-modal.active, .series-modal.active');
        if (modal) {
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) closeBtn.click();
            return;
        }
        
        // Try to go back in browser history
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Focus first element as fallback
            this.focusFirstInCurrentSection();
        }
    }
    
    navigateToBeginning() {
        const currentSection = this.getCurrentSection();
        if (currentSection && currentSection.length > 0) {
            this.focusElement(currentSection[0]);
        }
    }
    
    navigateToEnd() {
        const currentSection = this.getCurrentSection();
        if (currentSection && currentSection.length > 0) {
            this.focusElement(currentSection[currentSection.length - 1]);
        }
    }
    
    navigatePageUp() {
        this.navigateUp();
        this.navigateUp();
        this.navigateUp();
    }
    
    navigatePageDown() {
        this.navigateDown();
        this.navigateDown();
        this.navigateDown();
    }
    
    // Helper methods
    getCurrentFocus() {
        return document.activeElement;
    }
    
    getCurrentSection() {
        const current = this.getCurrentFocus();
        if (!current) return null;
        
        const section = current.closest('.content-section, .hero-section, .sidebar-nav, .main-header');
        if (!section) return null;
        
        const sectionId = section.id || section.className;
        return this.sections[sectionId] || [];
    }
    
    findElementAbove(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top;
        
        let closestElement = null;
        let closestDistance = Infinity;
        
        this.focusableElements.forEach(el => {
            if (el === element) return;
            
            const elRect = el.getBoundingClientRect();
            if (elRect.bottom >= centerY) return; // Element is below or at the same level
            
            const elCenterX = elRect.left + elRect.width / 2;
            const elCenterY = elRect.bottom;
            
            const distance = Math.sqrt(
                Math.pow(centerX - elCenterX, 2) + 
                Math.pow(centerY - elCenterY, 2)
            );
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestElement = el;
            }
        });
        
        return closestElement;
    }
    
    findElementBelow(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.bottom;
        
        let closestElement = null;
        let closestDistance = Infinity;
        
        this.focusableElements.forEach(el => {
            if (el === element) return;
            
            const elRect = el.getBoundingClientRect();
            if (elRect.top <= centerY) return; // Element is above or at the same level
            
            const elCenterX = elRect.left + elRect.width / 2;
            const elCenterY = elRect.top;
            
            const distance = Math.sqrt(
                Math.pow(centerX - elCenterX, 2) + 
                Math.pow(centerY - elCenterY, 2)
            );
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestElement = el;
            }
        });
        
        return closestElement;
    }
    
    findElementLeft(element) {
        const rect = element.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const leftX = rect.left;
        
        let closestElement = null;
        let closestDistance = Infinity;
        
        this.focusableElements.forEach(el => {
            if (el === element) return;
            
            const elRect = el.getBoundingClientRect();
            if (elRect.right >= leftX) return; // Element is to the right or at the same level
            
            const elCenterY = elRect.top + elRect.height / 2;
            const elRightX = elRect.right;
            
            const distance = Math.sqrt(
                Math.pow(leftX - elRightX, 2) + 
                Math.pow(centerY - elCenterY, 2)
            );
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestElement = el;
            }
        });
        
        return closestElement;
    }
    
    findElementRight(element) {
        const rect = element.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const rightX = rect.right;
        
        let closestElement = null;
        let closestDistance = Infinity;
        
        this.focusableElements.forEach(el => {
            if (el === element) return;
            
            const elRect = el.getBoundingClientRect();
            if (elRect.left <= rightX) return; // Element is to the left or at the same level
            
            const elCenterY = elRect.top + elRect.height / 2;
            const elLeftX = elRect.left;
            
            const distance = Math.sqrt(
                Math.pow(rightX - elLeftX, 2) + 
                Math.pow(centerY - elCenterY, 2)
            );
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestElement = el;
            }
        });
        
        return closestElement;
    }
    
    scrollHorizontal(element, direction) {
        const categoryRow = element.closest('.category-row');
        if (!categoryRow) return;
        
        const scrollAmount = 200;
        if (direction === 'left') {
            categoryRow.scrollLeft -= scrollAmount;
        } else {
            categoryRow.scrollLeft += scrollAmount;
        }
    }
    
    navigateToPreviousSection() {
        const sections = Object.keys(this.sections);
        const currentSectionElement = this.getCurrentFocus()?.closest('.content-section');
        
        if (!currentSectionElement) return;
        
        const currentSectionId = currentSectionElement.id;
        const currentIndex = sections.indexOf(currentSectionId);
        
        if (currentIndex > 0) {
            const previousSectionId = sections[currentIndex - 1];
            const previousSection = this.sections[previousSectionId];
            
            if (previousSection && previousSection.length > 0) {
                this.focusElement(previousSection[0]);
            }
        }
    }
    
    navigateToNextSection() {
        const sections = Object.keys(this.sections);
        const currentSectionElement = this.getCurrentFocus()?.closest('.content-section');
        
        if (!currentSectionElement) return;
        
        const currentSectionId = currentSectionElement.id;
        const currentIndex = sections.indexOf(currentSectionId);
        
        if (currentIndex < sections.length - 1) {
            const nextSectionId = sections[currentIndex + 1];
            const nextSection = this.sections[nextSectionId];
            
            if (nextSection && nextSection.length > 0) {
                this.focusElement(nextSection[0]);
            }
        }
    }
    
    focusFirstInCurrentSection() {
        const currentSection = this.getCurrentSection();
        if (currentSection && currentSection.length > 0) {
            this.focusElement(currentSection[0]);
        }
    }
    
    focusElement(element) {
        if (!element) return;
        
        // Remove focus from current element
        if (this.currentFocus) {
            this.currentFocus.classList.remove('focused');
        }
        
        // Focus new element
        element.focus();
        element.classList.add('focused');
        this.currentFocus = element;
        
        // Scroll element into view
        this.scrollIntoView(element);
        
        // Announce to screen readers
        this.announceToScreenReader(element);
    }
    
    scrollIntoView(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        
        // Check if element is partially or fully outside viewport
        const needsVerticalScroll = rect.top < 0 || rect.bottom > windowHeight;
        const needsHorizontalScroll = rect.left < 0 || rect.right > windowWidth;
        
        if (needsVerticalScroll || needsHorizontalScroll) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: needsVerticalScroll ? 'center' : 'nearest',
                inline: needsHorizontalScroll ? 'center' : 'nearest'
            });
        }
    }
    
    announceToScreenReader(element) {
        const announcement = element.textContent || element.alt || element.title || 'Elemento focado';
        
        // Create live region for screen reader announcements
        let liveRegion = document.getElementById('navigation-announcements');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'navigation-announcements';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.cssText = `
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            `;
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = announcement;
    }
    
    activateCurrent() {
        const current = this.getCurrentFocus();
        if (current) {
            current.click();
        }
    }
    
    // Touch and gesture handlers
    handleSwipe(e) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = touchEndX - this.touchStartX;
        const deltaY = touchEndY - this.touchStartY;
        
        const swipeThreshold = 50;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > swipeThreshold) {
                if (deltaX > 0) {
                    this.navigateRight();
                } else {
                    this.navigateLeft();
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > swipeThreshold) {
                if (deltaY > 0) {
                    this.navigateDown();
                } else {
                    this.navigateUp();
                }
            }
        }
    }
    
    handleDoubleTap(e) {
        this.activateCurrent();
    }
    
    handleLongPress(e) {
        // Show context menu or special options
        const current = this.getCurrentFocus();
        if (current) {
            // Trigger long press event
            current.dispatchEvent(new CustomEvent('longpress', {
                bubbles: true,
                detail: { element: current }
            }));
        }
    }
    
    handleVoiceCommand(command) {
        console.log('🎤 Comando de voz:', command);
        
        // Simple voice commands
        if (command.includes('cima') || command.includes('subir')) {
            this.navigateUp();
        } else if (command.includes('baixo') || command.includes('descer')) {
            this.navigateDown();
        } else if (command.includes('esquerda')) {
            this.navigateLeft();
        } else if (command.includes('direita')) {
            this.navigateRight();
        } else if (command.includes('selecionar') || command.includes('ok')) {
            this.activateCurrent();
        } else if (command.includes('voltar') || command.includes('sair')) {
            this.navigateBack();
        } else if (command.includes('pesquisar') || command.includes('buscar')) {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }
    }
    
    // Public methods
    addFocusableElement(element) {
        if (!element.classList.contains('focusable')) {
            element.classList.add('focusable');
        }
        this.updateFocusableElements();
    }
    
    removeFocusableElement(element) {
        element.classList.remove('focusable');
        this.updateFocusableElements();
    }
    
    setFocusSection(sectionId) {
        const section = this.sections[sectionId];
        if (section && section.length > 0) {
            this.focusElement(section[0]);
        }
    }
}

// Initialize navigation system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.navigationSystem = new NavigationSystem();
});

// Add custom focus styles
const style = document.createElement('style');
style.textContent = `
    .focusable {
        outline: none;
        transition: all 0.2s ease;
    }
    
    .focusable:focus,
    .focusable.focused {
        outline: 3px solid #e50914 !important;
        outline-offset: 2px;
        transform: scale(1.05);
        z-index: 10;
    }
    
    .content-card.focusable:focus,
    .content-card.focusable.focused {
        transform: scale(1.2);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
    }
    
    .menu-item.focusable:focus,
    .menu-item.focusable.focused {
        background: #e50914;
        transform: scale(1.05);
    }
    
    @media (prefers-reduced-motion: reduce) {
        .focusable:focus,
        .focusable.focused {
            transform: none;
        }
    }
`;
document.head.appendChild(style);
