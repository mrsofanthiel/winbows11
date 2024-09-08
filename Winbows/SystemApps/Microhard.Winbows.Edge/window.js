var groups = {
    0: ['home', 'gallery'],
    1: ['desktop', 'donwloads', 'documents', 'pictures', 'music', 'videos'],
    2: ['this_pc', 'network'],
}

var pages = ['home', 'gallery', 'desktop', 'donwloads', 'documents', 'pictures', 'music', 'videos', 'this_pc', 'network'];

var tabView = document.createElement('div');
tabView.className = 'tabview';
document.body.appendChild(tabView);
document.body.classList.add('winui');

var tabStrip = document.createElement('div');
var tabStripTabs = document.createElement('div');
var tabStripCreate = document.createElement('div');
var tabStripCreateButton = document.createElement('button');

tabStrip.className = 'explorer-tabstrip';
tabStripTabs.className = 'explorer-tabstrip-tabs';
tabStripCreate.className = 'explorer-tabstrip-create';
tabStripCreateButton.className = 'explorer-tabstrip-create-button';

browserWindow.toolbar.replaceChild(tabStrip, browserWindow.toolbar.querySelector('.window-toolbar-info'));
tabStrip.appendChild(tabStripTabs);
tabStrip.appendChild(tabStripCreate);
tabStripCreate.appendChild(tabStripCreateButton);

tabStripCreateButton.addEventListener('click', async () => {
    createTab();
})

browserWindow.addEventListener('dragstart', (e) => {
    if (e.target == tabStripCreateButton || tabStripTabs.contains(e.target)) {
        e.preventDefault();
    }
})

var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = await fs.getFileURL(utils.resolvePath('./window.css'));
document.head.appendChild(style);

function isLocalFile(page) {
    var disks = fs.disks;
    var is = false;
    disks.forEach(disk => {
        if (page.split(':')[0].toUpperCase() == disk.toUpperCase()) {
            is = true;
        }
    })
    return is;
}

async function getIcon(page) {
    return await fs.getFileURL('C:/Winbows/icons/applications/tools/edge.ico');
}

function getHeader(page) {
    return fetch(page).then(res => {
        return res.text();
    }).then(res => {
        var title = page;
        if (res.match(/<title>.*<\/title>/gi)) {
            title = res.match(/<title>.*<\/title>/gi)[0].replaceAll(/<.?title>/gi, "");
        }
        /*if (res.match(/<link.*rel=('|").*icon.*('|")>/gi)) {
            icon = "https://yt-dler.vercel.app" + res.match(/<link.*rel=('|").*icon.*('|")>/gi)[0].match(/href=('|").*('|")/gi)[0].replace("href=", "").replaceAll(/('|")/gi, "");
        }*/
        return title;
        // browseWindow.changeIcon(icon);
        // console.log(title, icon)
    }).catch(err => {
        console.log(err);
        return page;
    })
}

function getPath(page) {
    switch (page) {
        case 'home':
            return null;
        case 'gallery':
            return null;
        case 'desktop':
            return 'C:/Users/Admin/Desktop';
        case 'donwloads':
            return 'C:/Users/Admin/Downloads';
        case 'documents':
            return 'C:/Users/Admin/Documents';
        case 'pictures':
            return 'C:/Users/Admin/Pictures';
        case 'music':
            return 'C:/Users/Admin/Music';
        case 'videos':
            return 'C:/Users/Admin/Videos';
        case 'this_pc':
            return null;
        case 'network':
            return null;
        default:
            return page;
    }
}

async function getPageStatus(page) {
    if (pages.includes(page)) {
        return 'pages';
    }
    var status = await fs.exists(page);
    console.log(status)
    return status.exists == true ? 'dir' : false;
}

function pageToPath(page) {
    return pages.includes(page) ? getPath(page) : page;
}

