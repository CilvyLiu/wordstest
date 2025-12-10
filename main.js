document.addEventListener("DOMContentLoaded", () => {
    const mainContent = document.getElementById("main-content");
    const progressFill = document.getElementById("progress-fill");
    const inventoryToggle = document.getElementById("inventory-toggle");
    const startGameBtn = document.getElementById("start-game");

    let tasksData = null;
    let currentGroupIndex = 0;
    let clueCards = [];

    // 加载 JSON 数据
    fetch("data/tasks.json")
        .then(resp => resp.json())
        .then(json => {
            tasksData = json.groups;
            console.log("JSON loaded", tasksData);
        })
        .catch(err => {
            mainContent.innerHTML = `<p style="color:red">加载数据失败：${err}</p>`;
        });

    startGameBtn.addEventListener("click", () => {
        startGameBtn.style.display = "none";
        showGroup(currentGroupIndex);
    });

    function showGroup(index) {
        if (!tasksData || index >= tasksData.length) return showEndScreen();

        const group = tasksData[index];
        mainContent.innerHTML = `<h2>关卡 ${group.groupId}</h2>`;
        updateProgress(index);

        let activityIndex = 0;
        function nextActivity() {
            if (activityIndex >= group.activities.length) {
                if (group.reviewAfter && group.reviewTask) {
                    renderReview(group.reviewTask.activities, () => {
                        currentGroupIndex++;
                        showGroup(currentGroupIndex);
                    });
                } else {
                    currentGroupIndex++;
                    showGroup(currentGroupIndex);
                }
                return;
            }

            const activity = group.activities[activityIndex];
            activityIndex++;

            switch (activity.type) {
                case "WordPractice":
                    renderWordPractice(activity.items, nextActivity);
                    break;
                case "MiniGame":
                    renderMiniGame(activity, nextActivity);
                    break;
                case "Review":
                    renderReview(activity.activities, nextActivity);
                    break;
            }
        }

        nextActivity();
    }

    function updateProgress(index) {
        const total = tasksData.length;
        const percent = ((index) / total) * 100;
        progressFill.style.width = percent + "%";
    }

    function renderWordPractice(items, callback) {
        mainContent.innerHTML = "<h3>单词练习</h3>";
        const container = document.createElement("div");
        container.classList.add("task-container");

        items.forEach(item => {
            const wordBox = document.createElement("div");
            wordBox.classList.add("word-display");
            wordBox.textContent = item.word;
            container.appendChild(wordBox);

            item.mode.forEach(mode => {
                const btn = document.createElement("button");
                btn.textContent = mode;
                btn.addEventListener("click", () => handleWordMode(item.word, mode));
                container.appendChild(btn);
            });
        });

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "完成练习";
        nextBtn.addEventListener("click", callback);
        container.appendChild(nextBtn);

        mainContent.appendChild(container);
    }

    function handleWordMode(word, mode) {
        switch (mode) {
            case "choice_en":
                alert(`选择英文释义: ${word}`);
                break;
            case "choice_cn":
                alert(`选择中文释义: ${word}`);
                break;
            case "spelling":
                const ans = prompt(`拼写: ${word}`);
                if (ans && ans.trim().toLowerCase() === word.toLowerCase()) {
                    alert("正确！");
                    clueCards.push(word);
                } else {
                    alert(`错误，正确拼写是: ${word}`);
                }
                break;
            case "sentence":
                const sent = prompt(`用 "${word}" 造句`);
                if (sent && sent.length > 5) {
                    alert("已记录句子！");
                    clueCards.push(word);
                } else {
                    alert("句子太短，未记录。");
                }
                break;
        }
    }

    function renderMiniGame(activity, callback) {
        mainContent.innerHTML = `<h3>小活动: ${activity.game}</h3>`;
        const container = document.createElement("div");
        container.classList.add("task-container");

        const desc = document.createElement("p");
        desc.textContent = activity.description || "完成小游戏获取线索卡片";
        container.appendChild(desc);

        const btn = document.createElement("button");
        btn.textContent = "完成小游戏";
        btn.addEventListener("click", () => {
            clueCards.push(activity.reward);
            callback();
        });
        container.appendChild(btn);

        mainContent.appendChild(container);
    }

    function renderReview(activities, callback) {
        mainContent.innerHTML = "<h3>复习关卡</h3>";
        const container = document.createElement("div");
        container.classList.add("task-container");

        activities.forEach(act => {
            const btn = document.createElement("button");
            btn.textContent = act.type + (act.title ? ` - ${act.title}` : "");
            btn.addEventListener("click", () => {
                alert(`执行复习活动: ${act.type}`);
                clueCards.push(act.type);
            });
            container.appendChild(btn);
        });

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "完成复习";
        nextBtn.addEventListener("click", callback);
        container.appendChild(nextBtn);

        mainContent.appendChild(container);
    }

    function showEndScreen() {
        mainContent.innerHTML = `<h2 class="title-glow">恭喜！你完成了所有任务</h2>
        <p>你收集的线索卡片： ${clueCards.join(", ")}</p>`;
    }

    inventoryToggle.addEventListener("click", () => {
        alert("线索卡片：" + clueCards.join(", "));
    });
});
