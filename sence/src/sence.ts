import { Room } from "colyseus.js";
import * as utils from '@dcl/ecs-scene-utils'
import { getUserData, getUserPublicKey } from "@decentraland/Identity"
import { movePlayerTo } from '@decentraland/RestrictedActions'
import * as ui from '@dcl/ui-scene-utils'
import { getPlayersInScene } from "@decentraland/Players"
import { connect } from "./connection"
import { message } from "node_modules/@dcl/ui-scene-utils/dist/utils/default-ui-components";

function sence(room: Room) {

    //将room变量传递
    setRoom(room)

    //创建四层楼
    createFloor(room)

    //创建UI界面
    gameUI()

    //监听事件
    listen(room)

    //获取个人信息
    getPlayerInfo(room)

}

/*
    变量区
*/
//目标的加成装备
var targetWearable: string[] = ["urn:decentraland:off-chain:base-avatars:pride_tshirt", "urn:decentraland:off-chain:base-avatars:blue_tshirt"]

var room: Room

//用户的变量信息
var userId = ""
var scoreA = 0
var scoreB = 0
var scoreC = 0
var scoreD = 0
var ticketTwo = 0
var ticketThree = 0
var ticketFour = 0
var levelTwo = 0
var levelThree = 0
var wearables: string[] = []
var wearablesBonus: number = 0
//用户进入场景的权限时间
var floorTwoRemainTime: number
//在场景中的计时器
var timerInSence = new Entity()
var timerInSenceInterval: utils.Interval

function setTimerInSenceInterval() {
    var time = 24 * 3600 * 1000
    timerInSenceInterval = new utils.Interval(1000, () => {
        time -= 1000
        if (time == 0) {
            //从场景中移除
        }
    })
    timerInSence.addComponentOrReplace(timerInSenceInterval)
}


timerInSence.addComponentOrReplace

//在二楼的计时器
var timerInFloorTwo = new Entity()
var timerInFloorTwoInterval: utils.Interval

//游戏场景的变量信息
var floorOnePeople: String[] = []
var floorTwoPeople: String[] = []
var floorThreePeople: String[] = []
var floorFourPeople: String[] = []
var totalPeopleArray: String[] = []
var currentFloorPeople: String[] //用于判断当前楼层的人数，好计算可穿戴设备的加成

//UI的变量信息
var canvas = new UICanvas()
var shop = new UIImage(canvas, new Texture("images/btnShop1.png"))
var scoreText = new UIText(canvas)
var levelText = new UIText(canvas)
var userInfoText = new UIText(canvas)
var ticket2Text = new UIText(canvas)
var ticket3Text = new UIText(canvas)
var ticket4Text = new UIText(canvas)
var totalPeopleText = new UIText(canvas)
var floorPeopleText = new UIText(canvas)

var score = ""
var floorOnePeopleNumber = 0
var floorTwoPeopleNumber = 0
var floorThreePeopleNumber = 0
var floorFourPeopleNumber = 0
var floorNumber: number //记录目前的楼层
var level = 0
var scoreType: string


//加分计时器
var timer = new Entity()
var interval: utils.Interval


//创建面板
//UI面板
var shopPrompt = new ui.CustomPrompt(ui.PromptStyles.LIGHTLARGE, 800, 600, true)
var promptText1 = shopPrompt.addText("勇士，您当前拥有:A积分：" + scoreA + "    B积分：" + scoreB + "    C积分：" + scoreC + "    D积分：" + scoreD, 0, 120, Color4.Black(), 20)
var exitButton = shopPrompt.addButton("离开", 0, -180, () => { shopPrompt.hide() }, ui.ButtonStyles.RED)



var ticket2Icon = shopPrompt.addIcon("images/shipin.png", -200, 50, 80, 80, { sourceHeight: 75, sourceWidth: 75, sourceLeft: 0, sourceTop: 75 })
var promptText2 = shopPrompt.addText("二层入场时光卷轴\n售价:100A积分\n当前拥有数量：" + ticketTwo, -200, -50, Color4.Black(), 20)
var buyButton2 = shopPrompt.addButton("购买", -200, -120, () => {
    //购买发送购买的请求 后台进行扣分，然后将购买结果进行返回，并写入数据库，但是这样还是有可能造成服务器回应过慢导致卡分现象，所以现在本地进行减
    if (scoreA >= 100) {
        //分数减一
        scoreA -= 100
        scoreText.value = "分数" + scoreType + "：" + score
        //票数加一
        ticketTwo += 1
        ticket2Text.value = "二层B入场券数量：" + ticketTwo
        //发送到后台，再提交分数的信息和票数信息
        updatePromptText()
        postPlayerInfo()

    } else {
        ui.displayAnnouncement('勇士您的A积分不够，先获取A积分再来兑换时光卷哦!', 5, Color4.Red(), 30, true)
    }
    //shopPrompt.hide()

}, ui.ButtonStyles.DARK)

