document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('fortune-card');
    const mainFortune = document.getElementById('main-fortune');
    const toxicSoup = document.getElementById('toxic-soup');
    const resetBtn = document.getElementById('reset-btn');
    const clickHint = document.getElementById('click-hint');
    const starsContainer = document.getElementById('stars-container');

    // 预言数据
    const positiveFortunes = [
        "今年你的存款将和发量呈反比——存款猛涨，发量依然坚挺！",
        "老板会因为你的努力而过上更好的生活——当然，你也拿到了丰厚的年终奖。",
        "你的 Bug 会在午夜自愈，且不产生任何副作用。",
        "你的支付音效将成为你今年听过最美妙的交响乐。",
        "升职加薪的速度将超过你点外卖的速度。",
        "今年你的PPT将获得奥斯卡最佳视觉效果奖，直接闪瞎甲方。",
        "锦鲤附体，随手抽奖都能中个‘再来一箱’。",
        "年底查余额时，你会怀疑系统出了 Bug，因为多出了好几个零。"
    ];

    // 毒鸡汤数据
    const toxicSoups = [
        "上帝为你关上了一扇门，然后就去睡觉了。",
        "虽然你长得丑，但是你想得美啊。",
        "有时候不努力一把，你都不知道什么叫绝望。",
        "咸鱼翻身了，还是咸鱼。",
        "万事开头难，中间难，结尾更难。",
        "世上无难事，只要肯放弃。",
        "你以为你是被生活磨平了棱角，其实你只是长胖了，圆了。",
        "哪有什么岁月静好，不过是有人替你负重前行——那个人就是加班的你自己。"
    ];

    // 初始化星星背景
    function createStars() {
        const count = 100;
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 3;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
            starsContainer.appendChild(star);
        }
    }

    // 随机获取内容
    function getRandomContent() {
        const fRand = Math.floor(Math.random() * positiveFortunes.length);
        const sRand = Math.floor(Math.random() * toxicSoups.length);

        mainFortune.textContent = positiveFortunes[fRand];
        toxicSoup.textContent = toxicSoups[sRand];
    }

    // 处理抽取
    function drawFortune() {
        if (!card.classList.contains('flipped')) {
            getRandomContent();
            card.classList.add('flipped');
            clickHint.style.opacity = '0';
        }
    }

    // 重置
    function resetFortune() {
        card.classList.remove('flipped');
        setTimeout(() => {
            clickHint.style.opacity = '0.6';
        }, 500);
    }

    // 事件监听
    card.addEventListener('click', drawFortune);
    resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetFortune();
    });

    createStars();
});
