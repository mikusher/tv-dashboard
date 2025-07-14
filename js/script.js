// TV Dashboard - Script Principal
// Instâncias globais dos módulos
let storage;
let channelsManager;
let configManager;

// Variáveis globais
let currentAudioPlayer = null;
let maximizedMode = false;
let maximizedPlayer = null;
let gridSize = 16;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeModules();
    initializeGrid();
    loadSidebarChannels();
    loadChannelList();
    setupEventListeners();
});

/**
 * Inicializa os módulos do sistema
 */
function initializeModules() {
    try {
        // Inicializar storage
        storage = new StorageManager();
        console.log('✅ Storage inicializado');
        
        // Inicializar gerenciador de canais
        channelsManager = new ChannelsManager(storage);
        console.log('✅ Gerenciador de canais inicializado');
        
        // Inicializar gerenciador de configurações
        configManager = new ConfigManager(storage);
        console.log('✅ Gerenciador de configurações inicializado');
        
        // Aplicar configurações salvas
        applyStoredConfigurations();
        
    } catch (error) {
        console.error('❌ Erro ao inicializar módulos:', error);
        // Fallback para funcionamento básico
        initializeFallback();
    }
}

/**
 * Aplica configurações salvas
 */
function applyStoredConfigurations() {
    // Aplicar layout da grade
    gridSize = configManager.getGridSize();
    
    // Aplicar estado da sidebar
    const sidebarCollapsed = configManager.get('sidebarCollapsed', false);
    const sidebar = document.getElementById('sidebar');
    const headerToggle = document.querySelector('.toggle-sidebar-header');
    
    if (sidebarCollapsed && sidebar) {
        sidebar.classList.add('collapsed');
        // Definir estado inicial do botão
        if (headerToggle) {
            headerToggle.classList.remove('sidebar-open');
            headerToggle.innerHTML = '☰';
            headerToggle.title = 'Abrir sidebar';
        }
    } else {
        // Sidebar aberta - definir estado do botão
        if (headerToggle) {
            headerToggle.classList.add('sidebar-open');
            headerToggle.innerHTML = '✕';
            headerToggle.title = 'Fechar sidebar';
        }
    }
    
    console.log('⚙️ Configurações aplicadas');
}

/**
 * Fallback para funcionamento básico sem storage
 */
function initializeFallback() {
    console.warn('⚠️ Executando em modo fallback');
    gridSize = 16;
}

/**
 * Configuração inicial da grade de players
 */
function initializeGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    
    for (let i = 0; i < gridSize; i++) {
        createPlayerBox(i);
    }
}

/**
 * Criação de uma caixa de player individual
 * @param {number} index - Índice do player
 */
function createPlayerBox(index) {
    const grid = document.getElementById('grid');
    const playerBox = document.createElement('div');
    playerBox.className = 'player-box';
    playerBox.id = `player-${index}`;
    
    playerBox.innerHTML = `
        <div class="player-header">
            <div class="channel-info">
                <div class="channel-logo" id="logo-${index}">📺</div>
                <div class="channel-name" id="name-${index}">Player ${index + 1}</div>
            </div>
            <div class="player-controls">
                <button class="control-btn" onclick="toggleAudio(${index})" title="Áudio">🔊</button>
                <button class="control-btn" onclick="maximizePlayer(${index})" title="Maximizar">⛶</button>
                <button class="control-btn" onclick="removePlayer(${index})" title="Remover">✕</button>
            </div>
        </div>
        <div class="player-content" id="content-${index}">
            <div class="video-placeholder">Clique em um canal para carregar</div>
            <div class="status-indicator" id="status-${index}"></div>
        </div>
    `;
    
    grid.appendChild(playerBox);
}

/**
 * Carregamento de canal para o próximo player disponível
 * @param {string} name - Nome do canal
 * @param {string} url - URL do stream
 * @param {string} country - Código do país
 */
function loadChannel(name, url, country) {
    let targetPlayer = 0;
    for (let i = 0; i < gridSize; i++) {
        const content = document.getElementById(`content-${i}`);
        if (content && content.querySelector('.video-placeholder')) {
            targetPlayer = i;
            break;
        }
        targetPlayer = i;
    }

    loadChannelToPlayer(targetPlayer, name, url, country);
}

