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
        // CORREÇÃO: Usando a sintaxe correta do SDK (new Query().like(...))
        // O método "like" é um alias para "contains" e busca por substring.
        const cards = await tcgdex.card.list(
          new TCGdex.Query().like('name', query)
        );

        console.log('Cartas encontradas:', cards); // Ajuda a debugar

        const formatted = cards.map(card => ({
          id: card.id,
          name: card.name,
          // A URL da imagem pode vir sem extensão, então adicionamos /high.png
          image: `${card.image}/high.png` 
        }));

        setResults(formatted);
      } catch (error) {
        console.error('Erro ao buscar cartas:', error);
        // Se der erro, tenta uma busca mais simples (sem filtro de nome)
        // para ver se o problema é a query ou a API.
        try {
          const allCards = await tcgdex.card.list();
          const filtered = allCards.filter(c => 
            c.name.toLowerCase().includes(query.toLowerCase())
          );
          const formatted = filtered.map(card => ({
            id: card.id,
            name: card.name,
            image: `${card.image}/high.png`
          }));
          setResults(formatted);
        } catch (e) {
          console.error('Erro na busca alternativa:', e);
        }
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
            <p className="card-search-hint">Nenhuma carta encontrada. Tente outro nome.</p>
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