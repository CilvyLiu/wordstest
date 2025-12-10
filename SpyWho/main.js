let words = [];
let students = [];
let tasks = [];
let currentLevel = 1;
let currentWordIndex = 0;
let studentId = "stu001";

document.addEventListener("DOMContentLoaded", async () => {
  words = await fetch("../data/words.json").then(r=>r.json());
  students = await fetch("../data/students.json").then(r=>r.json());
  tasks = await fetch("../data/tasks.json").then(r=>r.json());

  document.getElementById("startGame").addEventListener("click", startGame);
  document.getElementById("restartBtn").addEventListener("click", ()=>location.reload());
});

function startGame(){
  document.getElementById("home").style.display = "none";
  document.getElementById("game").style.display = "block";
  currentWordIndex = 0;
  showNextWord();
}

function showNextWord(){
  const container = document.getElementById("activityContainer");
  container.innerHTML = "";

  if(currentWordIndex >= words.length){
    endGame();
    return;
  }

  // 每5个单词小活动
  if(currentWordIndex % 5 === 0 && currentWordIndex>0){
    showMiniActivity();
    return;
  }

  // 每10个单词复习
  if(currentWordIndex % 10 === 0 && currentWordIndex>0){
    showReviewActivity();
    return;
  }

  const wordObj = words[currentWordIndex];
  const html = `
    <h3>单词：${wordObj.word}</h3>
    <p>词性：${wordObj.pos.join(", ")}</p>
    <p>例句填空：</p>
    <p>${wordObj.examples[0].replace(wordObj.word,"______")}</p>
    <input type="text" id="answer">
    <button onclick="checkAnswer('${wordObj.word}')">提交答案</button>
  `;
  container.innerHTML = html;
}

function checkAnswer(correct){
  const val = document.getElementById("answer").value.trim();
  if(val.toLowerCase() === correct.toLowerCase()){
    alert("正确 ✅");
    collectClue();
    currentWordIndex++;
    showNextWord();
  }else{
    alert("再想想 ❌");
  }
}

function showMiniActivity(){
  const container = document.getElementById("activityContainer");
  container.innerHTML = `<h3>小活动 🔍</h3>
    <p>拼写、连线、句子练习都在这里（可扩展）</p>
    <button onclick="finishMiniActivity()">完成小活动</button>`;
}

function finishMiniActivity(){
  collectClue();
  currentWordIndex++;
  showNextWord();
}

function showReviewActivity(){
  const container = document.getElementById("activityContainer");
  container.innerHTML = `<h3>复习关卡 📝</h3>
    <p>选择题、拼写接龙、句子重组、篇章填空</p>
    <button onclick="finishReview()">完成复习</button>`;
}

function finishReview(){
  collectClue();
  currentWordIndex++;
  showNextWord();
}

function collectClue(){
  const student = students.find(s=>s.id===studentId);
  const clue = `clue${currentWordIndex+1}`;
  if(!student.cluesCollected.includes(clue)){
    student.cluesCollected.push(clue);
  }
}

function endGame(){
  document.getElementById("game").style.display="none";
  document.getElementById("result").style.display="block";
  const student = students.find(s=>s.id===studentId);
  document.getElementById("finalClues").innerHTML = "收集线索："+student.cluesCollected.join(", ");
  document.getElementById("scoreSummary").innerHTML = "完成关卡："+currentWordIndex+" 个单词";
}
