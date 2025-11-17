// ...existing code...
let objs = [];
let colors = ['#f71735', '#f7d002', '#1A53C0', '#232323'];

function setup() {
    // ...existing code...
    // 修改：固定畫布大小並置中，並將整個視窗背景設為 #121220
    let canvas = createCanvas(800, 600);
    // 使用 p5.js 的 position() 函式進行置中
    canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2); 
    rectMode(CENTER);
    document.body.style.backgroundColor = '#121220';
    objs.push(new DynamicShape());

    // 設定文字樣式 (字體放大至 64)
    textAlign(CENTER, CENTER); // 文字水平和垂直置中
    textSize(64);              // 字體大小
    fill(255);                 // 設定文字顏色為白色
}

function draw() {
    // 修改：使用透明背景以顯示整個視窗的底色
    clear();
    for (let i of objs) {
        i.run();
    }

    // 核心修改：在畫布中心繪製兩行文字
    const centerX = width / 2;
    const centerY = height / 2;
    const offset = 40; // 調整兩行文字與中心點的距離

    // 上方文字：淡江大學教育科技學系
    text("淡江大學教育科技學系", centerX, centerY - offset); 
    
    // 下方文字：414730126 林依涵
    text("414730126 林依涵", centerX, centerY + offset); 


    if (frameCount % int(random([15, 30])) == 0) {
        let addNum = int(random(1, 30));
        for (let i = 0; i < addNum; i++) {
            objs.push(new DynamicShape());
        }
    }
    // 由後向前移除已死亡的物件，避免 splice 時跳過
    for (let i = objs.length - 1; i >= 0; i--) {
        if (objs[i].isDead) {
            objs.splice(i, 1);
        }
    }
}

// 新增：視窗大小變動時重新置中畫布
function windowResized() {
    // 簡化：直接使用 p5.js 的 position() 函式來重新置中畫布
    const canvas = document.querySelector('canvas');
    if (canvas) {
        select('canvas').position((windowWidth - width) / 2, (windowHeight - height) / 2);
    }
}

function easeInOutExpo(x) {
    return x === 0 ? 0 :
        x === 1 ?
        1 :
        x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 :
        (2 - Math.pow(2, -20 * x + 10)) / 2;
}

class DynamicShape {
    constructor() {
        this.x = random(0.3, 0.7) * width;
        this.y = random(0.3, 0.7) * height;
        this.reductionRatio = 1;
        // 修正：允許 0-4 五種 shapeType
        this.shapeType = int(random(5));
        this.animationType = 0;
        this.maxActionPoints = int(random(2, 5));
        this.actionPoints = this.maxActionPoints;
        this.elapsedT = 0;
        this.size = 0;
        this.sizeMax = width * random(0.01, 0.05);
        this.fromSize = 0;
        this.init();
        this.isDead = false;
        this.clr = random(colors);
        this.changeShape = true;
        this.ang = int(random(2)) * PI * 0.25;
        this.lineSW = 0;
    }

    show() {
        push();
        translate(this.x, this.y);
        if (this.animationType == 1) scale(1, this.reductionRatio);
        if (this.animationType == 2) scale(this.reductionRatio, 1);
        fill(this.clr);
        stroke(this.clr);
        strokeWeight(this.size * 0.05);
        if (this.shapeType == 0) {
            noStroke();
            circle(0, 0, this.size);
        } else if (this.shapeType == 1) {
            noFill();
            circle(0, 0, this.size);
        } else if (this.shapeType == 2) {
            noStroke();
            rect(0, 0, this.size, this.size);
        } else if (this.shapeType == 3) {
            noFill();
            rect(0, 0, this.size * 0.9, this.size * 0.9);
        } else if (this.shapeType == 4) {
            line(0, -this.size * 0.45, 0, this.size * 0.45);
            line(-this.size * 0.45, 0, this.size * 0.45, 0);
        }
        pop();
        strokeWeight(this.lineSW);
        stroke(this.clr);
        line(this.x, this.y, this.fromX, this.fromY);
    }

