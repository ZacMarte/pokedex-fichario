import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Book,
  Check,
  ChevronRight,
  LogOut,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import pokemonNames from './data/en.json';
import { supabase } from './supabase';
import { signIn, signUp, signOut } from './auth';
import AlbumBook from './AlbumBook';
import LandingPage from './LandingPage';

const GENERATIONS = [
  { id: 1, name: 'Kanto', start: 1, end: 151, color: 'linear-gradient(135deg, #ee1515 0%, #3b6fd4 100%)', accent: '#eec615', starters: [1, 4, 7] },
  { id: 2, name: 'Johto', start: 152, end: 251, color: 'linear-gradient(135deg, #d4a017 0%, #c0c0c0 100%)', accent: '#17a8d4', starters: [152, 155, 158] },
  { id: 3, name: 'Hoenn', start: 252, end: 386, color: 'linear-gradient(135deg, #b22222 0%, #00027e 100%)', accent: '#2e8b57', starters: [252, 255, 258] },
  { id: 4, name: 'Sinnoh', start: 387, end: 493, color: 'linear-gradient(135deg, #4a6fa5 0%, #e5b7d5 100%)', accent: '#714aa5', starters: [387, 390, 393] },
  { id: 5, name: 'Unova', start: 494, end: 649, color: 'linear-gradient(135deg, #1a1a1a 0%, #e8e8e8 100%)', accent: '#8fb7ec', starters: [495, 498, 501] },
  { id: 6, name: 'Kalos', start: 650, end: 721, color: 'linear-gradient(135deg, #e63946 0%, #1d3557 100%)', accent: '#7cee72', starters: [650, 653, 656] },
  { id: 7, name: 'Alola', start: 722, end: 809, color: 'linear-gradient(135deg, #f4a261 0%, #2a4d8f 100%)', accent: '#757575', starters: [722, 725, 728] },
  { id: 8, name: 'Galar', start: 810, end: 905, color: 'linear-gradient(135deg, #00b4d8 0%, #c77dff 100%)', accent: '#c2246d', starters: [810, 813, 816] },
  { id: 9, name: 'Paldea', start: 906, end: 1025, color: 'linear-gradient(135deg, #e04f5f 0%, #6a4c93 100%)', accent: '#4fe0c8', starters: [906, 909, 912] },
];

const TOTAL = 1025;
const LEGACY_STORAGE_KEY = 'pokedex-fichario-owned-v1';

const NATIONAL = {
  id: 0,
  name: 'Nacional',
  start: 1,
  end: TOTAL,
  color: 'linear-gradient(135deg, #b6f278 0%, #6a9a3f 100%)',
  accent: '#b6f278',
  starters: [],
};

const pad = (n) => String(n).padStart(3, '0');
const sprite = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

function getUsername(user) {
  if (!user) return '';
  const email = user.email || '';
  return email.includes('@') ? email.split('@')[0] : email;
}

function readLegacyOwned() {
  try {
    const value = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function ProgressBar({ value, color = 'var(--lime)' }) {
  return (
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{ width: `${Math.min(100, value)}%`, background: color }}
      />
    </div>
  );
}

function PokemonCard({ pokemon, owned, onToggle }) {
  return (
    <button
      className={`pokemon-card ${owned ? 'is-owned' : ''}`}
      onClick={() => onToggle(pokemon.id)}
      aria-pressed={owned}
      title={`${owned ? 'Desmarcar' : 'Marcar'} ${pokemon.name} como capturado`}
    >
      <span className="card-number">#{pad(pokemon.id)}</span>
      <span className="pokemon-art-wrap">
        <img
          className="pokemon-art"
          src={sprite(pokemon.id)}
          alt={pokemon.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.visibility = 'hidden';
          }}
        />
        {owned && (
          <span className="owned-check">
            <Check size={15} strokeWidth={3} />
          </span>
        )}
      </span>
      <span className="pokemon-name">{pokemon.name}</span>
      <span className={`pokemon-status ${owned ? 'captured' : ''}`}>
        <span className="status-dot" />
        {owned ? 'Capturado' : 'Faltante'}
      </span>
    </button>
  );
}

