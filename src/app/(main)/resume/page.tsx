/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResumePage() {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Пожалуйста, введите текст резюме');
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
      
      if (!response.ok) throw new Error('Ошибка анализа');
      
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError('Не удалось проанализировать резюме');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setResumeText('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Шапка */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800 mb-2"
          >
            ← Назад
          </button>
          <h1 className="text-2xl font-bold">AI Анализ резюме</h1>
        </div>

        {!analysis ? (
          /* Форма ввода */
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Вставьте текст резюме:
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full h-64 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Скопируйте и вставьте ваше резюме здесь..."
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium ${
                loading 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {loading ? 'Анализируем...' : 'Проанализировать резюме'}
            </button>
          </div>
        ) : (
          /* Результаты */
          <div className="space-y-4">
            {/* Оценка */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Результаты анализа</h2>
                <button
                  onClick={handleReset}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Новый анализ
                </button>
              </div>
              
              <div className="text-3xl font-bold mb-2">
                Оценка: {analysis.score}/10
              </div>
              <p className="text-gray-600">{analysis.summary}</p>
            </div>

            {/* Наджи */}
            {analysis.nudges && analysis.nudges.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="font-bold mb-3">💡 Рекомендации-наджи</h3>
                {analysis.nudges.map((nudge: any, i: number) => (
                  <div key={i} className="mb-2 p-3 bg-white rounded">
                    {nudge.message}
                  </div>
                ))}
              </div>
            )}

            {/* Сильные стороны */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="font-bold mb-3">✅ Сильные стороны</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.strengths?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Слабые стороны */}
            <div className="bg-orange-50 rounded-lg p-6">
              <h3 className="font-bold mb-3">⚠️ Что улучшить</h3>
              <ul className="list-disc list-inside space-y-1">
                {analysis.weaknesses?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Быстрый старт */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-bold mb-3">🚀 Быстрый старт</h3>
              <ol className="list-decimal list-inside space-y-1">
                {analysis.quickStart?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}