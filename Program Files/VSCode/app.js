; (async () => {
    await System.requestAccessWindow('./window.js', {
        title: 'VSCode',
        datas: {
            file: 'C:/'
        }
    });
})();
