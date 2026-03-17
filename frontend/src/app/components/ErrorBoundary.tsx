export function ErrorBoundary() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Что-то пошло не так</h1>
        <p className="text-gray-600 mb-4">Произошла ошибка при загрузке страницы</p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
}
