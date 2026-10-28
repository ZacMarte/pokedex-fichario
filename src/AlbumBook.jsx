import { useState, useEffect } from 'react';
import { ArrowLeft, Book, Plus, X } from 'lucide-react';

const CARD_RATIO = '6.3 / 8.8';

// Recebe savedData (o que vem do banco) e onSave (a função pra atualizar no App)
export default function AlbumBook({ onClose, savedData, onSave }) {
  // Inicializa o estado com os dados que vieram do banco
  const [gridSize, setGridSize] = useState(savedData?.gridSize || null);
  const [pages, setPages] = useState(savedData?.pages || []);
  const [activeSlot, setActiveSlot] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  // Sempre que gridSize ou pages mudarem, avisa o App pra salvar no banco
  useEffect(() => {
    onSave({ gridSize, pages });
  }, [gridSize, pages, onSave]);

  const startAlbum = (size) => {
    setGridSize(size);
    const totalSlots = size * size;
    setPages([
      Array(totalSlots).fill(null),
      Array(totalSlots).fill(null),
    ]);
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

  const resetAlbum = () => {
    if (window.confirm("Tem certeza que quer apagar todo o álbum e começar de novo?")) {
      setGridSize(null);
      setPages([]);
    }
  };

  if (!gridSize || pages.length === 0) {
    return (
      <div className="album-setup">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="back-button" onClick={onClose}>
            <ArrowLeft size={16} /> Voltar para o início
          </button>
          {savedData?.gridSize && (
            <button className="back-button" style={{ color: '#ff5a5a' }} onClick={resetAlbum}>
              Apagar Álbum Atual
            </button>
          )}
        </div>
        <div className="album-setup-content">
          <Book size={48} className="album-setup-icon" />
          <h2>Novo Álbum</h2>
          <p>Escolha o tamanho do fichário para começar.</p>
          <div className="album-size-options">
            <button onClick={() => startAlbum(3)}>3 x 3</button>
            <button onClick={() => startAlbum(4)}>4 x 4</button>
          </div>
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
        <button className="back-button" onClick={() => setGridSize(null)}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <h2>Seu Fichário ({gridSize}x{gridSize})</h2>
        <div style={{ width: '80px' }} />
      </div>

      <div className="album-spreads-wrapper">
        {spreads.map((spread, spreadIndex) => (
          <div key={spreadIndex} className="album-spread">
            {pages[spread[0]] && (
              <div className="album-page page-left">
                <div 
                  className="album-grid" 
                  style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                >
                  {pages[spread[0]].map((url, slotIndex) => (
                    <div
                      key={slotIndex}
                      className={`album-slot ${url ? 'has-image' : ''}`}
                      style={{ aspectRatio: CARD_RATIO }}
                      onClick={() => handleSlotClick(spread[0], slotIndex)}
                    >
                      {url ? (
                        <>
                          <img src={url} alt="Carta" className="album-card-img" />
                          <button className="album-remove-btn" onClick={(e) => removeImage(e, spread[0], slotIndex)}>
                            <X size={12} />
                          </button>
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
                <div 
                  className="album-grid" 
                  style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                >
                  {pages[spread[1]].map((url, slotIndex) => (
                    <div
                      key={slotIndex}
                      className={`album-slot ${url ? 'has-image' : ''}`}
                      style={{ aspectRatio: CARD_RATIO }}
                      onClick={() => handleSlotClick(spread[1], slotIndex)}
                    >
                      {url ? (
                        <>
                          <img src={url} alt="Carta" className="album-card-img" />
                          <button className="album-remove-btn" onClick={(e) => removeImage(e, spread[1], slotIndex)}>
                            <X size={12} />
                          </button>
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

      {activeSlot && (
        <div className="modal-overlay" onClick={() => setActiveSlot(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Adicionar carta</h3>
            <p>Cole o link da imagem da carta de Pokémon.</p>
            <input
              type="url"
              placeholder="https://exemplo.com/carta.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setActiveSlot(null)}>Cancelar</button>
              <button className="btn-save" onClick={saveImage}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}