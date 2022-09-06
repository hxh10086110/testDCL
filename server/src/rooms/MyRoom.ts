import { Room, Client } from "colyseus";
import { MyRoomState, Player } from "./MyRoomState";
import { getPlayer, setPlayer, updatePlayer } from "../db";

export class MyRoom extends Room<MyRoomState> {
  onCreate(options: any) {
    this.setState(new MyRoomState());
    // set-up the game!
    this.setUp();

    //获取用户信息
    this.onMessage("getPlayerInfo", async (client: Client, message) => {
      const result = await getPlayer(this.state.users.get(client.sessionId));
      if (result.length == 0) {
        console.log("没有查询到用户信息")
      } else {
        console.log(result[0])
        client.send("PlayerInfo", result[0])
      }

    })


    //保存场景信息
    this.onMessage("getSenceInfo", (client: Client, message) => {
      //用户加入到场景中
      client.send("senceInfo", this.state.peopleNumber)
    })

    this.onMessage("toFloorOne", (client: Client, message) => {
      //首先需要判断该用户是否是从外面进来的，还是说是从别的层来到第一层的
      //通过userId为key，楼层为value保存用户的信息
      var isExit = this.state.playerInFloor.get(client.sessionId)
      if (isExit == undefined) {
        //在楼层中不存在某个用户的信息，所以是外部进来的
        //总人数列表添加
        this.state.peopleNumber.totalPeopleArray.push(message)
        //将玩家添加进一层
        this.state.peopleNumber.floorOnePeople.push(message)
      } else {
        //存在信息，获取信息
        if (isExit == 2) {
          //获取值所在的索引值
          var index = this.state.peopleNumber.floorTwoPeople.indexOf(message)
          //从数组中删除
          this.state.peopleNumber.floorTwoPeople.splice(index, 1)
          this.state.peopleNumber.floorOnePeople.push(message)
        } else if (isExit == 3) {
          //获取值所在的索引值
          var index = this.state.peopleNumber.floorThreePeople.indexOf(message)
          //从数组中删除
          this.state.peopleNumber.floorThreePeople.splice(index, 1)
          this.state.peopleNumber.floorOnePeople.push(message)
        } else if (isExit == 4) {
          //获取值所在的索引值
          var index = this.state.peopleNumber.floorFourPeople.indexOf(message)
          //从数组中删除
          this.state.peopleNumber.floorFourPeople.splice(index, 1)
          this.state.peopleNumber.floorOnePeople.push(message)
        }
      }

      //设置玩家的位置在1楼
      this.state.playerInFloor.set(message, 1)
    })

    this.onMessage("toFloorTwo", (client: Client, message) => {
      //因为2，3，4楼都是需要从必须得从其他楼层进入，包括1楼，所以一定是已经存在于用户表中的，所以需要判断是从哪个楼层进入二楼
      var isExit = this.state.playerInFloor.get(message)
      if (isExit == 1) {
        //获取值所在的索引值
        var index = this.state.peopleNumber.floorOnePeople.indexOf(message)
        //从数组中删除
        this.state.peopleNumber.floorOnePeople.splice(index, 1)
        this.state.peopleNumber.floorTwoPeople.push(message)
      } else if (isExit == 3) {
        //获取值所在的索引值
        var index = this.state.peopleNumber.floorThreePeople.indexOf(message)
        //从数组中删除
        this.state.peopleNumber.floorThreePeople.splice(index, 1)
        this.state.peopleNumber.floorTwoPeople.push(message)
      } else if (isExit == 4) {
        //获取值所在的索引值
        var index = this.state.peopleNumber.floorFourPeople.indexOf(message)
        //从数组中删除
        this.state.peopleNumber.floorFourPeople.splice(index, 1)
        this.state.peopleNumber.floorTwoPeople.push(message)
      }

      //设置玩家的位置在二楼
      this.state.playerInFloor.set(message, 2)
    })



    this.onMessage("toFloorThree", (client: Client, message) => {
      //用户进入三楼
      var isExit = this.state.playerInFloor.get(message)
      if (isExit == 1) {
        //获取值所在的索引值
        var index = this.state.peopleNumber.floorOnePeople.indexOf(message)
        //从数组中删除
        this.state.peopleNumber.floorOnePeople.splice(index, 1)
        this.state.peopleNumber.floorThreePeople.push(message)
      } else if (isExit == 2) {
        //获取值所在的索引值
        var index = this.state.peopleNumber.floorTwoPeople.indexOf(message)
        //从数组中删除
        this.state.peopleNumber.floorTwoPeople.splice(index, 1)
        this.state.peopleNumber.floorThreePeople.push(message)
      } else if (isExit == 4) {
        //获取值所在的索引值
        var index = this.state.peopleNumber.floorFourPeople.indexOf(message)
        //从数组中删除
        this.state.peopleNumber.floorFourPeople.splice(index, 1)
        this.state.peopleNumber.floorThreePeople.push(message)
      }
      //设置玩家的位置在三楼
      this.state.playerInFloor.set(message, 3)
    })

    

    this.onMessage("toFloorFour", (client: Client, message) => {
      //用户进入四楼
      //用户进入三楼
      var isExit = this.state.playerInFloor.get(message)
      if (isExit == 1) {
        //获取值所在的索引值
        var index = this.state.peopleNumber.floorOnePeople.indexOf(message)
        //从数组中删除
        this.state.peopleNumber.floorOnePeople.splice(index, 1)
        this.state.peopleNumber.floorFourPeople.push(message)
      } else if (isExit == 2) {
        //获取值所在的索引值
        var index = this.state.peopleNumber.floorTwoPeople.indexOf(message)
        //从数组中删除
        this.state.peopleNumber.floorTwoPeople.splice(index, 1)
        this.state.peopleNumber.floorFourPeople.push(message)
      } else if (isExit == 3) {
        //获取值所在的索引值
        var index = this.state.peopleNumber.floorThreePeople.indexOf(message)
        //从数组中删除
        this.state.peopleNumber.floorThreePeople.splice(index, 1)
        this.state.peopleNumber.floorFourPeople.push(message)
      }
      //设置玩家的位置在三楼
      this.state.playerInFloor.set(message, 4)
    })


    //离开只需要一个就行
    this.onMessage("levelFloor", (client: Client, message) => {
      //这里的离开指的是直接离开场景
      //删除元素在总人数数组
      var index = this.state.peopleNumber.totalPeopleArray.indexOf(message)
      this.state.peopleNumber.totalPeopleArray.splice(index, 1)
      //删除元素在楼层数组
      var floorNumber = this.state.playerInFloor.get(message)
      if (floorNumber == 1) {
        var index1 = this.state.peopleNumber.floorOnePeople.indexOf(message)
        //从数组中删除
        this.state.peopleNumber.floorOnePeople.splice(index1, 1)
      } else if (floorNumber == 2) {
        var index2 = this.state.peopleNumber.floorTwoPeople.indexOf(message)
        //从数组中删除
        this.state.peopleNumber.floorTwoPeople.splice(index2, 1)
      } else if (floorNumber == 3) {
        var index3 = this.state.peopleNumber.floorThreePeople.indexOf(message)
        //从数组中删除
        this.state.peopleNumber.floorThreePeople.splice(index3, 1)
      } else if (floorNumber == 4) {
        var index4 = this.state.peopleNumber.floorFourPeople.indexOf(message)
        //从数组中删除
        this.state.peopleNumber.floorFourPeople.splice(index4, 1)
      }
      //删除元素和楼层的索引关系
      this.state.playerInFloor.delete(message)
    })

    this.onMessage("toabc",(client:Client,message)=>{
      console.log("收到请求信息")
        var a = 10
        client.send("abc",a)
    })

    this.onMessage("postPlayerInfo", (client: Client, message) => {

      //获取userId
      var userId = this.state.users.get(client.sessionId)
      //拼接SQL
      var sql = "update player set ticketTwo=" + message.ticketTwo 
      + ",ticketThree=" + message.ticketThree 
      + ",ticketFour=" + message.ticketFour 
      + ",scoreA=" + message.scoreA
      + ",scoreB=" + message.scoreB
      + ",scoreC=" + message.scoreC 
      + ",scoreD=" + message.scoreD
      + ",levelTwo=" + message.levelTwo
      + ",levelThree=" + message.levelThree
      + ",floorTwoRemainTime=" + message.floorTwoRemainTime
      + " where userId='" + userId + "'"
      //查询SQL
      updatePlayer(sql)
    })



    // this.onMessage("updatePlayer",async(client:Client,message) => {
    //   var sql = "update player set scoreA = 10 where userId ='"+this.state.users.get(client.sessionId)+"'"
    //   const result = await updatePlayer(sql)
    // })

  }

