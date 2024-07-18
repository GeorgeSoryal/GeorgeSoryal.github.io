// Create task: Simple BlackJack (not with leader or card down or up faced), just a simple multiplayer game
// A player will play BlackJack against others where a dealer is not involved
/* Acknowledgements:
Info used to debug issues -
https://dev.to/sanchithasr/7-ways-to-convert-a-string-to-number-in-javascript-4l
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor
Back of a card image -
https://opengameart.org/content/colorful-poker-card-back
Deck of cards images -
Byron Knoll: http://code.google.com/p/vector-playing-cards/
People icons -
https://3dwarehouse.sketchup.com/model/6fc6ce57e672f74aae03309dca32a7d7/2d-man-casual?hl=en
https://3dwarehouse.sketchup.com/model/710a9890e5a23f2d95ef289500154580/2D-man?hl=tr
https://3dwarehouse.sketchup.com/model/51ae36a56115d08dc82809007dc9b963/2D%E4%BA%BA?hl=zh-tw
https://3dwarehouse.sketchup.com/model/583b69cf5d1e4017ab5e7c8c109bb0bb/2d-person?hl=en
https://3dwarehouse.sketchup.com/model/32c185fef3ea916afb2bf77c5cf4d3da/2D-Person-Brian
https://3dwarehouse.sketchup.com/model/30ddd6e44b5e95b1e873675aadbcda24/Santa
https://www.formfonts.com/2D-Model/1/11143/1/h10-people/vectorfigures-colour/
*/

function randomNumber(rangeStart, rangeFinish){
    return Math.floor(Math.random()*(rangeFinish-rangeStart)) + rangeStart;
}

function setEndScreen(endGameText, descriptionText=null){
    var redirect = document.createElement("form");
    redirect.method = "GET";
    redirect.action = "endScreen.html";
    var endGameData = document.createElement("input", {type:"hidden"});
    endGameData.name = "endGameText";
    endGameData.value = encodeURIComponent(endGameText); 
    var descriptionData = document.createElement("input", {type:"hidden"});
    descriptionData.name = "descriptionText";
    descriptionData.value = encodeURIComponent(descriptionText);
    if(descriptionText !== null) redirect.appendChild(descriptionData);
    redirect.appendChild(endGameData);
    document.body.appendChild(redirect);
    redirect.submit();
}

class Player{
    cards;
    cardImages;
    hasLost;
    playerNum;
    constructor(playerNum){
        this.cards = [];
        this.cardImages = [];
        this.hasLost = false;
        this.playerNum = playerNum;
    }

    // Given a list that is storing the cards that a player holds, it will set the list to two random
    // cards from
    // a deck of cards
    // playerList {list} - the list to contain the random cards from the deck
    // isFirstRound {boolean} - if this the first round of dealing cards, or if this is a hit or the
    // starting two cards
    // being dealt
    dealCards(deckOfCards, deckOfCardsImages, isFirstRound){
        // Since the first element is removed that means that the list shifts and the 2 code statements
        // can be put into a for
        // loop
        // booleans are cast into numbers when the add operator is used on it

        // if isFirstRound is false, 0 + 1 = 1 and it will be run
        // once
        // else if true, 1 + 1 = 2 and it will be run twice
        for(var i = 0; !isFirstRound + i < 2; i++){
            this.cards.push(deckOfCards[0]);
            this.cardImages.push(deckOfCardsImages[0]);
            deckOfCards.splice(0, 1);
            deckOfCardsImages.splice(0, 1);
        }
    }
    