/**
 * Carregamento de canal para um player específico
 * @param {number} playerIndex - Índice do player
 * @param {string} name - Nome do canal
 * @param {string} url - URL do stream
 * @param {string} country - Código do país
 */
function loadChannelToPlayer(playerIndex, name, url, country) {
    const nameElement = document.getElementById(`name-${playerIndex}`);
    const logoElement = document.getElementById(`logo-${playerIndex}`);
    const contentElement = document.getElementById(`content-${playerIndex}`);

    if (!nameElement || !contentElement) return;

    // Destruir player existente
    const existingVideo = contentElement.querySelector('video');
    if (existingVideo && existingVideo.id) {
        try {
            const existingPlayer = videojs.getPlayer(existingVideo.id);
            if (existingPlayer) {
                existingPlayer.dispose();
            }
        } catch (e) {
            console.log('Erro ao destruir player existente:', e);
        }
    }

    // Atualizar informações
    nameElement.textContent = name;
    logoElement.textContent = getCountryFlag(country);

    // Criar novo player
    const videoId = `video-${playerIndex}`;
    contentElement.innerHTML = `
        <video
            id="${videoId}"
            class="video-js vjs-default-skin"
            controls
            preload="auto"
            data-setup="{}"
            style="width: 100%; height: 100%;">
            <source src="${url}" type="application/x-mpegURL">
            <p class="vjs-no-js">Para visualizar este vídeo, ative o JavaScript.</p>
        </video>
        <div class="status-indicator" id="status-${playerIndex}"></div>
    `;

    setTimeout(() => {
        try {
            const player = videojs(videoId, {
                fluid: true,
                responsive: true,
                aspectRatio: '16:9',
                liveui: true,
                playsinline: true,
                muted: true,
                controls: true,
                fill: false,
                html5: {
                    hls: {
                        enableLowInitialPlaylist: true,
                        smoothQualityChange: true,
                        overrideNative: true
                    }
                }
            });

            player.ready(() => {
                player.play().catch(e => {
                    console.log(`Autoplay falhou para ${name}:`, e);
                });

                // Garantir object-fit: contain
                const videoElement = player.el().querySelector('video');
                if (videoElement) {
                    videoElement.style.objectFit = 'contain';
                    videoElement.style.width = '100%';
                    videoElement.style.height = '100%';
                }

                const statusIndicator = document.getElementById(`status-${playerIndex}`);
                if (statusIndicator) {
                    statusIndicator.classList.add('live');
                }
            });

            player.on('error', (e) => {
                console.error(`Erro no player ${playerIndex}:`, e);
                setTimeout(() => {
                    contentElement.innerHTML = `
                        <div class="video-placeholder" style="color: #dc3545; text-align: center;">
                            <div style="font-size: 24px; margin-bottom: 10px;">❌</div>
                            <div>Erro ao carregar: ${name}</div>
                            <small style="opacity: 0.7;">Verifique a URL</small>
                        </div>
                        <div class="status-indicator" style="background: #dc3545;"></div>
                    `;
                }, 1000);
            });

            contentElement.dataset.channelName = name;
            contentElement.dataset.channelUrl = url;
            contentElement.dataset.channelCountry = country;

        } catch (error) {
            console.error(`Erro ao inicializar player ${playerIndex}:`, error);
            contentElement.innerHTML = `
                <div class="video-placeholder" style="color: #dc3545; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                    <div>Erro ao inicializar</div>
                    <small>${name}</small>
                </div>
            `;
        }
    }, 100);
}

/**
 * Obter emoji da bandeira do país
 * @param {string} countryCode - Código do país
 * @returns {string} Emoji da bandeira
 */
function getCountryFlag(countryCode) {
    const flags = {
        'PT': '🇵🇹', 'Portugal': '🇵🇹',
        'ES': '🇪🇸', 'Espanha': '🇪🇸', 'Spain': '🇪🇸',
        'FR': '🇫🇷', 'França': '🇫🇷', 'France': '🇫🇷',
        'GB': '🇬🇧', 'Reino Unido': '🇬🇧', 'UK': '🇬🇧', 'United Kingdom': '🇬🇧',
        'US': '🇺🇸', 'Estados Unidos': '🇺🇸', 'USA': '🇺🇸', 'United States': '🇺🇸',
        'IT': '🇮🇹', 'Itália': '🇮🇹', 'Italy': '🇮🇹',
        'DE': '🇩🇪', 'Alemanha': '🇩🇪', 'Germany': '🇩🇪',
        'BR': '🇧🇷', 'Brasil': '🇧🇷', 'Brazil': '🇧🇷',
        'NL': '🇳🇱', 'Holanda': '🇳🇱', 'Netherlands': '🇳🇱',
        'BE': '🇧🇪', 'Bélgica': '🇧🇪', 'Belgium': '🇧🇪'
    };
    return flags[countryCode] || '🌍';
}

