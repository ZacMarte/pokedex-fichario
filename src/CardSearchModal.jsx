import { useState, useEffect } from 'react';
import { Search, X, Loader } from 'lucide-react';

export default function CardSearchModal({ isOpen, onClose, onSelectCard }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const apiKey = import.meta.env.VITE_APITCG_KEY;
        
        if (!apiKey) {
          throw new Error('Chave da API não configurada. Verifique o arquivo .env ou a Vercel.');
        }

        // A chamada agora segue exatamente o padrão da documentação
        const response = await fetch(
          `https://api.apitcg.com/api/products?tcg=pokemon&type=card&name=${encodeURIComponent(query)}&limit=50`,
          {
            headers: {
              'x-api-key': apiKey
            }
          }
        );

        if (!response.ok) {
          if (response.status === 401) throw new Error('Chave de API inválida.');
          if (response.status === 429) throw new Error('Limite de buscas atingido. Tente novamente mais tarde.');
          throw new Error('Erro ao buscar cartas na API.');
        }

        const data = await response.json();
        
        // De acordo com o JSON da doc, a imagem fica dentro de um array "images"
        const formatted = (data.data || []).map(card => ({
          id: card._id,
          name: card.name,
          // Pega a imagem grande (ou a média, ou a pequena, dependendo do que estiver disponível)
          image: card.images?.[0]?.large || card.images?.[0]?.medium || card.images?.[0]?.small || ''
        }));

        setResults(formatted);
      } catch (err) {
        console.error('Erro:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 800); // 800ms de espera para não gastar requisições à toa

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
            placeholder="Digite o nome... (ex: Charizard)"
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
          
          {error && (
            <p className="card-search-hint" style={{ color: '#e88a8a' }}>{error}</p>
          )}

          {query && !loading && !error && results.length === 0 && (
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