let ticket3Icon = shopPrompt.addIcon("images/shipin.png", 0, 50, 80, 80, { sourceHeight: 75, sourceWidth: 75, sourceLeft: 75, sourceTop: 75 })
let promptText3 = shopPrompt.addText("三层入场时光卷轴\n售价:100B积分\n当前拥有数量：" + ticketThree, 0, -50, Color4.Black(), 20)
let buyButton3 = shopPrompt.addButton("购买", 0, -120, () => {
    //购买发送购买的请求 后台进行扣分，然后将购买结果进行返回，并写入数据库，但是这样还是有可能造成服务器回应过慢导致卡分现象，所以现在本地进行减
    if (scoreB >= 100) {
        //分数减一
        scoreB -= 100
        scoreText.value = "分数" + scoreType + "：" + score
        //票数加一
        ticketThree += 1
        ticket3Text.value = "三层C入场券数量：" + ticketThree
        //发送到后台，再提交分数的信息和票数信息
        updatePromptText()
        postPlayerInfo()

    } else {
        ui.displayAnnouncement('勇士您的B积分不够，先获取B积分再来兑换时光卷哦!', 5, Color4.Red(), 30, true)
    }

}, ui.ButtonStyles.DARK)

let ticket4Icon = shopPrompt.addIcon("images/shipin.png", 200, 50, 80, 80, { sourceHeight: 75, sourceWidth: 75, sourceLeft: 225, sourceTop: 75 })
let promptText4 = shopPrompt.addText("四层入场时光卷轴\n售价:100C积分\n当前拥有数量：" + ticketFour, 200, -50, Color4.Black(), 20)
let buyButton4 = shopPrompt.addButton("购买", 200, -120, () => {
    //购买发送购买的请求 后台进行扣分，然后将购买结果进行返回，并写入数据库，但是这样还是有可能造成服务器回应过慢导致卡分现象，所以现在本地进行减
    if (scoreC >= 100) {
        //分数减一
        scoreC -= 100
        scoreText.value = "分数" + scoreType + "：" + score
        //票数加一
        ticketFour += 1
        ticket3Text.value = "四层D入场券数量：" + ticketFour
        //发送到后台，再提交分数的信息和票数信息
        updatePromptText()
        postPlayerInfo()

    } else {
        ui.displayAnnouncement('勇士您的C积分不够，先获取C积分再来兑换时光卷哦!', 5, Color4.Red(), 30, true)
    }
}, ui.ButtonStyles.DARK)

shopPrompt.background.width = 800
shopPrompt.background.height = 600
shopPrompt.background.source = new Texture("images/zs.png")
shopPrompt.background.sourceLeft = 0
shopPrompt.background.sourceTop = 0
shopPrompt.background.sourceHeight = 494
shopPrompt.background.sourceWidth = 890

var toFloorTwoPrompt: any

//P2P数据传输
var p2pTransform = new MessageBus()



//更新面板上的信息，只有当点击商店的时候的时候进行更新
function updatePromptText() {
    promptText1.text.value = "勇士，您当前拥有:A积分：" + scoreA + "    B积分：" + scoreB + "    对应等级：" + scoreC + "    D积分：" + scoreD
    promptText2.text.value = "二层入场时光卷轴\n售价:100A积分\n当前拥有数量：" + ticketTwo
    promptText3.text.value = "三层入场时光卷轴\n售价:100B积分\n当前拥有数量：" + ticketThree
    promptText4.text.value = "四层入场时光卷轴\n售价:100C积分\n当前拥有数量：" + ticketFour
    toFloorTwoPrompt.text.value = '勇士，您是否使用一张B入场券进入二层，当前使用B入场券有效期为' + (1 + (levelTwo - 1) * 1) + '天\n目前拥有B入场券数量：' + ticketTwo
}

//传递room
function setRoom(_room: Room) {
    room = _room
}

//墙体
const materialWall = new Material()
materialWall.albedoColor = new Color4(0.7, 0.6, 0.2, 0.5)

//墙柱
const materialWallPost = new Material()
materialWallPost.albedoColor = new Color4(1, 1, 1, 1)

//创建墙体
function spawnWall(x: number, y: number, z: number, r: number, floor: Entity) {
    let wall = new Entity()
    wall.addComponent(new Transform({ position: new Vector3(x, y, z), scale: new Vector3(4.8, 6, 0.2), rotation: Quaternion.Euler(0, r, 0) }))
    wall.addComponent(new BoxShape())
    wall.addComponent(materialWall)
    wall.setParent(floor)
    return wall
}

//创建墙柱
function spawnWallPost(x: number, y: number, z: number, floor: Entity) {
    let wallPost = new Entity()
    wallPost.addComponent(new Transform({ position: new Vector3(x, y, z), scale: new Vector3(0.4, 6, 0.4) }))
    wallPost.addComponent(new BoxShape())
    wallPost.addComponent(materialWallPost)
    wallPost.setParent(floor)

    return wallPost
}

