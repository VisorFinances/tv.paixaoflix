// Otimizações de Performance para PaixãoFlix Pro Max
// Aplicar estas otimizações no JavaScript principal

class PerformanceOptimizer {
    constructor() {
        this.imageCache = new Map();
        this.tmdbCache = new Map();
        this.preloadQueue = [];
        this.isThrottled = false;
    }
    
    // Throttle de scroll para performance
    throttleScroll(callback, delay = 16) {
        if (this.isThrottled) return;
        
        this.isThrottled = true;
        
        requestAnimationFrame(() => {
            callback();
            this.isThrottled = false;
        });
        
        setTimeout(() => {
            this.isThrottled = false;
        }, delay);
    }
    
    // Lazy loading otimizado para imagens
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-lazy]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback para browsers antigos
            images.forEach(img => this.loadImage(img));
        }
    }
    
    loadImage(img) {
        const src = img.dataset.lazy;
        
        if (this.imageCache.has(src)) {
            img.src = this.imageCache.get(src);
            img.classList.add('loaded');
            return;
        }
        
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = src;
            img.classList.add('loaded');
            this.imageCache.set(src, src);
        };
        
        tempImg.src = src;
    }
    
    // Pre-fetch de dados TMDB
    prefetchTMDBData(items) {
        items.forEach(item => {
            if (item.tmdb_id && !this.tmdbCache.has(item.tmdb_id)) {
                const cacheKey = `tmdb_${item.tmdb_id}`;
                this.tmdbCache.set(cacheKey, 'loading');
                
                // Fetch assíncrono
                fetch(`https://api.themoviedb.org/3/tv/${item.tmdb_id}?api_key=b275ce8e1a6b3d5d879bb0907e4f56ad&language=pt-BR`)
                    .then(response => response.json())
                    .then(data => {
                        this.tmdbCache.set(cacheKey, data);
                    })
                    .catch(error => {
                        console.warn('Erro no prefetch TMDB:', error);
                        this.tmdbCache.delete(cacheKey);
                    });
            }
        });
    }
    
    // Memory cleanup
    cleanupMemory() {
        // Limpar cache de imagens se estiver muito grande
        if (this.imageCache.size > 100) {
            const entries = Array.from(this.imageCache.entries());
            entries.slice(0, 50).forEach(([key]) => {
                this.imageCache.delete(key);
            });
        }
        
        // Limpar cache TMDB antigo
        if (this.tmdbCache.size > 50) {
            const entries = Array.from(this.tmdbCache.entries());
            entries.slice(0, 25).forEach(([key]) => {
                this.tmdbCache.delete(key);
            });
        }
        
        // Forçar garbage collection se disponível
        if (window.gc) {
            window.gc();
        }
    }
    
    // Otimização de scroll horizontal
    optimizeHorizontalScroll() {
        const scrollContainers = document.querySelectorAll('.movie-row, .movie-row-2-3');
        
        scrollContainers.forEach(container => {
            let isScrolling = false;
            let startX = 0;
            let scrollLeft = 0;
            
            container.addEventListener('mousedown', (e) => {
                isScrolling = true;
                startX = e.pageX - container.offsetLeft;
                scrollLeft = container.scrollLeft;
                container.style.cursor = 'grabbing';
            });
            
            container.addEventListener('mouseleave', () => {
                isScrolling = false;
                container.style.cursor = 'grab';
            });
            
            container.addEventListener('mouseup', () => {
                isScrolling = false;
                container.style.cursor = 'grab';
            });
            
            container.addEventListener('mousemove', (e) => {
                if (!isScrolling) return;
                e.preventDefault();
                
                const x = e.pageX - container.offsetLeft;
                const walk = (x - startX) * 2;
                container.scrollLeft = scrollLeft - walk;
            });
        });
    }
    
    // Prevenção de memory leaks
    preventMemoryLeaks() {
        // Limpar event listeners antigos
        const elements = document.querySelectorAll('[data-listeners]');
        elements.forEach(element => {
            element.removeEventListener('click', element._clickHandler);
            element.removeAttribute('data-listeners');
        });
        
        // Limpar timeouts não utilizados
        const highestTimeoutId = setTimeout(() => {}, 0);
        for (let i = 0; i < highestTimeoutId; i++) {
            clearTimeout(i);
        }
    }
    
    // Otimização para dispositivos de baixo desempenho
    optimizeForLowEnd() {
        // Detectar dispositivo de baixo desempenho
        const isLowEnd = navigator.hardwareConcurrency <= 2 || 
                          navigator.deviceMemory <= 2 ||
                          /Android [1-4]/.test(navigator.userAgent);
        
        if (isLowEnd) {
            // Reduzir animações
            document.documentElement.style.setProperty('--transition-fast', '0.1s ease');
            document.documentElement.style.setProperty('--transition-normal', '0.2s ease');
            
            // Desativar efeitos pesados
            document.body.classList.add('low-performance-mode');
            
            // Reduzir qualidade de imagens
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                img.style.imageRendering = 'auto';
                img.style.imageRendering = 'crisp-edges';
            });
        }
    }
    
    // Inicializar otimizações
    init() {
        // Iniciar lazy loading
        this.lazyLoadImages();
        
        // Otimizar scroll horizontal
        this.optimizeHorizontalScroll();
        
        // Otimizar para dispositivo
        this.optimizeForLowEnd();
        
        // Limpar memória a cada 5 minutos
        setInterval(() => this.cleanupMemory(), 300000);
        
        // Prevenção de memory leaks a cada minuto
        setInterval(() => this.preventMemoryLeaks(), 60000);
        
        console.log('🚀 Otimizações de performance ativadas');
    }
}

// Aplicar otimizações globais
document.addEventListener('DOMContentLoaded', () => {
    const optimizer = new PerformanceOptimizer();
    optimizer.init();
    
    // Disponibilizar globalmente
    window.performanceOptimizer = optimizer;
});

// Extensão para Array - shuffle otimizado
Array.prototype.shuffle = function() {
    let currentIndex = this.length, randomIndex;
    
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [this[currentIndex], this[randomIndex]] = [this[randomIndex], this[currentIndex]];
    }
    
    return this;
};

// Extensão para String - truncate seguro
String.prototype.truncate = function(length) {
    return this.length > length ? this.substring(0, length) + '...' : this;
};
