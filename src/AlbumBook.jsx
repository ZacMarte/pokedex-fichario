import { useState } from 'react';
import { ArrowLeft, Book, Plus, X } from 'lucide-react';

const CARD_RATIO = '6.3 / 8.8';

export default function AlbumBook({ onClose }) {
  const [gridSize, setGridSize] = useState(null);
  const [pages, setPages] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const startAlbum = (size) => {
    setGridSize(size);
    const totalSlots = size * size;
    setPages([
      Array(totalSlots).fill(null), // Página 1 (Esquerda)
      Array(totalSlots).fill(null), // Página 2 (Direita)
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

  if (!gridSize) {
    return (
      <div className="album-setup">
        <button className="back-button" onClick={onClose}>
          <ArrowLeft size={16} /> Voltar para o início
        </button>
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

  // Agrupa as páginas em pares (Spread): [ [0, 1], [2, 3], [4, 5] ... ]
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
        <div style={{ width: '80px' }} /> {/* Espaçador pro título ficar no meio */}
      </div>

      <div className="album-spreads-wrapper">
        {spreads.map((spread, spreadIndex) => (
          <div key={spreadIndex} className="album-spread">
            {/* Página Esquerda */}
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

            {/* Página Direita */}
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