//创建地板的方块
function spawnFloor(x: number, y: number, z: number, floor: Entity, materialCube: Material) {
    // create the entity
    let cube = new Entity()
    cube.addComponent(new Transform({ position: new Vector3(x, y, z), scale: new Vector3(16, 0.2, 16) }))
    cube.addComponent(new BoxShape())
    cube.addComponent(materialCube)
    cube.setParent(floor)
    return cube
}

//按钮创建
function createFloorButton(floorNumber: number, buttonColor: string, floor: Entity): Entity {
    //创建一个实体
    //顺序按照蓝 绿 红 排序
    //蓝色的x坐标为2.8 8 13.2  Z默认为15.8 y坐标为 2 8.2 14.4

    var button = new Entity()
    button.setParent(floor)
    var transform = new Transform()
    if (floorNumber == 1) {
        transform.position.y = 2
    } else if (floorNumber == 2) {
        transform.position.y = 8.2
    } else if (floorNumber == 3) {
        transform.position.y = 14.4
    }

    if (buttonColor == "blue") {
        transform.position.x = 2.8
        button.addComponentOrReplace(new GLTFShape("glb/Blue_Button.glb"))
    } else if (buttonColor == "green") {
        transform.position.x = 8
        button.addComponentOrReplace(new GLTFShape("glb/Green_Button.glb"))
    } else if (buttonColor == "red") {
        transform.position.x = 13.2
        button.addComponentOrReplace(new GLTFShape("glb/Red_Button.glb"))
    }
    transform.position.z = 15.8
    transform.scale = new Vector3(2, 2, 2)
    transform.rotation = Quaternion.Euler(-90, 0, 0)

    button.addComponent(transform)
    return button

}


function createFloorOne(floor: Entity, room: Room, materialCube: Material) {

    //创建门  门的尺寸应该是高4米  宽2米 宽0.3米
    let door = new Entity()
    door.setParent(floor)
    door.addComponentOrReplace(new Transform({ position: new Vector3(10.4, 0.2, 0.3), scale: new Vector3(2.4, 1.5, 1) }))
    let doorShape = new GLTFShape("glb/LEDGridDoorframe.glb")
    door.addComponentOrReplace(doorShape)

    //创建进入二楼的按钮
    var blueButton = createFloorButton(1, "blue", floor)
    blueButton.addComponent(
        new OnPointerDown(
            (e) => {
                toFloorTwo()
            },
            { button: ActionButton.POINTER, showFeedback: true, hoverText: "点击进入二层" }
        )
    )

    var greenButton = createFloorButton(1, "green", floor)
    greenButton.addComponent(
        new OnPointerDown(
            (e) => {
                test()
            },
            { button: ActionButton.POINTER, showFeedback: true, hoverText: "点击进入三层" }
        )
    )

    var redButton = createFloorButton(1, "red", floor)
    redButton.addComponent(
        new OnPointerDown(
            (e) => {

            },
            { button: ActionButton.POINTER, showFeedback: true, hoverText: "点击进入四层" }
        )
    )

    //第一层
    spawnWallPost(0.2, 3.2, 0.2, floor)
    spawnWallPost(5.4, 3.2, 0.2, floor)
    spawnWallPost(0.2, 3.2, 5.4, floor)
    spawnWallPost(10.6, 3.2, 0.2, floor)
    spawnWallPost(0.2, 3.2, 10.6, floor)
    spawnWallPost(15.8, 3.2, 0.2, floor)
    spawnWallPost(0.2, 3.2, 15.8, floor)

    spawnWallPost(5.4, 3.2, 15.8, floor)
    spawnWallPost(10.6, 3.2, 15.8, floor)
    spawnWallPost(15.8, 3.2, 15.8, floor)
    spawnWallPost(15.8, 3.2, 5.4, floor)
    spawnWallPost(15.8, 3.2, 10.6, floor)

    spawnWall(2.8, 3.2, 0.1, 0, floor)
    spawnWall(0.1, 3.2, 2.8, 90, floor)
    // const wall3 = spawnWall(8,3.2,0.1,0)
    spawnWall(0.1, 3.2, 8, 90, floor)
    spawnWall(13.2, 3.2, 0.1, 0, floor)
    spawnWall(0.1, 3.2, 13.2, 90, floor)

    spawnWall(2.8, 3.2, 15.9, 0, floor)
    spawnWall(15.9, 3.2, 2.8, 90, floor)
    spawnWall(8, 3.2, 15.9, 0, floor)
    spawnWall(15.9, 3.2, 8, 90, floor)
    spawnWall(13.2, 3.2, 15.9, 0, floor)
    spawnWall(15.9, 3.2, 13.2, 90, floor)

    spawnFloor(8, 0.1, 8, floor, materialCube)

    //设置进入一楼的标题
    scoreType = "A"
    floorNumber = 1


    //加分逻辑 假设60秒钟加1分，那么0.1秒加1/60/10分
    //基础分
    var addScoreA = 10
    interval = new utils.Interval(1000, () => {
        scoreA += addScoreA * (1 + wearablesBonus)
        score = scoreA.toFixed(3) //截取小数点后3位
        scoreText.value = "分数" + scoreType + "：" + score
    })
    timer.addComponentOrReplace(interval)
}

