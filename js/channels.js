/**
 * TV Dashboard - Channels Module
 * Gerenciamento completo de canais de TV
 */

class ChannelsManager {
    constructor(storageManager) {
        this.storage = storageManager;
        this.channels = this.storage.getChannels();
        this.categories = new Set();
        this.countries = new Set();
        
        this.updateMeta();
    }

    /**
     * Atualiza metadados (categorias e países)
     */
    updateMeta() {
        this.categories.clear();
        this.countries.clear();
        
        this.channels.forEach(channel => {
            if (channel.category) this.categories.add(channel.category);
            if (channel.country) this.countries.add(channel.country);
        });
    }

    /**
     * Recarrega canais do storage
     */
    reload() {
        this.channels = this.storage.getChannels();
        this.updateMeta();
        console.log('📺 Canais recarregados');
    }

    /**
     * Obtém todos os canais
     * @returns {Array} Lista de canais
     */
    getAll() {
        return this.channels;
    }

    /**
     * Obtém canal por ID
     * @param {number} id - ID do canal
     * @returns {Object|null} Canal encontrado ou null
     */
    getById(id) {
        return this.channels.find(channel => channel.id === id) || null;
    }

    /**
     * Obtém canal por nome
     * @param {string} name - Nome do canal
     * @returns {Object|null} Canal encontrado ou null
     */
    getByName(name) {
        return this.channels.find(channel => 
            channel.name.toLowerCase() === name.toLowerCase()
        ) || null;
    }

    /**
     * Busca canais por texto
     * @param {string} query - Texto de busca
     * @returns {Array} Canais encontrados
     */
    search(query) {
        if (!query || query.trim() === '') return this.channels;
        
        const searchTerm = query.toLowerCase();
        return this.channels.filter(channel => 
            channel.name.toLowerCase().includes(searchTerm) ||
            channel.description?.toLowerCase().includes(searchTerm) ||
            channel.category.toLowerCase().includes(searchTerm) ||
            channel.country.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Filtra canais por categoria
     * @param {string} category - Categoria
     * @returns {Array} Canais da categoria
     */
    getByCategory(category) {
        return this.channels.filter(channel => channel.category === category);
    }

    /**
     * Filtra canais por país
     * @param {string} country - País
     * @returns {Array} Canais do país
     */
    getByCountry(country) {
        return this.channels.filter(channel => channel.country === country);
    }

    /**
     * Obtém canais padrão
     * @returns {Array} Canais padrão
     */
    getDefaults() {
        return this.channels.filter(channel => channel.isDefault === true);
    }

    /**
     * Obtém canais customizados
     * @returns {Array} Canais customizados
     */
    getCustom() {
        return this.channels.filter(channel => !channel.isDefault);
    }

    /**
     * Adiciona um novo canal
     * @param {Object} channelData - Dados do canal
     * @returns {Object} Resultado da operação
     */
    add(channelData) {
        try {
            // Validar dados obrigatórios
            const validation = this.validateChannel(channelData);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join(', '),
                    channel: null
                };
            }

            // Verificar se canal já existe
            if (this.getByName(channelData.name)) {
                return {
                    success: false,
                    error: 'Canal com este nome já existe',
                    channel: null
                };
            }

            // Criar canal
            const newChannel = {
                id: Date.now(),
                name: channelData.name.trim(),
                url: channelData.url.trim(),
                country: channelData.country?.trim() || 'Desconhecido',
                category: channelData.category?.trim() || 'Outros',
                description: channelData.description?.trim() || '',
                isDefault: false,
                isActive: true,
                createdAt: new Date().toISOString(),
                ...channelData
            };

            // Salvar no storage
            if (this.storage.addChannel(newChannel)) {
                this.reload();
                console.log('✅ Canal adicionado:', newChannel.name);
                
                return {
                    success: true,
                    error: null,
                    channel: newChannel
                };
            } else {
                return {
                    success: false,
                    error: 'Erro ao salvar canal no storage',
                    channel: null
                };
            }
        } catch (error) {
            console.error('❌ Erro ao adicionar canal:', error);
            return {
                success: false,
                error: error.message,
                channel: null
            };
        }
    }

