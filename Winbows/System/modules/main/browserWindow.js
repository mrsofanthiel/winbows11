Object.defineProperty(window.workerModules, 'browserWindow', {
    value: async (path = {}, config = {}) => {
        console.log(path)

        const ICON = await window.Taskbar.createIcon({
            name: path.caller,
            icon: await fs.getFileURL(window.appRegistry.getIcon(path.callee)),
            openable: true,
            category: 'app',
            status: {
                active: true,
                opened: true
            }
        })

        var resizerConfig = {
            'browser-window-resizer-top': 'vertical',
            'browser-window-resizer-bottom': 'vertical',
            'browser-window-resizer-left': 'horizontal',
            'browser-window-resizer-right': 'horizontal',
            'browser-window-resizer-right-top': 'both',
            'browser-window-resizer-right-bottom': 'both',
            'browser-window-resizer-left-bottom': 'both',
            'browser-window-resizer-left-top': 'both'
        }

        var hostElement = document.createElement('div');
        var resizers = document.createElement('div');
        var content = document.createElement('div');
        var shadowRoot = content.attachShadow({ mode: 'open' });
        var windowElement = document.createElement('div');
        var toolbarElement = document.createElement('div');
        var contentElement = document.createElement('div');

        hostElement.className = 'browser-window-container active';

        // Resizers
        resizers.className = 'browser-window-resizers';
        // In shadow root
        windowElement.className = 'window';
        toolbarElement.className = 'window-toolbar';
        contentElement.className = 'window-content';

        window.Winbows.AppWrapper.appendChild(hostElement);
        hostElement.appendChild(resizers);
        hostElement.appendChild(content);
        shadowRoot.appendChild(windowElement);
        windowElement.appendChild(toolbarElement);
        windowElement.appendChild(contentElement);

        Object.keys(resizerConfig).forEach(key => {
            var allowed = resizerConfig[key];
            var pointerDown = false;
            var pointerPosition = [];
            var resizer = document.createElement('div');
            var originalPosition = {};
            var originalSize = {};
            resizer.className = key;
            resizer.addEventListener('pointerdown', (e) => {
                var position = utils.getPosition(hostElement);
                pointerPosition = [e.pageX, e.pageY];
                originalPosition = {
                    x: position.x,
                    y: position.y
                }
                originalSize = {
                    width: hostElement.offsetWidth,
                    height: hostElement.offsetHeight
                }
                hostElement.classList.add('moving');
                pointerDown = true;
            })
            window.addEventListener('pointermove', (e) => {
                if (pointerDown == true) {
                    var diffX = e.pageX - pointerPosition[0];
                    var diffY = e.pageY - pointerPosition[1];
                    var width = originalSize.width;
                    var height = originalSize.height;
                    if (allowed == 'vertical') {
                        diffX = 0;
                    } else if (allowed == 'horizontal') {
                        diffY = 0;
                    }
                    // For vertical resize
                    if (key.search('top') > -1) {
                        // Fixate bottom
                        hostElement.style.top = originalPosition.y + diffY + 'px';
                        windowElement.style.height = height - diffY + 'px';
                    } else if (key.search('bottom') > -1) {
                        // Fixate top
                        windowElement.style.height = height + diffY + 'px';
                    }

                    // For horizontal resize
                    if (key.search('left') > -1) {
                        // Fixate right
                        hostElement.style.left = originalPosition.x + diffX + 'px';
                        windowElement.style.width = width - diffX + 'px';
                    } else {
                        // Fixate left
                        windowElement.style.width = width + diffX + 'px';
                    }
                }
            })
            window.addEventListener('pointerup', (e) => {
                pointerDown = false;
                hostElement.classList.remove('moving');
            })
            window.addEventListener('blur', (e) => {
                pointerDown = false;
                hostElement.classList.remove('moving');
            })
            resizers.appendChild(resizer);
        })

        // Default toolbar
        var toolbarInfo = document.createElement('div');
        var toolbarIcon = document.createElement('img');
        var toolbarTitle = document.createElement('div');
        var toolbarButtons = document.createElement('div');

        toolbarInfo.className = 'window-toolbar-info';
        toolbarIcon.className = 'window-toolbar-icon';
        toolbarTitle.className = 'window-toolbar-title';
        toolbarButtons.className = 'window-toolbar-buttons';

        var icon = config.icon || window.appRegistry.getIcon(path.callee);
        var title = config.title || 'App';

        toolbarTitle.innerHTML = window.replaceHTMLTags(title);

        await (async () => {
            var url = URL.createObjectURL(await window.fs.downloadFile('C:/Winbows/System/styles/app.css'));
            var style = document.createElement('link');
            style.rel = 'stylesheet';
            style.type = 'text/css';
            style.href = url;
            shadowRoot.appendChild(style);
            return;
        })();

        (async () => {
            var url = await window.fs.getFileURL(icon);
            await loadImage(url);
            toolbarIcon.src = url;
        })();

        var minimizeButton = document.createElement('div');
        var maximizeButton = document.createElement('div');
        var closeButton = document.createElement('div');

        minimizeButton.className = 'window-toolbar-button';
        maximizeButton.className = 'window-toolbar-button';
        closeButton.className = 'window-toolbar-button close';

        closeButton.addEventListener('click', close)

        var icons = ['C:/Winbows/icons/controls/minimize.png', 'C:/Winbows/icons/controls/maxmin.png', 'C:/Winbows/icons/controls/maximize.png', 'C:/Winbows/icons/controls/close.png'];

        // var iconStyle = document.createElement('style');
        // iconStyle.innerHTML = `.window{--close-icon:url(${await window.fs.getFileURL(icons[0])});--maximize-icon:url(${await window.fs.getFileURL(icons[1])});--minimize-icon:url(${await window.fs.getFileURL(icons[2])});--maxmin-icon:url(${await window.fs.getFileURL(icons[3])});}`;
        // shadowRoot.appendChild(iconStyle);

        var minimizeImage = document.createElement('img');
        minimizeImage.className = 'window-toolbar-button-icon';
        minimizeImage.src = await window.fs.getFileURL(icons[0]);
        minimizeButton.appendChild(minimizeImage);

        var maximizeImage = document.createElement('img');
        maximizeImage.className = 'window-toolbar-button-icon';
        maximizeImage.src = await window.fs.getFileURL(icons[1]);
        maximizeButton.appendChild(maximizeImage);

        var closeImage = document.createElement('img');
        closeImage.className = 'window-toolbar-button-icon';
        closeImage.src = await window.fs.getFileURL(icons[3]);
        closeButton.appendChild(closeImage)

        toolbarButtons.appendChild(minimizeButton);
        toolbarButtons.appendChild(maximizeButton);
        toolbarButtons.appendChild(closeButton);

        toolbarInfo.appendChild(toolbarIcon);
        toolbarInfo.appendChild(toolbarTitle);

        toolbarElement.appendChild(toolbarInfo);
        toolbarElement.appendChild(toolbarButtons);

        ICON.open();
        const windowID = ICON.register({
            browserWindow: hostElement
        })

        function close() {
            ICON.close(windowID);
        }

        var pointerDown = false;
        var pointerPosition = [];
        var originalPosition = {};

        toolbarElement.addEventListener('pointerdown', (e) => {
            pointerDown = true;
            var position = utils.getPosition(hostElement);
            pointerPosition = [e.pageX, e.pageY];
            originalPosition = {
                x: position.x,
                y: position.y
            }
        })

        window.addEventListener('pointermove', (e) => {
            if (pointerDown) {
                hostElement.style.left = originalPosition.x + e.pageX - pointerPosition[0] + 'px';
                hostElement.style.top = originalPosition.y + e.pageY - pointerPosition[1] + 'px';
            }
        })

        window.addEventListener('pointerup', (e) => {
            pointerDown = false;
        })

        window.addEventListener('blur', (e) => {
            pointerDown = false;
        })

        return { shadowRoot, container: hostElement, window: windowElement, toolbar: toolbarElement, content: contentElement, close };
    },
    writable: false,
    configurable: false
})