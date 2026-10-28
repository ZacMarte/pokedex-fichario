import { useState } from 'react';
import { ArrowLeft, Book, Plus, X, Check, Save } from 'lucide-react';

const CARD_RATIO = '6.3 / 8.8';

export default function AlbumBook({ onClose, albums, onSaveAlbums }) {
  const [view, setView] = useState(albums.length === 0 ? 'select-size' : 'list');
  const [gridSize, setGridSize] = useState(null);
  const [pages, setPages] = useState([]);
  const [activeAlbumId, setActiveAlbumId] = useState(null);
  
  const [activeSlot, setActiveSlot] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  // Modal para nomear o álbum ao salvar
  const [isNaming, setIsNaming] = useState(false);
  const [albumName, setAlbumName] = useState('');

  const handleCreateNew = () => setView('select-size');

  const startAlbum = (size) => {
    setGridSize(size);
    const totalSlots = size * size;
    setPages([
      Array(totalSlots).fill(null),
      Array(totalSlots).fill(null),
    ]);
    setActiveAlbumId(null); // Novo álbum
    setView('edit');
  };

  const openAlbum = (album) => {
    setGridSize(album.gridSize);
    setPages(album.pages);
    setActiveAlbumId(album.id);
    setView('edit');
  };

  const addSpread = () => {
    const totalSlots = gridSize * gridSize;
    setPages((prev) => [
      ...prev,
      Array(totalSlots).fill(null),
      Array(totalSlots).fill(null),
    ]);
  };

  const handleSlotClick = (pageIndex, slotIndex) => {
    setActiveSlot({ pageIndex, slotIndex });
    setImageUrl(pages[pageIndex][slotIndex] || '');
  };

  const saveImage = () => {
    if (!activeSlot) return;
    const { pageIndex, slotIndex } = activeSlot;
    
    setPages((prev) => {
      const newPages = [...prev];
      newPages[pageIndex] = [...newPages[pageIndex]];
      newPages[pageIndex][slotIndex] = imageUrl.trim() || null;
      return newPages;
    });
    
    setActiveSlot(null);
    setImageUrl('');
  };

  const removeImage = (e, pageIndex, slotIndex) => {
    e.stopPropagation();
    setPages((prev) => {
      const newPages = [...prev];
      newPages[pageIndex] = [...newPages[pageIndex]];
      newPages[pageIndex][slotIndex] = null;
      return newPages;
    });
  };

  // Salva o álbum na lista global (chamando o App)
  const confirmSave = () => {
    if (!albumName.trim()) return;

    const newAlbum = {
      id: activeAlbumId || Date.now().toString(), // Gera um ID se for novo
      name: albumName.trim(),
      gridSize,
      pages,
    };

    let updatedAlbums;
    if (activeAlbumId) {
      // Atualiza existente
      updatedAlbums = albums.map(a => a.id === activeAlbumId ? newAlbum : a);
    } else {
      // Adiciona novo
      updatedAlbums = [...albums, newAlbum];
    }

    onSaveAlbums(updatedAlbums);
    setIsNaming(false);
    setView('list'); // Volta pra lista
  };

  // Abre o modal de salvar
  const handleSaveClick = () => {
    const existing = albums.find(a => a.id === activeAlbumId);
    setAlbumName(existing ? existing.name : '');
    setIsNaming(true);
  };

  // --- RENDERIZAÇÃO: LISTA DE ÁLBUNS ---
  if (view === 'list') {
    return (
      <div className="album-container">
        <div className="album-header">
          <button className="back-button" onClick={onClose}>
            <ArrowLeft size={16} /> Voltar ao início
          </button>
          <h2>Meus Álbuns</h2>
          <div style={{ width: '80px' }} />
        </div>

        <div className="album-list-grid">
          {albums.map(album => (
            <button key={album.id} className="album-list-card" onClick={() => openAlbum(album)}>
              <Book size={24} className="album-list-icon" />
              <strong>{album.name}</strong>
              <span>{album.gridSize}x{album.gridSize}</span>
            </button>
          ))}
          
          <button className="album-list-card new-album" onClick={handleCreateNew}>
            <Plus size={24} />
            <strong>Novo Álbum</strong>
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO: ESCOLHA DE TAMANHO ---
  if (view === 'select-size') {
    return (
      <div className="album-setup">
        <button className="back-button" onClick={() => albums.length > 0 ? setView('list') : onClose()}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="album-setup-content">
          <Book size={48} className="album-setup-icon" />
          <h2>Criar Novo Álbum</h2>
          <p>Escolha o tamanho do fichário.</p>
          <div className="album-size-options">
            <button onClick={() => startAlbum(3)}>3 x 3</button>
            <button onClick={() => startAlbum(4)}>4 x 4</button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO: EDITOR DO ÁLBUM ---
  const spreads = [];
  for (let i = 0; i < pages.length; i += 2) {
    spreads.push([i, i + 1]);
  }

  return (
    <div className="album-container">
      <div className="album-header">
        <button className="back-button" onClick={() => setView('list')}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <h2>{albums.find(a => a.id === activeAlbumId)?.name || 'Novo Álbum'}</h2>
        
        {/* BOTÃO DE SALVAR NOVO */}
        <button className="btn-save-album" onClick={handleSaveClick}>
          <Save size={16} /> Salvar
        </button>
      </div>

      <div className="album-spreads-wrapper">
        {spreads.map((spread, spreadIndex) => (
          <div key={spreadIndex} className="album-spread">
            {/* ... O código das páginas esquerda e direita é o mesmo de antes ... */}
            {pages[spread[0]] && (
              <div className="album-page page-left">
                <div className="album-grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                  {pages[spread[0]].map((url, slotIndex) => (
                    <div key={slotIndex} className={`album-slot ${url ? 'has-image' : ''}`} style={{ aspectRatio: CARD_RATIO }} onClick={() => handleSlotClick(spread[0], slotIndex)}>
                      {url ? (
                        <>
                          <img src={url} alt="Carta" className="album-card-img" />
                          <button className="album-remove-btn" onClick={(e) => removeImage(e, spread[0], slotIndex)}><X size={12} /></button>
                        </>
                      ) : (
                        <div className="album-slot-add"><Plus size={24} /></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pages[spread[1]] && (
              <div className="album-page page-right">
                <div className="album-grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                  {pages[spread[1]].map((url, slotIndex) => (
                    <div key={slotIndex} className={`album-slot ${url ? 'has-image' : ''}`} style={{ aspectRatio: CARD_RATIO }} onClick={() => handleSlotClick(spread[1], slotIndex)}>
                      {url ? (
                        <>
                          <img src={url} alt="Carta" className="album-card-img" />
                          <button className="album-remove-btn" onClick={(e) => removeImage(e, spread[1], slotIndex)}><X size={12} /></button>
                        </>
                      ) : (
                        <div className="album-slot-add"><Plus size={24} /></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="album-footer">
        <button className="album-add-page-btn" onClick={addSpread}>
          <Plus size={18} /> Adicionar mais páginas
        </button>
      </div>

      {/* MODAL DE ADICIONAR CARTA */}
      {activeSlot && (
        <div className="modal-overlay" onClick={() => setActiveSlot(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Adicionar carta</h3>
            <input type="url" placeholder="Link da imagem..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} autoFocus />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setActiveSlot(null)}>Cancelar</button>
              <button className="btn-save" onClick={saveImage}>Inserir</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SALVAR (NOMEAR) */}
      {isNaming && (
        <div className="modal-overlay" onClick={() => setIsNaming(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Salvar Álbum</h3>
            <p>Dê um nome para o seu álbum.</p>
            <input type="text" placeholder="Ex: Coleção Kanto..." value={albumName} onChange={(e) => setAlbumName(e.target.value)} autoFocus />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsNaming(false)}>Cancelar</button>
              <button className="btn-save" onClick={confirmSave} disabled={!albumName.trim()}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}