    // Will update the cards on the screen to match the player list in the code
    // playerList {list} - the list for the cards on screen to match
    // player {Number} - the player'
    // playerCardsShown {list} - the cards that are shown on the screen, gotten with getProperty
    // backOfCardShown {boolean} - true if the back is shown (for non player characters), otherwise
    // false if front is shown (for playable character)
    // overwrite {boolean} - whether to overwrite already shown cards
    updateCardsOnScreen(backOfCardShown){
        var tempImage = ""; // to be used for card displayed
        if(this.cards.length < 1){
            console.log("ERROR");
            return;
        }
        // that's the image shown and the value of tempImage
        // ternary operator to change value based on boolean, here it makes it so that if the back is to be shown,
        // tempImage will refer to an image of a back of a card
        tempImage = backOfCardShown ? "card_images/card-back-black.png" : "card_images/" + this.cardImages[0];
        document.getElementById("player"+this.playerNum+"CardA").src= tempImage;
        tempImage = backOfCardShown ? "card_images/card-back-black.png" : "card_images/" + this.cardImages[1];
        document.getElementById("player"+this.playerNum+"CardB").src= tempImage;
        if(this.cards.length > 2){
            for(var i = 2; i < this.cards.length; i++){
                // ternary operator like mentioned in above comment ^^^
                tempImage = backOfCardShown ? "card_images/card-back-black.png" : "card_images/" + this.cardImages[i];
                document.getElementById("player"+this.playerNum+"Card"+(i-1)).src = tempImage;
            }
        }
    }

    // Will return the score of a player given the cards they hold
    // playerList {list} - the list containing the cards that any player holds
    // return score {number} - the score of the player based on the playerList provided
    calculateScore(){
        var score = 0;
        for(var i = 0; i < this.cards.length; i++){
            // Jack, Queen, King all have unique first letters in a deck of cards meaning that
            // only need the first letter is needed to differnetiate to them
            if(this.cards[i].substring(0, 1) == 'J'|| this.cards[i].substring(0, 1) == 'K'||
            this.cards[i].substring(0, 1) == 'Q'|| this.cards[i].substring(0, 2) == 10){
                score += 10;
            } else if(this.cards[i].substring(0, 1) == 'A'){
                // In the rules of blackjack, an Ace can be counted as an 11 if it allows the player to reach 21
                // score once
                // the card is dealt
                (score + 11) == 21 ? score += 11: score += 1;
            } else{
                // Number() needed since otherwise, the number would be concatenated instead of added
                // numerically
                score += Number(this.cards[i].substring(0, 1));
            }
        }
        return score;
    }
    
    // Checks if the player won (for players 1 - 3) and updates to end screen if they won
    // playerList {list} - list to be checked for Loss with
    // player {number} - player number
    // return true if lost, false if still not lost
    checkLoss(){
        if(this.calculateScore() == 21){
            var firstCards = this.cards.splice(0, (this.cards.length - 1));
            const endGameText = "End of match, Player " + this.playerNum + " won with the " + firstCards.join(", the ") + ", and the " + this.cards + ".";
            if(turnNumber == 0){
                setEndScreen(endGameText, "Natural! (Player " + this.playerNum + " won first round!)");
                return;
            }
            setEndScreen(endGameText);
            return;
        } else if(this.calculateScore() > 21){
            document.getElementById("infoText").innerHTML = "Player " + this.playerNum +" busted!";
            this.updateCardsOnScreen(false);
            this.hasLost = true;
            return;
        }
        this.hasLost = false;
        return;
    }
    
    start(deckOfCards, deckOfCardsImages, backOfCardShown){
        this.dealCards(deckOfCards, deckOfCardsImages, true);
        this.updateCardsOnScreen(backOfCardShown);
        this.checkLoss();
    }
}

var turnNumber = 0;
// A 2-d list is used so that when the cards are shuffled, the images aren't out of order
var deckOfCards = [
"Ace of Hearts", "Ace of Clubs", "Ace of Spades", "Ace of Diamonds",
"2 of Hearts", "2 of Clubs", "2 of Spades", "2 of Diamonds",
"3 of Hearts", "3 of Clubs", "3 of Spades", "3 of Diamonds",
"4 of Hearts", "4 of Clubs", "4 of Spades", "4 of Diamonds",
"5 of Hearts", "5 of Clubs", "5 of Spades", "5 of Diamonds",
"6 of Hearts", "6 of Clubs", "6 of Spades", "6 of Diamonds",
"7 of Hearts", "7 of Clubs", "7 of Spades", "7 of Diamonds",
"8 of Hearts", "8 of Clubs", "8 of Spades", "8 of Diamonds",
"9 of Hearts", "9 of Clubs", "9 of Spades", "9 of Diamonds",
"10 of Hearts", "10 of Clubs", "10 of Spades", "10 of Diamonds",
"Jack of Hearts", "Jack of Clubs", "Jack of Spades", "Jack of Diamonds", 
"Queen of Hearts", "Queen of Clubs", "Queen of Spades", "Queen of Diamonds", 
"King of Hearts", "King of Clubs", "King of Spades", "King of Diamonds"
];