//创建二层
function createFloorTwo(x: number, floor: Entity, materialCube: Material) {
    spawnWallPost(0.2, 3.2 + 6.2 * (x - 1), 0.2, floor)
    spawnWallPost(5.4, 3.2 + 6.2 * (x - 1), 0.2, floor)
    spawnWallPost(0.2, 3.2 + 6.2 * (x - 1), 5.4, floor)
    spawnWallPost(10.6, 3.2 + 6.2 * (x - 1), 0.2, floor)
    spawnWallPost(0.2, 3.2 + 6.2 * (x - 1), 10.6, floor)
    spawnWallPost(15.8, 3.2 + 6.2 * (x - 1), 0.2, floor)
    spawnWallPost(0.2, 3.2 + 6.2 * (x - 1), 15.8, floor)

    spawnWallPost(5.4, 3.2 + 6.2 * (x - 1), 15.8, floor)
    spawnWallPost(10.6, 3.2 + 6.2 * (x - 1), 15.8, floor)
    spawnWallPost(15.8, 3.2 + 6.2 * (x - 1), 15.8, floor)
    spawnWallPost(15.8, 3.2 + 6.2 * (x - 1), 5.4, floor)
    spawnWallPost(15.8, 3.2 + 6.2 * (x - 1), 10.6, floor)

    spawnWall(2.8, 3.2 + 6.2 * (x - 1), 0.1, 0, floor)
    spawnWall(0.1, 3.2 + 6.2 * (x - 1), 2.8, 90, floor)
    spawnWall(8, 3.2 + 6.2 * (x - 1), 0.1, 0, floor)
    spawnWall(0.1, 3.2 + 6.2 * (x - 1), 8, 90, floor)
    spawnWall(13.2, 3.2 + 6.2 * (x - 1), 0.1, 0, floor)
    spawnWall(0.1, 3.2 + 6.2 * (x - 1), 13.2, 90, floor)

    spawnWall(2.8, 3.2 + 6.2 * (x - 1), 15.9, 0, floor)
    spawnWall(15.9, 3.2 + 6.2 * (x - 1), 2.8, 90, floor)
    spawnWall(8, 3.2 + 6.2 * (x - 1), 15.9, 0, floor)
    spawnWall(15.9, 3.2 + 6.2 * (x - 1), 8, 90, floor)
    spawnWall(13.2, 3.2 + 6.2 * (x - 1), 15.9, 0, floor)
    spawnWall(15.9, 3.2 + 6.2 * (x - 1), 13.2, 90, floor)
    spawnFloor(8, 0.1 + 6.2 * (x - 1), 8, floor, materialCube)
}

//创建三层
function createFloorThree(x: number, floor: Entity, materialCube: Material) {
    spawnWallPost(0.2, 3.2 + 6.2 * (x - 1), 0.2, floor)
    spawnWallPost(5.4, 3.2 + 6.2 * (x - 1), 0.2, floor)
    spawnWallPost(0.2, 3.2 + 6.2 * (x - 1), 5.4, floor)
    spawnWallPost(10.6, 3.2 + 6.2 * (x - 1), 0.2, floor)
    spawnWallPost(0.2, 3.2 + 6.2 * (x - 1), 10.6, floor)
    spawnWallPost(15.8, 3.2 + 6.2 * (x - 1), 0.2, floor)
    spawnWallPost(0.2, 3.2 + 6.2 * (x - 1), 15.8, floor)

    spawnWallPost(5.4, 3.2 + 6.2 * (x - 1), 15.8, floor)
    spawnWallPost(10.6, 3.2 + 6.2 * (x - 1), 15.8, floor)
    spawnWallPost(15.8, 3.2 + 6.2 * (x - 1), 15.8, floor)
    spawnWallPost(15.8, 3.2 + 6.2 * (x - 1), 5.4, floor)
    spawnWallPost(15.8, 3.2 + 6.2 * (x - 1), 10.6, floor)

    spawnWall(2.8, 3.2 + 6.2 * (x - 1), 0.1, 0, floor)
    spawnWall(0.1, 3.2 + 6.2 * (x - 1), 2.8, 90, floor)
    spawnWall(8, 3.2 + 6.2 * (x - 1), 0.1, 0, floor)
    spawnWall(0.1, 3.2 + 6.2 * (x - 1), 8, 90, floor)
    spawnWall(13.2, 3.2 + 6.2 * (x - 1), 0.1, 0, floor)
    spawnWall(0.1, 3.2 + 6.2 * (x - 1), 13.2, 90, floor)

    spawnWall(2.8, 3.2 + 6.2 * (x - 1), 15.9, 0, floor)
    spawnWall(15.9, 3.2 + 6.2 * (x - 1), 2.8, 90, floor)
    spawnWall(8, 3.2 + 6.2 * (x - 1), 15.9, 0, floor)
    spawnWall(15.9, 3.2 + 6.2 * (x - 1), 8, 90, floor)
    spawnWall(13.2, 3.2 + 6.2 * (x - 1), 15.9, 0, floor)
    spawnWall(15.9, 3.2 + 6.2 * (x - 1), 13.2, 90, floor)
    spawnFloor(8, 0.1 + 6.2 * (x - 1), 8, floor, materialCube)
}


