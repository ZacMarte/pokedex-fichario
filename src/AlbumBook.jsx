import { useState, useMemo } from 'react'; // <-- Importante: useMemo
import { ArrowLeft, Book, Plus, X, Save, Trash2, Sparkles } from 'lucide-react';
import CardSearchModal from './CardSearchModal';

const CARD_RATIO = '6.3 / 8.8';

const REGIONS = [
  { name: 'Kanto', start: 1, end: 151 },
  { name: 'Johto', start: 152, end: 251 },
  { name: 'Hoenn', start: 252, end: 386 },
  { name: 'Sinnoh', start: 387, end: 493 },
  { name: 'Unova', start: 494, end: 649 },
  { name: 'Kalos', start: 650, end: 721 },
  { name: 'Alola', start: 722, end: 809 },
  { name: 'Galar', start: 810, end: 905 },
  { name: 'Paldea', start: 906, end: 1025 },
  { name: 'Nacional (Todos)', start: 1, end: 1025 },
];

const sprite = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export default function AlbumBook({ onClose, albums, onSaveAlbums }) {
  const [view, setView] = useState(albums.length === 0 ? 'select-size' : 'list');
  const [gridSize, setGridSize] = useState(null);
  const [pages, setPages] = useState([]);
  const [activeAlbumId, setActiveAlbumId] = useState(null);
  
  const [activeSlot, setActiveSlot] = useState(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const [isNaming, setIsNaming] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // --- CÁLCULO DO VALOR TOTAL DO ÁLBUM ---
  const albumTotalValue = useMemo(() => {
    let total = 0;
    pages.forEach(page => {
      if (!page) return;
      page.forEach(slot => {
        if (slot?.price) total += Number(slot.price);
      });
    });
    return total;
  }, [pages]);

  const handleCreateNew = () => setView('select-size');

  const startEmptyAlbum = (size) => {
    setGridSize(size);
    const totalSlots = size * size;
    setPages([
      Array(totalSlots).fill(null),
      Array(totalSlots).fill(null),
    ]);
    setActiveAlbumId(null);
    setView('edit');
  };

  const startThemedAlbum = (region, size) => {
    setGridSize(size);
    const totalSlots = size * size;
    const pokemonList = [];
    for (let i = region.start; i <= region.end; i++) {
      pokemonList.push({ pokemonId: i, imageUrl: null, price: 0 });
    }

    const newPages = [];
    for (let i = 0; i < pokemonList.length; i += totalSlots) {
      const page = pokemonList.slice(i, i + totalSlots);
      while (page.length < totalSlots) page.push(null);
      newPages.push(page);
    }
    if (newPages.length % 2 !== 0) {
      newPages.push(Array(totalSlots).fill(null));
    }

    setPages(newPages);
    setActiveAlbumId(null);
    setAlbumName(`Região ${region.name}`);
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

  const handleSlotClick = (e, pageIndex, slotIndex) => {
    e.preventDefault();
    setActiveSlot({ pageIndex, slotIndex });
    setIsSearchModalOpen(true);
  };

  // Recebe a imagem e o preço do modal
  const handleSelectCard = (imageUrl, price) => {
    if (!activeSlot) return;
    const { pageIndex, slotIndex } = activeSlot;
    
    setPages((prev) => {
      const newPages = [...prev];
      const newPage = [...newPages[pageIndex]];
      
      if (newPage[slotIndex]) {
        // Mantém o pokemonId, mas atualiza imagem e preço
        newPage[slotIndex] = { ...newPage[slotIndex], imageUrl, price };
      } else {
        newPage[slotIndex] = { pokemonId: null, imageUrl, price };
      }
      
      newPages[pageIndex] = newPage;
      return newPages;
    });
  };

  const removeImage = (e, pageIndex, slotIndex) => {
    e.stopPropagation();
    setPages((prev) => {
      const newPages = [...prev];
      const newPage = [...newPages[pageIndex]];
      
      if (newPage[slotIndex]) {
        if (newPage[slotIndex].pokemonId) {
          // Se for temático, volta a ser silhueta (zera o preço)
          newPage[slotIndex] = { ...newPage[slotIndex], imageUrl: null, price: 0 };
        } else {
          newPage[slotIndex] = null;
        }
      }
      
      newPages[pageIndex] = newPage;
      return newPages;
    });
  };

  const confirmSave = () => {
    if (!albumName.trim()) return;

    const newAlbum = {
      id: activeAlbumId || Date.now().toString(),
      name: albumName.trim(),
      gridSize,
      pages,
    };

    let updatedAlbums;
    if (activeAlbumId) {
      updatedAlbums = albums.map(a => a.id === activeAlbumId ? newAlbum : a);
    } else {
      updatedAlbums = [...albums, newAlbum];
    }

    onSaveAlbums(updatedAlbums);
    setIsNaming(false);
    setView('list');
  };

  const handleSaveClick = () => {
    const existing = albums.find(a => a.id === activeAlbumId);
    setAlbumName(existing ? existing.name : albumName);
    setIsNaming(true);
  };

  const handleDeleteClick = () => {
    if (!activeAlbumId) {
      setView('list');
      return;
    }
    setIsDeleting(true);
  };

  const confirmDelete = () => {
    const updatedAlbums = albums.filter(a => a.id !== activeAlbumId);
    onSaveAlbums(updatedAlbums);
    setIsDeleting(false);
    setView('list');
  };

  // --- RENDERIZAÇÃO ---
  if (view === 'list') {
    return (
      <div className="album-container">
        <div className="album-header">
          <div style={{ width: '80px' }} />
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

  if (view === 'select-size') {
    return (
      <div className="album-setup">
        <button className="back-button" onClick={() => albums.length > 0 ? setView('list') : onClose()}>
          <ArrowLeft size={16} /> Voltar
        </button>
        
        <div className="album-setup-content">
          <h2>Escolha o Tamanho</h2>
          <p>Primeiro, defina o tamanho do grid.</p>
          <div className="album-size-options" style={{ marginBottom: '40px' }}>
            <button onClick={() => setGridSize(3)} className={gridSize === 3 ? 'active' : ''}>3 x 3</button>
            <button onClick={() => setGridSize(4)} className={gridSize === 4 ? 'active' : ''}>4 x 4</button>
          </div>

          {gridSize && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Sparkles size={18} color="var(--lime)" />
                <h3>Álbuns Temáticos (Com silhuetas)</h3>
              </div>
              <div className="theme-albums-grid">
                {REGIONS.map(r => (
                  <button key={r.name} onClick={() => startThemedAlbum(r, gridSize)} className="theme-album-btn">
                    {r.name}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: '40px' }}>
                <h3>Ou comece do zero</h3>
                <button onClick={() => startEmptyAlbum(gridSize)} className="btn-create-empty">
                  Criar Álbum Vazio
                </button>
              </div>
            </>
          )}
          {!gridSize && <p style={{ color: 'var(--text-muted)' }}>Selecione um tamanho acima para continuar.</p>}
        </div>
      </div>
    );
  }

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
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2>{albums.find(a => a.id === activeAlbumId)?.name || albumName || 'Novo Álbum'}</h2>
          {/* MOSTRANDO O VALOR TOTAL AQUI */}
          <span className="album-total-value">
            Valor estimado: <strong>US$ {albumTotalValue.toFixed(2)}</strong>
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-delete-album" onClick={handleDeleteClick} title="Apagar Álbum">
            <Trash2 size={16} />
          </button>
          <button className="btn-save-album" onClick={handleSaveClick}>
            <Save size={16} /> Salvar
          </button>
        </div>
      </div>

      <div className="album-spreads-wrapper">
        {spreads.map((spread, spreadIndex) => (
          <div key={spreadIndex} className="album-spread">
            {pages[spread[0]] && (
              <div className="album-page page-left">
                <div className="album-grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                  {pages[spread[0]].map((slot, slotIndex) => (
                    <div 
                      key={slotIndex} 
                      className={`album-slot ${slot?.imageUrl ? 'has-image' : ''} ${slot?.pokemonId ? 'is-themed' : ''}`} 
                      style={{ aspectRatio: CARD_RATIO, cursor: 'pointer' }} 
                      onClick={(e) => handleSlotClick(e, spread[0], slotIndex)}
                    >
                      {slot?.imageUrl ? (
                        <>
                          <img src={slot.imageUrl} alt="Carta" className="album-card-img" />
                          <button className="album-remove-btn" onClick={(e) => removeImage(e, spread[0], slotIndex)}><X size={12} /></button>
                        </>
                      ) : slot?.pokemonId ? (
                        <>
                          <img src={sprite(slot.pokemonId)} alt="Silhueta" className="pokemon-silhouette" />
                          <span className="silhouette-number">#{String(slot.pokemonId).padStart(3, '0')}</span>
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
                  {pages[spread[1]].map((slot, slotIndex) => (
                    <div 
                      key={slotIndex} 
                      className={`album-slot ${slot?.imageUrl ? 'has-image' : ''} ${slot?.pokemonId ? 'is-themed' : ''}`} 
                      style={{ aspectRatio: CARD_RATIO, cursor: 'pointer' }} 
                      onClick={(e) => handleSlotClick(e, spread[1], slotIndex)}
                    >
                      {slot?.imageUrl ? (
                        <>
                          <img src={slot.imageUrl} alt="Carta" className="album-card-img" />
                          <button className="album-remove-btn" onClick={(e) => removeImage(e, spread[1], slotIndex)}><X size={12} /></button>
                        </>
                      ) : slot?.pokemonId ? (
                        <>
                          <img src={sprite(slot.pokemonId)} alt="Silhueta" className="pokemon-silhouette" />
                          <span className="silhouette-number">#{String(slot.pokemonId).padStart(3, '0')}</span>
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

      <CardSearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectCard={handleSelectCard}
      />

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

      {isDeleting && (
        <div className="modal-overlay" onClick={() => setIsDeleting(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#ff5a5a' }}>Apagar Álbum</h3>
            <p>Tem certeza que deseja apagar este álbum? Essa ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsDeleting(false)}>Cancelar</button>
              <button className="btn-delete-confirm" onClick={confirmDelete}>Apagar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}