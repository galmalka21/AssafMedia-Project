

const gameScreen = document.getElementById('game-screen')

const popupScreen = document.getElementById('popup-screen')
const popupHeader = document.getElementById('popup-header')
const popupText = document.getElementById('popup-text')
const popupInput = document.getElementById('popup-input')
const popupLogin = document.getElementById('popup-login')
const popupGuest = document.getElementById('popup-guest')
const popupRestart = document.getElementById('popup-restart')
const popupCards = document.getElementById('popup-cards')
const popupClose = document.getElementById('popup-close')

const cardGames = document.getElementById('card-user-games')
const cardWins = document.getElementById('card-user-wins')
const cardLosses = document.getElementById('card-user-losses')

const cardGamesText = document.getElementById('user-games')
const cardWinsText = document.getElementById('user-wins')
const cardLossesText = document.getElementById('user-losses')

const trailContainer = document.getElementById('trail')
const sidemenuScreen = document.getElementById('sidemenu')
const browseMapButton = document.getElementById('browse-btn')
const rollDiceButton = document.getElementById('rolldice-btn')
const viewStatsButton = document.getElementById('viewstats-btn')
const dice = document.getElementById('dice')

const character = document.getElementById('character')

const screenOrientation = window.matchMedia('(orientation: portrait)')
const screenMultiplyer = 2

const islands = {}
const diceImgs = {}
const diceRollImgs = {}

let guest = false
let username

let mapAtStartPosition = true
let popupVisable = true
let sidemenuVisible = true
let pirateMoving = false
let alreadyRolled = false
let enableBrowseMap = false
let mapPromise = Promise.resolve()

let prevWidth = window.innerWidth;
let prevHeight = window.innerHeight;
let screenWidth = window.innerWidth
let screenHeight = window.innerHeight

let intervalID , intervalID2

let currentIsland = 1
let currentImage = 1
let currentRoll = 1
let finalNumber

let initialPostion = {}
let precentPosition = {}
let islandAjustments = {}

let startX, startY;
let distanceX = 0;
let distanceY = 0;


function onLoad(){
    appInit()
    handleResize()
    detectScreen()
    movePirate(currentIsland)
}

