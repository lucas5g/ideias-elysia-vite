export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-400 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-white mb-4">Página não encontrada</h2>
        <p className="text-gray-400 mb-8">A página que você está procurando não existe.</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          Voltar para Home
        </a>
      </div>
    </div>
  )
}
