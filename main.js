// main.js
document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app-container");
    const mainContent = document.getElementById("main-content");
    const progressFill = document.getElementById("progress-fill");
    const inventoryToggle = document.getElementById("inventory-toggle");

    let tasksData = null;
    let currentGroupIndex = 0;
    let clueCards = [];
    let studentScores = {}; // 可扩展保存分数

    // 加载 JSON 数据
    fetch("data/tasks.json")
        .then(resp => resp.json())
        .then(json => {
            tasksData = json.groups;
            showGroup(currentGroupIndex);
        })
        .catch(err => {
            mainContent.innerHTML = `<p style="color:red">加载数据失败：${err}</p>`;
        });

    // 显示小组/关卡
    function showGroup(index) {
        if (!tasksData || index >= tasksData.length) {
            return showEndScreen();
        }

        const group = tasksData[index];
        mainContent.innerHTML = `<h2>关卡 ${group.groupId}</h2>`;
        updateProgress(index);

        // 遍历活动
        let activityIndex = 0;
        function nextActivity() {
            if (activityIndex >= group.activities.length) {
                // 检查复习任务
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

    // 更新进度条
    function updateProgress(index) {
        const total = tasksData.length;
        const percent = ((index) / total) * 100;
        progressFill.style.width = percent + "%";
    }

    // 渲染单词练习
    function renderWordPractice(items, callback) {
        mainContent.innerHTML = "<h3>单词练习</h3>";
        const container = document.createElement("div");
        container.classList.add("task-container");

        items.forEach(item => {
            const wordBox = document.createElement("div");
            wordBox.classList.add("word-display");
            wordBox.textContent = item.word;
            container.appendChild(wordBox);

            // 创建每种练习模式按钮
            item.mode.forEach(mode => {
                const btn = document.createElement("button");
                btn.textContent = mode;
                btn.addEventListener("click", () => {
                    handleWordMode(item.word, mode);
                });
                container.appendChild(btn);
            });
        });

        // 下一步按钮
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

    // 渲染小游戏
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

    // 渲染复习
    function renderReview(activities, callback) {
        mainContent.innerHTML = "<h3>复习关卡</h3>";
        const container = document.createElement("div");
        container.classList.add("task-container");

        activities.forEach((act, idx) => {
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

    // 展示结束/破案
    function showEndScreen() {
        mainContent.innerHTML = `<h2 class="title-glow">恭喜！你完成了所有任务</h2>
        <p>你收集的线索卡片： ${clueCards.join(", ")}</p>
        <p>现在揭示谁是间谍 🕵️‍♂️</p>`;
    }

    // 库存/线索切换
    inventoryToggle.addEventListener("click", () => {
        alert("线索卡片：" + clueCards.join(", "));
    });
});
