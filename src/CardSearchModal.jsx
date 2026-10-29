import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Loader } from 'lucide-react';

function ModalContent({ isOpen, onClose, onSelectCard }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Função para buscar os dados
  const fetchCards = async (searchQuery, pageNumber) => {
    setLoading(true);
    setError(null);
    
    try {
      const apiKey = import.meta.env.VITE_APITCG_KEY;
      
      if (!apiKey) {
        throw new Error('Chave da API não configurada. Verifique o arquivo .env ou a Vercel.');
      }

      // Limit 100 e controle de página
      const response = await fetch(
        `https://api.apitcg.com/api/products?tcg=pokemon&type=card&name=${encodeURIComponent(searchQuery)}&limit=100&page=${pageNumber}`,
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
      
      const formatted = (data.data || []).map(card => ({
        id: card._id,
        name: card.name,
        image: card.images?.[0]?.large || card.images?.[0]?.medium || card.images?.[0]?.small || '',
        // Capturando o preço de mercado (se existir, senão assume 0)
        price: card.markets?.tcgplayer?.prices?.market || 0
      }));

      if (pageNumber === 1) {
        setResults(formatted);
      } else {
        setResults(prev => [...prev, ...formatted]);
      }

      // Se retornou 100, é provável que tenha mais páginas
      setHasMore(formatted.length === 100);

    } catch (err) {
      console.error('Erro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasMore(false);
      return;
    }

    const timer = setTimeout(() => {
      setPage(1);
      fetchCards(query, 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [query]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCards(query, nextPage);
  };

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
          {loading && page === 1 && <Loader size={18} className="spin" />}
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
            <>
              <div className="card-search-grid">
                {results.map((card) => (
                  <button 
                    key={card.id} 
                    className="card-result-item"
                    onClick={() => {
                      // Passando imagem E preço
                      onSelectCard(card.image, card.price);
                      onClose();
                    }}
                    title={`${card.name} (US$ ${card.price.toFixed(2)})`}
                  >
                    <img src={card.image} alt={card.name} loading="lazy" />
                  </button>
                ))}
              </div>
              
              {/* BOTÃO DE CARREGAR MAIS */}
              {hasMore && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', paddingBottom: '20px' }}>
                  <button 
                    onClick={handleLoadMore} 
                    disabled={loading}
                    style={{
                      background: 'var(--lime)',
                      color: 'var(--bg)',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: loading ? 'wait' : 'pointer',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Carregando...' : 'Carregar mais cartas'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default function CardSearchModal(props) {
  if (!props.isOpen) return null;
  return createPortal(
    <ModalContent {...props} />,
    document.body
  );
}