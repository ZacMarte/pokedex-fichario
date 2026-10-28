import { useState, useEffect } from 'react';
import { Search, X, Loader } from 'lucide-react';
import TCGdex from '@tcgdex/sdk';

// Instancia o SDK configurado para Português (Brasil)
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
        // Busca na API
        const cards = await tcgdex.card.list(
          TCGdex.Query.create().contains('name', query)
        );

        // Formata os dados (adiciona o /high.png no final da URL)
        const formatted = cards.map(card => ({
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
    }, 600); // Espera o usuário parar de digitar por 600ms

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card-search-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="card-search-header">
          <h3>Buscar Carta</h3>
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
            <p className="card-search-hint">Digite o nome de um Pokémon para ver as cartas.</p>
          )}
          
          {query && !loading && results.length === 0 && (
            <p className="card-search-hint">Nenhuma carta encontrada.</p>
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