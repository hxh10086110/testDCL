"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoomState = exports.Cube = exports.Player = void 0;
const schema_1 = require("@colyseus/schema");
class Player extends schema_1.Schema {
}
__decorate([
    schema_1.type("string")
], Player.prototype, "name", void 0);
exports.Player = Player;
class Cube extends schema_1.Schema {
}
__decorate([
    schema_1.type("number")
], Cube.prototype, "x", void 0);
__decorate([
    schema_1.type("number")
], Cube.prototype, "y", void 0);
__decorate([
    schema_1.type("number")
], Cube.prototype, "z", void 0);
exports.Cube = Cube;
class MyRoomState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.players = new schema_1.MapSchema();
        this.cube = new Cube();
    }
}
__decorate([
    schema_1.type({ map: Player })
], MyRoomState.prototype, "players", void 0);
__decorate([
    schema_1.type(Cube)
], MyRoomState.prototype, "cube", void 0);
exports.MyRoomState = MyRoomState;