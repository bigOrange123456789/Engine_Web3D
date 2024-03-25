export class Detection {//需要服务器
    constructor(meshes) {
        this.config=window.configALL.Detection
        this.updateGroupList=[]
        this.meshes=meshes
        window.meshes=meshes
        this.demandResponseDelay={}

        this.dectionURL=this.config.urlDetectionServer
        // if(!this.config.Detection)return
        this.date=this.getTime()
        // this.time0=performance.now()
        // this.

        this.count_pack_p2p=0//P2P加载数量
        this.count_pack_server=0//服务器获取数量

        this.count_pack_request={
            "glb":0,
            "zip":0
        }
        this.plumpness={
            sum:0,
            num:0
        }

        this.count_mesh_p2p=0
        this.count_mesh_server=0
        
        this.close=false
        this.pack_circumstances={}
        
        const scope=this
        this.testTime=this.config.testTime//90//60//window.param.testTime;//测试时间
        this.frameCount=0;//记录帧数量
        function testFrame(){
            scope.frameCount++
            scope.recordPlumpness()
            requestAnimationFrame(testFrame);
        }testFrame()
        setTimeout(()=>{
            console.log("end")
            scope.finish()
        },scope.testTime*1000)//},100)//
        window.getTimeList=()=>{
            const config=scope.getTimeList()
            window.save(config,"result_n"+window.NUMBER+"t"+window.TIME0+".json")
            // window.save(config,"result.json")
        }
        window.getAllMapSize=()=>{scope.getAllMapSize()}
    }
    getAllMapSize(){
        const getMapSize=mesh=>{
            if(!mesh)return 0
            const map=mesh.lod[1].material.map
            if(!map)return 0
            else return map.image.height*map.image.width
        }
        const list={}
        for(let id in this.meshes){
            list[id]=getMapSize(this.meshes[id])
        }
        this.saveJson(list,"mapSize.json")
    }
    recordPlumpness(){
        let s=document.getElementById("plumpness").innerHTML
        if(s!==""){
            let s2=s.split(":")[1].split("%")[0]
            this.plumpness.num++
            this.plumpness.sum+=parseFloat(s2)
        }
    }
    request(type){
        this.count_pack_request[type]++
    }
    updateGroup(groupid){
        this.updateGroupList.push([
            groupid,
            this.getTime()
        ])
    }
    getTime(){
        return [
            new Date().getMonth(),
            new Date().getDate(),
            new Date().getHours(),//
            new Date().getSeconds(),//1
            new Date().getMilliseconds(),
            new Date().getMinutes(),//新添加
        ]
    }
    getLoadDelay(){
        let delay=0
        let delayMax=0
        let count=0
        for(let id in this.meshes){
            const mesh=this.meshes[id]
            if(mesh.originType!=="edgeP2P"){//延迟只统计通过Server获取的
                if(mesh.LoadDelay>delayMax){
                    delayMax=mesh.LoadDelay
                }
                delay+=mesh.LoadDelay
                count++
            }
        }
        return {
            "ave":delay/count,
            "max":delayMax,
            "count":count
        }
    }
    getDemandResponseDelay(){
        let delay=0
        let delayMax=0
        let count=0
        let count_preLoad_used  =0
        let count_preLoad_noUsed=0
        for(let id in this.meshes){
            const mesh=this.meshes[id]
            if(this.demandResponseDelay[id]){
                // if(mesh.originType==originType){//延迟只统计通过Server获取的
                let delay0=mesh.delay["parsed"]-this.demandResponseDelay[id].start
                if(delay0<=0){
                    delay0=0
                    count_preLoad_used++
                }
                if(delay0>delayMax) delayMax=delay0
                delay+=delay0
                count++
            }else{
                count_preLoad_noUsed++
            }
            
            // }
            // console.log(id,mesh.delay["parsed"],this.demandResponseDelay[id].start,delay)
        }
        return {
            "ave":delay/count,
            "max":delayMax,
            "count":count,
            "count_preLoad_used":count_preLoad_used,
            "count_preLoad_noUsed":count_preLoad_noUsed
        }
    }
    getTimeList(){
        const config={}
        for(let id in this.meshes){
            const mesh=this.meshes[id]
            config[id]=mesh.config0
        }
        return config
    }
    getDelay(delayType,originType){
        let delay=0
        let delayMax=0
        let count=0
        for(let id in this.meshes){
            const mesh=this.meshes[id]
            if(mesh.originType==originType){//延迟只统计通过Server获取的
                const delay0=mesh.delay[delayType]
                if(delay0>delayMax){
                    delayMax=delay0
                }
                delay+=delay0
                count++
            }
        }
        return {
            "ave":delay/count,
            "max":delayMax,
            "count":count
        }
    }
    receivePack(type){
        if(type=="p2p")this.count_pack_p2p++
        else if(type=="server")this.count_pack_server++
        else console.log("error:receivePack type")
    }
    receiveMesh(mesh){
        if(mesh.originType=="centerServer")this.count_mesh_server++
        else if(mesh.originType=="edgeP2P")this.count_mesh_p2p++
        // else console.log("error:mesh.originType",mesh.myId)
    }
    addDemand(list){
        // this.demandResponseDelay={}
        for(let i=0;i<list.length;i++){
            const meshId=list[i]
            if(!this.demandResponseDelay[meshId]){
                this.demandResponseDelay[meshId]={start:performance.now()}
                if(this.meshes[meshId])this.demandResponseDelay[meshId]["end"]=performance.now()
            }
        }
    }
    count_mesh_p2p_NotUsed(){
        let count=0
        for(let id in this.meshes){
            const mesh=this.meshes[id]
            if(mesh.originType=="edgeP2P"&&!mesh.used)
                count++
        }
        return count
    }
    count_mesh_server_NotUsed(){
        let count=0
        for(let id in this.meshes){
            const mesh=this.meshes[id]
            if(mesh.originType=="centerServer"&&!mesh.used)
                count++
        }
        return count
    }
    getDeviceModel(){
        let userAgent = navigator.userAgent
        let webLog = {
            userAgent:userAgent,
            isPhone:navigator.userAgent.split("Mobile").length>1,
            wechat:null,
            device:null,//'iPad' 'iPhone' Android
            system:null,
        }
        // 获取微信版本
        let m1 = userAgent.match(/MicroMessenger.*?(?= )/)
        if (m1 && m1.length > 0) {
            webLog.wechat = m1[0]
        }
        // 苹果手机
        if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
            // 获取设备名
            if (userAgent.includes('iPad')) {
                webLog.device = 'iPad'
            } else {
                webLog.device = 'iPhone'
            }
            // 获取操作系统版本
            m1 = userAgent.match(/iPhone OS .*?(?= )/)
            if (m1 && m1.length > 0) {
                webLog.system = m1[0]
            }
        }
        // 安卓手机
        if (userAgent.includes('Android')) {
            // 获取设备名
            m1 = userAgent.match(/Android.*; ?(.*(?= Build))/)
            if (m1 && m1.length > 1) {
                webLog.device = m1[1]
            }
            // 获取操作系统版本
            m1 = userAgent.match(/Android.*?(?=;)/)
            if (m1 && m1.length > 0) {
                webLog.system = m1[0]
            }
        }
        return webLog
    }
    finish(){
        if(!this.config.open)return
        // alert(746487)
        const self=this
        this.close=true
        var data={
            updateGroupList:this.updateGroupList,

            count_pack_request:this.count_pack_request,

            count_pack_p2p  :this.count_pack_p2p,
            count_pack_server:this.count_pack_server,

            count_mesh_p2p  :this.count_mesh_p2p,
            count_mesh_server:this.count_mesh_server,

            count_mesh_p2p_NotUsed:this.count_mesh_p2p_NotUsed(),
            count_mesh_server_NotUsed:this.count_mesh_server_NotUsed(),

            loadDelay:this.getLoadDelay(),
            delay:{
                load:this.getDelay("load","centerServer"),
                forward:this.getDelay("forward","centerServer"),
                parse:this.getDelay("parse","centerServer"),
                parse_edgeP2P:this.getDelay("parse","edgeP2P"),
                demandResponse:this.getDemandResponseDelay(),
            },

            frameCount:this.frameCount,//测试所用的帧数
            testTime:this.testTime,//测试时间
            config:this.config,
            
            url:window.location.href,//地址以及参数
            date:this.date,         //测试日期
            useP2P:window.useP2P,

            plumpness:this.plumpness,//饱满度

            deviceModel:this.getDeviceModel(),//获取设备型号
        }
        console.log(data)
        var oReq = new XMLHttpRequest();
        oReq.open("POST", self.dectionURL, true);
        oReq.responseType = "arraybuffer";
        oReq.onload = function () {//接收数据
            var unitArray=new Uint8Array(oReq.response) //网络传输基于unit8Array
            var str=String.fromCharCode.apply(null,unitArray)//解析为文本
            console.log(str)
            if(self.config.backURL!==null)
                    location.href=self.config.backURL
            else alert("测试完成，感谢您的配合！")
            // window.location.href="https://smart3d.tongji.edu.cn/cn/index.htm"
            //window.opener = null;//为了不出现提示框
            // window.close();//关闭窗口//完成测试，关闭窗口
            // window.location.href="http://58.34.91.211:28081/?scene=KaiLiNan&useP2P=true&useP2P=true&needDetection=true&onlyP2P=true"
        };
        setTimeout(()=>{
            oReq.send(JSON.stringify(data));//返回实验结果
        },Math.random()*self.config.maxBackDelay*1000)
        // setTimeout(()=>{
        //     oReq.send(JSON.stringify(data));//返回实验结果
        // },100)
    }
    saveJson(data,name){
        const jsonData = JSON.stringify(data)
        const myBlob = new Blob([jsonData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(myBlob)
        link.download = name
        link.click()
    }
}