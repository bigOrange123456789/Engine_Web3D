import * as THREE from "three";
const Vector3=THREE.Vector3
const Spherical=THREE.Spherical
const Object3D=THREE.Object3D
class Enum{
    constructor(data){//["viewpoint","model"]
        this.data=data
        this.i=0
    }
    get(){
        return this.data[this.i]
    }
    equals(x){
        return x==this.data[this.i]
    }
    set(x){
        for(var i=0;i<this.data.length;i++)
            if(this.data[i]==x)
                this.i=i
    }
}
class PlayerControl{
    static getState(){
        const camera=window.camera
        console.log("camera.position.set("+camera.position.x+","+camera.position.y+","+camera.position.z+");camera.rotation.set("+camera.rotation.x+","+camera.rotation.y+","+camera.rotation.z+");")
    }
    enable=true//false//true
    constructor(camera,FlipY,constraint){
        window.getState=PlayerControl.getState
        this.target=new Vector3(0,0,0)
        this.up=new Vector3(0,1,0)
        // this.mode=mode//new Enum(["viewpoint","model"])
        //枚举变量 {0:"Centered on the viewpoint",  1:"Centered on the model"} //0 .equals("viewpoint")     1 .equals("model")
        //0是第一人称控制方式(相机中心) 1是场景中心控制方式(物体中心)
        // this.speed={
        //     moveBoard:0.05,//键盘控制下的视角移动速度(物体中心)
        //     moveDrag:0.01,//鼠标拖拽下的视角移动速度(物体中心)
        //     moveWheel0:0.001,//鼠标滚轮滚动下的视角移动速度(相机中心)
        //     moveWheel1:0.03,//鼠标滚轮滚动下的视角移动速度(物体中心)
        //     movePhone0:0.01,//手机双指下的前进后退速度(相机中心)
        //     movePhone1:0.05,//手机双指下的前进后退速度(物体中心)
        //     rotateMouse:0.08,//鼠标拖拽下的旋转速度
        //     rotatePhone:0.04//手机滑动下的旋转速度
        // }
        this.speed={
            moveBoard:5,//键盘控制下的视角移动速度(物体中心)
            moveDrag:0.1,//鼠标拖拽下的视角移动速度(物体中心)

            moveWheel0:1,//鼠标滚轮滚动下的视角移动速度(相机中心)
            moveWheel1:3,//鼠标滚轮滚动下的视角移动速度(物体中心)

            movePhone0:0.01,//手机双指下的前进后退速度(相机中心)
            movePhone1:0.05,//手机双指下的前进后退速度(物体中心)
            rotateMouse:0.001*0.5,//鼠标拖拽下的旋转速度
            rotatePhone:0.04//手机滑动下的旋转速度
        }
        this.speed={
            moveBoard:500,//键盘控制下的视角移动速度(物体中心)
            moveDrag:100,//鼠标拖拽下的视角移动速度(物体中心)

            moveWheel0:1,//鼠标滚轮滚动下的视角移动速度(相机中心)
            moveWheel1:3,//鼠标滚轮滚动下的视角移动速度(物体中心)

            movePhone0:10,//手机双指下的前进后退速度(相机中心)
            movePhone1:0.05,//手机双指下的前进后退速度(物体中心)
            rotateMouse:0.001,//0.004,//鼠标拖拽下的旋转速度
            rotatePhone:0.04//手机滑动下的旋转速度
        }
        const controller=new PlayerControl0(camera,this.speed,this.target,this.up,FlipY,constraint);
        this.mode=controller.mode
        const self=this
        function tool(){
            requestAnimationFrame(tool);
            if(self.enable)controller.update();
            controller.operating=self.enable
        }tool();
    }
}

