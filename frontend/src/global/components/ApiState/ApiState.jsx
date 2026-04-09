const ApiState = ({ type, title, message, onRetry }) => {

  const APISTATESTYPES = ['error', 'empty', 'loading'];

  if(!APISTATESTYPES.includes(type)) {
    throw Error ('The ApiState type doesnt exists.');
  }
  
  const config = {
    error: {
      title: title || 'Ups, algo salió mal',
      message: message || 'No pudimos cargar la información. Intenta nuevamente.',
      icon: '⚠️',
      showRetry: true,
    },
    empty: {
      title: title || 'No hay resultados',
      message: message || 'No encontramos datos para mostrar.',
      icon: '📭',
      showRetry: false,
    },
  }

  const current = config[type]

  if(type === 'loading') {
    return (
        <div className="fixed inset-0 flex justify-center items-center bg-white/50 backdrop-blur-sm z-50">
            <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                <span className="text-sm font-medium text-gray-500">Cargando...</span>
            </div>
        </div>
    );
  } else {
    return (
        <div style={styles.container}>
        <div style={styles.icon}>{current.icon}</div>
        <h2>{current.title}</h2>
        <p>{current.message}</p>

        {current.showRetry && onRetry && (
            <button onClick={onRetry} style={styles.button}>
            Reintentar
            </button>
        )}
        </div>
    )
  }
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '40px',
    color: '#555',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '10px',
  },
  button: {
    marginTop: '15px',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#ff385c',
    color: 'white',
    cursor: 'pointer',
  },
}

export default ApiState