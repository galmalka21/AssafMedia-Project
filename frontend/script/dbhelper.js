async function getMessage(){
    const response = await fetch('http://localhost:3000/message');
    const data = await response.text();
    return data;
}

async function saveData(data){
    const response = await fetch('http://localhost:3000/save', {
        method: 'POST', 
        mode: 'cors', 
        cache: 'no-cache', 
        credentials: 'same-origin', 
        headers: {
        'Content-Type': 'application/json'
        },
        redirect: 'follow', 
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    })
    return response.json();  
}

async function saveUserData(udata){
    const response = await fetch('http://localhost:3000/save-user-data', {
        method: 'POST', 
        mode: 'cors', 
        cache: 'no-cache', 
        credentials: 'same-origin', 
        headers: {
        'Content-Type': 'application/json'
        },
        redirect: 'follow', 
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(udata) 
    })
    return response.json(); 
}

async function getUserData(){
    const response = await fetch('http://localhost:3000/load-user-data');
    const data = await response.text();
    return data;
   
}

async function handleLogin(type){
    if(type == 1){
        guest = false
        let value = popupInput.value
        if(value.length >= 3 && value.length <= 30){
            username = value
            await saveUsername(value)
            onPopupVisibilityChange()
        } else {
            popupInput.value = null
            popupInput.placeholder = 'Username should be more than 3 letters or less than 30!'
        }
    } else {
        guest = true
        onPopupVisibilityChange()
    }
    
}

async function saveUsername(uname){
    const response = await fetch('http://localhost:3000/save-user', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache', 
        credentials: 'same-origin',
        headers: {
        'Content-Type': 'application/json'
        },
        redirect: 'follow', 
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({username})
        })
        return response.json();
    
}

async function viewUserStats(){
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
        popupHeader.innerHTML = fixedUsername + " Stats!"
        cardGamesText.innerHTML = totalGames
        cardWinsText.innerHTML = userWins
        cardLossesText.innerHTML = userLosses
    }
    
}