class PlayerControl0{
    constructor(camera,speed,center,up,FlipY,constraint){
        this.FlipY=FlipY
        document.oncontextmenu = ()=>{return false}//关闭鼠标右键弹窗
        camera.getWorldDirection=()=>{//相机的初始方向是（0，0，-1）
            return new Vector3(
                camera.matrixWorld.elements[8]*-1,
                camera.matrixWorld.elements[9]*-1,
                camera.matrixWorld.elements[10]*-1
            )
        }
        camera.getLeftDirection=()=>{
            return new Vector3(//相机的左方向是（-1，0，0）
                camera.matrixWorld.elements[0]
                ,camera.matrixWorld.elements[1]
                ,camera.matrixWorld.elements[2])
        }

        this.speed=speed
        this.constraint=constraint//true
        this.camera=camera;
        this.center=center
        this.up=up
        this.mode=new Enum(["viewpoint","model"])//0是第一人称控制方式(相机中心) 1是场景中心控制方式(物体中心)
        // this.mode.set("model");
        this.operating = true

        this.onceClicked=false;
        this.dposition={
            left:0,
            forward:0,
            up:0
        }
        this.ableRotation=true;
        var scope=this
        //设置鼠标控制
        var myMouseManager=new MouseManager();
        myMouseManager.dragMouse=function (dx,dy) {
            scope.onceClicked=true;
            if(!scope.ableRotation||!scope.operating)return;
            if(myMouseManager.button===0||myMouseManager.button===2){//左键拖动或右键拖动
                scope.rotation1(-scope.speed.rotateMouse*dx);//水平拖动
                scope.rotation2(-scope.speed.rotateMouse*dy);//竖直拖动
            }else{//滚轮
                scope.move(0, scope.speed.moveDrag * dy, scope.speed.moveDrag * dx)
            }
        }
        myMouseManager.onMouseWheel=function(event){
            var delta = 0;
            if ( event.wheelDelta !== undefined )delta = event.wheelDelta;
            else if ( event.detail !== undefined )delta = - event.detail;
            scope.move(
                (scope.mode.equals("model")?scope.speed.moveWheel1:scope.speed.moveWheel0) 
                *delta,0,0)
        }
        //设置键盘控制
        var myKeyboardManager=new KeyboardManager();
        myMouseManager.init();
        var autoPath=[];
        myKeyboardManager.onKeyDown=function(event){
            if(event.key==="ArrowUp"||event.key==="w"||event.key==="W")scope.dposition.forward=1;//forward(step);
            else if(event.key==="ArrowDown"||event.key==="s"||event.key==="S")scope.dposition.forward=-1;//forward(-step);
            else if(event.key==="q"||event.key==="Q")scope.dposition.up=1;
            else if(event.key==="e"||event.key==="E")scope.dposition.up=-1;
            else if(event.key==="ArrowLeft"||event.key==="a"||event.key==="A")scope.dposition.left=1;
            else if(event.key==="ArrowRight"||event.key==="d"||event.key==="D")scope.dposition.left=-1;
            else if(event.key==="v"){
                var a=Math.floor(scope.camera.rotation.x*100000)/100000;
                var b=Math.floor(scope.camera.rotation.y*100000)/100000;
                var c=Math.floor(scope.camera.rotation.z*100000)/100000;
                var s="["+
                Math.floor(scope.camera.position.x*100)/100+","+
                Math.floor(scope.camera.position.y*100)/100+","+
                Math.floor(scope.camera.position.z*100)/100+","+
                a+","+
                b+","+
                c+",100]"
                console.log(","+s);
                autoPath.push(s);
            }else if(event.key==="V")alert(autoPath);
            scope.dposition.up=scope.dposition.up*(scope.FlipY?-1:1)
            scope.dposition.left=scope.dposition.left*(scope.FlipY?-1:1)

        }
        myKeyboardManager.onKeyUp=function(event){
            if(event.key==="ArrowUp"||event.key==="w"||event.key==="W")        scope.dposition.forward=0;//forward(step);
            else if(event.key==="ArrowDown"||event.key==="s"||event.key==="S") scope.dposition.forward=0;//forward(-step);
            else if(event.key==="q"||event.key==="Q")         scope.dposition.up=0;
            else if(event.key==="e"||event.key==="E")         scope.dposition.up=0;
            else if(event.key==="ArrowLeft"||event.key==="a"||event.key==="A") scope.dposition.left=0;
            else if(event.key==="ArrowRight"||event.key==="d"||event.key==="D")scope.dposition.left=0;
        }
        myKeyboardManager.init();

        //设置手机控制
        var myPhoneManager=new PhoneManager();
        myPhoneManager.drag=function(dx,dy){
            if(scope.operating){
                if(!scope.ableRotation)return;
                scope.rotation1(-scope.speed.rotatePhone*dx,scope.camera);
                scope.rotation2(-scope.speed.rotatePhone*dy,scope.camera);
            }
        }
        myPhoneManager.dragDouble=function(distanceChange){
            if(scope.operating)
                //scope.forward(distanceChange*scope.speed.movePhone,scope.camera)
                scope.move(
                    (scope.mode.equals("model")?scope.speed.movePhone1:scope.speed.movePhone0) 
                    *distanceChange,0,0)
        }
        myPhoneManager.init();
    }
    update() {//用于协助完成键盘移动控制
        if(this.mode.equals("viewpoint") ){//只在物体中心时执行
            var s=this.speed.moveBoard
            this.move(this.dposition.forward*s,this.dposition.up*s,this.dposition.left*s)
        }
    }
    rotation1(step){//偏航角
        if(this.mode.equals("viewpoint") ){
            var direction0=this.camera.getWorldDirection();
            var pos=this.camera.position;
            direction0.applyAxisAngle(this.up,step);
            this.camera.lookAt(
                pos.x+direction0.x,
                pos.y+direction0.y,
                pos.z+direction0.z);
            this.camera.updateMatrixWorld();
        }else{
            var pos0=this.camera.position.clone().sub(this.center)
			var spheric=new Spherical().setFromCartesianCoords(pos0.x,pos0.y,pos0.z)//将笛卡尔坐标转换为极坐标
			spheric.theta+=(step*0.1)
			var pos1=new Vector3().setFromSpherical( spheric )
			this.camera.position.copy(pos1.add(this.center))
			this.camera.lookAt(this.center)
            this.camera.updateMatrix();
        }
    }
    rotation2(step){//俯仰角
        if(this.mode.equals("viewpoint") ){
            var direction1=this.camera.getWorldDirection();
            var direction= new Vector3().crossVectors(direction1,this.up);
            var pos=this.camera.position;
            direction1.applyAxisAngle(direction,step);
            this.camera.lookAt(
                pos.x+direction1.x,
                pos.y+direction1.y,
                pos.z+direction1.z);
            this.camera.updateMatrix();
        }else{
            var pos0=this.camera.position.clone().sub(this.center)
			var spheric=new Spherical().setFromCartesianCoords(pos0.x,pos0.y,pos0.z)
			spheric.phi+=(step*0.1)
            spheric.makeSafe()
			var pos1=new Vector3().setFromSpherical( spheric )
			this.camera.position.copy(pos1.add(this.center))
			this.camera.lookAt(this.center)
        }
    }
    move(x,y,z){
        var scope=this
        if(this.constraint){//受到约束
            if(this.mode.equals("model")){//1是场景中心控制方式(物体中心)
                forward(x);
            }else{//0是第一人称控制方式(相机中心)
                up_constraint(y)
                left_constraint(z)   
                forward_constraint(x)
            }
        }else{//不受约束
            if(this.mode.equals("model")){//1是场景中心控制方式(物体中心)
                forward(x)
                //开始移动视点中心?
                var obj=new Object3D()
                obj.position.copy(this.center)
                up(y)
                up(y,obj)
                var pos0=this.camera.position.clone().sub(this.center)
                var spheric=new Spherical().setFromCartesianCoords(pos0.x,pos0.y,pos0.z)
                
                if(spheric.theta>-Math.PI/2&&spheric.theta<Math.PI/2){
                    left(z,obj)
                    left(z)
                }else{
                    left(-z,obj)
                    left(-z)
                }
                this.center.copy(obj.position)
                this.camera.lookAt(this.center)
                //完成移动视点中心
            }else{//0是第一人称控制方式(相机中心)
                up(y)
                left(z)  
                forward(x)
            }
        }

        function up(step,obj) {//向上运动
            if(!step)return
            if(typeof(obj)=="undefined")obj=scope.camera
            var direction =  new Vector3(//相机的上方向是（0，1，0）
                obj.matrixWorld.elements[4]
                ,obj.matrixWorld.elements[5]
                ,obj.matrixWorld.elements[6]
            )
            obj.position.add(new Vector3().addScaledVector(direction,step))
        }
        function forward(step,obj) {//向前运动
            if(!step)return
            if(typeof(obj)=="undefined")obj=scope.camera
            var direction =  new Vector3(//相机的初始方向是（0，0，-1）//对y旋转-90度后相机为水平方向camera.rotation.set(0,-Math.PI/2,0);
                obj.matrixWorld.elements[8]
                ,obj.matrixWorld.elements[9]
                ,obj.matrixWorld.elements[10])
            obj.position.add(new Vector3().addScaledVector(direction,-step))
        }
        function left(step,obj) {//向左运动
            if(!step)return
            if(typeof(obj)=="undefined")obj=scope.camera
            var direction =  new Vector3(//相机的左方向是（-1，0，0）
                obj.matrixWorld.elements[0]
                ,obj.matrixWorld.elements[1]
                ,obj.matrixWorld.elements[2])
            obj.position.add(new Vector3().addScaledVector(direction,-step))
        }
        function up_constraint(step,obj) {//向上运动
            if(!step)return
            if(typeof(obj)=="undefined")obj=scope.camera
            var direction =  new Vector3(0,step,0)//相机的上方向是（0，1，0）
            obj.position.add(direction)
        }
        function left_constraint(step,obj) {
            if(!step)return
            if(typeof(obj)=="undefined")obj=scope.camera
            var direction =  new Vector3(//相机的左方向是（-1，0，0）
                obj.matrixWorld.elements[0],0,obj.matrixWorld.elements[2]
            )
            if(scope.isCollision(-1.2*step,direction))return
            obj.position.add(new Vector3().addScaledVector(direction,-step))
        }
        function forward_constraint(step,obj) {
            if(!step)return
            if(typeof(obj)=="undefined")obj=scope.camera
            var direction =  new Vector3(//相机的初始方向是（0，0，-1）//对y旋转-90度后相机为水平方向camera.rotation.set(0,-Math.PI/2,0);
                obj.matrixWorld.elements[8],0,obj.matrixWorld.elements[10]
            )
            if(scope.isCollision(-step,direction))return
            obj.position.add(new Vector3().addScaledVector(direction,-step))
        }
    }
    isCollision(step,direction){//碰撞检测
        return false
        direction=direction.clone()
        const camera=this.camera
        const obstacles=Object.values(window.meshes)
        const speed=10*step;//>0?1400:-1400
        // console.log(speed,direction.x,direction.multiplyScalar(speed).x)
        // 定义一个Raycaster对象
        var raycaster = new THREE.Raycaster();

        // 计算相机移动的下一个位置
        var nextPosition = camera.position.clone().add(direction.multiplyScalar(speed));

        // 检测相机当前位置和下一个位置之间是否有障碍物
        raycaster.set(camera.position, nextPosition.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(obstacles);

        // 如果有障碍物，将相机移动到最近的障碍物表面
        if (intersects.length > 0) {
            var distance = intersects[0].distance;
            if (distance < Math.abs(speed)) {
                return true// camera.position.add(camera.getWorldDirection().multiplyScalar(distance));
            }
        } else {
            // camera.position.add(camera.getWorldDirection().multiplyScalar(speed));
        }
        // console.log(distance,speed)
        return false
    }
}
function MouseManager(){
    var scope=this;
    this.press=false;//鼠标未处于按下状态
    this.preX=-1;
    this.preY=-1;
    this.button=0//0左 1中 2右
    this.dragMouse=function(dx,dy){
        console.log(dx,dy);
    }
    this.onMouseMove=function( event ) {//鼠标移动事件监听
        if(scope.press&&scope.preX!==-1&&scope.preY!==-1)
            scope.dragMouse(event.x-scope.preX,event.y-scope.preY);
        scope.preX=event.x;
        scope.preY=event.y;
    }
    this.onMouseUp=function( event ) {//鼠标移动事件监听
        scope.press=false;
        //console.log(1);
    }
    this.onMouseDown=function( event ) {//鼠标移动事件监听
        scope.press=true
        scope.button=event.button
        if(window.myMoveManager)
            window.myMoveManager.stopFlag=true
        //console.log(2);
    }
    this.onMouseWheel=function(event){
        console.log(event);
    }
    this.init=function() {
        document.addEventListener( 'mousemove',event=>{
            if(!window.inPanel)scope.onMouseMove(event)
        }, true );
        document.addEventListener( 'mouseup', event=>{
            if(!window.inPanel)scope.onMouseUp(event)
        }, true );
        document.addEventListener( 'mousedown',event=>{
            if(!window.inPanel)scope.onMouseDown(event)
        }, true );
        document.addEventListener( 'mousewheel', event=>{
            if(!window.inPanel)scope.onMouseWheel(event)
        }, false );
    }
}
function KeyboardManager(){
    var scope=this;
    this.onKeyDown=function(event){
        console.log(event);
    }
    this.onKeyUp=function(event){
        console.log(event);
    }
    this.init=function(){
        window.addEventListener( 'keydown',scope.onKeyDown, false );
        window.addEventListener( 'keyup',scope.onKeyUp  , false );
    }
}
function PhoneManager(){
    var scope=this;
    this.preX=-1;
    this.preY=-1;
    this.preDistance=-1;
    this.drag=function(dx,dy){
        console.log(dx,dy);
    }
    this.dragDouble=function(distanceChange){
        console.log(distanceChange);
    }
    this.onTouchMove = function (event) {
        //event.touches.length//同时出现的触摸点个数
        if(event.touches.length===1){
            if(scope.preX>=0&&scope.preY>=0)
                scope.drag(
                    event.touches[ 0 ].pageX-scope.preX,
                    event.touches[ 0 ].pageY-scope.preY
                );
            scope.preX=event.touches[ 0 ].pageX;
            scope.preY=event.touches[ 0 ].pageY;
        }else if(event.touches.length===2){
            var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
            var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
            var distance = Math.sqrt( dx * dx + dy * dy );
            if(scope.preDistance>=0)
                scope.dragDouble(distance-scope.preDistance);
            scope.preDistance=distance;
        }
    }
    this.onTouchEnd=function () {
        scope.preX=-1;
        scope.preY=-1;
        scope.preDistance=-1;
    }
    this.init=function(){
        document.addEventListener( 'touchmove', scope.onTouchMove, false );
        document.addEventListener( 'touchend', scope.onTouchEnd, false );
    }
}
export{PlayerControl}