deckOfCardsImages = [
"ace_of_hearts.png", "ace_of_clubs.png", "ace_of_spades.png", "ace_of_diamonds.png",
"2_of_hearts.png", "2_of_clubs.png", "2_of_spades.png", "2_of_diamonds.png",
"3_of_hearts.png", "3_of_clubs.png", "3_of_spades.png", "3_of_diamonds.png", 
"4_of_hearts.png", "4_of_clubs.png", "4_of_spades.png", "4_of_diamonds.png", 
"5_of_hearts.png", "5_of_clubs.png", "5_of_spades.png", "5_of_diamonds.png", 
"6_of_hearts.png", "6_of_clubs.png", "6_of_spades.png", "6_of_diamonds.png",
"7_of_hearts.png", "7_of_clubs.png", "7_of_spades.png", "7_of_diamonds.png", 
"8_of_hearts.png", "8_of_clubs.png", "8_of_spades.png", "8_of_diamonds.png", 
"9_of_hearts.png", "9_of_clubs.png", "9_of_spades.png", "9_of_diamonds.png", 
"10_of_hearts.png", "10_of_clubs.png", "10_of_spades.png", "10_of_diamonds.png", 
"jack_of_hearts2.png", "jack_of_clubs2.png", "jack_of_spades2.png", "jack_of_diamonds2.png", 
"queen_of_hearts2.png", "queen_of_clubs2.png", "queen_of_spades2.png", "queen_of_diamonds2.png", 
"king_of_hearts2.png", "king_of_clubs2.png", "king_of_spades2.png", "king_of_diamonds2.png"
]

var playerPNGs = ["randomPersonImage1.png", "randomPersonImage2.png",
"randomPersonImage3.png", "randomPersonImage4.png", "randomPersonImage5.png",
"randomPersonImage6.png", "randomPersonImage7.png"];

var randomPlayerIndex = randomNumber(0, playerPNGs.length);
document.getElementById("player1Image").src = "player_images/" + playerPNGs[randomPlayerIndex];
playerPNGs.splice(randomPlayerIndex, 1);
randomPlayerIndex = randomNumber(0, playerPNGs.length);
document.getElementById("player2Image").src = "player_images/" + playerPNGs[randomPlayerIndex];
playerPNGs.splice(randomPlayerIndex, 1);
randomPlayerIndex = randomNumber(0, playerPNGs.length);
document.getElementById("player3Image").src = "player_images/" + playerPNGs[randomPlayerIndex];
playerPNGs.splice(randomPlayerIndex, 1);

// The player will always be player 4, players 1 - 3 will always be bots
var player1 = new Player(1);
var player2 = new Player(2);
var player3 = new Player(3);
var player4 = new Player(4);

// twice Just to make sure that it's completely fair
shuffleCards(deckOfCards, deckOfCardsImages);
shuffleCards(deckOfCards, deckOfCardsImages);

// Beginning of driver code: Dealing with only two direct inputs as well as indirect hovering inputs
player1.start(deckOfCards, deckOfCardsImages, true)
player2.start(deckOfCards, deckOfCardsImages, true)
player3.start(deckOfCards, deckOfCardsImages, true)
player4.start(deckOfCards, deckOfCardsImages, false)

document.getElementById("hitButton").addEventListener("click", () => {
    updateScreen(true);
    document.getElementById("player4Response").innerHTML = "Hit!";
});

document.getElementById("standButton").addEventListener("click", () => {
    updateScreen(false);
    document.getElementById("player4Response").innerHTML = "Stand!";
});