//创建四层
function createFloorFour(x: number, floor: Entity, materialCube: Material) {

    spawnFloor(8, 0.1 + 6.2 * (x - 1), 8, floor, materialCube)

}

/*
    创建场景
*/
function createFloor(room: Room) {
    //创建四层楼层
    let floorOne = new Entity()
    let floorTwo = new Entity()
    let floorThree = new Entity()
    let floorFour = new Entity()

    engine.addEntity(floorOne)
    engine.addEntity(floorTwo)
    engine.addEntity(floorThree)
    engine.addEntity(floorFour)

    //一楼创建墙体 墙柱 地板
    //地板
    var materialCube1 = new Material()
    var myTexture1 = new Texture("images/floor2.jpg")
    materialCube1.albedoTexture = myTexture1
    createFloorOne(floorOne, room, materialCube1)

    //二楼创建墙体 墙柱 地板
    var materialCube2 = new Material()
    var myTexture2 = new Texture("images/floor2.jpg")
    materialCube2.albedoTexture = myTexture2
    createFloorTwo(2, floorTwo, materialCube2)

    //三楼创建墙体 墙柱 地板
    var materialCube3 = new Material()
    var myTexture3 = new Texture("images/floor2.jpg")
    materialCube3.albedoTexture = myTexture3
    createFloorThree(3, floorThree, materialCube3)

    //四楼
    var materialCube4 = new Material()
    var myTexture4 = new Texture("images/floor2.jpg")
    materialCube4.albedoTexture = myTexture4
    createFloorFour(4, floorThree, materialCube4)

}


/*
    UI上的全局变量
*/

function gameUI() {

    //创建得分的text文本和设置文本内容
    scoreText.value = "分数" + scoreType + "：" + score
    scoreText.fontSize = 20
    scoreText.hAlign = "center"
    scoreText.vAlign = "top"
    scoreText.positionX = "35%"
    scoreText.positionY = "10%"

    //创建用户ID的text文本和设置文本内容

    userInfoText.value = "玩家ID：" + userId
    userInfoText.fontSize = 20
    userInfoText.hAlign = "center"
    userInfoText.vAlign = "top"
    userInfoText.positionX = "-30%"
    userInfoText.positionY = "10%"


    ticket2Text.value = "二层B入场券数量：" + ticketTwo
    ticket2Text.fontSize = 20
    ticket2Text.hAlign = "center"
    ticket2Text.vAlign = "top"
    ticket2Text.positionX = "-30%"
    ticket2Text.positionY = "5%"


    ticket3Text.value = "三层C入场券数量：" + ticketThree
    ticket3Text.fontSize = 20
    ticket3Text.hAlign = "center"
    ticket3Text.vAlign = "top"
    ticket3Text.positionX = "-30%"
    ticket3Text.positionY = "0%"


    ticket4Text.value = "四层D入场券数量：" + ticketFour
    ticket4Text.fontSize = 20
    ticket4Text.hAlign = "center"
    ticket4Text.vAlign = "top"
    ticket4Text.positionX = "-30%"
    ticket4Text.positionY = "-5%"

    //玩家等级
    levelText.value = "玩家等级：" + level
    levelText.fontSize = 20
    levelText.hAlign = "center"
    levelText.vAlign = "top"
    levelText.positionX = "-30%"
    levelText.positionY = "-10%"

    //总人数

    totalPeopleText.value = "总人数：" + totalPeopleArray.length
    totalPeopleText.fontSize = 20
    totalPeopleText.hAlign = "center"
    totalPeopleText.vAlign = "top"
    totalPeopleText.positionX = "35%"
    totalPeopleText.positionY = "5%"

    //楼层人数

    floorPeopleText.value = "楼层人数\n一楼人数：" + floorOnePeopleNumber +
        "\n二楼人数：" + floorTwoPeopleNumber +
        "\n三楼人数：" + floorThreePeopleNumber +
        "\n四楼人数：" + floorFourPeopleNumber
    floorPeopleText.fontSize = 20
    floorPeopleText.hAlign = "center"
    floorPeopleText.vAlign = "top"
    floorPeopleText.positionX = "35%"
    floorPeopleText.positionY = "-20%"

    //商店图片

    shop.name = "shop"
    shop.width = "100px"
    shop.height = "60px"
    shop.sourceWidth = 211
    shop.sourceHeight = 128
    shop.positionX = "-45%"
    shop.positionY = "13%"
    shop.isPointerBlocker = true
    shop.onClick = new OnClick(() => {
        // DO SOMETHING
        //  log('当前时间戳',new Date().getTime())
        updatePromptText()
        shopPrompt.show()
    })

}

