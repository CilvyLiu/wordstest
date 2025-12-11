/**
 * main.js - 核心游戏逻辑和渲染
 * 使用 Fetch API 异步加载 config.json 和 tasks.json
 */

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');

    // 1. 异步加载两个 JSON 文件
    Promise.all([
        fetch('config.json').then(res => res.json()),
        fetch('tasks.json').then(res => res.json())
    ])
    .then(([activityConfig, tasksData]) => {
        // 确保数据已成功加载
        if (!activityConfig || !activityConfig.groups || !tasksData) {
            appContainer.innerHTML = 
                '<p style="color:red; text-align:center;">错误：JSON 文件结构不正确或加载失败。</p>';
            return;
        }
        
        // 2. 数据加载成功后，开始渲染
        renderActivityOverview(activityConfig, tasksData, appContainer);
    })
    .catch(error => {
        // 通常在本地打开文件时会遇到 CORS 或网络错误
        appContainer.innerHTML = 
            `<p style="color:red; text-align:center;">错误：加载配置数据失败。请确保您正在使用本地服务器运行此文件，或检查文件路径和网络连接。</p><p style="color:red; text-align:center;">详情: ${error.message}</p>`;
        console.error("加载配置数据时发生错误:", error);
    });
});

/**
 * 根据组ID和活动类型，从 tasksData 中查找具体任务内容。
 */
const getTaskDetails = (tasksData, key) => {
    return tasksData[key] || null;
};

/**
 * 渲染活动的概览页面
 */
function renderActivityOverview(activityConfig, tasksData, appContainer) {
    activityConfig.groups.forEach(group => {
        const card = document.createElement('div');
        card.className = 'group-card';
        
        // 组标题
        card.innerHTML = `<div class="group-header"><h2>Group ${group.groupId}</h2></div>`;

        // 词汇列表
        const wordsTitle = document.createElement('p');
        wordsTitle.textContent = `包含词汇 (${group.words.length} 个):`;
        wordsTitle.style.fontWeight = 'normal';
        card.appendChild(wordsTitle);

        const wordList = document.createElement('ul');
        wordList.className = 'word-list';
        group.words.forEach(word => {
            const listItem = document.createElement('li');
            listItem.textContent = word;
            wordList.appendChild(listItem);
        });
        card.appendChild(wordList);
        
        // 学习活动渲染
        const activitiesDiv = document.createElement('div');
        activitiesDiv.className = 'activities';
        activitiesDiv.innerHTML = '<h3>📘 学习活动:</h3>';

        group.activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            if (activity.type === 'WordPractice') {
                activityItem.innerHTML = `<strong>词汇练习:</strong> 共 ${activity.items.length} 词, 模式: ${activity.items[0].mode.join('/')}`;
            } else if (activity.type === 'MiniGame') {
                const taskKey = `MiniGame-${group.groupId}`;
                const details = getTaskDetails(tasksData, taskKey);
                
                activityItem.innerHTML = `<strong>迷你游戏:</strong> ${activity.game} (奖励: ${activity.reward})<br> 描述: ${activity.description || '无'}`;
                
                if (details) {
                    activityItem.innerHTML += `<p style="margin:5px 0; font-size:0.85em; color:#4a4a4a;">- **游戏内容提示:** `;
                    if (activity.game === 'PicturePuzzle') {
                        activityItem.innerHTML += `需要拼图 (${details.details.pieces}块), 提示内容: ${details.details.image_hint}`; 
                    } else if (activity.game === 'WordMatch') {
                         activityItem.innerHTML += `匹配 ${details.details.length} 对词汇及释义, 例如: ${details.details[0].word} - ${details.details[0].definition}`;
                    } else if (activity.game === 'SpellingBox') {
                        activityItem.innerHTML += `在 ${details.details.grid_size} 的网格中找出 ${details.details.words.length} 个词。`;
                    } else {
                        activityItem.innerHTML += `具体游戏逻辑已定义在 tasks.json 中。`;
                    }
                    activityItem.innerHTML += `</p>`;
                } else {
                    activityItem.innerHTML += `<p style="color:orange; font-size:0.85em;">- (任务数据缺失：${taskKey})</p>`;
                }
            }
            activitiesDiv.appendChild(activityItem);
        });
        card.appendChild(activitiesDiv);

        // 复习任务渲染
        if (group.reviewAfter && group.reviewTask) {
            const reviewDiv = document.createElement('div');
            reviewDiv.className = 'review-task';
            reviewDiv.innerHTML = `<h3>🔄 阶段复习任务:</h3>`;

            group.reviewTask.activities.forEach(task => {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                
                const taskKey = `${task.type}-${group.groupId}`;
                const details = getTaskDetails(tasksData, taskKey);

                reviewItem.innerHTML = `<strong>${task.type}</strong>`;
                if (task.title) {
                    reviewItem.innerHTML += `<br><span class="title">标题: ${task.title}</span>`;
                }
                
                if (details) {
                    reviewItem.innerHTML += `<p style="margin:5px 0; font-size:0.85em; color:#4a4a4a;">- **任务内容提示:** `;
                    if (task.type === 'PassageCloze') {
                        reviewItem.innerHTML += `文章片段: "${details.passage.substring(0, 50)}..."`;
                    } else if (task.type === 'WordMatch') {
                        reviewItem.innerHTML += `匹配 ${details.details.length} 对词汇。`;
                    } else if (task.type === 'QuizChoice') {
                        reviewItem.innerHTML += `共 ${details.question_count || '?' } 道选择题。`;
                    }
                    reviewItem.innerHTML += `</p>`;
                } else {
                    reviewItem.innerHTML += `<p style="color:orange; font-size:0.85em;">- (任务数据缺失：${taskKey})</p>`;
                }

                reviewDiv.appendChild(reviewItem);
            });
            card.appendChild(reviewDiv);
        }

        appContainer.appendChild(card);
    });
}