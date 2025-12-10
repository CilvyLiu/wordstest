document.addEventListener("DOMContentLoaded",()=>{

  const mainContent = document.getElementById("main-content");
  const taskContainer = document.getElementById("task-container");
  const inventoryToggle = document.getElementById("inventory-toggle");
  const progressFill = document.getElementById("progress-fill");
  const startGameBtn = document.getElementById("start-game");

  let currentGroupIndex = 0;
  let clueCards = [];

  // 游戏开始
  startGameBtn.addEventListener("click",()=>{showGroup(currentGroupIndex);});

  // 显示小组
  function showGroup(idx){
    if(idx>=tasksData.length){return showEndScreen();}
    const group = tasksData[idx];
    taskContainer.innerHTML = "";
    document.getElementById("game-area").classList.remove("hidden");
    updateProgress(idx);

    renderActivities(group,()=>{currentGroupIndex++; showGroup(currentGroupIndex);});
  }

  function updateProgress(idx){
    const total = tasksData.length;
    const percent = ((idx)/total)*100;
    progressFill.style.width = percent+"%";
  }

  function renderActivities(group,callback){
    let actIdx=0;
    function nextActivity(){
      if(actIdx>=group.activities.length){return callback();}
      const activity = group.activities[actIdx];
      actIdx++;
      renderWordPractice(activity.items,nextActivity);
    }
    nextActivity();
  }

  function renderWordPractice(items,callback){
    taskContainer.innerHTML="";
    const container=document.createElement("div");
    container.classList.add("task-container");

    items.forEach(word=>{
      const wordBox = document.createElement("div");
      wordBox.classList.add("word-display");
      wordBox.textContent = word;
      container.appendChild(wordBox);

      const btnEn = document.createElement("button");
      btnEn.textContent = "英文释义";
      btnEn.addEventListener("click",()=>{alert("选择英文释义: "+word); clueCards.push(word);});
      container.appendChild(btnEn);

      const btnCn = document.createElement("button");
      btnCn.textContent = "中文释义";
      btnCn.addEventListener("click",()=>{alert("选择中文释义: "+word); clueCards.push(word);});
      container.appendChild(btnCn);

      const btnSpell = document.createElement("button");
      btnSpell.textContent="拼写";
      btnSpell.addEventListener("click",()=>{
        const ans = prompt(`拼写: ${word}`);
        if(ans && ans.trim().toLowerCase()===word.toLowerCase()){alert("正确"); clueCards.push(word);}
        else{alert(`错误, 正确拼写: ${word}`);}
      });
      container.appendChild(btnSpell);

      const btnSentence = document.createElement("button");
      btnSentence.textContent="造句";
      btnSentence.addEventListener("click",()=>{
        const sent = prompt(`用 "${word}" 造句`);
        if(sent && sent.length>5){alert("已记录句子"); clueCards.push(word);}
        else{alert("句子太短");}
      });
      container.appendChild(btnSentence);
    });

    const nextBtn = document.createElement("button");
    nextBtn.textContent="完成本关";
    nextBtn.addEventListener("click",callback);
    container.appendChild(nextBtn);

    taskContainer.appendChild(container);
  }

  function showEndScreen(){
    taskContainer.innerHTML=`<h2 class="title-glow">恭喜完成所有任务</h2>
    <p>收集线索: ${clueCards.join(", ")}</p>
    <p>现在揭示谁是间谍 🕵️‍♂️</p>`;
  }

  inventoryToggle.addEventListener("click",()=>{
    alert("线索卡片: "+clueCards.join(", "));
  });

});
