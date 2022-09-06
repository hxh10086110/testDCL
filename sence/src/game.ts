import * as utils from '@dcl/ecs-scene-utils'
import { getUserData } from "@decentraland/Identity"
import { movePlayerTo } from '@decentraland/RestrictedActions'
import * as ui from '@dcl/ui-scene-utils'
import { getPlayersInScene } from "@decentraland/Players"
import { connect } from "./connection"
import {sence} from "./sence"
connect("my_room").then((room) => {
    //初始化四层楼
    sence(room)
})