let db

async function onLoad(){
    db = await getData()
    console.log(calculateWinRate());
    console.log(calculateMostRolledDice())
}

async function getData(){
    const response = await fetch('https://localhost:3000/load');
    const data = await response.json();
    return data;
}

function calculateWinRate(){
    let win = 0 , loss = 0
    let ratio = 0
   for(let i = 0 ; i < db.length ; ++i){
        db[i].winrate == 1 ? win++ : loss++
   } 
   ratio = win / loss
   return ratio.toFixed(2)
}

function calculateMostRolledDice(){
    let obj = {1: 0 , 2: 0 , 3: 0 , 4: 0 , 5: 0 , 6: 0}
    for(let i  = 0 ; i < db.length ; ++i){
        let string = db[i].action
        let words = string.split(" ")
        let number = parseInt(words[2])
        obj[number]++
    }
    let maxKey;
    let maxValue = -Infinity;
    for (let key in obj) {
        if (obj[key] > maxValue) {
            maxValue = obj[key];
            maxKey = key;
        }
    }
    return {maxKey , maxValue}
    
}

function calculateNumberOfPlayers(){
    let count = 0
    let playerList = []
    for(let i = 0 ; i < db.length ; ++i){
        
    }
}