    /**
     * Atualiza um canal existente
     * @param {number} id - ID do canal
     * @param {Object} updatedData - Dados atualizados
     * @returns {Object} Resultado da operação
     */
    update(id, updatedData) {
        try {
            const existingChannel = this.getById(id);
            if (!existingChannel) {
                return {
                    success: false,
                    error: 'Canal não encontrado',
                    channel: null
                };
            }

            // Validar dados
            const validation = this.validateChannel(updatedData, id);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join(', '),
                    channel: null
                };
            }

            // Verificar nome duplicado (exceto o próprio canal)
            const nameExists = this.channels.find(ch => 
                ch.name.toLowerCase() === updatedData.name?.toLowerCase() && ch.id !== id
            );
            
            if (nameExists) {
                return {
                    success: false,
                    error: 'Já existe outro canal com este nome',
                    channel: null
                };
            }

            // Atualizar no storage
            const updateData = {
                ...updatedData,
                updatedAt: new Date().toISOString()
            };

            if (this.storage.updateChannel(id, updateData)) {
                this.reload();
                const updatedChannel = this.getById(id);
                console.log('✅ Canal atualizado:', updatedChannel.name);
                
                return {
                    success: true,
                    error: null,
                    channel: updatedChannel
                };
            } else {
                return {
                    success: false,
                    error: 'Erro ao atualizar canal no storage',
                    channel: null
                };
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar canal:', error);
            return {
                success: false,
                error: error.message,
                channel: null
            };
        }
    }

    /**
     * Remove um canal
     * @param {number} id - ID do canal
     * @returns {Object} Resultado da operação
     */
    remove(id) {
        try {
            const channel = this.getById(id);
            if (!channel) {
                return {
                    success: false,
                    error: 'Canal não encontrado'
                };
            }

            // Não permitir remover canais padrão
            if (channel.isDefault) {
                return {
                    success: false,
                    error: 'Não é possível remover canais padrão'
                };
            }

            if (this.storage.removeChannel(id)) {
                this.reload();
                console.log('🗑️ Canal removido:', channel.name);
                
                return {
                    success: true,
                    error: null
                };
            } else {
                return {
                    success: false,
                    error: 'Erro ao remover canal do storage'
                };
            }
        } catch (error) {
            console.error('❌ Erro ao remover canal:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Ativa/desativa um canal
     * @param {number} id - ID do canal
     * @param {boolean} isActive - Status ativo
     * @returns {Object} Resultado da operação
     */
    toggleActive(id, isActive) {
        return this.update(id, { isActive });
    }

    /**
     * Valida dados de um canal
     * @param {Object} channelData - Dados do canal
     * @param {number} excludeId - ID a excluir da validação
     * @returns {Object} Resultado da validação
     */
    validateChannel(channelData, excludeId = null) {
        const errors = [];

        // Nome obrigatório
        if (!channelData.name || channelData.name.trim() === '') {
            errors.push('Nome é obrigatório');
        } else if (channelData.name.trim().length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        }

        // URL obrigatória e válida
        if (!channelData.url || channelData.url.trim() === '') {
            errors.push('URL é obrigatória');
        } else {
            const urlPattern = /^https?:\/\/.+/;
            if (!urlPattern.test(channelData.url.trim())) {
                errors.push('URL deve ser válida (começar com http:// ou https://)');
            }
        }

        // Categoria obrigatória
        if (!channelData.category || channelData.category.trim() === '') {
            errors.push('Categoria é obrigatória');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Obtém estatísticas dos canais
     * @returns {Object} Estatísticas
     */
    getStats() {
        const total = this.channels.length;
        const active = this.channels.filter(ch => ch.isActive !== false).length;
        const defaults = this.getDefaults().length;
        const custom = this.getCustom().length;

        const byCategory = {};
        const byCountry = {};

        this.channels.forEach(channel => {
            // Por categoria
            byCategory[channel.category] = (byCategory[channel.category] || 0) + 1;
            
            // Por país
            byCountry[channel.country] = (byCountry[channel.country] || 0) + 1;
        });

        return {
            total,
            active,
            inactive: total - active,
            defaults,
            custom,
            categories: Array.from(this.categories).length,
            countries: Array.from(this.countries).length,
            byCategory,
            byCountry
        };
    }

    /**
     * Obtém todas as categorias disponíveis
     * @returns {Array} Lista de categorias
     */
    getCategories() {
        return Array.from(this.categories).sort();
    }

    /**
     * Obtém todos os países disponíveis
     * @returns {Array} Lista de países
     */
    getCountries() {
        return Array.from(this.countries).sort();
    }

    /**
     * Exporta canais para JSON
     * @param {boolean} includeDefaults - Incluir canais padrão
     * @returns {Object} Dados exportados
     */
    export(includeDefaults = true) {
        const channelsToExport = includeDefaults 
            ? this.channels 
            : this.getCustom();

        return {
            channels: channelsToExport,
            stats: this.getStats(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * Importa canais de dados JSON
     * @param {Object} data - Dados a importar
     * @param {boolean} replaceExisting - Substituir canais existentes
     * @returns {Object} Resultado da importação
     */
    import(data, replaceExisting = false) {
        try {
            if (!data.channels || !Array.isArray(data.channels)) {
                return {
                    success: false,
                    error: 'Dados inválidos: canais não encontrados',
                    imported: 0
                };
            }

            let imported = 0;
            let errors = [];

            data.channels.forEach((channelData, index) => {
                // Pular canais padrão se não for para substituir
                if (channelData.isDefault && !replaceExisting) {
                    return;
                }

                // Validar canal
                const validation = this.validateChannel(channelData);
                if (!validation.isValid) {
                    errors.push(`Canal ${index + 1}: ${validation.errors.join(', ')}`);
                    return;
                }

                // Verificar se já existe
                const existing = this.getByName(channelData.name);
                if (existing && !replaceExisting) {
                    errors.push(`Canal "${channelData.name}" já existe`);
                    return;
                }

                // Importar/atualizar canal
                if (existing && replaceExisting) {
                    const result = this.update(existing.id, channelData);
                    if (result.success) imported++;
                    else errors.push(`Erro ao atualizar "${channelData.name}": ${result.error}`);
                } else {
                    const result = this.add(channelData);
                    if (result.success) imported++;
                    else errors.push(`Erro ao adicionar "${channelData.name}": ${result.error}`);
                }
            });

            return {
                success: imported > 0,
                error: errors.length > 0 ? errors.join('; ') : null,
                imported,
                errors: errors.length
            };
        } catch (error) {
            console.error('❌ Erro ao importar canais:', error);
            return {
                success: false,
                error: error.message,
                imported: 0
            };
        }
    }

    /**
     * Redefine canais para os padrão
     * @returns {boolean} Sucesso da operação
     */
    resetToDefaults() {
        try {
            const defaultChannels = this.storage.getDefaultChannels();
            this.storage.setChannels(defaultChannels);
            this.reload();
            console.log('🔄 Canais redefinidos para padrão');
            return true;
        } catch (error) {
            console.error('❌ Erro ao redefinir canais:', error);
            return false;
        }
    }

    /**
     * Testa conectividade de um canal
     * @param {string} url - URL do canal
     * @returns {Promise<Object>} Resultado do teste
     */
    async testChannel(url) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                cache: 'no-cache'
            });

            clearTimeout(timeoutId);

            return {
                success: response.ok,
                status: response.status,
                statusText: response.statusText,
                contentType: response.headers.get('content-type'),
                accessible: true
            };
        } catch (error) {
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Timeout - Canal não responde',
                    accessible: false
                };
            }
            
            return {
                success: false,
                error: error.message,
                accessible: false
            };
        }
    }
}

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChannelsManager;
} 