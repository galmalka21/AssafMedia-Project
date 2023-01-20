const gameScreen = document.getElementById("game-screen")
const popupScreen = document.getElementById("popup-screen")
const sidemenuScreen = document.getElementById("sidemenu")
const browseMapButton = document.getElementById("browse-btn")
const rollDiceButton = document.getElementById("rolldice-btn")
const dice = document.getElementById("dice")


let pirateMoving = false
let prevWidth = window.innerWidth;
let prevHeight = window.innerHeight;

let intervalID
let direction = 0
let screenOrientation = window.matchMedia("(orientation: portrait)")
let currentIsland = 1
const screenMultiplyer = 2
const islands = {}
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

let pirateAjustments = {
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
    
        Object.keys(islands).forEach(key =>{
            let width = Math.min(Math.max(islands[key].offsetLeft + distanceX, -screenWidth  + initialPostion[key].X), initialPostion[key].X)
            let height = Math.min(Math.max(islands[key].offsetTop + distanceY, -screenHeight + initialPostion[key].Y), initialPostion[key].Y)
            islands[key].style.left = width + 'px'
            islands[key].style.top = height + 'px'
        })
    
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
    var randomNum = Math.floor(Math.random() * 6) + 1;
    dice.innerHTML = randomNum
    moveAnimationHandler(randomNum)
}

function moveAnimationHandler(island){
    pirateMoving = true
    console.log("I:" + island);
    //4
    if(island >= 1){
        console.log(1);
        moveAnimation(1)
    }
    if(island >= 2){
        console.log(2);
        moveAnimation(2)
    }
    if(island >= 3){
        console.log(3);
        moveAnimation(3)
    }
    if(island >= 4){
        console.log(4);
        moveAnimation(4)
    }
    if(island >= 5){
        console.log(5);
        moveAnimation(5)
    }
    if(island >= 6){
        console.log(6);
        moveAnimation(6)
    }

    currentIsland = island
    pirateMoving = false
}

function moveAnimation(island){
    intervalID = setInterval(() => {
        console.log(intervalID);
        let islandRect = islands[island].getBoundingClientRect()
        let characterRect = character.getBoundingClientRect()
        
        let positionX = islandRect.left + (islandRect.width / 2)
        let positionY = islandRect.top + (islandRect.height / 2) - characterRect.height

        if(characterRect.left < positionX){
            character.style.left = (characterRect.left + 1) + 'px'
        }
        if(characterRect.top < positionY){
            character.style.top = (characterRect.top + 1) + 'px'
        }
        
        if(characterRect.left >= islandRect.left && characterRect.top >= islandRect.top){
            console.log("Animation stoped");
            clearInterval(intervalID)
        }
    },5)
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
    let characterRect = character.getBoundingClientRect()
    let sidemenuRect = sidemenuScreen.getBoundingClientRect()
    let currentWidth = window.innerWidth
    let currentHeight = window.innerHeight
    screenWidth = window.innerWidth
    screenHeight = window.innerHeight

    gameScreen.style.width = (screenWidth * screenMultiplyer) + 'px'
    gameScreen.style.height = (screenHeight * screenMultiplyer) + 'px'

    let charRatio = 0
    if(characterRect.width > characterRect.height){
        charRatio = characterRect.width / characterRect.height
    } else {
        charRatio = characterRect.height / characterRect.width
    }

    character.style.width = Math.floor((screenWidth * 0.15)) + 'px'
    character.style.height = Math.floor((screenHeight * 0.15 * charRatio)) + 'px'

    sidemenuScreen.style.width = Math.floor(screenWidth * 0.2) + 'px'
    sidemenuScreen.style.height = Math.floor(screenHeight * 0.2 * (sidemenuRect.width / sidemenuRect.height)) + 'px'

    Object.keys(islands).forEach(key => {
        let ration = islands[key].style.width / islands[key].style.height
        islands[key].style.width = (screenWidth * 0.25)  + 'px'
        islands[key].style.height = (screenHeight * 0.25 * ration)  + 'px'

        initialPostion[key].X = distanceX + (screenWidth * screenMultiplyer) * precentPosition[key].X
        initialPostion[key].Y = distanceY + (screenHeight * screenMultiplyer) * precentPosition[key].Y

        islands[key].style.left = initialPostion[key].X + 'px'
        islands[key].style.top = initialPostion[key].Y + 'px'
    })

    prevWidth = currentWidth
    prevHeight = currentHeight
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
      //distance += Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
      if(enableBrowseMap)
        moveMap()
    }
  });
  