/**
 * Alternar áudio de um player
 * @param {number} playerIndex - Índice do player
 */
function toggleAudio(playerIndex) {
    const audioControl = document.getElementById('audioControl');
    const channelName = document.getElementById(`name-${playerIndex}`).textContent;
    const contentElement = document.getElementById(`content-${playerIndex}`);
    const videoElement = contentElement.querySelector('video');

    const audioBtn = document.querySelector(`#player-${playerIndex} .player-controls .control-btn`);

    // Desativar áudio de outros players
    for (let i = 0; i < gridSize; i++) {
        if (i !== playerIndex) {
            const otherContent = document.getElementById(`content-${i}`);
            const otherVideo = otherContent?.querySelector('video');
            const otherAudioBtn = document.querySelector(`#player-${i} .player-controls .control-btn`);
            
            if (otherAudioBtn && otherAudioBtn.textContent === '🔇') {
                otherAudioBtn.textContent = '🔊';
                otherAudioBtn.classList.remove('active');
            }
            
            if (otherVideo && otherVideo.id) {
                try {
                    const otherPlayer = videojs.getPlayer(otherVideo.id);
                    if (otherPlayer) {
                        otherPlayer.muted(true);
                        otherPlayer.volume(0);
                    }
                } catch (e) {
                    console.log('Erro ao mutar player:', e);
                }
            }
        }
    }

    if (currentAudioPlayer === playerIndex) {
        currentAudioPlayer = null;
        if (audioBtn) {
            audioBtn.textContent = '🔊';
            audioBtn.classList.remove('active');
        }
        audioControl.textContent = '🔇 Sem áudio ativo';
        
        if (videoElement && videoElement.id) {
            try {
                const player = videojs.getPlayer(videoElement.id);
                if (player) {
                    player.muted(true);
                    player.volume(0);
                }
            } catch (e) {
                console.log('Erro ao mutar player atual:', e);
            }
        }
    } else {
        currentAudioPlayer = playerIndex;
        if (audioBtn) {
            audioBtn.textContent = '🔇';
            audioBtn.classList.add('active');
        }
        audioControl.textContent = `🔊 ${channelName}`;
        
        if (videoElement && videoElement.id) {
            try {
                const player = videojs.getPlayer(videoElement.id);
                if (player) {
                    player.muted(false);
                    player.volume(1);
                }
            } catch (e) {
                console.log('Erro ao desmutar player:', e);
            }
        }
    }
}

/**
 * Maximizar/minimizar um player
 * @param {number} playerIndex - Índice do player
 */
function maximizePlayer(playerIndex) {
    const playerBox = document.getElementById(`player-${playerIndex}`);
    
    if (maximizedPlayer === playerIndex) {
        // Voltar ao modo normal
        playerBox.classList.remove('maximized');
        maximizedPlayer = null;
        
        // Mostrar sidebar novamente
        document.getElementById('sidebar').style.display = 'block';
        
        // Resetar altura do conteúdo do player
        const playerContent = playerBox.querySelector('.player-content');
        if (playerContent) {
            playerContent.style.height = '230px';
        }
        
        // Reinicializar o player para ajustar proporções
        setTimeout(() => {
            const video = playerBox.querySelector('video');
            if (video && video.id) {
                try {
                    const player = videojs.getPlayer(video.id);
                    if (player) {
                        // Forçar redimensionamento
                        player.dimensions('100%', '100%');
                        player.trigger('resize');
                        
                        // Garantir object-fit: contain
                        const videoElement = player.el().querySelector('video');
                        if (videoElement) {
                            videoElement.style.objectFit = 'contain';
                        }
                    }
                } catch (e) {
                    console.log('Erro ao redimensionar player:', e);
                }
            }
        }, 100);
        
    } else {
        // Maximizar este player
        playerBox.classList.add('maximized');
        maximizedPlayer = playerIndex;
        
        // Esconder sidebar
        document.getElementById('sidebar').style.display = 'none';
        
        // Ajustar altura do conteúdo do player para maximizado
        const playerContent = playerBox.querySelector('.player-content');
        if (playerContent) {
            playerContent.style.height = 'calc(100vh - 120px)';
        }
        
        // Reinicializar o player para tela cheia
        setTimeout(() => {
            const video = playerBox.querySelector('video');
            if (video && video.id) {
                try {
                    const player = videojs.getPlayer(video.id);
                    if (player) {
                        // Redimensionar para tela cheia
                        player.dimensions('100%', '100%');
                        player.trigger('resize');
                        
                        // Garantir object-fit: contain para não cortar a imagem
                        const videoElement = player.el().querySelector('video');
                        if (videoElement) {
                            videoElement.style.objectFit = 'contain';
                            videoElement.style.width = '100%';
                            videoElement.style.height = '100%';
                        }
                        
                        // Atualizar CSS do Video.js
                        const playerEl = player.el();
                        if (playerEl) {
                            playerEl.style.width = '100%';
                            playerEl.style.height = '100%';
                        }
                    }
                } catch (e) {
                    console.log('Erro ao maximizar player:', e);
                }
            }
        }, 100);
    }
}

