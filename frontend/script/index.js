const gameScreen = document.getElementById('game-screen')
const popupScreen = document.getElementById('popup-screen')
const popupHeader = document.getElementById('popup-header')
const popupText = document.getElementById('popup-text')
const popupButton = document.getElementById('popup-button')
const popupInput = document.getElementById('popup-input')

const popupEndGame = document.getElementById('popup-endgame')
const popupOnLoad = document.getElementById('popup-onload')
const popupAlert = document.getElementById('popup-alert')
const popupStats = document.getElementById('popup-stats')
const popupDesc = document.getElementById('popup-description')

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

let popupVisable = true
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
    distanceX = 0
    distanceY = 0
    startX = 0
    startY = 0
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
    
    if(!pirateMoving){
        movePirate(currentIsland)
    }
    
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

            let characterRect = character.getBoundingClientRect()
            let destinationIslandRect = islands[i].getBoundingClientRect()

            // let positionX = Math.round(destinationIslandRect.left + ((destinationIslandRect.width / 2) * islandAjustments[i].X))
            // let positionY = Math.round(destinationIslandRect.top + ((destinationIslandRect.height / 2) * islandAjustments[i].Y) - characterRect.height)
            let positionX = Math.round(destinationIslandRect.left ) 
            let positionY = Math.round(destinationIslandRect.top + (destinationIslandRect.height / 2))

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
                followCharacter()
                if(Math.round(characterRect.left)  == Math.round(destinationIslandRect.left) && Math.round(characterRect.top) == Math.round(destinationIslandRect.top)){
                    pirateMoving = false
                    if(i == finalNumber){
                        endGameResults()
                    }
                }
            }
        } , 5)
    })

}

async function followCharacter(){
    if(pirateMoving){
        let characterRect = character.getBoundingClientRect()
        let screen = gameScreen.getBoundingClientRect()
        
        if(characterRect.left >= screen.width / screenMultiplyer / 2 && character.left <= screen.width / screenMultiplyer){
            let promise = Promise.resolve()
            distanceX += -1
            promise.then(()=> moveMap())
            
        }
        
    }
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
    onPopupVisibilityChange()
    
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
    if(username){
        await saveUserData(udata)
    }
    await saveData(data)
}

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
    
    popupHeader.style.fontSize = screenWidth / 40 + 'px'
    popupText.style.fontSize = screenWidth / 50 + 'px'
    popupButton.style.fontSize = screenWidth / 50 + 'px'
    popupInput.style.fontSize = screenWidth / 50 + 'px'
    
}

function toggleBrowseMap(){
    if(enableBrowseMap){
        enableBrowseMap = false 
        document.body.style.cursor = 'default'
    } else {
        enableBrowseMap = true
        document.body.style.cursor = 'grab'
    }
}

function expandMap(type){
    if(type === 1){
        let screen = gameScreen.getBoundingClientRect()
        gameScreen.style.width = screen.width + 1080 + 'px'
        gameScreen.style.height = screen.height + 920 + 'px'
        console.log(screen.width);
    }
    else if(type === 0){
        let screen = gameScreen.getBoundingClientRect()
        gameScreen.style.width = screen.width - 1080 + 'px'
        gameScreen.style.height = screen.height - 920 + 'px'
        console.log(screen.width);
    }
}

function detectPopupType(type){
    if(type == 'endgame'){
        popupEndGame.style.display = 'flex'
        popupAlert.style.display = 'none'
        popupOnLoad.style.display = 'none'
        popupStats.style.display = 'none'
        popupDesc.style.display = 'none'
    }
    if(type == 'onload'){
        popupEndGame.style.display = 'none'
        popupAlert.style.display = 'none'
        popupOnLoad.style.display = 'flex'
        popupStats.style.display = 'none'
        popupDesc.style.display = 'none'
    }
    if(type == 'alert'){
        popupEndGame.style.display = 'none'
        popupAlert.style.display = 'flex'
        popupOnLoad.style.display = 'none'
        popupStats.style.display = 'none'
        popupDesc.style.display = 'none'
    }
    if(type == 'stats'){
        popupEndGame.style.display = 'none'
        popupAlert.style.display = 'none'
        popupOnLoad.style.display = 'none'
        popupStats.style.display = 'flex'
        popupDesc.style.display = 'none'
    }
    if(type == 'description'){
        popupEndGame.style.display = 'none'
        popupAlert.style.display = 'none'
        popupOnLoad.style.display = 'none'
        popupStats.style.display = 'none'
        popupDesc.style.display = 'flex'
        
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
    })
    
}

async function getMessage(){
    const response = await fetch('https://localhost:3000/message');
    const data = await response.text();
    return data;
}

async function saveData(data){
    const response = await fetch('https://localhost:3000/save', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
    return response.json();  
}

async function saveUserData(udata){
    const response = await fetch('https://localhost:3000/save-user-data', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(udata) // body data type must match "Content-Type" header
    })
    return response.json(); 
}

async function getUserData(){
    const response = await fetch('https://localhost:3000/load-user-data');
    const data = await response.text();
    return data;
   
}

async function handleLogin(type){
    if(type == 1){
        guest = false
        let value = popupInput.value
        if(value.length >= 3){
            username = value
            await saveUsername(value)
            onPopupVisibilityChange()
            console.log(username);
        } else {
            popupInput.value = null
            popupInput.placeholder = 'Username should be more than 3 letters!'
            
        }
    } else {
        guest = true
        onPopupVisibilityChange()
    }
    
}

async function usernameExists(uname){
    const response = await fetch('https://localhost:3000/load-users');
    const data = await response.json();
    for(let i = 0; i < data.length; ++i){
        if(data[i].username == uname){
            return true
        }
    }
    
    return false
}

async function saveUsername(uname){
    let bool = await usernameExists(uname)
    if(!bool){
        const response = await fetch('https://localhost:3000/save-user', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify({username}) // body data type must match "Content-Type" header
            })
            return response.json();
    }
}

async function viewUserStats(){
    let cardGames = document.getElementById('user-games')
    let cardWins = document.getElementById('user-wins')
    let cardLosses = document.getElementById('user-losses')
    if(username){
        onPopupVisibilityChange()
        detectPopupType('stats')
        let data = JSON.parse(await getUserData())
        let userData = []
        for(let i = 0 ; i < data.length ; ++i){
            if(data[i].username == username){
                userData.push(data[i])
            }
        }
        let userWins = 0
        let userLosses = 0
        let totalGames = userData.length
        for(let i = 0 ; i < totalGames ; ++i){
            userData[i].won == 1 ? userWins++ : userLosses++
        }
        let fixedUsername = username.charAt(0).toUpperCase() + username.slice(1)
        cardGames.innerHTML = totalGames
        cardWins.innerHTML = userWins
        cardLosses.innerHTML = userLosses
    }
    
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
                break
            case 3:
                break
            case 4:
                break
            case 5:
                break
            case 6:
                break
            default:
                break
        }
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
  
function detectScreen(){
    if(screenOrientation.matches){
        gameScreen.style.display = 'none'
        popupScreen.style.display = 'flex'
        detectPopupType('alert')
    } else {
        popupScreen.style.display = 'none'
        gameScreen.style.display = 'block'
        if(!guest || !username){
            detectPopupType('onload')
            onPopupVisibilityChange()
        }
    }
}

  // Known Bugs
  // 1. When pirate moving change resize is bugged.
  // 2. When you move the map and than resize the map tears
  // 3. Pirate change speed when map size is changing
