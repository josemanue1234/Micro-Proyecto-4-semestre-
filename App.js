import { useState, useEffect } from 'react';
import './App.css';

const ACCESS_KEY = "B9J0s2JMmW4R8Wu7kU1RgvGIQOB2gs5N_RueSSMNYpU";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [usuariosRegistrados, setUsuariosRegistrados] = useState([]);
  const [autoAleatorio, setAutoAleatorio] = useState(null);
  const [autosGuardados, setAutosGuardados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [pestañaActiva, setPestañaActiva] = useState('descubrir');

  // Cargar datos al iniciar
  useEffect(() => {
    const usuariosGuardados = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
    setUsuariosRegistrados(usuariosGuardados);

    if (usuario) {
      const autosUsuario = JSON.parse(localStorage.getItem(`autosGuardados_${usuario.email}`)) || [];
      setAutosGuardados(autosUsuario);
    }
  }, [usuario]);

  // Guardar autos cuando cambian
  useEffect(() => {
    if (usuario) {
      localStorage.setItem(`autosGuardados_${usuario.email}`, JSON.stringify(autosGuardados));
    }
  }, [autosGuardados, usuario]);

  const registrarUsuario = () => {
    if (!email || !contraseña) {
      setError("Por favor completa todos los campos");
      return;
    }
    const existe = usuariosRegistrados.some((u) => u.email === email);
    if (existe) {
      setError("Ya existe una cuenta con este email");
      return;
    }
    const nuevoUsuario = { email, contraseña };
    const usuariosActualizados = [...usuariosRegistrados, nuevoUsuario];
    setUsuariosRegistrados(usuariosActualizados);
    localStorage.setItem("usuariosRegistrados", JSON.stringify(usuariosActualizados));
    setUsuario(nuevoUsuario);
    setError(null);
  };

  const iniciarSesion = () => {
    const usuarioEncontrado = usuariosRegistrados.find(
      (u) => u.email === email && u.contraseña === contraseña
    );
    if (usuarioEncontrado) {
      setUsuario(usuarioEncontrado);
      setError(null);
    } else {
      setError("Credenciales incorrectas");
    }
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setEmail("");
    setContraseña("");
    setAutoAleatorio(null);
    setError(null);
  };

  const mostrarAutoAleatorio = async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await fetch(
        `https://api.unsplash.com/photos/random?query=luxury+car&orientation=landscape&client_id=${ACCESS_KEY}`
      );
      
      if (!respuesta.ok) {
        throw new Error(`Error de API: ${respuesta.status}`);
      }
      
      const datos = await respuesta.json();
      
      if (datos.urls && datos.urls.regular) {
        setAutoAleatorio({
          url: datos.urls.regular,
          alt: datos.alt_description || "Auto de lujo",
          fotografo: datos.user.name,
          portfolio: datos.user.links.html
        });
      } else {
        throw new Error("No se encontró la URL de la imagen");
      }
    } catch (err) {
      setError("Error al cargar la imagen: " + err.message);
      console.error("Error al obtener imagen:", err);
    } finally {
      setCargando(false);
    }
  };

  const guardarAuto = () => {
    if (!autoAleatorio) {
      setError("No hay ninguna imagen para guardar");
      return;
    }
    
    if (autosGuardados.some(auto => auto.url === autoAleatorio.url)) {
      setError("Este auto ya está en tu colección");
      return;
    }
    
    const autosActualizados = [...autosGuardados, autoAleatorio];
    setAutosGuardados(autosActualizados);
    setError(null);
  };

  const eliminarAuto = (url) => {
    const actualizados = autosGuardados.filter((auto) => auto.url !== url);
    setAutosGuardados(actualizados);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="titulo">GARAGE DE LUJO</h1>
          <p className="subtitulo">Colección Automotriz Exclusiva</p>
        </div>
        {usuario && (
          <div className="user-controls">
            <span className="bienvenida">Bienvenido, {usuario.email}</span>
            <button className="logout-btn" onClick={cerrarSesion}>
              CERRAR SESIÓN
            </button>
          </div>
        )}
      </header>

      {!usuario ? (
        <div className="auth-container">
          <div className="auth-card glassmorphism">
            <div className="brand-logo">
              <span>⚡</span>
            </div>
            <h2 className="auth-title">ACCESO A COLECCIÓN PRIVADA</h2>
            <div className="auth-form">
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="input-icon">✉️</span>
              </div>
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Contraseña"
                  className="auth-input"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                />
                <span className="input-icon">🔒</span>
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="auth-actions">
                <button className="auth-btn login" onClick={iniciarSesion}>
                  INICIAR SESIÓN
                </button>
                <button className="auth-btn register" onClick={registrarUsuario}>
                  REGISTRARSE
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <main className="main-content">
          <nav className="app-nav">
            <button 
              className={`nav-btn ${pestañaActiva === 'descubrir' ? 'active' : ''}`}
              onClick={() => setPestañaActiva('descubrir')}
            >
              DESCUBRIR
            </button>
            <button 
              className={`nav-btn ${pestañaActiva === 'coleccion' ? 'active' : ''}`}
              onClick={() => setPestañaActiva('coleccion')}
            >
              MI COLECCIÓN ({autosGuardados.length})
            </button>
          </nav>

          {pestañaActiva === 'descubrir' && (
            <div className="discover-section">
              <div className="action-buttons">
                <button 
                  className="action-btn discover-btn" 
                  onClick={mostrarAutoAleatorio} 
                  disabled={cargando}
                >
                  {cargando ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    'ENCONTRAR AUTO EXCLUSIVO'
                  )}
                </button>
                <button 
                  className="action-btn save-btn" 
                  onClick={guardarAuto} 
                  disabled={!autoAleatorio || cargando}
                >
                  AÑADIR A COLECCIÓN
                </button>
              </div>

              {error && <div className="error-message">{error}</div>}

              {cargando ? (
                <div className="loading-placeholder">
                  <div className="loading-spinner"></div>
                  <p>Buscando vehículos exclusivos...</p>
                </div>
              ) : autoAleatorio ? (
                <div className="featured-car">
                  <div className="car-image-container">
                    <img 
                      src={autoAleatorio.url} 
                      alt={autoAleatorio.alt} 
                      className="car-image"
                    />
                    <div className="image-overlay">
                      <p className="photographer-credit">
                        Foto por <a href={autoAleatorio.portfolio} target="_blank" rel="noopener noreferrer">
                          {autoAleatorio.fotografo}
                        </a> en Unsplash
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🚗</div>
                  <h3>Ningún vehículo seleccionado</h3>
                  <p>Haz clic en "Encontrar Auto Exclusivo" para descubrir automóviles premium</p>
                </div>
              )}
            </div>
          )}

          {pestañaActiva === 'coleccion' && (
            <div className="collection-section">
              {autosGuardados.length === 0 ? (
                <div className="empty-collection">
                  <div className="empty-icon">🏁</div>
                  <h3>Tu colección está vacía</h3>
                  <p>Descubre y guarda vehículos premium para construir tu colección</p>
                  <button 
                    className="action-btn discover-btn"
                    onClick={() => setPestañaActiva('descubrir')}
                  >
                    DESCUBRIR AUTOS
                  </button>
                </div>
              ) : (
                <div className="car-gallery">
                  {autosGuardados.map((auto, index) => (
                    <div className="car-card" key={index}>
                      <div className="card-image-container">
                        <img src={auto.url} alt={auto.alt} className="card-image" />
                        <div className="card-overlay">
                          <button 
                            className="remove-btn"
                            onClick={() => eliminarAuto(auto.url)}
                          >
                            ✕
                          </button>
                          <p className="card-photographer">
                            <a href={auto.portfolio} target="_blank" rel="noopener noreferrer">
                              {auto.fotografo}
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      )}

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} GARAGE DE LUJO | Experiencia Automotriz Premium</p>
      </footer>
    </div>
  );
}