/**
 * Remover player específico
 * @param {number} playerIndex - Índice do player
 */
function removePlayer(playerIndex) {
    const contentElement = document.getElementById(`content-${playerIndex}`);
    const nameElement = document.getElementById(`name-${playerIndex}`);
    const logoElement = document.getElementById(`logo-${playerIndex}`);

    const videoElement = contentElement.querySelector('video');
    if (videoElement && videoElement.id) {
        try {
            const player = videojs.getPlayer(videoElement.id);
            if (player) {
                player.dispose();
            }
        } catch (e) {
            console.log('Erro ao destruir player:', e);
        }
    }

    if (currentAudioPlayer === playerIndex) {
        currentAudioPlayer = null;
        document.getElementById('audioControl').textContent = '🔇 Sem áudio ativo';
    }

    if (maximizedPlayer === playerIndex) {
        maximizedPlayer = null;
        document.getElementById('sidebar').style.display = 'block';
    }

    contentElement.innerHTML = '<div class="video-placeholder">Clique em um canal para carregar</div>';
    nameElement.textContent = 'Player ' + (playerIndex + 1);
    logoElement.textContent = '📺';
}

/**
 * Alternar visibilidade da sidebar
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const headerToggle = document.querySelector('.toggle-sidebar-header');
    
    sidebar.classList.toggle('collapsed');
    
    // Atualizar aparência do botão no header
    if (sidebar.classList.contains('collapsed')) {
        headerToggle.classList.remove('sidebar-open');
        headerToggle.innerHTML = '☰'; // Ícone de menu para abrir
        headerToggle.title = 'Abrir sidebar';
    } else {
        headerToggle.classList.add('sidebar-open');
        headerToggle.innerHTML = '✕'; // Ícone de fechar quando aberta
        headerToggle.title = 'Fechar sidebar';
    }
    
    // Redimensionar players após mudança de layout
    setTimeout(() => {
        resizeAllPlayers();
    }, 300); // Aguardar transição CSS
    
    // Salvar estado se o config manager estiver disponível
    if (configManager) {
        const isCollapsed = sidebar.classList.contains('collapsed');
        configManager.set('sidebarCollapsed', isCollapsed);
    }
}

/**
 * Redimensiona todos os players ativos
 */
function resizeAllPlayers() {
    document.querySelectorAll('video').forEach(video => {
        if (video.id) {
            try {
                const player = videojs.getPlayer(video.id);
                if (player) {
                    player.trigger('resize');
                    
                    // Garantir object-fit correto
                    const videoElement = player.el().querySelector('video');
                    if (videoElement) {
                        videoElement.style.objectFit = 'contain';
                        videoElement.style.width = '100%';
                        videoElement.style.height = '100%';
                    }
                }
            } catch (e) {
                console.log('Erro ao redimensionar player:', e);
            }
        }
    });
}

/**
 * Alternar maximização de todos os players
 */
