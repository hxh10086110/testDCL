import { Schema, Context, ArraySchema, MapSchema, type } from "@colyseus/schema";

//玩家类
export class Player extends Schema {
  @type("number") id:number ;
  @type("string") userId:string;
  @type("number") ticketTwo:number;
  @type("number") ticketThree:number;
  @type("number") ticketFour:number;
  @type("number") scoreA:number;
  @type("number") scoreB:number;
  @type("number") scoreC:number;
  @type("number") scoreD:number;
  @type("number") levelTwo:number;
  @type("number") levelThree:number;
  @type("number") floorTwoRemainTime:number;
}

// var floorOnePeople: String[] = []
// var floorTwoPeople: String[] = []
// var floorThreePeople: String[] = []
// var floorFourPeople: String[] = []
// var totalPeopleArray: String[] = []

export class PeopleNumber extends Schema{
  @type(["string"])floorOnePeople:string[] = []
  @type(["string"])floorTwoPeople:string[] = []
  @type(["string"])floorThreePeople:string[] = []
  @type(["string"])floorFourPeople:string[] = []
  @type(["string"])totalPeopleArray:string[] = []
}

//服务器上连接的用户类
// export class User extends Schema{
//   @type("string") userId:string
// }




export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: "string" }) users = new MapSchema<string>();
  @type(PeopleNumber) peopleNumber = new PeopleNumber();
  @type({map:"number"}) playerInFloor = new MapSchema<number>();
}