function appInit(){
    precentPosition = {
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

    initialPostion = {
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

    islandAjustments = {
        1: {
            X: 0.70 , Y: 1
        },
        2: {
            X: 0.80 , Y: 1.10
        },
        3: {
            X: 1, Y: 1
        },
        4: {
            X: 0.40, Y: 1.65
        },
        5: {
            X: 0.6, Y: 1
        },
        6: {
            X: 0.4, Y: 1.6
        }
    }
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

}

function restartGame(){
    onPopupVisibilityChange()
    currentIsland = 1
    gameScreen.style.left = 0 + 'px'
    gameScreen.style.top = 0 + 'px'
    character.style.transform = 'scaleX(1)'
    distanceX = 0
    distanceY = 0
    startX = 0
    startY = 0
    mapAtStartPosition = true
    enableBrowseMap = false
    pirateMoving = false
    alreadyRolled = false
    currentImage = 1
    currentRoll = 1
    document.body.style.cursor = 'default'
    handleResize()
    movePirate(currentIsland)
}

function movePirate(key){
    let islandRect = islands[key].getBoundingClientRect(); 
    let characterRect = character.getBoundingClientRect();
    
    let positionX = islandRect.left + (islandRect.width / 2) * islandAjustments[key].X
    let positionY = islandRect.top + (islandRect.height / 2) * islandAjustments[key].Y - characterRect.height

    character.style.left = positionX + 'px'
    character.style.top = positionY + 'px'

}

function moveMap(){  
    let newGameScreenLeft =  Math.min(Math.max(gameScreen.offsetLeft + distanceX, -screenWidth ), 0)
    let newGameScreenTop = Math.min(Math.max(gameScreen.offsetTop + distanceY, -screenHeight ), 0)

    gameScreen.style.left = newGameScreenLeft + 'px'
    gameScreen.style.top = newGameScreenTop + 'px'

    Object.keys(islands).forEach(key =>{
        let islandLeft = Math.min(Math.max(islands[key].offsetLeft + distanceX, -screenWidth  + initialPostion[key].X), initialPostion[key].X)
        let islandTop = Math.min(Math.max(islands[key].offsetTop + distanceY, -screenHeight + initialPostion[key].Y), initialPostion[key].Y)
        islands[key].style.left = islandLeft + 'px'
        islands[key].style.top = islandTop + 'px'
    })
    
    if(!pirateMoving){
        movePirate(currentIsland)
    }
    mapAtStartPosition = false
}

function moveAnimationHandler(island){
    if(island == 1){
        endGameResults()
    } else {
        let promise = Promise.resolve()
        distanceX = 0
        distanceY = 0
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

            let screen = gameScreen.getBoundingClientRect()
            let startX = screen.width / screenMultiplyer / 2
            let endX = screen.width - screen.width / screenMultiplyer / 2
            let startY = screen.height / screenMultiplyer / 2
            let endY = screen.height - screen.height / screenMultiplyer / 2
            let characterRect = character.getBoundingClientRect()
            let destinationIslandRect = islands[i].getBoundingClientRect()

            let positionX = Math.floor(destinationIslandRect.left + ((destinationIslandRect.width / 2) * islandAjustments[i].X))
            let positionY = Math.floor(destinationIslandRect.top + ((destinationIslandRect.height / 2) * islandAjustments[i].Y) - characterRect.height)

            characterRect.left < positionX ? directionX = 1 : directionX = -1
            Math.floor(characterRect.top) < Math.floor(positionY) ? directionY = 1 : directionY = -1

            if(directionX == -1){
                character.style.transform = 'scaleX(-1)'
                imgRotate = true
            }
            else if(directionX == 1){
                character.style.transform = 'scaleX(1)'
                imgRotate = false
            }

            if (!pirateMoving) {
                currentIsland = i
                clearInterval(intervalID);
                resolve()
            } 
            else {
                
                if(characterRect.right >= startX && characterRect.right <= endX){
                    Object.keys(islands).forEach((key) => {
                        islands[key].style.left =  islands[key].offsetLeft - directionX + 'px'
                    })
                } else {
                    if(Math.floor(characterRect.left) != Math.floor(positionX)){
                        character.style.left = characterRect.left + directionX + 'px'
                    }
                }
                if(characterRect.bottom >= startY && characterRect.bottom <= endY){
                    Object.keys(islands).forEach((key) => {

                        islands[key].style.top = islands[key].offsetTop - directionY + 'px'
                    })
                } else {
                    if(Math.floor(characterRect.top) != Math.floor(positionY)){
                        character.style.top = characterRect.top + directionY + 'px'
                    }
                }
                let boundryLeft = destinationIslandRect.left
                let boundryRight = destinationIslandRect.left + destinationIslandRect.width * directionX
                let boundryTop = destinationIslandRect.top
                let boundryBottom = destinationIslandRect.top - destinationIslandRect.height
                if((Math.floor(characterRect.left) >= Math.floor(boundryLeft) && Math.floor(characterRect.left) <= Math.floor(boundryRight))
                 && (Math.floor(characterRect.top) >= Math.floor(boundryBottom) && Math.floor(characterRect.top) <= Math.floor(boundryTop))){
                    pirateMoving = false
                    if(i == finalNumber){
                        endGameResults()
                    }
                }
            }
        } , 5)
    })

}

async function rollDice(){
    let promise = Promise.resolve()
    await promise.then(() => returnToStartPoint())
    if(!alreadyRolled && ((guest && !username) || (!guest && username)) && !popupVisable){
        currentImage = 1
        currentRoll = 1
        intervalID = setInterval(() => {
            dice.src = diceRollImgs[currentRoll]
            currentRoll != 0 ?
            currentRoll = (currentRoll + 1) % 4
            : null
            currentRoll == 3 ? currentRoll = 1 : null
            
        } , 100)
        setTimeout(() => {
            clearInterval(intervalID)
            finalNumber = Math.floor(Math.random() * 6) + 1
            dice.src = diceImgs[finalNumber]
            moveAnimationHandler(finalNumber)
        } , 1000)
        alreadyRolled = true
        
    }
    
    
    
}

async function endGameResults(){
    let data = {
        description : '',
        won: ''
    }
    let udata = {
        username: username,
        won: ''
    }
    detectPopupType('endgame')
    if(!popupVisable){
        onPopupVisibilityChange()
    }
    
    
    switch(finalNumber){
        case 1:
            popupHeader.innerHTML = 'You stayed on the island'
            popupText.innerHTML = 'Game Over!'
            data.description = "player rolled 1 and stayed on the island"
            data.won = 0
            udata.won = 0
            break
        case 2:
            let random = Math.floor(Math.random() * 10) + 1
            if(random >= 5){
                popupHeader.innerHTML = 'You drunk poisonous rum!'
                popupText.innerHTML = 'Game Over!'
                data.description = "player rolled 2 and drunk bad rum"
                data.won = 0
                udata.won = 0
            } else {
                popupHeader.innerHTML = 'You drunk great rum!'
                popupText.innerHTML = 'You Win!'
                data.description = "player rolled 2 and drunk good rum"
                data.won = 1
                udata.won = 1
            }
            break
        case 3:
            popupHeader.innerHTML = 'You fought a dragon and lost'
            popupText.innerHTML = 'Game Over!'
            data.description = "player rolled 3 and lost to a dragon"
            data.won = 0
            udata.won = 0
            break
        case 4:
            popupHeader.innerHTML = 'You found the treasure!'
            popupText.innerHTML = 'You Win!'
            data.description = "player rolled 4 and found the treasure"
            data.won = 0
            udata.won = 0
            break
        case 5:
            let message = await getMessage()
            popupHeader.innerHTML = "You found a message in a bottle!"
            popupText.innerHTML = message
            data.description = "player rolled 5 and found a message in a bottle"
            data.won = 0
            udata.won = 0
            break
        case 6:
            popupHeader.innerHTML = 'You arrived to the island!'
            popupText.innerHTML = 'You Win!'
            data.description = "player rolled 6 and arrived to an island"
            data.won = 1
            udata.won = 1
            break
    }
    await saveData(data)
    if(username){
        await saveUserData(udata)
    }
    
}