// Limitation: every image must be explicitly created and dealt with in code.org
// A player can have maximum 11 cards
// The idea of hitboxes comes from games where they use basic rectangle shapes instead of the
// dimensions of sprites

// Hitboxes are more flexible since they're invinsible and can be manipulated easier
// onEvent("player4Hitbox1", "mouseover", function(){
// if(getProperty("player4Card1", "y") == 300)document.getElementById(("player4Card1", "y", 275);
// });
// onEvent("player4Hitbox1", "mouseout", function(){
// if(getProperty("player4Card1", "y") <= 275) document.getElementById(("player4Card1", "y", 300);
// });
// onEvent("player4Hitbox3", "mouseover", function(){
// if(getProperty("player4Card3", "y") == 300)document.getElementById(("player4Card3", "y", 275);
// });
// onEvent("player4Hitbox3", "mouseout", function(){
// if(getProperty("player4Card3", "y") <= 275) document.getElementById(("player4Card3", "y", 300);
// });
// onEvent("player4Hitbox2", "mouseover", function(){
// if(getProperty("player4Card2", "y") == 300)document.getElementById(("player4Card2", "y", 275);
// });
// onEvent("player4Hitbox2", "mouseout", function(){
// if(getProperty("player4Card2", "y") <= 275) document.getElementById(("player4Card2", "y", 300);
// });
// onEvent("player4Hitbox4", "mouseover", function(){
// if(getProperty("player4Card4", "y") == 300)document.getElementById(("player4Card4", "y", 275);
// });
// onEvent("player4Hitbox4", "mouseout", function(){
// if(getProperty("player4Card4", "y") <= 275) document.getElementById(("player4Card4", "y", 300);
// });
// onEvent("player4HitboxA", "mouseover", function(){
// if(getProperty("player4CardA", "y") == 300)document.getElementById(("player4CardA", "y", 275);
// });
// onEvent("player4HitboxA", "mouseout", function(){
// if(getProperty("player4CardA", "y") <= 275) document.getElementById(("player4CardA", "y", 300);
// });
// onEvent("player4HitboxB", "mouseover", function(){
// if(getProperty("player4CardB", "y") == 300)document.getElementById(("player4CardB", "y", 275);
// });
// onEvent("player4HitboxB", "mouseout", function(){
// if(getProperty("player4CardB", "y") <= 275) document.getElementById(("player4CardB", "y", 300);
// });
// onEvent("player4Hitbox5", "mouseover", function(){
// if(getProperty("player4Card5", "y") == 300)document.getElementById(("player4Card5", "y", 275);
// });
// onEvent("player4Hitbox5", "mouseout", function(){
// if(getProperty("player4Card5", "y") <= 275) document.getElementById(("player4Card5", "y", 300);
// });
// onEvent("player4Hitbox6", "mouseover", function(){
// if(getProperty("player4Card6", "y") == 300)document.getElementById(("player4Card6", "y", 275);
// });
// onEvent("player4Hitbox6", "mouseout", function(){
// if(getProperty("player4Card6", "y") <= 275) document.getElementById(("player4Card6", "y", 300);
// });
// onEvent("player4Hitbox7", "mouseover", function(){
// if(getProperty("player4Card7", "y") == 300)document.getElementById(("player4Card7", "y", 275);
// });
// onEvent("player4Hitbox7", "mouseout", function(){
// if(getProperty("player4Card7", "y") <= 275) document.getElementById(("player4Card7", "y", 300);
// });
// onEvent("player4Hitbox8", "mouseover", function(){
// if(getProperty("player4Card8", "y") == 300)document.getElementById(("player4Card8", "y", 275);
// });
// onEvent("player4Hitbox8", "mouseout", function(){
// if(getProperty("player4Card8", "y") <= 275) document.getElementById(("player4Card8", "y", 300);
// });
// onEvent("player4Hitbox9", "mouseover", function(){
// if(getProperty("player4Card9", "y") == 300)document.getElementById(("player4Card9", "y", 275);
// });
// onEvent("player4Hitbox9", "mouseout", function(){
// if(getProperty("player4Card9", "y") <= 275) document.getElementById(("player4Card9", "y", 300);
// });

