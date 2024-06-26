import * as THREE from "three";
export {MoveManager};
class MoveManager{
    speed=2*50;
    clock=new THREE.Clock()//.getElapsedTime()
    avatar;
    roamPath;
    myPreviewflag;//确定目标节点
    stopFlag;//控制是否开始移动
    isLoop;//如果不进行循环漫游的话，第一行的初始状态就没用了
    finishCb=()=>{}

    myMakeOneRoamStep=new MakeOneRoamStep();
    constructor(avatar,roamPath){
        var scope=this;
        scope.avatar=avatar;
        scope.roamPath=roamPath;
        scope.myPreviewflag=1;//确定目标节点
        scope.stopFlag=true;//false;//
        scope.isLoop=true;//false;//如果不进行循环漫游的话，第一行的初始状态就没用了

        scope.myMakeOneRoamStep=new MakeOneRoamStep();
        this.#autoRoam();//创建后自动执行
    }
    #autoRoam=function () {
        var scope=this;
        let timepre=scope.clock.getElapsedTime()
        let speed0=scope.speed*0.01
        autoRoam0();
        function autoRoam0(){
            const dt=0.01//scope.clock.getElapsedTime()-timepre
            speed0=0.6*speed0+0.4*scope.speed*dt
            if(!scope.stopFlag)//是否停止自动漫游
                if(scope.myMakeOneRoamStep.preview(scope.myPreviewflag,scope.avatar,scope.roamPath,speed0)) {
                    scope.myPreviewflag++;
                    if(scope.myPreviewflag=== scope.roamPath.length){
                        scope.myPreviewflag = 1;
                        if(!scope.isLoop) scope.stopFlag=true;
                        scope.finishCb()
                    }
                }
            // console.log(scope.clock.getElapsedTime()-timepre)
            timepre=scope.clock.getElapsedTime()
            requestAnimationFrame(autoRoam0);
        }
    }
    static getArray=function(arr1){//通过平面位置获取输入数据
        //arr1:  x,z
        //arr2:  x,y,z,  a,b,c, time
        var arr2=[];
        var time=400;
        arr2.push([
            arr1[0][0],0,arr1[0][1],
            0,0,0,
            time
        ]);
        for(var i=1;i<arr1.length;i++){
            arr2.push([
                arr1[i][0],0,arr1[i][1],
                0,Math.atan2(

                    (arr1[i][0]-arr1[i-1][0]),
                    (arr1[i][1]-arr1[i-1][1])
                ),0,
                time
            ]);
        }
        return arr2;
    }
    getStartPos(){
        const mystate=this.myPreviewflag-1
        if(mystate>=this.roamPath.length)mystate=0
        if(mystate<0)mystate=this.roamPath.length-1
        return this.roamPath[mystate]
    }
    joinPath(){//切换路径
        const self=this
        self.stopFlag=true
        const endpos=this.getStartPos()
        const camera=this.avatar
        const move0=new MoveManager(camera, [
          [
            camera.position.x,camera.position.y,camera.position.z,
            camera.rotation.x,camera.rotation.y,camera.rotation.z,10
          ],
          [endpos[0],endpos[1],endpos[2],endpos[3],endpos[4],endpos[5],10]
        ])
        move0.isLoop=false
        move0.finishCb=()=>{
          self.stopFlag=false
        }
        move0.stopFlag=false
    }
}
class MakeOneRoamStep{
    pattern;
    rectify;//记录这是第几步//第一步更新参数，最后一步纠正状态
    stepIndex_max;

    targetStatus;//目标状态

    dx;dy;dz;//一步的位移

    q1;q2;qt;

    constructor(){
        var scope=this;
        scope.rectify=true;//
        scope.stepIndex=1;//记录这是第几步//第一步更新参数，最后一步纠正状态
    }
    #updateParam=function(x1,y1,z1,x2,y2,z2,a1,b1,c1,a2,b2,c2,time){
        var scope=this;

        scope.dx=(x2-x1)/time;
        scope.dy=(y2-y1)/time;
        scope.dz=(z2-z1)/time;

        scope.q1=euler2quaternion(a1,b1,c1);
        scope.q2=euler2quaternion(a2,b2,c2);

        scope.qt=scope.stepIndex/scope.stepIndex_max;

        function euler2quaternion(x,y,z) {
            var euler=new THREE.Euler(x,y,z, 'XYZ');
            var quaternion=new THREE.Quaternion();
            quaternion.setFromEuler(euler);
            return quaternion;
        }
        scope.targetStatus=[x2,y2,z2,a2,b2,c2];
    }
    #initParam=function(x1,y1,z1,x2,y2,z2,a1,b1,c1,a2,b2,c2,time){
        this.stepIndex_max=time;
        this.#updateParam(x1,y1,z1,x2,y2,z2,a1,b1,c1,a2,b2,c2,time);
    }
    preview=function(mystate,avatar,mydata,speed){//thisObj,time,myavatar,k//thisObj,x1,y1,z1,x2,y2,z2,time,myavatar,k
        var scope=this;
        var x1,y1,z1,x2,y2,z2,//位置
            a1,b1,c1,a2,b2,c2;//角度//a=c

        if(mystate>=mydata.length)return;
        var time=mydata[mystate][6]/speed;
        //当前状态
        x1=avatar.position.x;
        y1=avatar.position.y;
        z1=avatar.position.z;
        a1=avatar.rotation.x;
        b1=avatar.rotation.y;
        c1=avatar.rotation.z;
        //目标状态
        x2=mydata[mystate][0];
        y2=mydata[mystate][1];
        z2=mydata[mystate][2];
        a2=mydata[mystate][3];
        b2=mydata[mystate][4];
        c2=mydata[mystate][5];

        if(scope.stepIndex===1){//新的阶段
            scope.#initParam(x1,y1,z1,x2,y2,z2,a1,b1,c1,a2,b2,c2,time);
        }else if(scope.rectify){//如果有路径纠正功能
            scope.#updateParam(x1,y1,z1,x2,y2,z2,a1,b1,c1,a2,b2,c2,time-scope.stepIndex+1);
        }
        return movetoPos(avatar,scope);
        function movetoPos(avatar,scope){//移动
            if(scope.stepIndex<scope.stepIndex_max){
                avatar.position.x+=scope.dx;
                avatar.position.y+=scope.dy;
                avatar.position.z+=scope.dz;

                avatar.quaternion.x=scope.q1.x;
                avatar.quaternion.y=scope.q1.y;
                avatar.quaternion.z=scope.q1.z;
                avatar.quaternion.w=scope.q1.w;

                avatar.quaternion.slerp (scope.q2, scope.qt);
                scope.stepIndex++;
                return false;
            }else{
                avatar.position.set(scope.targetStatus[0],scope.targetStatus[1],scope.targetStatus[2]);
                avatar.rotation.set(scope.targetStatus[3],scope.targetStatus[4],scope.targetStatus[5]);
                scope.stepIndex=1;
                return true;
            }
        }
    }
}
