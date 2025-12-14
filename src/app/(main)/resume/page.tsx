/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ResumePage() {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    setUploadLoading(true);
    
    // Проверяем размер (макс 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Файл слишком большой (максимум 10MB)');
      setFileName('');
      setUploadLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/resume-parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка обработки файла');
      }

      const { text, metadata } = await response.json();
      setResumeText(text);
      
      console.log('File parsed successfully:', metadata);
      
    } catch (err) {
      console.error('Ошибка загрузки файла:', err);
      setError(err instanceof Error ? err.message : 'Не удалось обработать файл');
      setFileName('');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Пожалуйста, введите текст резюме или загрузите файл');
      return;
    }

    if (resumeText.trim().length < 100) {
      setError('Текст резюме слишком короткий (минимум 100 символов)');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/resume-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка анализа');
      }
      
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Не удалось проанализировать резюме. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setResumeText('');
    setFileName('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Шапка */}
        <div className="bg-gray-50 rounded-lg shadow-sm p-4 mb-4">
          <button
            onClick={() => router.back()}
            className="text-black hover:text-gray-700 mb-2 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад
          </button>
          <h1 className="text-2xl font-bold text-black">AI Анализ резюме</h1>
          <p className="text-black mt-1">Получите профессиональный разбор вашего резюме за 10 секунд</p>
        </div>

        {!analysis ? (
          /* Форма ввода */
          <div className="bg-gray-50 rounded-lg shadow-sm p-6">
            {/* Кнопка загрузки файла */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.docx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploadLoading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadLoading}
                className={`w-full py-3 px-4 border-2 border-dashed rounded-lg transition-colors ${
                  uploadLoading 
                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                    : 'border-gray-300 hover:border-red-400'
                }`}
              >
                <div className="flex items-center justify-center">
                  {uploadLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3 text-red-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-black font-medium">Обрабатываем файл...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-black font-medium">
                        {fileName || 'Прикрепить файл (PDF, DOCX, TXT)'}
                      </span>
                    </>
                  )}
                </div>
              </button>
              {fileName && !uploadLoading && (
                <div className="mt-2 flex items-center justify-between text-sm text-green-600 bg-green-50 p-2 rounded">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Файл загружен: {fileName}
                  </span>
                  <button
                    onClick={() => {
                      setFileName('');
                      setResumeText('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="text-center text-gray-500 mb-4">
              <span>или</span>
            </div>

            {/* Поле для текста */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-black">
                Вставьте текст резюме:
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                disabled={uploadLoading}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Скопируйте и вставьте ваше резюме здесь..."
                style={{ color: 'black' }}
              />
              <div className="flex justify-between items-center text-sm mt-1">
                <span className={`${
                  resumeText.length < 100 ? 'text-red-500' : 
                  resumeText.length < 500 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {resumeText.length} символов
                </span>
                <span className="text-gray-600">
                  Минимум 100 символов для качественного анализа
                </span>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <button
              onClick={handleAnalyze}
              disabled={loading || uploadLoading || resumeText.length < 100}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                loading || uploadLoading || resumeText.length < 100
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Анализируем резюме...
                </span>
              ) : (
                'Проанализировать резюме'
              )}
            </button>

            {/* Подсказка для пользователя */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Совет:</p>
                  <p>Для лучшего результата убедитесь, что резюме содержит: опыт работы, образование, навыки и достижения с конкретными цифрами.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Результаты */
          <div className="space-y-4">
            {/* Оценка */}
            <div className="bg-gray-50 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-black">Результаты анализа</h2>
                <button
                  onClick={handleReset}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Новый анализ →
                </button>
              </div>
              
              <div className="flex items-center mb-4">
                <div className={`text-4xl font-bold mr-6 px-4 py-2 rounded-lg ${
                  analysis.score >= 8 ? 'text-green-600 bg-green-50' :
                  analysis.score >= 6 ? 'text-yellow-600 bg-yellow-50' :
                  'text-red-600 bg-red-50'
                }`}>
                  {analysis.score}/10
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        analysis.score >= 8 ? 'bg-green-500' :
                        analysis.score >= 6 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${analysis.score * 10}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-black leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Наджи */}
            {analysis.nudges && analysis.nudges.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <h3 className="font-bold mb-4 text-black text-lg flex items-center">
                  💡 Рекомендации-наджи
                  <span className="ml-2 text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                    поведенческие подсказки
                  </span>
                </h3>
                {analysis.nudges.map((nudge: any, i: number) => (
                  <div key={i} className="mb-3 p-4 bg-white rounded-lg shadow-sm border-l-4 border-purple-400">
                    <p className="text-black">{nudge.message}</p>
                    {nudge.type && (
                      <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                        {nudge.type === 'social_proof' && '📊 Социальное доказательство'}
                        {nudge.type === 'framing' && '🖼️ Фрейминг'}
                        {nudge.type === 'simplification' && '✨ Упрощение'}
                        {nudge.type === 'default_effect' && '✅ Эффект умолчания'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Сильные стороны */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="font-bold mb-3 text-black text-lg flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Сильные стороны
              </h3>
              <ul className="space-y-2">
                {analysis.strengths?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-black">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Слабые стороны */}
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
              <h3 className="font-bold mb-3 text-black text-lg flex items-center">
                <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Зоны роста
              </h3>
              <ul className="space-y-2">
                {analysis.weaknesses?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <span className="text-orange-500 mr-2 mt-1">!</span>
                    <span className="text-black">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Рекомендации */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-bold mb-3 text-black text-lg">💼 Практические рекомендации</h3>
                <ol className="space-y-2">
                  {analysis.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <span className="text-blue-600 mr-3 font-bold">{i + 1}.</span>
                      <span className="text-black">{rec}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Быстрый старт */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
              <h3 className="font-bold mb-4 text-lg flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Быстрый старт за 10 минут
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {analysis.quickStart?.map((step: string, i: number) => (
                  <div key={i} className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                    <span className="text-3xl font-bold block mb-1">{i + 1}</span>
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}