/**
 * TV Dashboard - Storage Module
 * Gerencia a persistência de dados usando localStorage
 */

class StorageManager {
    constructor() {
        this.storageType = this.detectStorageType();
        this.prefix = 'tvdashboard_';
        
        // Inicializar estrutura de dados padrão
        this.initializeDefaultData();
    }

    /**
     * Detecta o tipo de storage disponível
     * @returns {Storage} localStorage ou sessionStorage
     */
    detectStorageType() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            console.log('🗄️ LocalStorage disponível');
            return localStorage;
        } catch (e) {
            console.warn('⚠️ LocalStorage não disponível, usando sessionStorage');
            return sessionStorage;
        }
    }

    /**
     * Inicializa dados padrão se não existirem
     */
    initializeDefaultData() {
        if (!this.exists('channels')) {
            this.setChannels(this.getDefaultChannels());
        }
        
        if (!this.exists('config')) {
            this.setConfig(this.getDefaultConfig());
        }
        
        if (!this.exists('layout')) {
            this.setLayout(this.getDefaultLayout());
        }
    }

    /**
     * Verifica se uma chave existe no storage
     * @param {string} key - Chave a verificar
     * @returns {boolean}
     */
    exists(key) {
        return this.storageType.getItem(this.prefix + key) !== null;
    }

    /**
     * Salva dados no storage
     * @param {string} key - Chave
     * @param {any} data - Dados a salvar
     * @returns {boolean} Sucesso da operação
     */
    save(key, data) {
        try {
            const serializedData = JSON.stringify({
                data: data,
                timestamp: Date.now(),
                version: '1.0'
            });
            
            this.storageType.setItem(this.prefix + key, serializedData);
            console.log(`💾 Dados salvos: ${key}`);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao salvar ${key}:`, error);
            return false;
        }
    }

    /**
     * Carrega dados do storage
     * @param {string} key - Chave
     * @param {any} defaultValue - Valor padrão se não encontrar
     * @returns {any} Dados carregados
     */
    load(key, defaultValue = null) {
        try {
            const item = this.storageType.getItem(this.prefix + key);
            
            if (!item) {
                return defaultValue;
            }
            
            const parsed = JSON.parse(item);
            console.log(`📂 Dados carregados: ${key}`);
            return parsed.data;
        } catch (error) {
            console.error(`❌ Erro ao carregar ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Remove dados do storage
     * @param {string} key - Chave a remover
     * @returns {boolean} Sucesso da operação
     */
    remove(key) {
        try {
            this.storageType.removeItem(this.prefix + key);
            console.log(`🗑️ Dados removidos: ${key}`);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao remover ${key}:`, error);
            return false;
        }
    }

    /**
     * Limpa todos os dados do dashboard
     * @returns {boolean} Sucesso da operação
     */
    clear() {
        try {
            const keys = Object.keys(this.storageType);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    this.storageType.removeItem(key);
                }
            });
            
            // Reinicializar dados padrão
            this.initializeDefaultData();
            console.log('🧹 Storage limpo e reinicializado');
            return true;
        } catch (error) {
            console.error('❌ Erro ao limpar storage:', error);
            return false;
        }
    }

    /**
     * Exporta todos os dados
     * @returns {Object} Dados exportados
     */
    export() {
        try {
            const exportData = {
                channels: this.getChannels(),
                config: this.getConfig(),
                layout: this.getLayout(),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            console.log('📤 Dados exportados');
            return exportData;
        } catch (error) {
            console.error('❌ Erro ao exportar dados:', error);
            return null;
        }
    }

    /**
     * Importa dados
     * @param {Object} data - Dados a importar
     * @returns {boolean} Sucesso da operação
     */
    import(data) {
        try {
            if (data.channels) this.setChannels(data.channels);
            if (data.config) this.setConfig(data.config);
            if (data.layout) this.setLayout(data.layout);
            
            console.log('📥 Dados importados com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao importar dados:', error);
            return false;
        }
    }

    /**
     * Obtém informações sobre o storage
     * @returns {Object} Informações do storage
     */
    getStorageInfo() {
        try {
            const used = new Blob(Object.values(this.storageType)).size;
            const keys = Object.keys(this.storageType).filter(key => key.startsWith(this.prefix));
            
            return {
                type: this.storageType === localStorage ? 'localStorage' : 'sessionStorage',
                keysCount: keys.length,
                usedSpace: used,
                keys: keys.map(key => key.replace(this.prefix, ''))
            };
        } catch (error) {
            console.error('❌ Erro ao obter info do storage:', error);
            return null;
        }
    }

    // ================================
    // MÉTODOS ESPECÍFICOS PARA CANAIS
    // ================================

    /**
     * Salva lista de canais
     * @param {Array} channels - Lista de canais
     */
    setChannels(channels) {
        return this.save('channels', channels);
    }

    /**
     * Carrega lista de canais
     * @returns {Array} Lista de canais
     */
    getChannels() {
        return this.load('channels', this.getDefaultChannels());
    }

    /**
     * Adiciona um canal
     * @param {Object} channel - Canal a adicionar
     * @returns {boolean} Sucesso da operação
     */
    addChannel(channel) {
        const channels = this.getChannels();
        channel.id = channel.id || Date.now();
        channel.createdAt = new Date().toISOString();
        channels.push(channel);
        return this.setChannels(channels);
    }

    /**
     * Atualiza um canal
     * @param {number} id - ID do canal
     * @param {Object} updatedChannel - Dados atualizados
     * @returns {boolean} Sucesso da operação
     */
    updateChannel(id, updatedChannel) {
        const channels = this.getChannels();
        const index = channels.findIndex(ch => ch.id === id);
        
        if (index !== -1) {
            channels[index] = { ...channels[index], ...updatedChannel, updatedAt: new Date().toISOString() };
            return this.setChannels(channels);
        }
        return false;
    }

    /**
     * Remove um canal
     * @param {number} id - ID do canal
     * @returns {boolean} Sucesso da operação
     */
    removeChannel(id) {
        const channels = this.getChannels();
        const filteredChannels = channels.filter(ch => ch.id !== id);
        return this.setChannels(filteredChannels);
    }

    /**
     * Busca canais por categoria
     * @param {string} category - Categoria
     * @returns {Array} Canais da categoria
     */
    getChannelsByCategory(category) {
        const channels = this.getChannels();
        return channels.filter(ch => ch.category === category);
    }

    /**
     * Busca canais por país
     * @param {string} country - País
     * @returns {Array} Canais do país
     */
    getChannelsByCountry(country) {
        const channels = this.getChannels();
        return channels.filter(ch => ch.country === country);
    }

    // ================================
    // MÉTODOS ESPECÍFICOS PARA CONFIG
    // ================================

    /**
     * Salva configurações
     * @param {Object} config - Configurações
     */
    setConfig(config) {
        return this.save('config', config);
    }

    /**
     * Carrega configurações
     * @returns {Object} Configurações
     */
    getConfig() {
        return this.load('config', this.getDefaultConfig());
    }

    /**
     * Atualiza uma configuração específica
     * @param {string} key - Chave da configuração
     * @param {any} value - Valor
     * @returns {boolean} Sucesso da operação
     */
    updateConfig(key, value) {
        const config = this.getConfig();
        config[key] = value;
        return this.setConfig(config);
    }

    // ================================
    // MÉTODOS ESPECÍFICOS PARA LAYOUT
    // ================================

    /**
     * Salva layout atual
     * @param {Object} layout - Layout
     */
    setLayout(layout) {
        return this.save('layout', layout);
    }

    /**
     * Carrega layout
     * @returns {Object} Layout
     */
    getLayout() {
        return this.load('layout', this.getDefaultLayout());
    }

    /**
     * Salva estado dos players
     * @param {Array} playersState - Estado dos players
     */
    setPlayersState(playersState) {
        return this.save('playersState', playersState);
    }

    /**
     * Carrega estado dos players
     * @returns {Array} Estado dos players
     */
    getPlayersState() {
        return this.load('playersState', []);
    }

    // ================================
    // DADOS PADRÃO
    // ================================

    /**
     * Retorna canais padrão
     * @returns {Array} Canais padrão
     */
    getDefaultChannels() {
        return [
            {
                id: 1,
                name: 'SIC Notícias',
                url: 'https://d277k9d1h9dro4.cloudfront.net/out/v1/293e7c3464824cbd8818ab8e49dc5fe9/index.m3u8',
                country: 'PT',
                category: 'Notícias',
                description: 'Canal de notícias da SIC',
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'RTP1',
                url: 'https://streaming-live.rtp.pt/liverepeater/smil:rtpClean1HD.smil/playlist.m3u8',
                country: 'PT',
                category: 'Generalistas',
                description: 'Canal generalista da RTP',
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: 'SIC',
                url: 'https://d1zx6l1dn8vaj5.cloudfront.net/out/v1/b89cc37caa6d418eb423cf092a2ef970/index_4.m3u8',
                country: 'PT',
                category: 'Generalistas',
                description: 'Canal generalista SIC',
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                name: 'CNN Portugal',
                url: 'https://video-auth8.iol.pt/live_cnn/live_cnn/playlist.m3u8',
                country: 'PT',
                category: 'Notícias',
                description: 'CNN Portugal',
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                name: 'RTP2',
                url: 'https://streaming-live.rtp.pt/liverepeater/smil:rtp2HD.smil/playlist.m3u8',
                country: 'PT',
                category: 'Generalistas',
                description: 'RTP2',
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 6,
                name: 'TVI',
                url: 'https://video-auth4.iol.pt/live_tvi/live_tvi/playlist.m3u8',
                country: 'PT',
                category: 'Generalistas',
                description: 'TVI',
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 7,
                name: 'BBC News',
                url: 'https://vs-hls-push-ww-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_news_channel_hd/iptv_hd_abr_v1.m3u8',
                country: 'GB',
                category: 'Notícias',
                description: 'BBC News International',
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 8,
                name: 'Sky News',
                url: 'https://skynews2-plutolive-vo.akamaized.net/cdnlive2/sky-news-international/chunklist.m3u8',
                country: 'GB',
                category: 'Notícias',
                description: 'Sky News International',
                isDefault: true,
                createdAt: new Date().toISOString()
            }
        ];
    }

    /**
     * Retorna configurações padrão
     * @returns {Object} Configurações padrão
     */
    getDefaultConfig() {
        return {
            gridLayout: '4x4',
            gridSize: 16,
            autoplay: 'muted',
            theme: 'dark',
            volume: 1.0,
            autoSave: true,
            sidebarCollapsed: false,
            showPlayerControls: true,
            showStatusIndicator: true,
            maxRetries: 3,
            retryDelay: 5000,
            language: 'pt',
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Retorna layout padrão
     * @returns {Object} Layout padrão
     */
    getDefaultLayout() {
        return {
            gridColumns: 4,
            gridRows: 4,
            playerBoxMinHeight: 280,
            playerContentHeight: 230,
            sidebarWidth: 300,
            maximizedPlayer: null,
            maximizedMode: false,
            createdAt: new Date().toISOString()
        };
    }
}

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
} 