function toggleMaximizeAll() {
    const grid = document.getElementById('grid');
    maximizedMode = !maximizedMode;
    
    if (maximizedMode) {
        grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        document.querySelectorAll('.player-box').forEach(box => {
            box.style.minHeight = '350px';
            const playerContent = box.querySelector('.player-content');
            if (playerContent) {
                playerContent.style.height = '300px';
            }
        });
    } else {
        grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        document.querySelectorAll('.player-box').forEach(box => {
            box.style.minHeight = '280px';
            const playerContent = box.querySelector('.player-content');
            if (playerContent) {
                playerContent.style.height = '230px';
            }
        });
    }
    
    // Redimensionar todos os players ativos
    setTimeout(() => {
        document.querySelectorAll('video').forEach(video => {
            if (video.id) {
                try {
                    const player = videojs.getPlayer(video.id);
                    if (player) {
                        player.trigger('resize');
                        const videoElement = player.el().querySelector('video');
                        if (videoElement) {
                            videoElement.style.objectFit = 'contain';
                        }
                    }
                } catch (e) {
                    console.log('Erro ao redimensionar player:', e);
                }
            }
        });
    }, 100);
}

// ================================
// FUNÇÕES DE CONFIGURAÇÃO MODAL
// ================================

/**
 * Abrir modal de configuração
 */
function openConfigModal() {
    document.getElementById('configModal').classList.add('active');
    loadChannelList();
}

/**
 * Fechar modal de configuração
 */
function closeConfigModal() {
    document.getElementById('configModal').classList.remove('active');
}

/**
 * Mostrar aba específica do modal de configuração
 * @param {string} tabName - Nome da aba
 */