function listen(room: Room) {
    //监听玩家进入场景
    onEnterSceneObservable.add((player) => {
        //回调参数是玩家信息，监听是谁进入了游戏场景，只有调用了getSenceInfo才会出现调用的信息
        log("玩家进入场景", player.userId)
        if (player.userId == userId) {
            room.send("toFloorOne", userId)
        }
        //这个是替代方法，在本地直接加，因为将玩家进入场景的信息发送到服务器，再由服务器推送给其他的玩家会有延迟
        //那么当监听到用户进入场景了，那么直接在本地加，后期服务上的数据过来了再复制也是相同的值
        floorOnePeople.push(player.userId)
        floorOnePeopleNumber = floorOnePeople.length

        currentFloorPeople = floorOnePeople
        //更新场景信息
        getSenceInfo(room)

        //开启计分
        engine.addEntity(timer)
        //刷新加成信息
        getWearablesBonus()

        //开启计时
        engine.addEntity(timerInSence) //进入场景开启

    })
    //监听玩家离开场景
    onLeaveSceneObservable.add(async (player) => {
        log("玩家离开场景", player.userId)
        if (player.userId == userId) {
            room.send("levelFloor", userId)
        }
        //减少用户
        //这里本来发送了levelFloor就会去刷新每层楼和总人数信息的，但是因为webscoekt太慢
        //而楼层的人数会影响到装备的加层，但是后期UI会更新和楼层人数会更新，
        //楼层的人数这里取的还是之前的值，所以要手动更新一下
        //但是这里不知道是从哪层楼离开的，解决办法，用变量记录楼层号
        var index = totalPeopleArray.indexOf(userId)
        totalPeopleArray.splice(index, 1)
        if (floorNumber == 1) {
            var index = floorOnePeople.indexOf(player.userId)
            floorOnePeople.splice(index, 1)
            floorOnePeopleNumber--
            currentFloorPeople = floorOnePeople
        } else if (floorNumber == 2) {
            var index = floorTwoPeople.indexOf(player.userId)
            floorTwoPeople.splice(index, 1)
            floorTwoPeopleNumber--
            currentFloorPeople = floorTwoPeople
        } else if (floorNumber == 3) {
            var index = floorThreePeople.indexOf(player.userId)
            floorThreePeople.splice(index, 1)
            floorThreePeopleNumber--
            currentFloorPeople = floorThreePeople
        } else if (floorNumber == 4) {
            var index = floorFourPeople.indexOf(player.userId)
            floorFourPeople.splice(index, 1)
            floorFourPeopleNumber--
            currentFloorPeople = floorFourPeople
        }


        //刷新UI信息
        getSenceInfo(room)
        //关闭计分
        engine.removeEntity(timer)
        //刷新加成信息
        getWearablesBonus()
        //提交积分信息
        postPlayerInfo()
    })

    //监听场景信息发生改变
    room.onMessage("senceInfo", (message) => {
        log("服务器发来的场景信息", message)
        floorOnePeople = message.floorOnePeople
        floorTwoPeople = message.floorTwoPeople
        floorThreePeople = message.floorThreePeople
        floorFourPeople = message.floorFourPeople
        totalPeopleArray = message.totalPeopleArray
        gameUI()
    })



    //监听用户的可穿戴设备发生改变
    onProfileChanged.add((profileData) => {
        if (profileData.ethAddress === userId) {
            log("触发可穿戴设备更换方法")
            executeTask(async () => {
                let userData = await getUserData()
                if (userData?.avatar.wearables != undefined) {
                    wearables = userData?.avatar.wearables
                    getWearablesBonus()
                } else {
                    log("可穿戴设备获取失败")
                }
            })
        }

    })

    room.onMessage("PlayerInfo", (message) => {

        userId = message.userId
        scoreA = message.scoreA
        scoreB = message.scoreB
        scoreC = message.scoreC
        scoreD = message.scoreD

        ticketTwo = message.ticketTwo
        ticketThree = message.ticketThree
        ticketFour = message.ticketFour

        levelTwo = message.levelTwo
        levelThree = message.levelThree
        floorTwoRemainTime = message.floorTwoRemainTime

        score = scoreA.toString()
        gameUI()
    })

    p2pTransform.on("toFloorTwo", (info: any) => {
        /*
            这里为延迟的WebSocket做补充
            测试方式，使用彩虹tshirt进入二楼，一个人的时候没有分数加倍，
            两个人的时候有分数加倍
        */
        //P2P方法info.userId, info.floorNumber
        if (info.floorNumber == 1) {
            var index = floorOnePeople.indexOf(info.userId)
            floorOnePeople.splice(index, 1)
            floorOnePeopleNumber--
        } else if (info.floorNumber == 3) {
            var index = floorThreePeople.indexOf(info.userId)
            floorThreePeople.splice(index, 1)
            floorThreePeopleNumber--
        } else if (info.floorNumber == 4) {
            var index = floorFourPeople.indexOf(info.userId)
            floorFourPeople.splice(index, 1)
            floorFourPeopleNumber--
        }
        floorTwoPeople.push(info.userId)
        floorTwoPeopleNumber++
        //刷新加成信息
        getWearablesBonus()
    })

}