// Given a list of a deck of cards, the function will shuffle the deck
// deck {list} - list of a deck of cards, they can be any data type
// return {list} - a shuffled list
function shuffleCards(deck, imageDeck){
    var randomIndex = randomNumber(0, deck.length);
    var oldCard = "";
    for(var i = 0; i < deck.length; i++){
        randomIndex = randomNumber(0, deck.length);
        // To make sure that a card doesn't get removed when the index and randomIndex is equal
        while(randomIndex == i){
            randomIndex = randomNumber(0, deck.length);
        }
        oldCard = deck[i];
        oldCardImage = imageDeck[i];
        deck.splice(i, 1);
        deck.splice(randomIndex, 0, oldCard);
        imageDeck.splice(i, 1);
        imageDeck.splice(randomIndex, 0, oldCardImage);
    }
    return deck;
}


// isHit {boolean} - if the player chose hit or stand, used for ordering of card dealing
function updateScreen(isHit){
    turnNumber++;
    document.getElementById("turnText").innerHTML = "Turn Number: " + turnNumber;
    // Player 1 is more risky, Player 2 is more balanced, and Player 3 is more safe
    player1.checkLoss();
    if((randomNumber(0, 10) <= 7 || (player2.hasLost && player3.hasLost && player4.hasLost)) && !player1.hasLost){
        document.getElementById("player1Response").innerHTML = "Hit!";
        player1.dealCards(deckOfCards, deckOfCardsImages, false);
        player1.checkLoss();
    } else if(!player1.hasLost) document.getElementById("player1Response").innerHTML = "Stand!";
    if(player1.hasLost) document.getElementById("player1Response").innerHTML = "Busted.";
    
    if(player1.hasLost) player1.updateCardsOnScreen(false);
    else player1.updateCardsOnScreen(true);
    
    player2.checkLoss();
    if((randomNumber(0, 10) <= 5 || (player1.hasLost && player3.hasLost && player4.hasLost)) && !player2.hasLost){
        document.getElementById("player2Response").innerHTML = "Hit!";
        player2.dealCards(deckOfCards, deckOfCardsImages, false);
        player2.checkLoss();
    } else if(!player2.hasLost) document.getElementById("player2Response").innerHTML = "Stand!";
    if(player2.hasLost) document.getElementById("player2Response").innerHTML = "Busted.";

    if(player2.hasLost) player2.updateCardsOnScreen(false);
    else player2.updateCardsOnScreen(true);

    player3.checkLoss();
    if((randomNumber(0, 10) <= 4 || (player2.hasLost && player4.hasLost && player1.hasLost)) && !player3.hasLost){
        document.getElementById("player3Response").innerHTML = "Hit!";
        player3.dealCards(deckOfCards, deckOfCardsImages, false);
        player3.checkLoss();
    } else if(!player3.hasLost) document.getElementById("player3Response").innerHTML = "Stand!";
    if(player3.hasLost) document.getElementById("player3Response").innerHTML = "Busted.";

    if(player3.hasLost) player3.updateCardsOnScreen(false);
    else player3.updateCardsOnScreen(true);

    player4.checkLoss();
    if((isHit || (player3.hasLost && player1.hasLost && player2.hasLost)) && !player4.hasLost){
        player4.dealCards(deckOfCards, deckOfCardsImages, false);
        player4.checkLoss();
    }
    // Will always be face-up unlike other players
    player4.updateCardsOnScreen(false);
    if(player1.hasLost && player2.hasLost && player3.hasLost && player4.hasLost){
        setEndScreen("Everybody busted on turn "+ turnNumber + ".");
        return;
    }
}

function loadCardZIndex(){
    var cardsContainers = document.querySelectorAll(".cardsContainer");
    for(var i = 0; i < cardsContainers.length; i++){
        var hitboxes = cardsContainers[i].children;
        for(var j = 0; j < hitboxes.length; j++){
            var childDiv = hitboxes[j];
            if(childDiv.nodeName = 'DIV') childDiv.style.zIndex = ""+j+"";
        }
    }
}