  setUp() {
    this.broadcast("start");




  }

  async onJoin(client: Client, options: any) {
    // const user = new User().assign({
    //   userId: options.userData.userId || "0x"
    // });
    var userId = options.userData.userId
    this.state.users.set(client.sessionId, userId);

    //判断当前的玩家信息
    var isExit = await getPlayer(userId)
    if (isExit.length == 0) {
      //玩家没有在数据库
      console.log('玩家不在数据库')
      var player = new Player()
      player.userId = userId
      player.ticketTwo = 0
      player.ticketThree = 0
      player.ticketFour = 0
      player.scoreA = 0
      player.scoreB = 0
      player.scoreC = 0
      player.scoreD = 0
      player.levelTwo = 1
      player.levelThree = 1
      player.floorTwoRemainTime = 0

      //玩家数据添加到数据库
      let result = await setPlayer(player)

      //添加到状态表中
      this.state.players.set(userId, player)
    } else {
      console.log('玩家在数据库')
      let playerInDB = isExit[0]
      var player = new Player()
      player.userId = userId
      player.ticketTwo = playerInDB.ticketTwo
      player.ticketThree = playerInDB.ticketThree
      player.ticketFour = playerInDB.ticketFour
      player.scoreA = playerInDB.scoreA
      player.scoreB = playerInDB.scoreB
      player.scoreC = playerInDB.scoreC
      player.scoreD = playerInDB.scoreD
      player.levelTwo = playerInDB.levelTwo
      player.levelThree = playerInDB.levelThree
      player.floorTwoRemainTime = playerInDB.floorTwoRemainTime

      this.state.players.set(userId, player)
    }

    console.log(userId, "joined! => ", options.userData);
  }

  onLeave(client: Client, consented: boolean) {
    const userId = this.state.users.get(client.sessionId);
    // console.log(user.userId, "left!");
    this.state.users.delete(client.sessionId);
  }

  onDispose() {
    console.log("Disposing room...");
  }

}
