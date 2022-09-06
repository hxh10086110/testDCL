import mysql from 'mysql';
import { Player } from './rooms/MyRoomState';
//安装mysql的过程
/*
    npm install mysql 
    npm install -D @types/mysql
*/
const dbConfig = {
    host:"127.0.0.1",
    port:3307,
    user:"root",
    password:"123456",
    database:"dcl"
}

const pool = mysql.createPool(dbConfig)

const getPlayer = (userId:string) => {
    var sql = 'select * from player where userId = "'+userId+'"';
    return new Promise<any>((resolve,reject)=>{
        pool.getConnection((error,connection) => {
            if(error){
                reject(error)
            }else{
                connection.query(sql,(error,results) => {
                    if(error){
                        resolve(0)
                    }else{
                        resolve(results)
                    }
                    connection.release()
                })
            }
        })
    })
}

const setPlayer = (player:Player) => {
    var sql = 'insert into player(userId,ticketTwo,ticketThree,ticketFour,scoreA,scoreB,scoreC,scoreD,levelTwo,levelThree,floorTwoRemainTime)'+
    'values("'+
    player.userId+'",'+
    player.ticketTwo+','+
    player.ticketThree+','+
    player.ticketFour+','+
    player.scoreA+','+
    player.scoreB+','+
    player.scoreC+','+
    player.scoreD+','+
    player.levelTwo+','+
    player.levelThree+','+
    player.floorTwoRemainTime
    +')'
    ;
    return new Promise<any>((resolve,reject)=>{
        pool.getConnection((error,connection) => {
            if(error){
                reject(error)
            }else{
                connection.query(sql,(error,results) => {
                    if(error){
                        resolve(0)
                    }else{
                        resolve(results)
                    }
                    connection.release()
                })
            }
        })
    })
}

const updatePlayer = (sql:string) => {
    
    return new Promise<any>((resolve,reject)=>{
        pool.getConnection((error,connection) => {
            if(error){
                reject(error)
            }else{
                connection.query(sql,(error,results) => {
                    if(error){
                        resolve(0)
                    }else{
                        resolve(results)
                    }
                    connection.release()
                })
            }
        })
    })
}


export {getPlayer,setPlayer,updatePlayer}