const gameScreen = document.getElementById("game-screen")
const popupScreen = document.getElementById("popup-screen")
const sidemenuScreen = document.getElementById("sidemenu")
const browseMapButton = document.getElementById("browse-btn")
const rollDiceButton = document.getElementById("rolldice-btn")
const dice = document.getElementById("dice")

let pirateMoving = false
let alreadyRolled = false
let prevWidth = window.innerWidth;
let prevHeight = window.innerHeight;

let intervalID
let screenOrientation = window.matchMedia("(orientation: portrait)")
let currentIsland = 1
const screenMultiplyer = 2
const islands = {}
const diceImgs = {}
const diceRollImgs = {}
let currentImage = 1
let currentRoll = 1
let finalNumber
let mapPositon = {X: 0,Y: 0}
let initialPostion = {
    1: {
        X: 0, Y: 0
    },
    2: {
        X: 0 , Y:0
    },
    3: {
        X: 0 , Y: 0
    },
    4: {
        X: 0 , Y: 0
    },
    5: {
        X: 0, Y: 0
    },
    6: {
        X: 0, Y: 0
    }
}
let precentPosition = {
    1: {
        X: 0.05, Y: 0.15
    },
    2: {
        X: 0.4 , Y:0.10
    },
    3: {
        X: 0.7 , Y: 0.10
    },
    4: {
        X: 0.4 , Y: 0.4
    },
    5: {
        X: 0.05, Y: 0.7
    },
    6: {
        X: 0.7, Y: 0.6
    }
}


const character = document.getElementById('character')
let characterWidth
let characterHieght 
let enableBrowseMap = false

let screenWidth = window.innerWidth
let screenHeight = window.innerHeight

var startX, startY;
var distanceX = 0;
var distanceY = 0;


function onLoad(){
    for(i = 1 ; i <= 6; ++i){
        let id = ("island" + ("0" + i))
        islands[i] = document.getElementById(id)
    }
    for(i = 1; i <= 6; ++i){
        let id = ("../assets/dice/dice" + ("0" + i) + ".png")
        diceImgs[i] = id
    }
    for(i = 1; i <=3; ++i){
        let id = ("../assets/dice/diceroll" + ("0" + i) + ".png")
        diceRollImgs[i] = id
    }
    detectScreen()
    handleResize()
    movePirate(currentIsland)
}

function detectScreen(){
    if(screenOrientation.matches){
        gameScreen.style.display = 'none'
        popupScreen.style.display = 'block'
    } else {
        popupScreen.style.display = 'none'
        gameScreen.style.display = 'block'
    }
}


function movePirate(key){
    let islandRect = islands[key].getBoundingClientRect(); 
    let characterRect = character.getBoundingClientRect();
    
    let positionX = islandRect.left + (islandRect.width / 2)
    let positionY = islandRect.top + (islandRect.height / 2)

    character.style.left = positionX + 'px'
    character.style.top = positionY - characterRect.height + 'px'

    console.log(key)

}

function moveMap(){
    if(!pirateMoving){
        let mapRect = gameScreen.getBoundingClientRect();
        let newWidth =  Math.min(Math.max(gameScreen.offsetLeft + distanceX, -screenWidth ), 0)
        let newHeight = Math.min(Math.max(gameScreen.offsetTop + distanceY, -screenHeight ), 0)
        gameScreen.style.left = newWidth + 'px'
        gameScreen.style.top = newHeight + 'px'
        
        distanceX = (screenWidth / prevWidth) * distanceX
        distanceY = (screenHeight / prevHeight) * distanceY

        Object.keys(islands).forEach(key =>{
            let width = Math.min(Math.max(islands[key].offsetLeft + distanceX, -screenWidth  + initialPostion[key].X), initialPostion[key].X)
            let height = Math.min(Math.max(islands[key].offsetTop + distanceY, -screenHeight + initialPostion[key].Y), initialPostion[key].Y)
            islands[key].style.left = width + 'px'
            islands[key].style.top = height + 'px'
        })
        
        mapPositon.X = newWidth
        mapPositon.Y = newHeight
        movePirate(currentIsland)
    }
}


function browseMap(){
    if(enableBrowseMap){
        enableBrowseMap = false 
        document.body.style.cursor = 'default'
    } else {
        enableBrowseMap = true
        document.body.style.cursor = 'grab'
    }
}

function rollDice(){
    if(!alreadyRolled){
        currentImage = 1
        currentRoll = 1
        intervalID = setInterval(() => {
            dice.src = diceRollImgs[currentRoll]
            console.log(currentRoll);
            currentRoll != 0 ?
            currentRoll = (currentRoll + 1) % 4
            : null
            
        } , 250)
    
        setTimeout(() => {
            clearInterval(intervalID)
            finalNumber = Math.floor(Math.random() * 6) + 1
            dice.src = diceImgs[finalNumber]
            console.log("final" + (finalNumber));
            moveAnimationHandler(finalNumber)
        } , 1000)
        alreadyRolled = true
    }
    
    
}

