export class P2P{
    open=true
    constructor(camera,detection){
        const scope=this
        this.pageId
        this.config={groupId:-1}
        this.detection=detection
        this.camera=camera
        this.parse=data=>console.log(data)
        this.socketURL=window.configALL.P2P.urlP2pControllerServer//"http://114.80.207.60:8011"//this.urlP2pServer
        console.log("this.socketURL",this.socketURL)
        const self=this
        if(this.open){
            this.geolocation(location=>{
                self.init_p2p_controller(self.socketURL,location)
            })
        }
        window.updateGroupId=(groupId)=>{
            scope.config.groupId=groupId
            scope.updateGroupId()
        }
    }
    geolocation(cb){
        cb(null);return
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function(r){
            const status=this.getStatus()
            let location
            if( status== BMAP_STATUS_SUCCESS){
                location= [r.point.lat,r.point.lng]
            }else {
                console.log('failed'+status)
                location= [31,121]//上海
            }
            if(cb)cb(location)
        },{enableHighAccuracy: true})        
    }
    init_p2p_controller(socketURL,location){
        console.log("location:",location)
        var scope=this
        var socket = io.connect(socketURL,{transports:['websocket','xhr-polling','jsonp-polling']})
        socket.emit('addUser',{
            feature:[scope.camera.position.x,scope.camera.position.y,scope.camera.position.z]
        })
        socket.on('userConfig',  data=> {
            scope.config=data
            // data.edgeIp="localhost"
            const edgeURL="http://"+data.edgeIp+":8011"
            scope.pageId=socket.id
            scope.socket = scope.init_p2p_edge(edgeURL)
        })
        socket.on('userConfigUpdate',  data=> {
            scope.config=data
            scope.updateGroupId()
        })
        setInterval(()=>{
            socket.emit('updateFeature',{
                feature:[scope.camera.position.x,scope.camera.position.y,scope.camera.position.z]
            })
        },10*1000)//每隔10s更新一次特征
    }
    updateGroupId(){
        if(typeof window.pathId!=="undefined")
            this.config.groupId=window.pathId
        else this.config.groupId=1000
        console.log(this.config.groupId)
        if(this.socket)
        this.socket.emit("pageConfig",{
            pageId:this.pageId,
            groupId:this.config.groupId
        })
    }
    init_p2p_edge(socketURL){
        var scope=this
        var socket = io.connect(socketURL,{transports:['websocket','xhr-polling','jsonp-polling']})
        socket.emit('pageId',this.pageId)
        socket.on('edge2client',  data=> {
            scope.parse(data)
        })
        socket.on('connect', () => {
            scope.socket=socket
            scope.updateGroupId()
            console.log('连接已建立');
            // 在连接建立后进行相关操作
        });
        socket.on('disconnect', () => {
            console.log('连接已断开');  
            // 在连接断开时进行相关操作
        });
        return socket
    }
    send(message){
        if(this.open&&this.socket){
            message.groupId=this.config.groupId
            this.socket.emit('client2edge',message)
        }
    }
}