/*
var backgroundImage = document.createElement('div');
backgroundImage.style.width = '100%';
backgroundImage.style.height = '100%';
backgroundImage.style.backgroundSize = 'cover';
backgroundImage.style.backgroundRepeat = 'no-repeat';
backgroundImage.style.backgroundPosition = 'center';
backgroundImage.style.position = 'absolute';
backgroundImage.style.zIndex = '-1';
backgroundImage.style.backgroundImage = `url(${await fs.getFileURL(window.getBackgroundImage())})`;
document.documentElement.appendChild(backgroundImage)
*/

var order = [];
var tabs = {};

function randomID() {
    var patterns = '0123456789abcdef';
    var id = '_';
    for (var i = 0; i < 6; i++) {
        id += patterns.charAt(Math.floor(Math.random() * patterns.length));
    }
    if (tabs[id]) {
        return randomID();
    }
    return id;
}

var tab = createTab();

async function createTab(icon, header, active = true) {
    // Initialize tab
    var tab = document.createElement('div');
    var tabInfo = document.createElement('div');
    var tabIcon = document.createElement('div');
    var tabHeader = document.createElement('div');
    var tabClose = document.createElement('div');
    var tabViewItem = document.createElement('div');

    var id = randomID();
    order.push(id);

    tab.className = 'explorer-tabstrip-tab';
    tabInfo.className = 'explorer-tabstrip-tab-info';
    tabIcon.className = 'explorer-tabstrip-tab-icon';
    tabHeader.className = 'explorer-tabstrip-tab-header';
    tabClose.className = 'explorer-tabstrip-tab-close';
    tabViewItem.className = 'tabview-item';

    if (active == true) {
        tabStrip.querySelectorAll('.active').forEach(tab => {
            tab.classList.remove('active');
        })
        tab.classList.add('active');
    }

    var originalPosition = order.indexOf(id);
    var currentPosition = order.indexOf(id);
    var startX = 0;
    var dragging = false;
    var events = {
        "start": ["mousedown", "touchstart", "pointerdown"],
        "move": ["mousemove", "touchmove", "pointermove"],
        "end": ["mouseup", "touchend", "pointerup", "blur"]
    }
    var properties = { changeHeader, changeIcon, close, focus, blur, tab, id };
    tabs[id] = properties;

    function moveNodeToIndex(nodeIndex, targetIndex, container) {
        const children = Array.from(container.children);

        if (nodeIndex < 0 || nodeIndex >= children.length || targetIndex < 0 || targetIndex >= children.length) {
            console.error('索引超出範圍');
            return;
        }

        const nodeToMove = children[nodeIndex];
        if (targetIndex === children.length - 1) {
            container.appendChild(nodeToMove);
        } else if (targetIndex < nodeIndex) {
            container.insertBefore(nodeToMove, children[targetIndex]);
        } else {
            container.insertBefore(nodeToMove, children[targetIndex + 1]);
        }
    }

    function moveArrayItem(arr, fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length) {
            console.error('索引超出範圍');
            return;
        }

        const item = arr.splice(fromIndex, 1)[0];
        arr.splice(toIndex, 0, item);

        console.log(arr, item)

        return arr;
    }

    function dragStart(e) {
        if (tabClose.contains(e.target)) return;
        focus();
        if (e.type.startsWith('touch')) {
            var touch = e.touches[0] || e.changedTouches[0];
            e.pageX = touch.pageX;
        }
        originalPosition = order.indexOf(id);
        currentPosition = order.indexOf(id);
        tab.style.transition = 'none';
        dragging = true;
        startX = e.pageX;
    }

    function dragMove(e) {
        if (!dragging) return;
        if (e.type.startsWith('touch')) {
            var touch = e.touches[0] || e.changedTouches[0];
            e.pageX = touch.pageX;
        }
        var x = e.pageX - startX;
        var unit = tab.offsetWidth + 8;
        var count = Math.round(x / unit);

        tab.style.transform = `translateX(${x}px)`;

        currentPosition = originalPosition + count;
        if (currentPosition > order.length - 1) {
            currentPosition = order.length - 1;
        } else if (currentPosition < 0) {
            currentPosition = 0;
        }
        count = currentPosition - originalPosition;

        if (x > 0) {
            Object.values(tabs).filter(tab => tab.id != id).forEach(tab => {
                tab.tab.style.transition = 'revert-layer';
                var index = order.indexOf(tab.id);
                if (index <= originalPosition + count && index > originalPosition) {
                    tab.tab.style.transform = 'translateX(calc(-100% - 8px))';
                } else {
                    tab.tab.style.transform = '';
                }
            })
        } else if (x < 0) {
            Object.values(tabs).filter(tab => tab.id != id).forEach(tab => {
                tab.tab.style.transition = 'revert-layer';
                var index = order.indexOf(tab.id);
                if (index >= originalPosition + count && index < originalPosition) {
                    tab.tab.style.transform = 'translateX(calc(100% + 8px))';
                } else {
                    tab.tab.style.transform = '';
                }
            })
        }

        /*
        if (x < 0) {
            if (!tabs[order[currentPosition - 1]]) return;
            if (Math.abs(x) > tabs[order[currentPosition - 1]].tab.offsetWidth / 2) {
                tabs[order[currentPosition - 1]].tab.style.transform = 'translateX(100%)';
                currentPosition--;
            } else if () {

            }
        }
        if (x < -tabs[order[currentPosition - 1]].tab.offsetWidth / 2) {
            tabs[order[currentPosition - 1]].tab.style.transform = 'translateX(100%)';
            currentPosition--;
        } else if (x > tabs[order[currentPosition + 1]].tab.offsetWidth / 2) {
            tabs[order[currentPosition + 1]].tab.style.transform = 'translateX(-100%)';
            currentPosition++;
        }
            */
    }

    function dragEnd() {
        if (dragging == false) return;
        dragging = false;
        if (currentPosition != originalPosition) {
            moveNodeToIndex(originalPosition, currentPosition, tabStripTabs);
            moveArrayItem(order, originalPosition, currentPosition);
            originalPosition = currentPosition;
            Object.values(tabs).forEach(tab => {
                tab.tab.style.transition = 'none';
                tab.tab.style.transform = 'translateX(0)';
                setTimeout(() => {
                    tab.tab.style.transition = 'revert-layer';
                }, 200)
            })
        } else {
            tab.style.transition = 'revert-layer';
            tab.style.transform = '';
        }
    }

    events.start.forEach(event => {
        tab.addEventListener(event, dragStart);
    })
    events.move.forEach(event => {
        window.addEventListener(event, dragMove);
    })
    events.end.forEach(event => {
        window.addEventListener(event, dragEnd);
    })

    tabClose.addEventListener('click', () => {
        close();
    })

    tab.appendChild(tabInfo);
    tab.appendChild(tabClose);
    tabInfo.appendChild(tabIcon);
    tabInfo.appendChild(tabHeader);
    tabStripTabs.appendChild(tab);
    tabView.appendChild(tabViewItem);

    function focus() {
        Object.values(tabs).forEach(tab => {
            tab.blur();
        })
        tab.classList.add('active');
        tabViewItem.classList.add('active');
    }
    function blur() {
        tab.classList.remove('active');
        tabViewItem.classList.remove('active');
    }
    function close() {
        tab.remove();
        tabViewItem.remove();
        var index = order.indexOf(id);
        delete tabs[id];
        order.splice(index, 1);
        if (Object.keys(tabs).length == 0) {
            return process.exit();
        } else if (order[index]) {
            return tabs[order[index]].focus();
        } else if (order[index - 1]) {
            return tabs[order[index - 1]].focus();
        } else {
            return tabs[order[0]].focus();
        }
    }
    function changeIcon(icon) {
        tabIcon.style.backgroundImage = `url(${icon})`;
    }
    function changeHeader(header) {
        tabHeader.innerHTML = header;
    }

    // Path
    var pathStrip = document.createElement('div');
    var pathStripActions = document.createElement('div');
    var pathStripActionBack = document.createElement('button');
    var pathStripActionNext = document.createElement('button');
    var pathStripActionRefresh = document.createElement('button');
    var pathStripSearch = document.createElement('input');

    pathStrip.className = 'explorer-pathstrip';
    pathStripActions.className = 'explorer-pathstrip-actions';
    pathStripActionBack.className = 'explorer-pathstrip-action back';
    pathStripActionNext.className = 'explorer-pathstrip-action next';
    pathStripActionRefresh.className = 'explorer-pathstrip-action refresh';
    pathStripSearch.className = 'explorer-pathstrip-search';

    pathStrip.appendChild(pathStripActions);
    pathStrip.appendChild(pathStripSearch);
    pathStripActions.appendChild(pathStripActionBack);
    pathStripActions.appendChild(pathStripActionNext);
    pathStripActions.appendChild(pathStripActionRefresh);

    var content = document.createElement('div');
    var iframe = document.createElement('iframe');

    content.className = 'explorer-content';
    iframe.className = 'explorer-content-iframe';

    tabViewItem.appendChild(pathStrip);
    tabViewItem.appendChild(content);
    content.appendChild(iframe)

    var viewHistory = [];
    var currentHistory = -1;
    var currentPage = 'about:blank';

    function randomID() {
        var patterns = '0123456789abcdef';
        var id = '_0x';
        for (var i = 0; i < 12; i++) {
            id += patterns.charAt(Math.floor(Math.random() * patterns.length));
        }
        return id;
    }

    var currentID = null;

    async function getPage() {
        console.log(currentPage);

        var isLocalFileURL = isLocalFile(currentPage);
        var url = isLocalFileURL ? await fs.getFileURL(currentPage) : currentPage;

        try {
            getHeader(currentPage).then(header => {
                changeHeader(header);
            })
            getIcon(currentPage).then(icon => {
                changeIcon(icon);
            })
        } catch (e) { 
            changeHeader(currentPage);
        }

        // TODO : Add path select and input
        pathStripSearch.value = pageToPath(currentPage);
        update();

        iframe.src = url;

        return;
    }

    function addToHistory(page) {
        if (page != viewHistory[viewHistory.length - 1]) {
            viewHistory.splice(currentHistory + 1);
            viewHistory.push(page);
            currentHistory = viewHistory.length - 1;
        }
    }

    pathStripActionBack.disabled = true;
    pathStripActionNext.disabled = true;

    pathStripActionBack.addEventListener('click', () => {
        if (currentHistory > 0) {
            currentHistory--;
            currentPage = viewHistory[currentHistory];
            getPage();
            pathStripActionNext.disabled = false;
            if (currentHistory == 0) {
                pathStripActionBack.disabled = true;
            }
        } else {
            return;
        }
    })

    pathStripActionNext.addEventListener('click', () => {
        if (currentHistory < viewHistory.length - 1) {
            currentHistory++;
            currentPage = viewHistory[currentHistory];
            getPage();
            pathStripActionBack.disabled = false;
            if (currentHistory == viewHistory.length - 1) {
                pathStripActionNext.disabled = true;
            }
        } else {
            return;
        }
    })

    pathStripActionRefresh.addEventListener('click', () => {
        getPage();
    })

    pathStripSearch.addEventListener('keydown', (e) => {
        if (e.key == 'Enter') {
            currentPage = pathStripSearch.value;
            addToHistory(currentPage);
            getPage();
        }
    })

    function update() {
        try {
            if (currentHistory < viewHistory.length - 1) {
                pathStripActionNext.disabled = false;
            } else {
                pathStripActionNext.disabled = true;
            }
            if (currentHistory > 0) {
                pathStripActionBack.disabled = false;
            } else {
                pathStripActionBack.disabled = true;
            }
        } catch (e) { };
    }

    changeHeader(getHeader(currentPage));
    getIcon(currentPage).then(icon => {
        changeIcon(icon);
    });
    addToHistory(currentPage);
    getPage();
    focus();

    return properties;
}