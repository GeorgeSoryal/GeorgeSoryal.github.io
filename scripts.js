var fullscreenButton = document.getElementsByClassName("fullscreen")[0];

fullscreenButton.addEventListener("click", ()=>{
    openFullscreen(document.getElementsByTagName("iframe")[0]);
});

function openFullscreen(elem) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    }
}