function handleResize(){
    screenWidth = window.innerWidth
    screenHeight = window.innerHeight

    gameScreen.style.width = (screenWidth * screenMultiplyer) + 'px'
    gameScreen.style.height = (screenHeight * screenMultiplyer) + 'px'

    character.style.width = (screenWidth * screenMultiplyer) * 0.05 + 'px'

    Object.keys(islands).forEach(key => {
        initialPostion[key].X = (screenWidth * screenMultiplyer) * precentPosition[key].X
        initialPostion[key].Y = (screenHeight * screenMultiplyer) * precentPosition[key].Y

        islands[key].style.left = initialPostion[key].X + 'px'
        islands[key].style.top = initialPostion[key].Y + 'px'
    })

    prevWidth = screenWidth
    prevHeight = screenHeight
    
    handleTextResize()

}

function handleTextResize(){
    popupHeader.style.fontSize = screenWidth / 40 + 'px'
    popupText.style.fontSize = screenWidth / 50 + 'px'
    popupInput.style.fontSize = screenWidth / 50 + 'px'

    popupInput.style.fontSize = screenWidth / 50 + 'px'
    popupGuest.style.fontSize = screenWidth / 50 + 'px'
    popupLogin.style.fontSize = screenWidth / 50 + 'px'
    popupRestart.style.fontSize = screenWidth / 50 + 'px'
    popupClose.style.fontSize = screenWidth / 50 + 'px'

    cardGames.style.width = screenWidth / 15 + 'px'
    cardWins.style.width = screenWidth / 15 + 'px'
    cardLosses.style.width = screenWidth / 15 + 'px'

    cardGames.style.height = screenWidth / 15 + 'px'
    cardWins.style.height = screenWidth / 15 + 'px'
    cardLosses.style.height = screenWidth / 15 + 'px'

    cardGamesText.style.fontSize = screenWidth / 50 + 'px'
    cardWinsText.style.fontSize = screenWidth / 50 + 'px'
    cardLossesText.style.fontSize = screenWidth / 50 + 'px'

}

function toggleBrowseMap(){
    console.log("click");
    if(enableBrowseMap){
        enableBrowseMap = false 
        document.body.style.cursor = 'default'
    } else {
        enableBrowseMap = true
        document.body.style.cursor = 'grab'
    }
}

function detectPopupType(type){
    if(type == 'endgame'){
        popupHeader.style.display = 'block'
        popupText.style.display = 'block'
        popupRestart.style.display = 'block'
        popupInput.style.display = 'none'
        popupLogin.style.display = 'none'
        popupGuest.style.display = 'none'
        popupCards.style.display = 'none'
        popupClose.style.display = 'none'
    }
    if(type == 'onload'){
        popupHeader.style.display = 'block'
        popupHeader.innerHTML = "Welcome To Pirate Game!"
        popupText.style.display = 'none'
        popupRestart.style.display = 'none'
        popupInput.style.display = 'block'
        popupLogin.style.display = 'block'
        popupGuest.style.display = 'block'
        popupCards.style.display = 'none'
        popupClose.style.display = 'none'
    }
    if(type == 'alert'){
        popupHeader.style.display = 'none'
        popupText.style.display = 'block'
        popupText.innerHTML = "Game doesnt support horizontal mode"
        popupRestart.style.display = 'none'
        popupInput.style.display = 'none'
        popupLogin.style.display = 'none'
        popupGuest.style.display = 'none'
        popupCards.style.display = 'none'
        popupClose.style.display = 'none'
    }
    if(type == 'stats'){
        popupHeader.style.display = 'block'
        popupText.style.display = 'none'
        popupRestart.style.display = 'none'
        popupInput.style.display = 'none'
        popupLogin.style.display = 'none'
        popupGuest.style.display = 'none'
        popupCards.style.display = 'flex'
        popupClose.style.display = 'block'
    }
    if(type == 'description'){
        popupHeader.style.display = 'block'
        popupText.style.display = 'block'
        popupRestart.style.display = 'none'
        popupInput.style.display = 'none'
        popupLogin.style.display = 'none'
        popupGuest.style.display = 'none'
        popupCards.style.display = 'none'
        popupClose.style.display = 'block'
        
    }
}

