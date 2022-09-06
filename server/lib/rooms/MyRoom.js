"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoom = void 0;
const colyseus_1 = require("colyseus");
const MyRoomState_1 = require("./MyRoomState");
const db_1 = require("../db");
class MyRoom extends colyseus_1.Room {
    onCreate(options) {
        this.setState(new MyRoomState_1.MyRoomState());
        // set-up the game!
        this.setUp();
        this.onMessage("getCurrentUserInfo", (client, message) => __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.getPlayer("ox");
            console.log(result);
        }));
    }
    setUp() {
        this.broadcast("start");
        // make sure we clear previous interval
        const cube = new MyRoomState_1.Cube();
        cube.x = 0;
        cube.y = 0;
        cube.z = 0;
        this.state.cube = cube;
        this.clock.clear();
    }
    onJoin(client, options) {
        const newPlayer = new MyRoomState_1.Player().assign({
            name: options.userData.displayName || "Anonymous"
        });
        this.state.players.set(client.sessionId, newPlayer);
        console.log(newPlayer.name, "joined! => ", options.userData);
    }
    onLeave(client, consented) {
        const player = this.state.players.get(client.sessionId);
        console.log(player.name, "left!");
        this.state.players.delete(client.sessionId);
    }
    onDispose() {
        console.log("Disposing room...");
    }
}
exports.MyRoom = MyRoom;
