let wordsData = window.wordsData || [];
let currentGroup = 0;
let currentIndex = 0;
let score = 0;

const wordDisplay = document.getElementById('word-display');
const optionsDiv = document.getElementById('options');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');

function shuffleArray(arr){
  return arr.sort(() => Math.random() - 0.5);
}

// 获取当前题目
function getCurrentWord() {
  return wordsData[currentIndex];
}

// 显示题目
function displayQuestion() {
  feedback.textContent = '';
  optionsDiv.innerHTML = '';

  if(currentIndex >= wordsData.length){
    document.getElementById('game-area').classList.add('hidden');
    document.getElementById('summary').classList.remove('hidden');
    document.getElementById('score').textContent = `得分：${score} / ${wordsData.length}`;
    return;
  }

  const currentWord = getCurrentWord();
  const isCnQuestion = Math.random() > 0.5;
  let correctAnswer = isCnQuestion ? currentWord.word : currentWord.cn;
  let questionText = isCnQuestion ? currentWord.cn : currentWord.word;
  
  wordDisplay.textContent = questionText;

  let options = [correctAnswer];
  while(options.length < 4){
    let randWord = wordsData[Math.floor(Math.random() * wordsData.length)];
    let option = isCnQuestion ? randWord.word : randWord.cn;
    if(!options.includes(option)) options.push(option);
  }

  shuffleArray(options);

  options.forEach(opt => {
    let btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(opt, correctAnswer);
    optionsDiv.appendChild(btn);
  });
}

function checkAnswer(selected, correct){
  if(selected === correct){
    feedback.textContent = '✔ 正确！';
    score++;
  } else {
    feedback.textContent = `✖ 错误！正确答案：${correct}`;
  }
}

nextBtn.onclick = () => {
  currentIndex++;
  displayQuestion();
}

// 初始化
displayQuestion();
