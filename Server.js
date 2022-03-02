var clients ={}
var games={}

const WIN_STATES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8]]
const http=require('http').createServer().listen(8080)
const server =require('websocket').server
const socket=new server({'httpServer':http})
socket.on('request',(req)=>{
    const conn=req.accept(null,req.origin)
    const clientId=Math.round(Math.random()*100)+Math.round(Math.random()*100)+Math.round(Math.random()*100)
    clients [clientId]={ 'conn':conn}

    conn.send(JSON.stringify({
        'tag':'connected',
        'clientId':clientId
    }))
    sendAvailGames()
    conn.on('message',onMessage)
})

function sendAvailGames(){
    const gamesList = []
    for(const game in games){
        if(games[game].players.length<2)
        gamesList.push(game)
    }
    for(const client in clients){
    clients[client].conn.send(JSON.stringify({
        'tag':'gamesList',
        'list':gamesList
    }))         
    }


}

function onMessage(msg){
    const data=JSON.parse(msg.utf8Data)
    var player={}
    switch (data.tag){
        case 'create':
            const gameId=Math.round(Math.random()*100)+Math.round(Math.random()*100)+Math.round(Math.random()*100)
            const board= ['','','',
                          '','','',
                          '','','']
            player={
                'clientId':data.clientId,
                'symbol':'x',
                'isTurn':true
            }
            const players=Array(player)

            games[gameId]={
                'board':board,
                'players':players
            }
            clients[data.clientId].conn.send(JSON.stringify({
                'tag': 'created',
                'gameId':gameId
            }))
            sendAvailGames()

            break
            
        case 'join':
             player={
                'clientId':data.clientId,
                'symbol':'o',
                'isTurn': false
            }
            games[data.gameId].players.push(player)
            sendAvailGames()
            games[data.gameId].players.forEach(player=> {
                clients[player.clientId].conn.send(JSON.stringify({
                    'tag':'joined',
                    'gameId':data.gameId,
                    'symbol':player.symbol
                }))
            })
            updateBoard(data.gameId)
            break

        case 'moveMade':
            games[data.gameId].board=data.board
            console.log(games[data.gameId].board)
            console.log(data.board)
            const isWinner=winState(data.gameId)
            const isDraw=drawState(data.gameId)
            if(isWinner){
                // //added
                // updateBoard(data.gameId)
                // //added
                games[data.gameId].players.forEach(player =>{
                    clients[player.clientId].conn.send(JSON.stringify({
                        'tag': 'winner',
                        'winner':data.symbol,
                        'isTurn':data.isTurn,
                        
                        'player':data.clientId
                    
                    }))
                })
                //added
                updateBoard(data.gameId)
                //added
                

            }
            else if(isDraw){
                //added
                updateBoard(data.gameId)
                //added
                games[data.gameId].players.forEach(player =>{
                    clients[player.clientId].conn.send(JSON.stringify({
                        'tag': 'gameDraw',
                        'winner':data.symbol,
                        'isTurn':data.isTurn,
                    }))
                })
                
            }
            else{
                games[data.gameId].players.forEach(player =>{
                    player.isTurn =!player.isTurn
                })
                updateBoard(data.gameId)
                
            }
            break
    }
}

function updateBoard(gameId){
   
    games[gameId].players.forEach(player =>{
        clients[player.clientId].conn.send(JSON.stringify({
            'tag':'updateBoard',
            'isTurn':player.isTurn,
            'board': games[gameId].board,
            
        }))
    })
}

function winState(gameId){
    return WIN_STATES.some(row=>{
        return( row.every(cell=>{
            return games[gameId].board[cell]=='x' }) ||
            row.every(cell=>{
                return games[gameId].board[cell]=='o' })
                 )
    })
}

function drawState(gameId){
    return WIN_STATES.every(row =>{
        return(
            row.some(cell=>{
                return games[gameId].board[cell]=='x'
            }) &&
            row.some(cell=>{
                return games[gameId].board[cell]=='o'
            })
        )
    })
}