//获取玩家个人信息
function getPlayerInfo(room: Room) {
    executeTask(async () => {
        let userData = await getUserData()
        if (userData?.avatar.wearables != undefined) {
            wearables = userData?.avatar.wearables
        } else {
            log("可穿戴设备获取失败")
        }
    })
    room.send("getPlayerInfo")


}

//进入场景 连接到服务器 离开场景断开服务器
function getSenceInfo(room: Room) {
    log("向服务器获取场景信息")
    room.send("getSenceInfo")
}

//获取加层
function getWearablesBonus() {
    log("可穿戴设备", wearables)
    var floorPeople =
        wearablesBonus = 0
    //穿彩虹Tshirt，前面的人数为奇数时+100%，位于目标可穿戴设备的第一位
    //穿蓝色Tshirt,前面的人数为偶数时+50%，位于目标可穿戴设备的第二位
    for (let i = 0; i < targetWearable.length; i++) {
        if (-1 != wearables.indexOf(targetWearable[0])) {
            //判断人数，因为两个属于统一属性的东西，只能穿一件，所以发现一个就可以break了,后续还要判断不同类型的可穿戴设备
            wearablesBonus = floorPeople % 2 == 1 ? 1 : 0
            break
        } else if (-1 != wearables.indexOf(targetWearable[1])) {
            wearablesBonus = floorPeople % 2 == 0 ? 0.5 : 0
            break
        }
    }
    log("场景人数", floorPeople)
}

function postPlayerInfo() {
    var player = {
        ticketTwo: ticketTwo,
        ticketThree: ticketThree,
        ticketFour: ticketFour,
        scoreA: scoreA,
        scoreB: scoreB,
        scoreC: scoreC,
        scoreD: scoreD,
        levelTwo: levelTwo,
        levelThree: levelThree,
        floorTwoRemainTime: floorTwoRemainTime
    }

    room.send("postPlayerInfo", player)
}


// function addScoreFunction(){
//     interval = new utils.Interval(500,()=>{
//         score += 0.2
//         scoreText.value = "分数："+score
//     })
//     timer.addComponentOrReplace(interval)
// }

//定时器 24小时使玩家离开场景
// function levelTimer(long:number){
//     //定时器在用户离开场景的时候取消，用户进入场景或者切换楼层的时候进行更新,以毫秒为单位
//     timerInSence =
// }


