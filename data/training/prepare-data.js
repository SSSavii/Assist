/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const prepareTrainingData = () => {
  const pairs = [];
  
  // Читаем все файлы
  for (let i = 1; i <= 7; i++) {
    try {
      const resumePath = path.join(__dirname, 'resumes', `resume_${i}.txt`);
      const reviewPath = path.join(__dirname, 'reviews', `review_${i}.txt`);
      
      const resume = fs.readFileSync(resumePath, 'utf-8');
      const review = fs.readFileSync(reviewPath, 'utf-8');
      
      pairs.push({
        id: i,
        resume: resume.substring(0, 1500), // Берем первые 1500 символов для экономии токенов
        review: review.substring(0, 1000),
        name: `Example ${i}`
      });
      
      console.log(`✓ Обработан пример ${i}`);
    } catch (error) {
      console.error(`✗ Ошибка с примером ${i}:`, error.message);
    }
  }
  
  // Сохраняем JSON
  const outputPath = path.join(__dirname, 'training_pairs.json');
  fs.writeFileSync(outputPath, JSON.stringify(pairs, null, 2));
  
  console.log(`\n✅ Подготовлено ${pairs.length} примеров!`);
  console.log(`📁 Сохранено в: ${outputPath}`);
};

prepareTrainingData();