document.querySelectorAll('.load-iframe').forEach((btn, idx) => {
    btn.addEventListener('click', function() {
        const iframe = document.querySelectorAll('iframe')[idx];
        const fullscreenBtn = document.querySelectorAll('.fullscreen')[idx];
        const hideBtn = document.querySelectorAll('.hide-iframe')[idx];
        iframe.src = iframe.getAttribute('data-src');
        iframe.style.display = '';
        fullscreenBtn.style.display = '';
        hideBtn.style.display = '';
        btn.style.display = 'none';
    });
});

document.querySelectorAll('.hide-iframe').forEach((btn, idx) => {
    btn.addEventListener('click', function() {
        const iframe = document.querySelectorAll('iframe')[idx];
        const loadBtn = document.querySelectorAll('.load-iframe')[idx];
        const fullscreenBtn = document.querySelectorAll('.fullscreen')[idx];
        iframe.src = '';
        iframe.style.display = 'none';
        fullscreenBtn.style.display = 'none';
        btn.style.display = 'none';
        loadBtn.style.display = '';
    });
});

document.querySelectorAll('.open-new-tab').forEach((btn, idx) => {
    btn.addEventListener('click', function() {
        const iframe = document.querySelectorAll('iframe')[idx];
        window.open(iframe.getAttribute('data-src'), '_blank');
    });
});

document.querySelectorAll('.fullscreen').forEach((button, index) => {
    button.addEventListener("click", ()=> {
        openFullscreen(document.querySelectorAll("iframe")[index]);
    });
});

function openFullscreen(elem) {
    if (elem.requestFullscreen) {
        try {elem.requestFullscreen();} catch(e) {console.log(e);}
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        try {elem.webkitRequestFullscreen();} catch(e) {console.log(e);}
    }
}