    move() {
        let n = easeInOutExpo(norm(this.elapsedT, 0, this.duration));
        if (0 < this.elapsedT && this.elapsedT < this.duration) {
            if (this.actionPoints == this.maxActionPoints) {
                this.size = lerp(0, this.sizeMax, n);
            } else if (this.actionPoints > 0) {
                if (this.animationType == 0) {
                    this.size = lerp(this.fromSize, this.toSize, n);
                } else if (this.animationType == 1) {
                    this.x = lerp(this.fromX, this.toX, n);
                    this.lineSW = lerp(0, this.size / 5, sin(n * PI));
                } else if (this.animationType == 2) {
                    this.y = lerp(this.fromY, this.toY, n);
                    this.lineSW = lerp(0, this.size / 5, sin(n * PI));
                } else if (this.animationType == 3) {
                    if (this.changeShape == true) {
                        this.shapeType = int(random(5));
                        this.changeShape = false;
                    }
                }
                this.reductionRatio = lerp(1, 0.3, sin(n * PI));
            } else {
                this.size = lerp(this.fromSize, 0, n);
            }
        }

        this.elapsedT++;
        if (this.elapsedT > this.duration) {
            this.actionPoints--;
            this.init();
        }
        if (this.actionPoints < 0) {
            this.isDead = true;
        }
    }

    run() {
        this.show();
        this.move();
    }

    init() {
        this.elapsedT = 0;
        this.fromSize = this.size;
        this.toSize = this.sizeMax * random(0.5, 1.5);
        this.fromX = this.x;
        // 修正：使用 constrain 避免超出畫布範圍
        this.toX = constrain(this.fromX + (width / 10) * random([-1, 1]) * int(random(1, 4)), 0, width);
        this.fromY = this.y;
        this.toY = constrain(this.fromY + (height / 10) * random([-1, 1]) * int(random(1, 4)), 0, height);
        // 修正：animationType 允許 0-3（因為程式中有 animationType == 3 的分支）
        this.animationType = int(random(4));
        this.duration = random(20, 50);
    }
}

// 新增：左側固定選單（五項，字體 32px）
const leftMenu = document.createElement('aside');
leftMenu.id = 'leftMenu';
leftMenu.innerHTML = `
    <button id="menuToggle">×</button>
    <nav>
        <ul>
            <li id="menu-item-works">第一單元作品</li>
            <li id="menu-item-notes">第一單元講義</li>
            <li id="menu-item-works-notes">作品講義</li> 
            <li id="menu-item-quiz">測驗系統</li>
            <li id="menu-item-tku" class="has-submenu">
                淡江大學
                <ul class="submenu">
                    <li id="submenu-item-et">教育科技學系</li>
                </ul>
            </li>
            <li id="menu-item-home">回到首頁</li>
        </ul>
    </nav>
`;
document.body.appendChild(leftMenu);

const style = document.createElement('style');
style.innerHTML = `
    #leftMenu {
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        width: 300px;
        background: #ffffff; /* 修改：選單背景改為白色 */
        color: #000000; /* 修改：選單文字改為黑色 */
        padding: 40px 24px;
        box-sizing: border-box;
        z-index: 9999;
        transition: transform 0.3s ease-out; 
        -webkit-font-smoothing: antialiased;
    }

    /* 隱藏狀態 */
    #leftMenu.collapsed {
        transform: translateX(calc(-100% + 50px)); /* 隱藏選單，只露出 50px 給切換按鈕 */
    }
    /* 讓內容往左邊推，這樣隱藏時內容會消失 */
    #leftMenu nav {
        opacity: 1;
        transition: opacity 0.2s 0.1s;
    }
    #leftMenu.collapsed nav {
        opacity: 0;
        pointer-events: none; /* 讓隱藏時無法點擊內容 */
        transition: opacity 0.1s;
    }

    /* 切換按鈕樣式 */
    #menuToggle {
        position: absolute; 
        top: 0;
        right: -50px; /* 預設移到 #leftMenu 外部 */
        width: 50px;
        height: 50px;
        background: #ffffff; /* 修改：按鈕背景改為白色 */
        color: #000000; /* 修改：按鈕文字改為黑色 */
        border: none;
        cursor: pointer;
        font-size: 30px;
        line-height: 1;
        text-align: center;
        border-radius: 0 5px 5px 0;
        z-index: 10000;
        transition: right 0.3s ease-out;
    }


    #leftMenu nav ul { list-style: none; margin: 0; padding: 0; }
    #leftMenu nav ul li {
        font-size: 32px; /* 32px */
        margin: 20px 0;
        cursor: pointer;
        user-select: none;
    }
    #leftMenu nav ul li:hover { opacity: 0.9; }
    
    /* 子選單樣式 */
    #leftMenu nav ul li.has-submenu .submenu {
        list-style: none;
        margin: 10px 0 10px 20px; /* 縮排 */
        padding: 0;
        font-size: 24px; /* 子選單字體略小 */
        max-height: 0; /* 預設隱藏 */
        overflow: hidden;
        transition: max-height 0.3s ease-out; /* 展開動畫 */
    }
    /* 使用 :hover 狀態來展開子選單 */
    #leftMenu nav ul li.has-submenu:hover .submenu {
        max-height: 100px; /* 展開狀態，確保足夠高以顯示內容 */
        transition: max-height 0.3s ease-in;
    }


    /* iframe overlay */
    #iframeOverlay {
        position: fixed;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.6);
        z-index: 10000;
    }
    #iframeOverlay.visible { display: flex; }
    #iframeOverlay .iframe-wrap {
        position: relative;
    }
    #contentIframe {
        width: 70vw;       /* 70% 視窗寬 */
        height: 85vh;      /* 85% 視窗高 */
        border: none;
        border-radius: 6px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.6);
        background: #fff;
    }
    #closeIframe {
        position: absolute;
        right: -12px;
        top: -12px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background: #111;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
`;
document.head.appendChild(style);

