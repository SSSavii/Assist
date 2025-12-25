/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { parseResumeFile } from '@/lib/resume/fileParser';
import LottieSticker, { ScoreSticker } from '@/app/components/LottieSticker';
import { NudgeSystem } from '@/lib/resume/nudges';

export default function ResumePage() {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileWarning, setFileWarning] = useState<string | null>(null);
  
  const [uploadProgress, setUploadProgress] = useState<{ 
    progress: number; 
    status: string 
  } | null>(null);
  
  const [aiStatus, setAiStatus] = useState<'idle' | 'thinking' | 'ready' | 'failed'>('idle');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiProgress, setAiProgress] = useState(0);
  
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiAbortRef = useRef<AbortController | null>(null);

  const startAIAnalysis = useCallback(async (text: string) => {
    if (text.length < 100) return;
    
    if (aiAbortRef.current) {
      aiAbortRef.current.abort();
    }
    
    aiAbortRef.current = new AbortController();
    setAiStatus('thinking');
    setAiSummary(null);
    setAiProgress(0);
    
    const startTime = Date.now();
    const maxTime = 10000;
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(95, (elapsed / maxTime) * 100);
      setAiProgress(Math.round(progress));
      
      if (elapsed >= maxTime) {
        clearInterval(progressInterval);
      }
    }, 150);
    
    try {
      const response = await fetch('/api/resume-ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text }),
        signal: aiAbortRef.current.signal
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        setAiStatus('failed');
        return;
      }
      
      const data = await response.json();
      
      if (data.summary) {
        setAiSummary(data.summary);
        setAiStatus('ready');
        setAiProgress(100);
      } else {
        setAiStatus('failed');
      }
    } catch (err) {
      clearInterval(progressInterval);
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('AI analysis error:', err);
      }
      setAiStatus('failed');
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (resumeText.length >= 100) {
        startAIAnalysis(resumeText);
      } else {
        setAiStatus('idle');
        setAiSummary(null);
      }
    }, 600);
    
    return () => clearTimeout(debounceTimer);
  }, [resumeText, startAIAnalysis]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    setFileWarning(null);
    setUploadLoading(true);
    setUploadProgress({ progress: 0, status: 'Начинаем обработку...' });

    try {
      const result = await parseResumeFile(file, (progress, status) => {
        setUploadProgress({ progress, status });
      });
      
      setResumeText(result.text);
      
      if (result.metadata.warning) {
        setFileWarning(result.metadata.warning);
      } else if (result.metadata.quality === 'ocr') {
        setFileWarning(
          `Текст распознан через OCR (${result.metadata.ocrPages} стр.). Проверьте корректность.`
        );
      } else if (result.metadata.columnsDetected) {
        setFileWarning('Обнаружен двухколоночный макет. Текст объединён автоматически.');
      } else if (result.metadata.quality === 'poor') {
        setFileWarning('Качество текста низкое. Рекомендуем проверить или вставить вручную.');
      }
      
      console.log('File parsed:', {
        ...result.metadata,
        textPreview: result.text.substring(0, 100) + '...'
      });
      
    } catch (err) {
      console.error('Ошибка загрузки файла:', err);
      setError(err instanceof Error ? err.message : 'Не удалось обработать файл');
      setFileName('');
      setResumeText('');
    } finally {
      setUploadLoading(false);
      setUploadProgress(null);
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
        body: JSON.stringify({ 
          resumeText,
          aiSummary: aiStatus === 'ready' ? aiSummary : null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка анализа');
      }
      
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Не удалось проанализировать резюме');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setResumeText('');
    setFileName('');
    setError('');
    setFileWarning(null);
    setUploadProgress(null);
    setAiStatus('idle');
    setAiSummary(null);
    setAiProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (aiAbortRef.current) {
      aiAbortRef.current.abort();
    }
  };

  const AIStatusIndicator = () => {
    if (resumeText.length < 100) return null;
    
    return (
      <div className="mb-4 p-3 rounded-lg border bg-gray-50">
        {aiStatus === 'thinking' && (
          <div className="flex items-center gap-3">
            <div className="relative w-6 h-6">
              <svg className="animate-spin w-6 h-6 text-purple-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-purple-700">AI оценивает стиль...</span>
                <span className="text-xs text-purple-500">{aiProgress}%</span>
              </div>
              <div className="w-full bg-purple-100 rounded-full h-1.5">
                <div 
                  className="bg-purple-500 h-1.5 rounded-full transition-all duration-200"
                  style={{ width: `${aiProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
        
        {aiStatus === 'ready' && (
          <div className="flex items-center gap-2 text-green-600">
            <LottieSticker name="checkmark" size={20} />
            <span className="text-sm font-medium">AI готов!</span>
          </div>
        )}
        
        {aiStatus === 'failed' && (
          <div className="flex items-center gap-2 text-gray-500">
            <span className="text-sm">Используем стандартный анализ</span>
          </div>
        )}
      </div>
    );
  };

  const UploadProgressIndicator = () => {
    if (!uploadLoading || !uploadProgress) return null;
    
    const isOCR = uploadProgress.progress > 45 && uploadProgress.progress < 100;
    
    return (
      <div className={`mt-3 p-4 rounded-lg border ${
        isOCR ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${
            isOCR ? 'text-orange-700' : 'text-blue-700'
          }`}>
            {uploadProgress.status}
          </span>
          <span className={`text-sm font-bold ${
            isOCR ? 'text-orange-600' : 'text-blue-600'
          }`}>
            {uploadProgress.progress}%
          </span>
        </div>
        
        <div className={`w-full rounded-full h-2.5 ${
          isOCR ? 'bg-orange-100' : 'bg-blue-100'
        }`}>
          <div 
            className={`h-2.5 rounded-full transition-all duration-300 ${
              isOCR ? 'bg-orange-500' : 'bg-blue-500'
            }`}
            style={{ width: `${uploadProgress.progress}%` }}
          />
        </div>
        
        {isOCR && (
          <div className="mt-3 flex items-start gap-2">
            <span className="text-lg">🔍</span>
            <div>
              <p className="text-sm font-medium text-orange-800">
                Распознавание текста (OCR)
              </p>
              <p className="text-xs text-orange-600 mt-1">
                PDF содержит изображения или сложный дизайн. 
                Это может занять 15-45 секунд.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
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
          <div className="flex items-center gap-3">
            <LottieSticker name="ba_logo" size={48} />
            <div>
              <h1 className="text-2xl font-bold text-black">AI Анализ резюме</h1>
              <p className="text-black mt-1">Профессиональный разбор с AI</p>
            </div>
          </div>
        </div>

        {!analysis ? (
          <div className="bg-gray-50 rounded-lg shadow-sm p-6">
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
                className={`w-full py-4 px-4 border-2 border-dashed rounded-lg transition-colors ${
                  uploadLoading 
                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                    : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
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
              
              <UploadProgressIndicator />
              
              {fileName && !uploadLoading && (
                <div className="mt-3 flex items-center justify-between text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                  <span className="flex items-center">
                    <LottieSticker name="checkmark" size={20} className="mr-2" />
                    <span>
                      <span className="font-medium">Файл загружен:</span> {fileName}
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      setFileName('');
                      setResumeText('');
                      setFileWarning(null);
                      setAiStatus('idle');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {fileWarning && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <LottieSticker name="exclamation" size={24} className="mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Обратите внимание</p>
                      <p>{fileWarning}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center text-gray-500 mb-4">или</div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-black">
                Вставьте текст резюме:
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                disabled={uploadLoading}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black bg-white disabled:bg-gray-100"
                placeholder="Скопируйте и вставьте ваше резюме здесь...

Совет: Для PDF с красивым дизайном (Canva, Figma) лучше открыть файл, выделить весь текст (Ctrl+A) и скопировать (Ctrl+C), затем вставить сюда."
              />
              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${
                    resumeText.length < 100 ? 'text-red-500' : 
                    resumeText.length < 500 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {resumeText.length} символов
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">минимум 100 для анализа</span>
                </div>
                {resumeText.length > 0 && (
                  <button
                    onClick={() => setResumeText('')}
                    className="text-gray-400 hover:text-red-500 text-xs"
                  >
                    Очистить
                  </button>
                )}
              </div>
            </div>

            <AIStatusIndicator />
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                <div className="flex items-start">
                  <LottieSticker name="exclamation" size={24} className="mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Ошибка</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
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
                  Анализируем...
                </span>
              ) : (
                <>
                  Получить анализ
                  {aiStatus === 'ready' && (
                    <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">+ AI</span>
                  )}
                </>
              )}
            </button>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <LottieSticker name="fire" size={24} className="mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Как работает:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Обычные PDF — текст извлекается мгновенно</li>
                    <li>Двухколоночные PDF — колонки объединяются автоматически</li>
                    <li>Дизайнерские PDF — распознаём через OCR</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
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
                <div className="mr-4">
                  <ScoreSticker score={analysis.score} size={64} />
                </div>
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
              <p className="text-black leading-relaxed text-lg italic">&ldquo;{analysis.summary}&rdquo;</p>
            </div>

            {/* Практические рекомендации (nudges) - БЕЗ смайликов внутри */}
            {analysis.nudges && analysis.nudges.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <h3 className="font-bold mb-4 text-black text-lg flex items-center">
                  <LottieSticker name="fire" size={28} className="mr-2" />
                  Практические рекомендации
                </h3>
                <div className="space-y-3">
                  {analysis.nudges.map((nudge: any, i: number) => (
                    <div key={i} className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-purple-400">
                      <div className="flex justify-between items-start">
                        <p className="text-black flex-1">{nudge.message}</p>
                        {nudge.actionTime && (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded whitespace-nowrap">
                            {nudge.actionTime}
                          </span>
                        )}
                      </div>
                      <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                        {NudgeSystem.getNudgeTypeLabel(nudge.type)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Сильные стороны - БЕЗ иконок внутри карточек */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="font-bold mb-3 text-black text-lg flex items-center">
                  <LottieSticker name="checkmark" size={28} className="mr-2" />
                  Сильные стороны
                </h3>
                <div className="space-y-2">
                  {analysis.strengths.map((item: string, i: number) => (
                    <div key={i} className="bg-white p-3 rounded-lg">
                      <span className="text-black">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Зоны роста - БЕЗ иконок внутри карточек */}
            {analysis.weaknesses && analysis.weaknesses.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                <h3 className="font-bold mb-3 text-black text-lg flex items-center">
                  <LottieSticker name="exclamation" size={28} className="mr-2" />
                  Зоны роста
                </h3>
                <div className="space-y-2">
                  {analysis.weaknesses.map((item: string, i: number) => (
                    <div key={i} className="bg-white p-3 rounded-lg">
                      <span className="text-black">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Рекомендации - БЕЗ иконок внутри карточек */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-bold mb-3 text-black text-lg flex items-center">
                  <LottieSticker name="megaphone" size={28} className="mr-2" />
                  Рекомендации
                </h3>
                <div className="space-y-2">
                  {analysis.recommendations.map((rec: string, i: number) => (
                    <div key={i} className="bg-white p-3 rounded-lg">
                      <span className="text-black">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Быстрый старт - ОСТАВЛЯЕМ нумерацию */}
            {analysis.quickStart && analysis.quickStart.length > 0 && (
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                <h3 className="font-bold mb-4 text-lg flex items-center">
                  <LottieSticker name="heart_a_plus" size={32} className="mr-2" />
                  Быстрый старт
                </h3>
                <div className="space-y-2">
                  {analysis.quickStart.map((step: string, i: number) => (
                    <div key={i} className="bg-white/20 backdrop-blur rounded-lg p-3 flex items-center">
                      <span className="text-2xl font-bold mr-3 w-8">{i + 1}</span>
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center py-4">
              <LottieSticker name="heart_fire" size={40} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}