function AuthScreen({ onAuth, onBack, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const clean = username.trim();
      if (mode === 'signup') await signUp(clean, password);
      else await signIn(clean, password);
      onAuth?.();
    } catch (err) {
      const message = err?.message || 'Algo deu errado. Tente novamente.';
      if (/invalid login credentials/i.test(message)) {
        setError('Usuário ou senha incorretos.');
      } else if (/already registered|already exists/i.test(message)) {
        setError('Esse nome de usuário já está em uso.');
      } else if (/password/i.test(message) && /least/i.test(message)) {
        setError('A senha precisa ter pelo menos 6 caracteres.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      {onBack && (
        <button className="back-button" style={{ position: 'absolute', top: '24px', left: '24px' }} onClick={onBack}>
          <ArrowLeft size={16} /> Voltar
        </button>
      )}
      
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <span className="brand-mark"><span /></span>
          <span>MEU <b>FICHÁRIO</b></span>
        </div>
        <h1>{mode === 'login' ? 'Entrar na sua conta' : 'Criar sua conta'}</h1>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Acesse sua coleção de Pokémons de qualquer dispositivo.'
            : 'Escolha um nome de usuário e uma senha para começar.'}
        </p>

        <label className="auth-field">
          <span>Usuário</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="ex: ashketchum"
            autoComplete="username"
            required
            minLength={3}
            maxLength={24}
            pattern="[A-Za-z0-9_.-]+"
            title="Use apenas letras, números, ponto, underline ou hífen"
          />
        </label>

        <label className="auth-field">
          <span>Senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="mínimo 6 caracteres"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={6}
          />
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>

        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError('');
          }}
        >
          {mode === 'login'
            ? 'Não tem conta? Criar agora'
            : 'Já tem conta? Entrar'}
        </button>
      </form>
    </main>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [owned, setOwned] = useState(new Set());
  const [albums, setAlbums] = useState([]);
  const [selectedGen, setSelectedGen] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [legacyAvailable, setLegacyAvailable] = useState(0);
  const [toast, setToast] = useState(null);
  const [isAlbumOpen, setIsAlbumOpen] = useState(false);

  const [view, setView] = useState('landing');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pokedex-theme') || 
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  });

  const hydratedRef = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pokedex-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      hydratedRef.current = false;
      setOwned(new Set());
      setAlbums([]);
      setLegacyAvailable(0);
      return;
    }

    let cancelled = false;
    hydratedRef.current = false;
    setDataLoading(true);

    supabase
      .from('collections')
      .select('owned, albums')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error('Erro ao carregar:', error);
        
        const list = Array.isArray(data?.owned) ? data.owned : [];
        setOwned(new Set(list));
        setAlbums(Array.isArray(data?.albums) ? data.albums : []);

        setDataLoading(false);
        hydratedRef.current = true;

        const legacy = readLegacyOwned();
        if (legacy.length && list.length === 0) {
          setLegacyAvailable(legacy.length);
        } else {
          setLegacyAvailable(0);
        }
      });

    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user || !hydratedRef.current) return;

    const timeout = setTimeout(async () => {
      const { error } = await supabase.from('collections').upsert(
        {
          user_id: user.id,
          owned: [...owned],
          albums: albums,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (error) {
        console.error('Erro ao salvar:', error);
        setToast('Não foi possível salvar. Verifique sua conexão.');
        setTimeout(() => setToast(null), 3500);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [owned, albums, user]);

  const allPokemon = useMemo(
    () => Array.from({ length: TOTAL }, (_, i) => ({ id: i + 1, name: pokemonNames[i] || `Pokémon ${pad(i + 1)}` })),
    []
  );

  const totalOwned = owned.size;

  const currentGenPokemon = useMemo(() => {
    const list = selectedGen
      ? allPokemon.filter((p) => p.id >= selectedGen.start && p.id <= selectedGen.end)
      : allPokemon;
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
    return list.filter((p) => {
      const matchesFilter = filter === 'all' || (filter === 'owned' ? owned.has(p.id) : !owned.has(p.id));
      const matchesSearch = !normalizedSearch || p.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch) || String(p.id) === normalizedSearch.replace(/^#/, '');
      return matchesFilter && matchesSearch;
    });
  }, [allPokemon, selectedGen, filter, search, owned]);

  const togglePokemon = (id) => setOwned((previous) => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const setGeneration = (generation) => {
    setIsAlbumOpen(false);
    setSelectedGen(generation);
    setFilter('all');
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openNational = (initialFilter = 'all') => {
    setIsAlbumOpen(false);
    setSelectedGen(NATIONAL);
    setFilter(initialFilter);
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setIsAlbumOpen(false);
    setSelectedGen(null);
    setFilter('all');
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await signOut();
    setView('landing');
    goHome();
  };

  const importLegacy = async () => {
    if (!user) return;
    const legacy = readLegacyOwned();
    if (!legacy.length) return;
    const merged = new Set([...owned, ...legacy]);
    setOwned(merged);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    setLegacyAvailable(0);
    setToast('Coleção antiga importada com sucesso!');
    setTimeout(() => setToast(null), 3000);
  };

  const dismissLegacy = () => {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    setLegacyAvailable(0);
  };

  const currentTotal = selectedGen ? selectedGen.end - selectedGen.start + 1 : TOTAL;
  const currentOwned = selectedGen ? [...owned].filter((id) => id >= selectedGen.start && id <= selectedGen.end).length : totalOwned;
  const currentProgress = (currentOwned / currentTotal) * 100;

  if (authLoading) {
    return (
      <main className="app-shell">
        <div className="loading-screen">Carregando...</div>
      </main>
    );
  }

  if (!user) {
    if (view === 'landing') {
      return <LandingPage onLogin={() => setView('login')} onSignup={() => setView('signup')} />;
    }
    return <AuthScreen onAuth={() => setView('landing')} onBack={() => setView('landing')} initialMode={view} />;
  }

  const username = getUsername(user);
  const missingTotal = TOTAL - totalOwned;

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={goHome} aria-label="Voltar à Pokédex inicial">
          <span className="brand-mark"><span /></span>
          <span>FICHÁRIO DE <b>{username.toUpperCase()}</b></span>
        </button>

        <button
          className={`album-nav-btn ${isAlbumOpen ? 'active' : ''}`}
          onClick={() => setIsAlbumOpen(!isAlbumOpen)}
        >
          <Book size={16} />
          {isAlbumOpen ? 'Voltar à Pokédex' : 'Álbum de Cartas'}
        </button>

        <div className="topbar-right">
          {dataLoading ? (
            <span className="save-indicator"><span className="save-dot" />Carregando...</span>
          ) : (
            <span className="save-indicator"><span className="save-dot" />Salvo na sua conta</span>
          )}
          
          <button
            className="icon-button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="icon-button" onClick={handleLogout} title="Sair" aria-label="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {legacyAvailable > 0 && (
        <div className="legacy-banner">
          <div>
            <strong>Encontramos uma coleção antiga neste navegador</strong>
            <span>{legacyAvailable} Pokémon marcados antes do login.</span>
          </div>
          <div className="legacy-actions">
            <button className="legacy-import" onClick={importLegacy}>Importar</button>
            <button className="legacy-dismiss" onClick={dismissLegacy}>Ignorar</button>
          </div>
        </div>
      )}

      <div className="main-content">
        {isAlbumOpen ? (
          <AlbumBook 
            onClose={() => setIsAlbumOpen(false)} 
            albums={albums}
            onSaveAlbums={setAlbums}
          />
        ) : (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow"><Sparkles size={14} /> SUA COLEÇÃO, SUA JORNADA</div>
                <h1>
                  {selectedGen ? (
                    <>Pokédex <em>{selectedGen.name === 'Nacional' ? 'Nacional' : `de ${selectedGen.name}`}</em></>
                  ) : (
                    <>Complete sua <em>Pokédex.</em></>
                  )}
                </h1>
                <p>
                  {selectedGen
                    ? 'Um Pokémon por vez. Marque as cartas que já fazem parte da sua coleção.'
                    : 'Seu fichário digital para acompanhar cada Pokémon que você já encontrou em forma de carta.'}
                </p>
              </div>
              <div className="hero-orb" aria-hidden="true">
                <div className="orb-inner"><div className="orb-center" /></div>
              </div>
            </section>

            <section className="overview">
              <div className="overview-main">
                <div className="section-kicker">
                  {selectedGen ? `GERAÇÃO ${selectedGen.id}` : 'PROGRESSO NACIONAL'}
                </div>
                <div className="progress-heading">
                  <div className="big-count">
                    {currentOwned}<span>/{currentTotal}</span>
                  </div>
                  <div className="progress-percent">
                    {currentProgress.toFixed(1).replace('.', ',')}<small>%</small>
                  </div>
                </div>
                <ProgressBar value={currentProgress} color={selectedGen?.accent || 'var(--lime)'} />
                <div className="progress-foot">
                  <span>{currentTotal - currentOwned} faltantes</span>
                  <span>{currentProgress >= 100 ? 'Coleção completa!' : 'Continue completando'}</span>
                </div>
              </div>
            </section>

            {!selectedGen ? (
              <>
                <section className="quick-section">
                  <div className="section-title-row">
                    <div>
                      <div className="section-kicker">ACESSO RÁPIDO</div>
                      <h2>Ver por <span>status</span></h2>
                    </div>
                    <span className="subtle-count">Todas as gerações</span>
                  </div>
                  <div className="quick-grid">
                    <button className="quick-card quick-card--missing" onClick={() => openNational('missing')}>
                      <span className="quick-icon muted"><SlidersHorizontal size={18} /></span>
                      <div className="quick-info">
                        <strong>{missingTotal}</strong>
                        <span>Faltantes</span>
                      </div>
                      <span className="quick-arrow"><ChevronRight size={16} /></span>
                    </button>
                    <button className="quick-card quick-card--owned" onClick={() => openNational('owned')}>
                      <span className="quick-icon green"><Check size={18} /></span>
                      <div className="quick-info">
                        <strong>{totalOwned}</strong>
                        <span>Capturados</span>
                      </div>
                      <span className="quick-arrow"><ChevronRight size={16} /></span>
                    </button>
                  </div>
                </section>

                <section className="generation-section">
                  <div className="section-title-row">
                    <div>
                      <div className="section-kicker">ESCOLHA SUA REGIÃO</div>
                      <h2>Gerações <span>Pokémon</span></h2>
                    </div>
                    <span className="subtle-count">9 regiões</span>
                  </div>
                  <div className="generation-grid">
                    {GENERATIONS.map((gen) => {
                      const count = [...owned].filter((id) => id >= gen.start && id <= gen.end).length;
                      const total = gen.end - gen.start + 1;
                      const progress = (count / total) * 100;
                      const isComplete = count === total;
                      return (
                        <button
                          className="generation-card"
                          key={gen.id}
                          onClick={() => setGeneration(gen)}
                          style={{ '--gen-color': gen.accent, '--gen-gradient': gen.color }}
                        >
                          <span className="gen-deco" aria-hidden="true" />
                          {isComplete && (
                            <span className="gen-complete-badge">
                              <Check size={11} strokeWidth={3} /> Completa
                            </span>
                          )}
                          <div className="generation-top">
                            <span className="generation-number">GEN {String(gen.id).padStart(2, '0')}</span>
                            <ChevronRight size={17} />
                          </div>
                          <div className="generation-name">{gen.name}</div>
                          <div className="generation-meta">{total} Pokémon</div>
                          <div className="starter-row">
                            {gen.starters.map((id) => (
                              <img key={id} src={sprite(id)} alt="" loading="lazy" />
                            ))}
                          </div>
                          <ProgressBar value={progress} color={gen.accent} />
                          <div className="generation-bottom">
                            <span>{count}/{total} capturados</span>
                            <b>{progress.toFixed(0)}%</b>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </>
            ) : (
              <section className="collection-section">
                <button className="back-button" onClick={goHome}>
                  <ArrowLeft size={16} /> Voltar ao início
                </button>
                <div className="section-title-row collection-heading">
                  <div>
                    <div className="section-kicker">
                      {selectedGen.id === 0
                        ? `FICHÁRIO · ${filter === 'missing' ? 'FALTANTES' : filter === 'owned' ? 'CAPTURADOS' : 'NACIONAL'}`
                        : `FICHÁRIO · GERAÇÃO ${selectedGen.id}`}
                    </div>
                    <h2>
                      {selectedGen.name === 'Nacional'
                        ? filter === 'missing'
                          ? <>Todos os <span>faltantes</span></>
                          : filter === 'owned'
                            ? <>Todos os <span>capturados</span></>
                            : <>Pokédex <span>Nacional</span></>
                        : <>{selectedGen.name} <span>Pokédex</span></>}
                    </h2>
                  </div>
                  <span className="subtle-count">{currentGenPokemon.length} resultados</span>
                </div>
                <div className="collection-toolbar">
                  <div className="filter-tabs" role="group" aria-label="Filtrar Pokémon">
                    {[['all', 'Todos'], ['owned', 'Capturados'], ['missing', 'Faltantes']].map(([value, label]) => (
                      <button
                        key={value}
                        className={filter === value ? 'active' : ''}
                        onClick={() => setFilter(value)}
                      >
                        {label}
                        <span>
                          {value === 'all'
                            ? currentTotal
                            : value === 'owned'
                              ? currentOwned
                              : currentTotal - currentOwned}
                        </span>
                      </button>
                    ))}
                  </div>
                  <label className="search-box">
                    <Search size={17} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar Pokémon..."
                    />
                    <kbd>/</kbd>
                  </label>
                </div>
                <div className="grid-caption">
                  <span>Nº · NOME</span>
                  <span>TOQUE EM UM POKÉMON PARA MARCAR</span>
                </div>
                <div className="pokemon-grid">
                  {currentGenPokemon.map((pokemon) => (
                    <PokemonCard
                      key={pokemon.id}
                      pokemon={pokemon}
                      owned={owned.has(pokemon.id)}
                      onToggle={togglePokemon}
                    />
                  ))}
                </div>
                {currentGenPokemon.length === 0 && (
                  <div className="empty-state">
                    {filter === 'missing' ? (
                      <>
                        <Check size={28} />
                        <strong>Você não tem nenhum Pokémon faltante aqui!</strong>
                        <span>Coleção completa nessa seleção. 🎉</span>
                      </>
                    ) : filter === 'owned' ? (
                      <>
                        <Search size={25} />
                        <strong>Nenhum Pokémon capturado ainda</strong>
                        <span>Comece marcando os que você já tem.</span>
                      </>
                    ) : (
                      <>
                        <Search size={25} />
                        <strong>Nenhum Pokémon encontrado</strong>
                        <span>Tente mudar o filtro ou a busca.</span>
                      </>
                    )}
                  </div>
                )}
                <div className="list-footer">
                  Mostrando {currentGenPokemon.length} de {currentTotal} Pokémon · progresso salvo na sua conta
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <footer className="footer">
        <div className="footer-brand">
          <span className="brand-mark small"><span /></span> FICHÁRIO DE {username.toUpperCase()}
        </div>
        <span>© 2026 ZacMarte — Todos os direitos reservados.</span>
        <span className="footer-total">{totalOwned} / 1.025 registrados</span>
      </footer>

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

export default App;