// 新增：iframe overlay 組件（預設隱藏）
const overlay = document.createElement('div');
overlay.id = 'iframeOverlay';
overlay.innerHTML = `
    <div class="iframe-wrap">
        <button id="closeIframe" aria-label="關閉">×</button>
        <iframe id="contentIframe" src="about:blank" allowfullscreen></iframe>
    </div>
`;
document.body.appendChild(overlay);

// 點擊處理：取得所有按鈕
const menuContainer = document.getElementById('leftMenu'); 
const menuToggle = document.getElementById('menuToggle'); 
const worksBtn = document.getElementById('menu-item-works');
const notesBtn = document.getElementById('menu-item-notes');
const worksNotesBtn = document.getElementById('menu-item-works-notes');
const quizBtn = document.getElementById('menu-item-quiz');
const tkuBtn = document.getElementById('menu-item-tku'); 
const etBtn = document.getElementById('submenu-item-et'); // 子層：教育科技學系
const iframeOverlay = document.getElementById('iframeOverlay');
const contentIframe = document.getElementById('contentIframe');
const closeBtn = document.getElementById('closeIframe');

// 選單隱藏/顯示功能
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        const isCollapsed = menuContainer.classList.toggle('collapsed');
        
        // 改變按鈕文字
        if (isCollapsed) {
            menuToggle.textContent = '☰'; // 隱藏時顯示漢堡圖示 (Menu)
        } else {
            menuToggle.textContent = '×'; // 顯示時顯示關閉圖示 (Close)
        }
    });
}

// 點擊處理：第一單元作品 (維持開啟 iframe)
worksBtn.addEventListener('click', () => {
    contentIframe.src = 'https://myralin951105-cloud.github.io/20251020_1/';
    iframeOverlay.classList.add('visible');
});

// 🌟 核心修改：點擊處理：第一單元講義，改為直接跳轉
notesBtn.addEventListener('click', () => {
    window.location.href = 'https://hackmd.io/@WEqr_bjZTDOWTLFFXd3cXw/rkz6vmColx';
});

// 點擊處理：作品講義 (直接跳轉)
if (worksNotesBtn) {
    worksNotesBtn.addEventListener('click', () => {
        window.location.href = 'https://hackmd.io/@WEqr_bjZTDOWTLFFXd3cXw/rJq2Ax_eZg';
    });
}

// 點擊處理：測驗系統 (直接跳轉)
if (quizBtn) { 
    quizBtn.addEventListener('click', () => {
        window.location.href = 'https://myralin951105-cloud.github.io/2025.11.03/';
    });
}

// 點擊淡江大學主選單時跳轉
if (tkuBtn) {
    tkuBtn.addEventListener('click', (e) => {
        window.location.href = 'https://www.tku.edu.tw/';
    });
}

// 關閉按鈕
closeBtn.addEventListener('click', () => {
    iframeOverlay.classList.remove('visible');
    // 延遲清空 src，避免背景持續載入
    setTimeout(() => { contentIframe.src = 'about:blank'; }, 300);
});

// 可按需要為其他選單加入導向
document.getElementById('menu-item-home').addEventListener('click', () => {
    window.location.href = '/';
});

// 教育科技學系子選單的導航邏輯保持不變 (點擊時跳轉)
if (etBtn) {
    etBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡到父層
        window.location.href = 'https://www.et.tku.edu.tw/';
    });
}