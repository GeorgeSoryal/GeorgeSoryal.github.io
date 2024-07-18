/* Place your JavaScript in this file */
"use strict";

var clicked = 0;
var submitClicked = 0;
var label1Clicked = 0;
var label2Clicked = 0;
var trialsPassed = [false, false, false];

document.getElementById("prompt").addEventListener("mouseover", () =>{
    document.getElementById("prompt").setAttribute("placeholder", "In :)");
});

document.getElementById("prompt").addEventListener("mouseout", () =>{
    document.getElementById("prompt").setAttribute("placeholder", "Out!");
});

function submitClick(){
    submitClicked++;
    console.log("submitClicked " + submitClicked);
    isPASS2();
}


function updateRadioScreen(){
    clicked++;
    console.log(clicked);
    console.log(document.getElementById("TorF").getAttribute("checked"));
    document.getElementById("TorF").checked = !(clicked % 2 == 0);
    isPASS1();
}

function isPASS1(){
    if(document.getElementById("prompt").value == "FIRST" &&
    clicked == 3 && !trialsPassed[0]){
        trialsPassed[0] = true;
        console.log("PASS1");

        var submit = document.createElement("input");

        submit.id = "submitButton";
        submit.type = "button";
        submit.value = "Submit";
        submit.className = "Style";
        submit.setAttribute("onclick", "submitClick()");
        submit.style.width = `${document.getElementsByTagName(
            "label")[0].offsetWidth + document.getElementById("prompt").offsetWidth}px`;

        document.getElementById("formy").appendChild(submit);
    }
}

function onLoadedPage(){
    document.getElementById("TorF").checked = false;

    var img = document.createElement("img");
    var target = document.querySelectorAll("label")[1];
    target.insertAdjacentElement("beforebegin", img);
    img.src = "./single_easter_egg_800_wht.jpg";
    img.hidden = true;
}

function isPASS2(){
    if(trialsPassed[0] && submitClicked == 3 && clicked == 21 && document.getElementById("prompt").value == "Next"){
        trialsPassed[1] = true;
        console.log("PASS2");

        var discountDiv = document.createElement("div");
        discountDiv.id = "discountDiv";
        document.getElementById("Adjacent").appendChild(discountDiv);

        var unorderedList = document.createElement("ul");
        discountDiv.appendChild(unorderedList);

        var discountLabel = document.createElement("label");
        unorderedList.appendChild(discountLabel);
        discountLabel.innerHTML = "Enter Discount Here:";
        discountLabel.style.fontWeight = "Strong";

        var brElement = document.createElement("br");
        unorderedList.appendChild(brElement);

        var discountInput = document.createElement("input");
        discountInput.type = "field";
        discountInput.id = "discount";
        discountInput.placeholder = "last secret.";
        discountInput.className = "New";

        unorderedList.appendChild(discountInput);
        document.getElementsByTagName("label")[0].className = "Labels";
        document.getElementsByTagName("label")[1].className = "Labels";
    }
};