function moveAnimationHandler(island){
    if(island == 1){
        endGameResults()
    } else {
        let promise = Promise.resolve()
        for(i = 2; i <= island; ++i){
            let curr = i
            promise = promise.then(() => moveAnimation(curr))
        }  
    }
    
}

function moveAnimation(i){
    return new Promise((resolve) => {
        pirateMoving = true
        intervalID = setInterval(() => {
            let directionX , directionY
            let diffrenceX , diffrenceY

            let characterRect = character.getBoundingClientRect()
            let currentIslandRect = islands[currentIsland].getBoundingClientRect()
            let destinationIslandRect = islands[i].getBoundingClientRect()

            characterRect.left < destinationIslandRect.left ? directionX = 1 : directionX = -1
            characterRect.top < destinationIslandRect.top ? directionY = 1 : directionY = -1

            if (!pirateMoving) {
                currentIsland = i
                clearInterval(intervalID);
                resolve()
            } 
            else {
                if(Math.round(characterRect.left) != Math.round(destinationIslandRect.left)){
                    character.style.left = characterRect.left + directionX + 'px'
    
                }
                if(Math.round(characterRect.top) != Math.round(destinationIslandRect.top)){
                    character.style.top = characterRect.top + directionY + 'px'
                }

                if(Math.round(characterRect.left)  == Math.round(destinationIslandRect.left) && Math.round(characterRect.top) == Math.round(destinationIslandRect.top)){
                    pirateMoving = false
                    if(i == finalNumber){
                        enablePopup()
                    }
                }
            }
        } , 1)
    })

}

function followCharacter(island){
    while(pirateMoving){
        let characterRect = character.getBoundingClientRect()
        let distance = islands[island]
    }
}



function enablePopup(){
    let popupHeader = document.getElementById('popup-header')
    let popupText = document.getElementById('popup-text')
    popupScreen.style.display = 'flex'
    
    switch(finalNumber){
        case 1:
            popupHeader.innerHTML = 'You stayed on the island'
            popupText.innerHTML = 'Game Over!'
            break
        case 2:
            let random = Math.floor(Math.random() * 10) + 1
            if(random >= 5){
                popupHeader.innerHTML = 'You drunk poisonous rum!'
                popupText.innerHTML = 'Game Over!'
            } else {
                popupHeader.innerHTML = 'You drunk great rum!'
                popupText.innerHTML = 'You Win!'
            }
            break
        case 3:
            popupHeader.innerHTML = 'You fought a dragon and lost'
            popupText.innerHTML = 'Game Over!'
            break
        case 4:
            popupHeader.innerHTML = 'You found the treasure!'
            popupText.innerHTML = 'You Win!'
            break
        case 5:
            let message = ''
            popupText.innerHTML = message
            break
        case 6:
            popupHeader.innerHTML = 'You arrived to the island!'
            popupText.innerHTML = 'You Win!'
            break
    }
}

screenOrientation.addEventListener("change", (e) =>{
    if(e.matches){
        gameScreen.style.display = 'none'
        popupScreen.style.display = 'block'
    } else {
        popupScreen.style.display = 'none'
        gameScreen.style.display = 'block'
    }
})

window.addEventListener('resize', ()=> {
    handleResize()
    movePirate(currentIsland)
})

function handleResize(){
    screenWidth = window.innerWidth
    screenHeight = window.innerHeight

    distanceX = (screenWidth / prevWidth) * distanceX
    distanceY = (screenHeight / prevHeight) * distanceY

    gameScreen.style.width = (screenWidth * screenMultiplyer) + 'px'
    gameScreen.style.height = (screenHeight * screenMultiplyer) + 'px'

    character.style.width = (screenWidth * screenMultiplyer) * 0.05 + 'px'

    Object.keys(islands).forEach(key => {
        initialPostion[key].X = distanceX + (screenWidth * screenMultiplyer) * precentPosition[key].X
        initialPostion[key].Y = distanceY + (screenHeight * screenMultiplyer) * precentPosition[key].Y

        islands[key].style.left = initialPostion[key].X + 'px'
        islands[key].style.top = initialPostion[key].Y + 'px'
    })

    prevWidth = screenWidth
    prevHeight = screenHeight
}

window.addEventListener("mousedown", function(event) {
    console.log(event.pageX);
    console.log(event.pageY);
    startX = event.clientX;
    startY = event.clientY;
  });
  
window.addEventListener("mousemove", function(event) {
    if (event.which === 1) {
      var currentX = event.clientX;
      var currentY = event.clientY;
      distanceX = currentX - startX
      distanceY = currentY - startY
      if(enableBrowseMap)
        moveMap()
    }
  });
  


  // Known Bugs
  // 1. When pirate moving change resize is bugged.
  // 2. When you move the map and than resize the map tears
  // 3. Fix popup text on resize