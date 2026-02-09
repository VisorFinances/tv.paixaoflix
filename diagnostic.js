// Script de Diagnóstico PaixãoFlix V4
// Executar apenas com ?debug=true na URL

class DiagnosticTool {
    constructor() {
        this.debugMode = window.location.search.includes('debug=true');
        this.results = {
            system: {},
            api: {},
            dom: {},
            performance: {}
        };
        
        if (this.debugMode) {
            console.log('🔧 Modo Debug Ativado - Iniciando Diagnóstico Completo');
            this.runFullDiagnosis();
        }
    }
    
    async runFullDiagnosis() {
        console.log('🚀 Iniciando diagnóstico completo do PaixãoFlix V4...');
        
        // 1. Validação de Memória e Sistema
        this.validateSystem();
        
        // 2. Teste de API TMDB
        await this.testTMDBAPI();
        
        // 3. Verificador de DOM
        this.validateDOM();
        
        // 4. Integração Sazonal
        this.validateSeasonalIntegration();
        
        // 5. Teste de Performance
        this.testPerformance();
        
        // 6. Relatório Final
        this.generateReport();
    }
    
    validateSystem() {
        console.log('📊 Validando sistema...');
        
        // Verificar funções principais
        const mainFunctions = [
            'initApp', 'loadData', 'loadHeroBanner', 'resetToHome',
            'performSearch', 'createMovieCard', 'playChannel', 'showPage'
        ];
        
        mainFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                this.results.system[funcName] = '✅ OK';
                console.log(`✅ Sistema de ${funcName}: OK`);
            } else if (window.app && typeof window.app[funcName] === 'function') {
                this.results.system[funcName] = '✅ OK (app)';
                console.log(`✅ Sistema de ${funcName}: OK (app)`);
            } else {
                this.results.system[funcName] = '❌ ERRO';
                console.error(`❌ Erro: ${funcName} não encontrada`);
            }
        });
        
        // Verificar objeto app
        if (window.app) {
            this.results.system.appObject = '✅ OK';
            console.log('✅ Objeto app: OK');
        } else {
            this.results.system.appObject = '❌ ERRO';
            console.error('❌ Erro: objeto app não encontrado');
        }
    }
    
    async testTMDBAPI() {
        console.log('🎬 Testando API TMDB...');
        
        try {
            const apiKey = 'b275ce8e1a6b3d5d879bb0907e4f56ad';
            const testUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=1`;
            
            const response = await fetch(testUrl);
            
            if (response.ok) {
                const data = await response.json();
                this.results.api.tmdb = '✅ OK';
                console.log('✅ API TMDB: Conexão bem-sucedida', data.results?.length || 0, 'filmes encontrados');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            this.results.api.tmdb = `❌ ERRO: ${error.message}`;
            console.error('❌ API TMDB: Falha na conexão', error.message);
        }
    }
    
    validateDOM() {
        console.log('🏗️ Validando estrutura DOM...');
        
        const essentialIds = [
            'hero-title', 'hero-background', 'hero-description',
            'search-results', 'main-content', 'search-grid',
            'continue-watching-row', 'lancamentos-2026-row',
            'saturday-night-row', 'momento-crianca-row'
        ];
        
        essentialIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.results.dom[id] = '✅ OK';
                console.log(`✅ DOM #${id}: OK`);
            } else {
                this.results.dom[id] = '❌ ERRO';
                console.error(`❌ DOM #${id}: Elemento não encontrado`);
            }
        });
    }
    
    validateSeasonalIntegration() {
        console.log('📅 Validando integração sazonal...');
        
        try {
            const today = new Date();
            const month = today.getMonth() + 1;
            const day = today.getDate();
            
            console.log(`📅 Data atual: ${day}/${month}`);
            
            // Verificar função sazonal
            if (typeof window.checkSeasonalContent === 'function' || 
                (window.app && typeof window.app.checkSeasonalContent === 'function')) {
                this.results.performance.seasonal = '✅ OK';
                console.log('✅ Função sazonal: OK');
            } else {
                this.results.performance.seasonal = '⚠️ AVISO';
                console.warn('⚠️ Função sazonal não encontrada');
            }
            
            // Verificar seções sazonais
            const seasonalSections = ['saturday-section', 'novelas-section'];
            seasonalSections.forEach(section => {
                const element = document.getElementById(section);
                if (element) {
                    const display = window.getComputedStyle(element).display;
                    console.log(`📅 Seção ${section}: ${display}`);
                }
            });
            
        } catch (error) {
            this.results.performance.seasonal = `❌ ERRO: ${error.message}`;
            console.error('❌ Integração sazonal:', error.message);
        }
    }
    
    testPerformance() {
        console.log('⚡ Testando performance...');
        
        // Testar lazy loading
        if ('IntersectionObserver' in window) {
            this.results.performance.lazyLoading = '✅ OK';
            console.log('✅ Lazy Loading: Suportado');
        } else {
            this.results.performance.lazyLoading = '⚠️ FALLBACK';
            console.warn('⚠️ Lazy Loading: Usando fallback');
        }
        
        // Testar Service Worker
        if ('serviceWorker' in navigator) {
            this.results.performance.serviceWorker = '✅ OK';
            console.log('✅ Service Worker: Suportado');
        } else {
            this.results.performance.serviceWorker = '❌ ERRO';
            console.error('❌ Service Worker: Não suportado');
        }
        
        // Testar PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.results.performance.pwaMode = '✅ STANDALONE';
            console.log('✅ PWA: Modo standalone');
        } else {
            this.results.performance.pwaMode = '⚠️ BROWSER';
            console.log('⚠️ PWA: Modo browser');
        }
    }
    
    generateReport() {
        console.log('\n📋 === RELATÓRIO DE DIAGNÓSTICO PAIXÃOFLIX V4 ===\n');
        
        // Sistema
        console.log('🔧 SISTEMA:');
        Object.entries(this.results.system).forEach(([key, value]) => {
            console.log(`  ${value} ${key}`);
        });
        
        // API
        console.log('\n🌐 API:');
        Object.entries(this.results.api).forEach(([key, value]) => {
            console.log(`  ${value} ${key}`);
        });
        
        // DOM
        console.log('\n🏗️ DOM:');
        Object.entries(this.results.dom).forEach(([key, value]) => {
            console.log(`  ${value} #${key}`);
        });
        
        // Performance
        console.log('\n⚡ PERFORMANCE:');
        Object.entries(this.results.performance).forEach(([key, value]) => {
            console.log(`  ${value} ${key}`);
        });
        
        // Resumo
        const allResults = Object.values({...this.results.system, ...this.results.api, ...this.results.dom, ...this.results.performance});
        const successCount = allResults.filter(r => r.includes('✅')).length;
        const errorCount = allResults.filter(r => r.includes('❌')).length;
        const warningCount = allResults.filter(r => r.includes('⚠️')).length;
        
        console.log(`\n📊 RESUMO: ${successCount} ✅ | ${warningCount} ⚠️ | ${errorCount} ❌`);
        
        if (errorCount === 0) {
            console.log('🎉 SISTEMA 100% FUNCIONAL!');
        } else {
            console.log('⚠️ ATENÇÃO: Existem erros que precisam ser corrigidos');
        }
        
        console.log('\n🔧 Para desativar debug, remova ?debug=true da URL');
    }
}

// Inicializar diagnóstico automaticamente
new DiagnosticTool();
