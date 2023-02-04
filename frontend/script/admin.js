const loginScreen = document.getElementById('login')
const mainScreen = document.getElementById('main')

const winLoseRatioSpan = document.getElementById('win-lose-ratio');
const totalGamesSpan = document.getElementById('total-games');
const numberOfUsersSpan = document.getElementById('number-of-users');
const leastRolledDiceSpan = document.getElementById('least-rolled-dice');
const mostRolledDiceSpan = document.getElementById('most-rolled-dice');

let db , totalUsers

async function appInit(){
    loginScreen.style.display = 'none'
    mainScreen.style.display = 'block'
    db = await getData()
    await getUsers()
    winLoseRatioSpan.innerHTML = calculateWinRate()
    mostRolledDiceSpan.innerHTML = calculateMostRolledDice().maxKey
    leastRolledDiceSpan.innerHTML = calculateMostRolledDice().minKey
    totalGamesSpan.innerHTML = db.length
    numberOfUsersSpan.innerHTML = totalUsers
}

async function getData(){
    const response = await fetch('http://localhost:3000/load');
    const data = await response.json();
    return data;
}

async function getUsers(){
    const response = await fetch('http://localhost:3000/load-users');
    const data = await response.json();
    totalUsers = await data.length
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

    let entries = Object.entries(obj);
    entries.sort((a, b) => a[1] - b[1]);
    return { minKey: entries[0][0], minValue: entries[0][1], maxKey: entries[entries.length - 1][0], maxValue: entries[entries.length - 1][1] };
}


document.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    await fetch('http://localhost:3000/admin-login', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
      }),
    })
    .then(response => response.json())
    .then((data) =>{
      if(data.success){
        appInit()
      } else {

      }
    })
  });
    

  function handleLogout(){
    loginScreen.style.display = 'flex'
    mainScreen.style.display = 'none'
    db = null
    totalUsers = null
  }

setTimeout(() =>handleLogout(), 1000 * 60 * 1)