function showConfigTab(tabName) {
    // Remover active de todas as tabs
    document.querySelectorAll('.config-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Esconder todos os painéis
    document.querySelectorAll('.config-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Ativar tab clicada
    event.target.classList.add('active');
    
    // Mostrar painel correspondente
    document.getElementById(tabName + '-panel').classList.add('active');
}

/**
 * Carrega canais na sidebar
 */
function loadSidebarChannels() {
    if (!channelsManager) return;
    
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Remover seções de canais existentes (manter header)
    const existingSections = sidebar.querySelectorAll('.category-section');
    existingSections.forEach(section => section.remove());

    const channels = channelsManager.getAll();
    const categorizedChannels = {};

    // Filtrar apenas canais ativos e agrupar por categoria e país
    const activeChannels = channels.filter(channel => channel.isActive !== false);
    activeChannels.forEach(channel => {
        const key = `${channel.country}-${channel.category}`;
        if (!categorizedChannels[key]) {
            categorizedChannels[key] = {
                country: channel.country,
                category: channel.category,
                channels: []
            };
        }
        categorizedChannels[key].channels.push(channel);
    });

    // Criar seções na sidebar
    Object.values(categorizedChannels).forEach(group => {
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        categorySection.setAttribute('data-category', group.category);

        const flag = getCountryFlag(group.country);
        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = `${flag} ${group.country} - ${group.category}`;

        categorySection.appendChild(categoryTitle);

        // Adicionar canais da categoria
        group.channels.forEach(channel => {
            const channelItem = document.createElement('div');
            channelItem.className = 'channel-item';
            channelItem.onclick = () => loadChannel(channel.name, channel.url, channel.country);

            const channelFlag = getCountryFlag(channel.country);
            channelItem.innerHTML = `
                <div class="channel-flag">${channelFlag}</div>
                <span>${channel.name}</span>
            `;

            categorySection.appendChild(channelItem);
        });

        sidebar.appendChild(categorySection);
    });
}

// Atualizar função addChannel para tratar edição
function addChannel() {
    if (!channelsManager) {
        alert('Sistema de canais não está disponível');
        return;
    }

    const name = document.getElementById('channelName').value.trim();
    const url = document.getElementById('channelUrl').value.trim();
    const country = document.getElementById('channelCountry').value.trim();
    const category = document.getElementById('channelCategory').value;
    const description = document.getElementById('channelDescription').value.trim();

    const channelData = {
        name,
        url,
        country: country || 'Desconhecido',
        category,
        description
    };

    let result;
    
    // Verificar se está editando
    if (window.currentEditChannelId) {
        result = channelsManager.update(window.currentEditChannelId, channelData);
        window.currentEditChannelId = null;
    } else {
        result = channelsManager.add(channelData);
    }

    if (result.success) {
        // Recarregar sidebar e lista
        loadSidebarChannels();
        loadChannelList();

        // Limpar formulário
        clearChannelForm();
        
        const message = window.currentEditChannelId ? 'atualizado' : 'adicionado';
        alert(`Canal "${name}" ${message} com sucesso!`);
    } else {
        alert(`Erro ao processar canal: ${result.error}`);
    }
}

/**
 * Adicionar canal à sidebar
 * @param {Object} channel - Objeto do canal
 */
function addChannelToSidebar(channel) {
    const sidebar = document.getElementById('sidebar');
    
    let categorySection = document.querySelector(`[data-category="${channel.category}"]`);
    
    if (!categorySection) {
        categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        categorySection.setAttribute('data-category', channel.category);
        
        const flag = getCountryFlag(channel.country) || '🌍';
        const categoryTitle = document.createElement('div');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = `${flag} ${channel.category} (Customizado)`;
        
        categorySection.appendChild(categoryTitle);
        sidebar.appendChild(categorySection);
    }
    
    const channelItem = document.createElement('div');
    channelItem.className = 'channel-item';
    channelItem.onclick = () => loadChannel(channel.name, channel.url, channel.country);
    
    const flag = getCountryFlag(channel.country) || '🌍';
    channelItem.innerHTML = `
        <div class="channel-flag">${flag}</div>
        <span>${channel.name}</span>
    `;
    
    categorySection.appendChild(channelItem);
}

/**
 * Carregar lista de canais na configuração
 */
function loadChannelList() {
    const channelList = document.getElementById('channelList');
    if (!channelList) return;
    
    channelList.innerHTML = '';

    if (!channelsManager) {
        channelList.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">Sistema de canais não disponível</div>';
        return;
    }

    const channels = channelsManager.getAll();

    if (channels.length === 0) {
        channelList.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">Nenhum canal encontrado</div>';
        return;
    }

    // Ordenar canais: padrão primeiro, depois customizados
    const sortedChannels = channels.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return a.name.localeCompare(b.name);
    });

    sortedChannels.forEach(channel => {
        const channelItem = document.createElement('div');
        channelItem.className = 'channel-item-config';
        
        const isDefault = channel.isDefault;
        const isActive = channel.isActive !== false; // Padrão é true se não definido
        
        // Para canais padrão: botões "Editar" e "Desativar/Ativar"
        // Para canais customizados: botões "Editar" e "Excluir"
        const editLabel = 'Editar';
        let actionButton = '';
        
        if (isDefault) {
            const toggleLabel = isActive ? 'Disabled' : 'Active';
            const toggleClass = isActive ? 'deactivate-channel-btn' : 'activate-channel-btn';
            actionButton = `<button class="${toggleClass}" onclick="toggleChannelStatus(${channel.id})">${toggleLabel}</button>`;
        } else {
            actionButton = `<button class="delete-channel-btn" onclick="deleteChannel(${channel.id})">Excluir</button>`;
        }
        
        const statusText = isDefault ? (isActive ? '(Default - Active)' : '(Default - Disabled)') : '';
        const itemClass = !isActive ? 'channel-item-config inactive' : 'channel-item-config';
        channelItem.className = itemClass;
        
        channelItem.innerHTML = `
            <div class="channel-name">
                ${getCountryFlag(channel.country)} ${channel.name}
                ${statusText ? `<small style="color: ${isActive ? '#007bff' : '#dc3545'};">${statusText}</small>` : ''}
            </div>
            <div class="channel-url">${channel.url}</div>
            <div class="channel-actions">
                <button class="edit-channel-btn" onclick="editChannelConfig(${channel.id})">${editLabel}</button>
                ${actionButton}
            </div>
        `;
        channelList.appendChild(channelItem);
    });
}

/**
 * Editar configuração de canal
 * @param {number} id - ID do canal
 */
