/**
 * TV Dashboard - Configuration Module
 * Gerenciamento de configurações da aplicação
 */

class ConfigManager {
    constructor(storageManager) {
        this.storage = storageManager;
        this.config = this.storage.getConfig();
        this.watchers = new Map(); // Para observar mudanças
        
        // Aplicar configurações no carregamento
        this.applyConfig();
    }

    /**
     * Recarrega configurações do storage
     */
    reload() {
        this.config = this.storage.getConfig();
        this.applyConfig();
        console.log('⚙️ Configurações recarregadas');
    }

    /**
     * Obtém todas as configurações
     * @returns {Object} Configurações
     */
    getAll() {
        return { ...this.config };
    }

    /**
     * Obtém uma configuração específica
     * @param {string} key - Chave da configuração
     * @param {any} defaultValue - Valor padrão se não encontrar
     * @returns {any} Valor da configuração
     */
    get(key, defaultValue = null) {
        return this.config.hasOwnProperty(key) ? this.config[key] : defaultValue;
    }

    /**
     * Define uma configuração
     * @param {string} key - Chave da configuração
     * @param {any} value - Valor
     * @param {boolean} save - Salvar automaticamente
     * @returns {boolean} Sucesso da operação
     */
    set(key, value, save = true) {
        try {
            const oldValue = this.config[key];
            this.config[key] = value;

            if (save) {
                const result = this.storage.updateConfig(key, value);
                if (!result) {
                    // Reverter se falhar ao salvar
                    this.config[key] = oldValue;
                    return false;
                }
            }

            // Aplicar mudança imediatamente
            this.applyConfigChange(key, value, oldValue);
            
            // Notificar watchers
            this.notifyWatchers(key, value, oldValue);

            console.log(`⚙️ Configuração atualizada: ${key} = ${value}`);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao definir configuração ${key}:`, error);
            return false;
        }
    }

    /**
     * Define múltiplas configurações
     * @param {Object} configs - Objeto com configurações
     * @param {boolean} save - Salvar automaticamente
     * @returns {boolean} Sucesso da operação
     */
    setMultiple(configs, save = true) {
        try {
            const oldValues = {};
            
            // Aplicar mudanças
            Object.entries(configs).forEach(([key, value]) => {
                oldValues[key] = this.config[key];
                this.config[key] = value;
                this.applyConfigChange(key, value, oldValues[key]);
                this.notifyWatchers(key, value, oldValues[key]);
            });

            if (save) {
                const result = this.storage.setConfig(this.config);
                if (!result) {
                    // Reverter mudanças se falhar
                    Object.entries(oldValues).forEach(([key, value]) => {
                        this.config[key] = value;
                    });
                    return false;
                }
            }

            console.log('⚙️ Múltiplas configurações atualizadas');
            return true;
        } catch (error) {
            console.error('❌ Erro ao definir múltiplas configurações:', error);
            return false;
        }
    }

    /**
     * Remove uma configuração
     * @param {string} key - Chave da configuração
     * @param {boolean} save - Salvar automaticamente
     * @returns {boolean} Sucesso da operação
     */
    remove(key, save = true) {
        try {
            if (!this.config.hasOwnProperty(key)) return true;

            const oldValue = this.config[key];
            delete this.config[key];

            if (save) {
                const result = this.storage.setConfig(this.config);
                if (!result) {
                    // Reverter se falhar
                    this.config[key] = oldValue;
                    return false;
                }
            }

            // Notificar watchers
            this.notifyWatchers(key, undefined, oldValue);

            console.log(`⚙️ Configuração removida: ${key}`);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao remover configuração ${key}:`, error);
            return false;
        }
    }

    /**
     * Observa mudanças em uma configuração
     * @param {string} key - Chave da configuração
     * @param {Function} callback - Função callback
     * @returns {Function} Função para remover o watcher
     */
    watch(key, callback) {
        if (!this.watchers.has(key)) {
            this.watchers.set(key, new Set());
        }
        
        this.watchers.get(key).add(callback);

        // Retornar função para remover o watcher
        return () => {
            const keyWatchers = this.watchers.get(key);
            if (keyWatchers) {
                keyWatchers.delete(callback);
                if (keyWatchers.size === 0) {
                    this.watchers.delete(key);
                }
            }
        };
    }

    /**
     * Notifica watchers sobre mudanças
     * @param {string} key - Chave alterada
     * @param {any} newValue - Novo valor
     * @param {any} oldValue - Valor anterior
     */
    notifyWatchers(key, newValue, oldValue) {
        const keyWatchers = this.watchers.get(key);
        if (keyWatchers) {
            keyWatchers.forEach(callback => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    console.error(`❌ Erro em watcher para ${key}:`, error);
                }
            });
        }
    }

    /**
     * Aplica configurações na interface
     */
    applyConfig() {
        // Aplicar tema
        this.applyTheme(this.get('theme', 'dark'));
        
        // Aplicar layout da grade
        this.applyGridLayout(this.get('gridLayout', '4x4'));
        
        // Aplicar estado da sidebar
        this.applySidebarState(this.get('sidebarCollapsed', false));
        
        // Aplicar outras configurações
        this.applyVolumeSettings(this.get('volume', 1.0));
    }

    /**
     * Aplica uma mudança específica de configuração
     * @param {string} key - Chave da configuração
     * @param {any} newValue - Novo valor
     * @param {any} oldValue - Valor anterior
     */
    applyConfigChange(key, newValue, oldValue) {
        switch (key) {
            case 'theme':
                this.applyTheme(newValue);
                break;
            case 'gridLayout':
                this.applyGridLayout(newValue);
                break;
            case 'sidebarCollapsed':
                this.applySidebarState(newValue);
                break;
            case 'volume':
                this.applyVolumeSettings(newValue);
                break;
            case 'language':
                this.applyLanguage(newValue);
                break;
            default:
                console.log(`⚙️ Configuração "${key}" alterada: ${oldValue} → ${newValue}`);
        }
    }

    /**
     * Aplica tema
     * @param {string} theme - Tema (dark/light)
     */
    applyTheme(theme) {
        const body = document.body;
        if (theme === 'light') {
            body.classList.add('light-theme');
            body.classList.remove('dark-theme');
        } else {
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
        }
        console.log(`🎨 Tema aplicado: ${theme}`);
    }

    /**
     * Aplica layout da grade
     * @param {string} layout - Layout (2x2, 3x3, 4x4)
     */
    applyGridLayout(layout) {
        const grid = document.getElementById('grid');
        if (!grid) return;

        let columns, gridSize;
        
        switch (layout) {
            case '2x2':
                columns = 2;
                gridSize = 4;
                break;
            case '3x3':
                columns = 3;
                gridSize = 9;
                break;
            case '4x4':
            default:
                columns = 4;
                gridSize = 16;
                break;
        }

        grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        
        // Atualizar gridSize global se existir
        if (typeof window.gridSize !== 'undefined') {
            window.gridSize = gridSize;
        }

        console.log(`📐 Layout da grade aplicado: ${layout} (${gridSize} players)`);
    }

    /**
     * Aplica estado da sidebar
     * @param {boolean} collapsed - Se está colapsada
     */
    applySidebarState(collapsed) {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        if (collapsed) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }

        console.log(`📌 Sidebar ${collapsed ? 'colapsada' : 'expandida'}`);
    }

    /**
     * Aplica configurações de volume
     * @param {number} volume - Volume (0-1)
     */
    applyVolumeSettings(volume) {
        // Aplicar para todos os players ativos
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (video.id && typeof videojs !== 'undefined') {
                try {
                    const player = videojs.getPlayer(video.id);
                    if (player && !player.muted()) {
                        player.volume(volume);
                    }
                } catch (e) {
                    // Player pode não estar inicializado
                }
            }
        });

        console.log(`🔊 Volume aplicado: ${Math.round(volume * 100)}%`);
    }

    /**
     * Aplica idioma
     * @param {string} language - Código do idioma
     */
    applyLanguage(language) {
        document.documentElement.lang = language;
        console.log(`🌐 Idioma aplicado: ${language}`);
    }

    /**
     * Valida configurações
     * @param {Object} config - Configurações a validar
     * @returns {Object} Resultado da validação
     */
    validate(config) {
        const errors = [];
        const warnings = [];

        // Validar gridLayout
        if (config.gridLayout && !['2x2', '3x3', '4x4'].includes(config.gridLayout)) {
            errors.push('gridLayout deve ser "2x2", "3x3" ou "4x4"');
        }

        // Validar tema
        if (config.theme && !['dark', 'light'].includes(config.theme)) {
            errors.push('theme deve ser "dark" ou "light"');
        }

        // Validar volume
        if (config.volume !== undefined) {
            if (typeof config.volume !== 'number' || config.volume < 0 || config.volume > 1) {
                errors.push('volume deve ser um número entre 0 e 1');
            }
        }

        // Validar autoplay
        if (config.autoplay && !['muted', 'off'].includes(config.autoplay)) {
            warnings.push('autoplay deve ser "muted" ou "off"');
        }

        // Validar maxRetries
        if (config.maxRetries !== undefined) {
            if (!Number.isInteger(config.maxRetries) || config.maxRetries < 0) {
                errors.push('maxRetries deve ser um número inteiro não negativo');
            }
        }

        // Validar retryDelay
        if (config.retryDelay !== undefined) {
            if (!Number.isInteger(config.retryDelay) || config.retryDelay < 1000) {
                warnings.push('retryDelay deve ser pelo menos 1000ms');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Restaura configurações padrão
     * @param {boolean} save - Salvar automaticamente
     * @returns {boolean} Sucesso da operação
     */
    resetToDefaults(save = true) {
        try {
            const defaultConfig = this.storage.getDefaultConfig();
            this.config = { ...defaultConfig };

            if (save) {
                const result = this.storage.setConfig(this.config);
                if (!result) return false;
            }

            this.applyConfig();
            console.log('🔄 Configurações restauradas para padrão');
            return true;
        } catch (error) {
            console.error('❌ Erro ao restaurar configurações:', error);
            return false;
        }
    }

    /**
     * Exporta configurações
     * @returns {Object} Configurações exportadas
     */
    export() {
        return {
            config: { ...this.config },
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * Importa configurações
     * @param {Object} data - Dados a importar
     * @param {boolean} validate - Validar antes de importar
     * @returns {Object} Resultado da importação
     */
    import(data, validate = true) {
        try {
            if (!data.config || typeof data.config !== 'object') {
                return {
                    success: false,
                    error: 'Dados inválidos: configurações não encontradas'
                };
            }

            if (validate) {
                const validation = this.validate(data.config);
                if (!validation.isValid) {
                    return {
                        success: false,
                        error: `Configurações inválidas: ${validation.errors.join(', ')}`
                    };
                }
            }

            // Mesclar com configurações atuais
            const mergedConfig = { ...this.config, ...data.config };
            this.config = mergedConfig;

            const result = this.storage.setConfig(this.config);
            if (!result) {
                return {
                    success: false,
                    error: 'Erro ao salvar configurações importadas'
                };
            }

            this.applyConfig();
            console.log('📥 Configurações importadas com sucesso');

            return {
                success: true,
                error: null
            };
        } catch (error) {
            console.error('❌ Erro ao importar configurações:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtém informações sobre as configurações
     * @returns {Object} Informações
     */
    getInfo() {
        const configKeys = Object.keys(this.config);
        const watcherKeys = Array.from(this.watchers.keys());
        
        return {
            totalConfigs: configKeys.length,
            watchedConfigs: watcherKeys.length,
            configKeys: configKeys.sort(),
            watchedKeys: watcherKeys.sort(),
            lastModified: this.config.updatedAt || this.config.createdAt
        };
    }

    // ================================
    // MÉTODOS DE CONVENIÊNCIA
    // ================================

    /**
     * Obtém tamanho da grade
     * @returns {number} Tamanho da grade
     */
    getGridSize() {
        const layout = this.get('gridLayout', '4x4');
        switch (layout) {
            case '2x2': return 4;
            case '3x3': return 9;
            case '4x4': return 16;
            default: return 16;
        }
    }

    /**
     * Define tamanho da grade
     * @param {string} layout - Layout da grade
     * @returns {boolean} Sucesso da operação
     */
    setGridLayout(layout) {
        return this.set('gridLayout', layout);
    }

    /**
     * Define tema
     * @param {string} theme - Tema
     * @returns {boolean} Sucesso da operação
     */
    setTheme(theme) {
        return this.set('theme', theme);
    }

    /**
     * Define volume
     * @param {number} volume - Volume (0-1)
     * @returns {boolean} Sucesso da operação
     */
    setVolume(volume) {
        return this.set('volume', Math.max(0, Math.min(1, volume)));
    }

    /**
     * Alterna estado da sidebar
     * @returns {boolean} Novo estado
     */
    toggleSidebar() {
        const current = this.get('sidebarCollapsed', false);
        this.set('sidebarCollapsed', !current);
        return !current;
    }

    /**
     * Define modo de autoplay
     * @param {string} mode - Modo (muted/off)
     * @returns {boolean} Sucesso da operação
     */
    setAutoplay(mode) {
        return this.set('autoplay', mode);
    }
}

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
} 