//这个方法用来设置面板消息
function toFloorTwo() {

    //如果进入二楼有剩余时间，那么就直接进入
    if (floorTwoRemainTime > new Date().getTime()) {
        log("进入二楼有剩余时间")
        //移动到二楼
        moveToFloorTwo()
        //开启计时器，如果到时间了就踢出
        engine.addEntity(timerInFloorTwo) //进入二楼开启
        var time = floorTwoRemainTime - new Date().getTime()
        timerInFloorTwoInterval = new utils.Interval(1000, () => {
            time -= 1000
            if (time < 0) {
                //从场景中移除
                log("时间到，从二楼移除")
            }
        })
        timerInSence.addComponentOrReplace(timerInSenceInterval)
    } else {
        toFloorTwoPrompt = new ui.OptionPrompt(
            '进入二楼场景',
            '勇士，您是否使用一张B入场券进入二层，当前使用B入场券有效期为' + (1 + (levelTwo - 1) * 1) + '天\n目前拥有B入场券数量：' + ticketTwo,
            () => {

                if (floorTwoRemainTime > new Date().getTime()) {
                    log('进入二楼有剩余时间')
                    //有剩余时间就进入二楼
                    //如果剩余的时间太少，最好还是判断一下,比如小于10000毫秒就询问是否需要买票
                    // if(floorTwoRemainTime < 10000){

                    // }
                    //进入二楼
                    moveToFloorTwo()
                    // //开启计时器
                    timerInFloorTwo.addComponentOrReplace(
                        new utils.Delay(floorTwoRemainTime, () => {
                            //事件到了就踢出游戏
                            log("时间到时间到")
                        })
                    )

                } else {
                    //没有剩余时间,再判断卷的数量是否够用
                    log('进入二楼没有剩余时间')
                    if (ticketTwo > 0) {
                        ticketTwo--;
                        //刷新UI内容
                        ticket2Text.value = "二层B入场券数量：" + ticketTwo
                        //更新Prompt的信息
                        updatePromptText()
                        //更新时间信息
                        // floorTwoRemainTime += ((1 + (levelTwo - 1) * 1) * 24 * 3600 * 1000)

                        floorTwoRemainTime = new Date().getTime() + ((1 + (levelTwo - 1) * 1) * 20 * 1000)
                        //更新用户的信息
                        postPlayerInfo()
                        //进入二楼
                        timerInFloorTwo.addComponentOrReplace(
                            new utils.Delay(floorTwoRemainTime, () => {
                                //事件到了就踢出游戏
                                log('激活二楼计时器')
                                log("时间到时间到")
                            })
                        )

                    } else {
                        ui.displayAnnouncement('勇士您当前没有B入场券，先获取B入场券才能进入二层哦!', 5, Color4.Red(), 30, true)
                    }
                }
            }
        )
    }




    // let toFloorTwoPrompt = new ui.OptionPrompt(
    //     '进入二楼场景',
    //     '勇士，您是否使用一张B入场券进入二层，当前使用B入场券有效期为' + (1 + (levelTwo - 1) * 1) + '天\n目前拥有B入场券数量：' + ticketTwo,
    //     () => {
    //         //先判断入场券是否有剩余时间
    //         if (floorTwoRemainTime > new Date().getTime()) {
    //             log('进入二楼有剩余时间')
    //             //有剩余时间就进入二楼
    //             //如果剩余的时间太少，最好还是判断一下,比如小于10000毫秒就询问是否需要买票
    //             // if(floorTwoRemainTime < 10000){

    //             // }
    //             //进入二楼
    //             moveToFloorTwo()
    //             // //开启计时器
    //             timerInFloorTwo.addComponentOrReplace(
    //                 new utils.Delay(floorTwoRemainTime,()=>{
    //                     //事件到了就踢出游戏
    //                     log("时间到时间到")
    //                 })
    //             )

    //         } else {
    //             //没有剩余时间,再判断卷的数量是否够用
    //             log('进入二楼没有剩余时间')
    //             if(ticketTwo > 0){
    //                 ticketTwo--;
    //                 //刷新UI内容
    //                 ticket2Text.value = "二层B入场券数量：" + ticketTwo
    //                 //更新Prompt的信息
    //                 updatePromptText()
    //                 //更新时间信息
    //                 // floorTwoRemainTime += ((1 + (levelTwo - 1) * 1) * 24 * 3600 * 1000)

    //                 floorTwoRemainTime = new Date().getTime()+  ((1 + (levelTwo - 1) * 1) * 20 * 1000)
    //                 //更新用户的信息
    //                 postPlayerInfo()
    //                 //进入二楼
    //                 timerInFloorTwo.addComponentOrReplace(
    //                     new utils.Delay(floorTwoRemainTime,()=>{
    //                         //事件到了就踢出游戏
    //                         log('激活二楼计时器')
    //                         log("时间到时间到")
    //                     })
    //                 )

    //             }else{
    //                 ui.displayAnnouncement('勇士您当前没有B入场券，先获取B入场券才能进入二层哦!', 5, Color4.Red(), 30, true)
    //             } 
    //         }

    //     },
    //     () => {
    //         //使用成功
    //     },
    //     '确定',
    //     '取消'
    // )
    // toFloorTwoPrompt.hide()
}



function moveToFloorTwo() {


    //开启自己的加分及时器
    //获取玩家位置，当升至二楼的时候，玩家的x,z坐标不变，Y轴坐标升高
    var playerPostion = Camera.instance.position
    //变换玩家的位置
    playerPostion.y = 9
    movePlayerTo(playerPostion)

    //向服务器发送进入二层的信息 
    room.send("toFloorTwo")

    //这时候需要发送请求的服务器通知当前玩家进入了二楼，玩家之前楼层人数减少1
    //二楼楼层人数加1
    if (floorNumber == 1) {
        //从1楼进入2楼
        //一楼人数减少，二楼人数增加
        var index = floorOnePeople.indexOf(userId)
        floorOnePeople.splice(index, 1)
        floorOnePeopleNumber--
    } else if (floorNumber == 3) {
        //从3楼进入2楼
        var index = floorThreePeople.indexOf(userId)
        floorThreePeople.splice(index, 1)
        floorThreePeopleNumber--
    } else if (floorNumber == 4) {
        //从4楼进入2楼
        var index = floorFourPeople.indexOf(userId)
        floorFourPeople.splice(index, 1)
        floorFourPeopleNumber--
    }
    //传递用户进入二楼之前所在楼层以及用户的id
    p2pTransform.emit("toFloorTwo", { userId: userId, floorNumber: floorNumber })
    //二楼人数增加
    // floorTwoPeople.push(userId)
    // floorTwoPeopleNumber++
    //UI面板分数和楼层人数都需要变换
    score = scoreB.toString()
    scoreType = "B"
    //等级变化
    level = levelTwo
    //属性变化
    floorNumber = 2
    //当前的楼层的玩家用户就变成了二楼的玩家用户
    currentFloorPeople = floorTwoPeople
    //timer发生修改


}

function test() {
    //测试
    log('二楼票的数量', ticketTwo)
}


export { sence }