function editChannelConfig(id) {
    if (!channelsManager) {
        alert('Sistema de canais não está disponível');
        return;
    }

    const channel = channelsManager.getById(id);
    if (!channel) {
        alert('Canal não encontrado');
        return;
    }

    // Preencher formulário
    document.getElementById('channelName').value = channel.name;
    document.getElementById('channelUrl').value = channel.url;
    document.getElementById('channelCountry').value = channel.country;
    document.getElementById('channelCategory').value = channel.category;
    document.getElementById('channelDescription').value = channel.description || '';
    
    // Definir modo de edição
    window.currentEditChannelId = id;
    
    // Mudar para aba de adicionar
    showConfigTab('add');
    
    // Atualizar interface para edição
    const addButton = document.querySelector('#addChannelForm .btn');
    const formTitle = document.querySelector('#add-panel h3');
    
    if (channel.isDefault) {
        if (formTitle) formTitle.textContent = `Editar Canal Padrão: ${channel.name}`;
        if (addButton) {
            addButton.textContent = 'Atualizar Canal Padrão';
            addButton.disabled = false;
            addButton.style.background = '#ffc107';
            addButton.style.color = '#000';
        }
        
        // Adicionar aviso para canais padrão
        let warningDiv = document.getElementById('default-channel-warning');
        if (!warningDiv) {
            warningDiv = document.createElement('div');
            warningDiv.id = 'default-channel-warning';
            warningDiv.style.cssText = 'background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #ffeaa7;';
            document.getElementById('addChannelForm').insertBefore(warningDiv, document.getElementById('addChannelForm').firstChild);
        }
        warningDiv.innerHTML = '⚠️ <strong>Canal Padrão:</strong> Suas alterações serão salvas localmente e substituirão o canal original.';
    } else {
        if (formTitle) formTitle.textContent = `Editar Canal: ${channel.name}`;
        if (addButton) {
            addButton.textContent = 'Atualizar Canal';
            addButton.disabled = false;
            addButton.style.background = '#28a745';
            addButton.style.color = '#fff';
        }
        
        // Remover aviso se existir
        const warningDiv = document.getElementById('default-channel-warning');
        if (warningDiv) warningDiv.remove();
    }
}

/**
 * Deletar canal customizado
 * @param {number} id - ID do canal
 */
function deleteChannel(id) {
    if (!channelsManager) {
        alert('Sistema de canais não está disponível');
        return;
    }

    const channel = channelsManager.getById(id);
    if (!channel) {
        alert('Canal não encontrado');
        return;
    }

    // Verificar se é canal padrão
    if (channel.isDefault) {
        const userChoice = confirm(
            `"${channel.name}" é um canal padrão e não pode ser excluído permanentemente.\n\n` +
            `Deseja DESATIVAR este canal? (Ele ficará oculto mas pode ser reativado depois)\n\n` +
            `Clique OK para desativar ou Cancelar para manter ativo.`
        );
        
        if (userChoice) {
            toggleChannelStatus(id);
        }
        return;
    }

    if (confirm(`Tem certeza que deseja excluir permanentemente o canal "${channel.name}"?`)) {
        const result = channelsManager.remove(id);
        
        if (result.success) {
            // Recarregar lista
            loadChannelList();
            
            // Remover da sidebar - recarregar sidebar completa
            loadSidebarChannels();
            
            alert('Canal excluído com sucesso!');
        } else {
            alert(`Erro ao excluir canal: ${result.error}`);
        }
    }
}

/**
 * Ativar/Desativar canal (principalmente para canais padrão)
 * @param {number} id - ID do canal
 */
function toggleChannelStatus(id) {
    if (!channelsManager) {
        alert('Sistema de canais não está disponível');
        return;
    }

    const channel = channelsManager.getById(id);
    if (!channel) {
        alert('Canal não encontrado');
        return;
    }

    const currentStatus = channel.isActive !== false;
    const newStatus = !currentStatus;
    const action = newStatus ? 'ativar' : 'desativar';
    
    if (confirm(`Tem certeza que deseja ${action} o canal "${channel.name}"?`)) {
        const updatedChannel = { ...channel, isActive: newStatus };
        const result = channelsManager.update(id, updatedChannel);
        
        if (result.success) {
            // Recarregar lista e sidebar
            loadChannelList();
            loadSidebarChannels();
            
            const statusMessage = newStatus ? 'ativado' : 'desativado';
            alert(`Canal "${channel.name}" ${statusMessage} com sucesso!`);
        } else {
            alert(`Erro ao ${action} canal: ${result.error}`);
        }
    }
}

/**
 * Limpa o formulário de canal
 */
function clearChannelForm() {
    document.getElementById('channelName').value = '';
    document.getElementById('channelUrl').value = '';
    document.getElementById('channelCountry').value = '';
    document.getElementById('channelCategory').value = 'Notícias';
    document.getElementById('channelDescription').value = '';
    
    // Limpar modo de edição
    window.currentEditChannelId = null;
    
    // Resetar interface
    const formTitle = document.querySelector('#add-panel h3');
    const addButton = document.querySelector('#addChannelForm .btn');
    const warningDiv = document.getElementById('default-channel-warning');
    
    if (formTitle) formTitle.textContent = 'Adicionar Novo Canal';
    if (addButton) {
        addButton.textContent = 'Adicionar Canal';
        addButton.disabled = false;
        addButton.style.background = '#007bff';
        addButton.style.color = '#fff';
    }
    if (warningDiv) warningDiv.remove();
}

