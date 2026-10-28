import { useState, useEffect } from 'react';
import { Search, X, Loader } from 'lucide-react';
import TCGdex from '@tcgdex/sdk';

const tcgdex = new TCGdex('pt-br');

export default function CardSearchModal({ isOpen, onClose, onSelectCard }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      
      try {
        // 1. Busca todas as cartas com o nome (sem filtro de série ainda)
        const allCards = await tcgdex.card.list(
          new TCGdex.Query().like('name', query)
        );

        // 2. Filtro manual para remover as cartas do TCG Pocket
        // O ID das cartas do Pocket geralmente começa com "A1", "A1a", "A2", etc.
        // As cartas físicas têm IDs como "base1-4", "swsh3-136", etc.
        const physicalCards = allCards.filter(card => {
          // Remove se o ID começar com 'A' seguido de número (ex: A1, A2a)
          const isPocket = /^A\d/.test(card.id);
          return !isPocket;
        });

        console.log('Cartas físicas encontradas:', physicalCards);

        const formatted = physicalCards.map(card => ({
          id: card.id,
          name: card.name,
          image: `${card.image}/high.png` 
        }));

        setResults(formatted);
      } catch (error) {
        console.error('Erro ao buscar cartas:', error);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card-search-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="card-search-header">
          <h3>Buscar Carta (TCG Físico)</h3>
          <button className="btn-close-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="card-search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Digite o nome do Pokémon... (ex: Charizard)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {loading && <Loader size={18} className="spin" />}
        </div>

        <div className="card-search-results">
          {!query && (
            <p className="card-search-hint">Digite o nome de um Pokémon para ver as cartas do TCG físico.</p>
          )}
          
          {query && !loading && results.length === 0 && (
            <p className="card-search-hint">Nenhuma carta física encontrada. Tente outro nome.</p>
          )}

          {results.length > 0 && (
            <div className="card-search-grid">
              {results.map((card) => (
                <button 
                  key={card.id} 
                  className="card-result-item"
                  onClick={() => {
                    onSelectCard(card.image);
                    onClose();
                  }}
                  title={card.name}
                >
                  <img src={card.image} alt={card.name} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}