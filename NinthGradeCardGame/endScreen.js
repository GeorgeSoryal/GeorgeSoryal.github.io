var data = window.location.search;

var obj = {endGameText: "", descriptionText: ""};
parseGET(data, obj);

document.getElementById("endGameText").innerHTML = obj.endGameText;
document.getElementById("descriptionText").innerHTML = obj.descriptionText;


function parseGET(str, object){
    str = str.substring(1);
    var pairs = str.split('&');
    pairs = pairs.map(dataPiece => decodeURIComponent(decodeURIComponent(dataPiece)));
    pairs = pairs.map(pair => pair.split("="));
    for(var i = 0; i < pairs.length; i++){
        object[pairs[i][0]] = pairs[i][1];
    }
    return object;
}

function tryAgain(){location.href="index.html"}