/**
 * Alterar layout da grade
 */
function changeGridLayout() {
    const layout = document.getElementById('gridLayout').value;
    
    if (configManager) {
        configManager.setGridLayout(layout);
        gridSize = configManager.getGridSize();
    } else {
        // Fallback
        const grid = document.getElementById('grid');
        switch (layout) {
            case '2x2':
                gridSize = 4;
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                break;
            case '3x3':
                gridSize = 9;
                grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
                break;
            case '4x4':
            default:
                gridSize = 16;
                grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
                break;
        }
    }
    
    initializeGrid();
}

/**
 * Salvar configurações
 */
function saveConfig() {
    alert('Configurações salvas com sucesso!');
    closeConfigModal();
}

/**
 * Exporta todos os dados
 */
function exportData() {
    if (!storage) {
        alert('Sistema de storage não disponível');
        return;
    }

    try {
        const data = storage.export();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `tv-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        alert('Dados exportados com sucesso!');
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        alert('Erro ao exportar dados');
    }
}

/**
 * Aciona importação de dados
 */
function importData() {
    const fileInput = document.getElementById('importFileInput');
    if (fileInput) {
        fileInput.click();
    }
}

/**
 * Processa arquivo importado
 */
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!storage) {
                alert('Sistema de storage não disponível');
                return;
            }

            const result = storage.import(data);
            if (result) {
                // Recarregar módulos
                if (channelsManager) channelsManager.reload();
                if (configManager) configManager.reload();
                
                // Recarregar interface
                loadSidebarChannels();
                loadChannelList();
                applyStoredConfigurations();
                
                alert('Dados importados com sucesso!');
            } else {
                alert('Erro ao importar dados');
            }
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            alert('Arquivo inválido ou corrompido');
        }
    };
    
    reader.readAsText(file);
    
    // Limpar input
    event.target.value = '';
}

/**
 * Limpa todos os dados
 */
function clearAllData() {
    if (!storage) {
        alert('Sistema de storage não disponível');
        return;
    }

    const confirmText = 'CONFIRMAR';
    const userInput = prompt(
        `⚠️ ATENÇÃO: Esta ação irá apagar TODOS os dados salvos (canais, configurações, etc.).\n\n` +
        `Esta ação é IRREVERSÍVEL!\n\n` +
        `Digite "${confirmText}" para confirmar:`
    );

    if (userInput === confirmText) {
        try {
            storage.clear();
            
            // Recarregar módulos
            if (channelsManager) channelsManager.reload();
            if (configManager) configManager.reload();
            
            // Recarregar interface
            loadSidebarChannels();
            loadChannelList();
            applyStoredConfigurations();
            
            alert('Todos os dados foram limpos. A aplicação foi reinicializada com dados padrão.');
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            alert('Erro ao limpar dados');
        }
    } else if (userInput !== null) {
        alert('Confirmação incorreta. Operação cancelada.');
    }
}

/**
 * Muda tema da aplicação
 */
function changeTheme() {
    const themeSelect = document.getElementById('themeMode');
    if (!themeSelect) return;

    const theme = themeSelect.value;
    
    if (configManager) {
        configManager.setTheme(theme);
    } else {
        // Fallback
        const body = document.body;
        if (theme === 'light') {
            body.classList.add('light-theme');
            body.classList.remove('dark-theme');
        } else {
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
        }
    }
}

// ================================
// EVENT LISTENERS
// ================================

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Atalhos de teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (maximizedPlayer !== null) {
                maximizePlayer(maximizedPlayer);
            } else {
                closeConfigModal();
            }
        }
        
        if (e.key === 's' && e.ctrlKey) {
            e.preventDefault();
            toggleSidebar();
        }

        if (e.key === 'c' && e.ctrlKey) {
            e.preventDefault();
            openConfigModal();
        }
    });

    // Fechar modal ao clicar fora
    document.getElementById('configModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeConfigModal();
        }
    });
} 