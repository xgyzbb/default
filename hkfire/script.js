const timelineData = [
    {
        id: 7,
        date: '2025-11-29',
        time: '09:00',
        title: '政府宣布全面检讨建筑安全',
        description: '行政长官李家超宣布成立跨部门小组，全面检讨全港大厦外墙物料安全，并计划加快立法取缔竹棚，推动金属棚架使用。',
        tags: ['政府回应', '安全检讨'],
        urgent: false
    },
    {
        id: 6,
        date: '2025-11-28',
        time: '15:30',
        title: '警方拘捕三名涉案人士',
        description: '警方重案组拘捕两名建筑公司董事及一名工程顾问，年龄介乎52至68岁，涉嫌误杀及严重疏忽。廉政公署介入调查工程合约是否涉及贪污。',
        tags: ['警方行动', '拘捕'],
        urgent: true
    },
    {
        id: 5,
        date: '2025-11-28',
        time: '10:00',
        title: '火势受控，死伤人数更新',
        description: '经过两日两夜扑救，大火大致被救熄。当局确认死亡人数升至128人，其中包括一名英勇殉职的消防员。另有79人受伤，约200人仍失联。',
        tags: ['伤亡更新', '火势受控'],
        urgent: true
    },
    {
        id: 4,
        date: '2025-11-27',
        time: '18:00',
        title: '救援困难，伤亡惨重',
        description: '由于大厦外墙发泡胶物料助长火势，加上部分楼层火警钟失灵，导致大量居民走避不及。消防处形容环境极其恶劣。',
        tags: ['救援进展'],
        urgent: true
    },
    {
        id: 3,
        date: '2025-11-27',
        time: '09:00',
        title: '火警升为五级',
        description: '火势持续蔓延且不受控制，消防处将火警级别升至最高的五级。全港消防局增援，出动超过500名消防员及救护员。',
        tags: ['五级火警', '紧急'],
        urgent: true
    },
    {
        id: 2,
        date: '2025-11-26',
        time: '16:00',
        title: '火势迅速蔓延',
        description: '火势沿外墙棚架及易燃物料迅速向上蔓延，波及多个楼层。浓烟封锁逃生通道。',
        tags: ['火势蔓延'],
        urgent: false
    },
    {
        id: 1,
        date: '2025-11-26',
        time: '14:15',
        title: '大埔宏福苑发生火警',
        description: '大埔宏福苑一正进行外墙维修的大厦发生火警。初步怀疑是焊接工程火花燃点外墙物料所致。',
        tags: ['突发', '起火'],
        urgent: false
    }
];

const timelineContainer = document.getElementById('timeline');
const lastUpdatedEl = document.getElementById('last-updated');

// Google News RSS Feed for "Hong Kong Fire" (Simplified Chinese)
const RSS_URL = 'https://news.google.com/rss/search?q=%E9%A6%99%E6%B8%AF%E5%A4%A7%E7%81%AB&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans';
// Using rss2json to convert RSS to JSON and bypass CORS
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

function renderTimeline() {
    timelineContainer.innerHTML = '';

    // Sort by date/time descending
    const sortedData = [...timelineData].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA;
    });

    sortedData.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = `timeline-item ${item.urgent ? 'urgent' : ''}`;
        itemEl.style.transitionDelay = `${index * 100}ms`;

        const tagsHtml = item.tags.map(tag =>
            `<span class="tag ${tag === '突发' || tag === '五级火警' || tag === '最新消息' ? 'alert' : ''}">${tag}</span>`
        ).join('');

        itemEl.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="time-badge">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    ${item.date} ${item.time}
                </div>
                <h3 class="timeline-title">${item.title}</h3>
                <p class="timeline-desc">${item.description}</p>
                <div class="timeline-tags">
                    ${tagsHtml}
                </div>
            </div>
        `;

        timelineContainer.appendChild(itemEl);
    });

    // Trigger animations
    setTimeout(() => {
        document.querySelectorAll('.timeline-item').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    lastUpdatedEl.textContent = timeString;
}

async function fetchRealTimeNews() {
    try {
        console.log('Fetching latest news...');
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.status === 'ok' && data.items.length > 0) {
            let newItemsCount = 0;

            data.items.forEach(item => {
                // Parse date from RSS item (e.g., "2025-11-29 08:00:00")
                const pubDate = new Date(item.pubDate);
                const dateStr = pubDate.toISOString().split('T')[0];
                const timeStr = pubDate.toTimeString().slice(0, 5);

                // Check if this item already exists (simple check by title)
                const exists = timelineData.some(existing => existing.title === item.title);

                if (!exists) {
                    // Add new item
                    timelineData.unshift({
                        id: Date.now() + Math.random(), // Temporary ID
                        date: dateStr,
                        time: timeStr,
                        title: item.title,
                        description: item.description || '点击查看详细报道...', // RSS description might be HTML
                        tags: ['最新消息', 'Google News'],
                        urgent: false,
                        link: item.link
                    });
                    newItemsCount++;
                }
            });

            if (newItemsCount > 0) {
                console.log(`Added ${newItemsCount} new news items.`);
                renderTimeline();
            } else {
                console.log('No new news items found.');
            }
        }
    } catch (error) {
        console.error('Failed to fetch news:', error);
    }
}

function initAutoUpdate() {
    updateTime();
    setInterval(updateTime, 60000); // Update clock every minute

    // Fetch news immediately and then every 10 minutes
    fetchRealTimeNews();
    setInterval(fetchRealTimeNews, 600000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTimeline();
    initAutoUpdate();
});