function onPopupVisibilityChange(){
    let visibility = popupScreen.style.display
    if(visibility == 'flex'){
        popupScreen.style.display = 'none'
        popupVisable = false
    }
    if(visibility == 'none'){
        popupScreen.style.display = 'flex'
        popupVisable = true
    }
}
//Maybe make it faster
function returnToStartPoint(){
    return new Promise((resolve)=> {
        intervalID2 = setInterval(() =>{ 
            let screen = gameScreen.getBoundingClientRect()
            if(Math.round(screen.left) == 0 && Math.round(screen.top) == 0){
                clearInterval(intervalID2)
                resolve()
            } else {
                let directionX , directionY
                distanceX > 0 ? directionX = -1 : directionX = 1
                distanceY > 0 ? directionY = -1 : directionY = 1
                distanceX += directionX
                distanceY += directionY
                moveMap()
                movePirate(currentIsland)
            }
        },1)
        mapAtStartPosition = true
    })
    
}

function showIslandDescription(island){
    if(!popupVisable){
        detectPopupType('description')
        onPopupVisibilityChange()
        switch(island){
            case 1:
                popupHeader.innerHTML = "First Island"
                popupText.innerHTML = "If you stay on this island you will starve and lose.."
                break
            case 2:
                popupHeader.innerHTML = "Second Island"
                popupText.innerHTML = "Beware of the rum, rumors says its cursed.."
                break
            case 3:
                popupHeader.innerHTML = "Third Island"
                popupText.innerHTML = "Some says a mighty dragons lives here.."
                break
            case 4:
                popupHeader.innerHTML = "Forth Island"
                popupText.innerHTML = "Go two steps right and dig, I heard a pirate buried his treasure there"
                break
            case 5:
                popupHeader.innerHTML = "Fifth Island"
                popupText.innerHTML = "A closed bottle with a note inside, I wonder whats written there"
                break
            case 6:
                popupHeader.innerHTML = "Sixth Island"
                popupText.innerHTML = "Escape Island you will live if u get here!"
                break
            default:
                break
        }
    }
}

let interval , interval2
function toggleSideMenu(){
    let eyeIcon = document.getElementById('close-img')
    if(sidemenuVisible){
        clearInterval(interval2)
        
        let opacity = 1
        interval = setInterval(() => {
            sidemenuScreen.style.opacity = opacity
            opacity -= 0.1
            if(opacity == 0){
                clearInterval(interval)
            }
        },40)
        sidemenuVisible = false
        eyeIcon.src = '../assets/sidemenu/eye-open.png'
    } else {
        clearInterval(interval)
        let opacity = 0
        interval2 = setInterval(() => {
            sidemenuScreen.style.opacity = opacity
            opacity += 0.1
            
            if(opacity == 1){
                clearInterval(interval2)
            }
        },40)
        sidemenuVisible = true
        eyeIcon.src = '../assets/sidemenu/eye-close.png'
    }
    
}

window.addEventListener('resize', ()=> {
    handleResize()
    if(!pirateMoving){
        movePirate(currentIsland)
    }
    
})

screenOrientation.addEventListener("change", (e) =>{
    detectScreen()
})


window.addEventListener("mousedown", function(event) {
    startX = event.clientX;
    startY = event.clientY;
    beforeMoveScreenLeft = gameScreen.offsetLeft
    beforeMoveScreenTop = gameScreen.offsetTop
  });

  
  window.addEventListener("mousemove", function(event) {
    if (event.which === 1) {
      let currentX = event.clientX;
      let currentY = event.clientY;
      distanceX = currentX - startX
      distanceY = currentY - startY
      if(enableBrowseMap && !pirateMoving){
        moveMap()
      }
      
    }
  });

  gameScreen.addEventListener("touchstart", function(event) {
    
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  });

  gameScreen.addEventListener("touchmove", function(event) {
    if (event.which === 0) {
      let currentX = event.touches[0].clientX;
      let currentY = event.touches[0].clientY;
      distanceX = currentX - startX
      distanceY = currentY - startY
      if(enableBrowseMap && !pirateMoving){
        console.log("moving");
        moveMap()
      }  
    }
  });
  
function detectScreen(){
    if(screenOrientation.matches){
        gameScreen.style.display = 'none'
        popupScreen.style.display = 'flex'
        detectPopupType('alert')
    } else {
        popupScreen.style.display = 'none'
        gameScreen.style.display = 'block'
        if(!guest && !username){
            detectPopupType('onload')
            onPopupVisibilityChange()
        }
    }
}

