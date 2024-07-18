var fullscreenButtons = document.getElementsByClassName("fullscreen");
console.log(fullscreenButtons);
for(var i=0; i<fullscreenButtons.length; i++){
  console.log(fullscreenButtons[i]);
  console.log(document.getElementsByTagName("iframe"));
  Array.prototype.forEach.call(fullscreenButtons, (button, index) => {
    button.addEventListener("click", ()=> {
      console.log(document.getElementsByTagName("iframe")[index]);
      openFullscreen(document.getElementsByTagName("iframe")[index]);
    });
  });
}


function openFullscreen(elem) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    }
}
