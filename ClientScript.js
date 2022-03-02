var clientId
var gameId
var socket
var symbol
const create =document.querySelector('.crtBtn')
create.disabled=true 
const join =document.querySelector('.jnBtn')
join.disabled=true 
join.addEventListener('click',()=>{
    socket.send(JSON.stringify({
        'tag':'join',
        'clientId':clientId,
        'gameId':gameId
    }))
})
//added
const Make=document.getElementById("myP").style.visibility="hidden"
//added
const cells=document.querySelectorAll('.cell')
const board=document.querySelector('.board')
//added
board.style.display='none'
//added

const list =document.querySelector('ul')

const sidebar=document.querySelector('.sidebar')
const connect=document.querySelector('.cntBtn')
connect.addEventListener('click',(src)=>{
    socket= new WebSocket('ws://localhost:8080')
    socket.onmessage=onMessage
    src.target.disabled= true
})
function onMessage(msg)
{
   const data=JSON.parse(msg.data)
   switch (data.tag){
       case 'connected':
           clientId=data.clientId
          
           const lbl=document.createElement('label')
           lbl.innerText=data.clientId
           lbl.style.textAlign='center'
           sidebar.insertBefore(lbl,connect)
           create.disabled=false
           join.disabled=false
           //
           console.log(list)
           break
        case 'gamesList':
           while(list.firstChild){
               list.removeChild(list.lastChild)
           }
          const games =data.list
          games.forEach( game=>{
              const li= document.createElement('li')
              li.innerText=game
              li.style.textAlign='center'
              list.appendChild(li)
              li.addEventListener('click',()=>{gameId=game})

         //added
          if(list.firstChild)
          create.disabled=true
          //added
          })  
          break  
        case 'created': 
              gameId=data.gameId
              create.disabled=true
              join.disabled=true
              console.log(gameId)
              break
        case 'joined':
                document.querySelector('.board').style.display='grid'
                symbol =data.symbol
                //
                console.log(symbol)
                //
                
                 if(symbol =='x')
                 {
                     board.classList.add('cross')
                 }
                else 
                {
                     board.classList.add('circle')
                }

                
                break

        case 'updateBoard':
                cells.forEach(cell=>{
                    if(cell.classList.contains('cross'))
                    cell.classList.remove('cross')
                    else if (cell.classList.contains('circle'))
                    cell.classList.remove('circle')
                })
                 for(i=0;i<9;i++){
                   if(data.board[i]=='x')
                      cells[i].classList.add('cross')
              else if (data.board[i]=='o')
                      cells[i].classList.add('circle')

                      //added
                      var bol=data.isTurn
                      if(bol)
                      document.getElementById("myP").style.visibility="visible"
                      else
                      document.getElementById("myP").style.visibility="hidden"
                      //added
            }
            if(data.isTurn){
                makeMove()
            }
               break
       
        case 'winner':
            data.isTurn=false
                 if(!data.isTurn){
                    console.log(data.isTurn)
                    document.getElementById("myP").style.visibility="hidden"
                }
            alert(`The winner is ${data.winner}`)

            Make.style.display='none'
            // console.log(data.isTurn)
            // console.log(data.player

            break
        case 'gameDraw':
            data.isTurn=false
            if(!data.isTurn){
               document.getElementById("myP").style.visibility="hidden"
           }
            alert ('The Game is a Draw!')
            break

       
             

   }
}

function makeMove(){
    cells.forEach(cell=>{
        if(!cell.classList.contains('cross') && ! cell.classList.contains('circle'))
        cell.addEventListener('click',cellClicked)
    })
}
function cellClicked(src){
    let icon
    if(symbol=='x')
    icon='cross'
    else icon='circle'
    src.target.classList.add(icon)
    const board=[]
    for(i=0; i<9; i++){
        if(cells[i].classList.contains('circle'))
        board[i]='o'
        else if (cells[i].classList.contains('cross'))
        board[i]='x'
        else 
        board[i]=''
    }
    cells.forEach(cell =>{
        cell.removeEventListener('click',cellClicked)
    })
    socket.send(JSON.stringify({
        'tag':'moveMade',
        'board':board,
        'clientId':clientId,
        'gameId':gameId,
        'symbol':symbol,
        'isTurn':false
    }))
}

create.addEventListener('click',()=>{
    socket.send(JSON.stringify({
        'tag':'create',
        'clientId':clientId
    }))
})