import * as THREE from "three"
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
export class ControlEdit{
    type="horizontal"//"rotation"//"vertical"   //[horizontal vertical rotation]、[水平移动 竖直移动 旋转]
    constructor(camera,renderer,objects,orbitControls,downFun,moveFun){
        this.camera=camera
        this.renderer=renderer
        this.objects=objects
        this.orbitControls=orbitControls//当鼠标位于控制面板之上的时候不进行检测
        this.downFun=downFun//选中控制函数
        this.moveFun=moveFun//移动拖拽函数
        this.#checkOnPanel()
        this.#checkDrag(this.objects)
        
    }
    #checkDrag(objects){
        const self=this
        const orbitControls=this.orbitControls
        let ac,//当前活动对象
            plane,//平移平面由活动对象初始位置和当前相机方向向量确定
            startPosition,//目标位置,使用终末位置计算平移量，当然也可以使用递增量
            startMouseWorldPosition,//拖动起始点射线与平移平面的交点
            // endMouseWorldPosition;//拖动结束点射线与平移平面的交点
            mousePre//鼠标上一时刻的位置
    
        const camera=this.camera
        function screenToWorld(offsetX, offsetY) {
            let x = (offsetX / window.innerWidth) * 2 - 1,
              y = -(offsetY / window.innerHeight) * 2 + 1;
            let raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
            return raycaster;
        }
        this.renderer.domElement.addEventListener('mousedown', function (e) {
            mousePre=[e.clientX, e.clientY]
            //鼠标落点处创建射线
            let raycaster = screenToWorld(e.clientX, e.clientY);
            //获取射线经过的在指定范围内的物体集合
            let intersect = raycaster.intersectObjects(objects);
            if (intersect.length > 0) {
              ac = intersect[0].object;
              if(self.downFun)self.downFun(ac)
              //创建经过物体中心点的垂直于相机方向的平面
              plane = new THREE.Plane();
              if(self.type=="vertical")camera.getWorldDirection(plane.normal)
              else if(self.type=="horizontal")plane.normal.set(0,1,0)//
              if(self.type=="horizontal"||self.type=="vertical"){
                plane.setFromNormalAndCoplanarPoint(plane.normal, ac.position);
                //如果使用世界原点构建平面会导致物体位移和鼠标位移不对等，应该使用物体的初始位置中心作为视角切面平面
                startMouseWorldPosition = new THREE.Vector3();
                raycaster.ray.intersectPlane(plane, startMouseWorldPosition);
                //备份物体初始点
                startPosition = ac.position.clone();
              }
              
            }
          });
        this.renderer.domElement.addEventListener('mousemove', function (e) {
            if (ac) {
                if(orbitControls)orbitControls.enabled=false
              e.preventDefault();
              e.stopPropagation();
              //鼠标移动点处创建射线
              if(self.type=="horizontal"||self.type=="vertical"){
                let raycaster = screenToWorld(e.clientX, e.clientY);
                let endMouseWorldPosition = new THREE.Vector3();
                //目标点射线与平移平面的焦点即为平移目标点
                raycaster.ray.intersectPlane(plane, endMouseWorldPosition);
                //计算平移向量
                let addVector3 = endMouseWorldPosition.sub(startMouseWorldPosition);
                let target = startPosition.clone().add(addVector3).clone();
                ac.position.copy(target)
                if(self.moveFun)self.moveFun(ac)
              }else if(self.type=="rotation"){
            // console.log("test")
                // e.clientX-mousePre[0]
                console.log(ac)
                const r=ControlEdit.rotation(
                    [ac.rotation.x,ac.rotation.y,ac.rotation.z],
                    [0,e.clientX-mousePre[0],0]
                )
                // ac.rotation.set(r[0],r[1],r[2])
                console.log(r[0],r[1],r[2])
                mousePre=[e.clientX, e.clientY]
              }
              
            }else{
                if(orbitControls)orbitControls.enabled=true
            }
          });
        this.renderer.domElement.addEventListener('mouseup', function (e) {
            ac = false
          })
          
    }
    #checkDragOld(objects){
        const orbitControls=this.orbitControls
        const self=this
        createDragControls(objects)
        function createDragControls(objects) {
            // 初始化拖拽控件
            var dragControls = new DragControls(objects, camera, renderer.domElement);

            // 鼠标略过事件
            dragControls.addEventListener('hoveron', function (event) {
                console.log("createDragControls hoveron");
                // 让变换控件对象和选中的对象绑定
            });

            // 开始拖拽
            dragControls.addEventListener('dragstart', function (event) {
                console.log("createDragControls dragstart");
                orbitControls.enabled = false;
            });

            // 拖拽过程
            dragControls.addEventListener('drag', function (event) {
                // console.log("createDragControls drag",event);
                const obj=event.object
                const id=obj.name
                if(window.avatar){
                    // obj.position.y=window.avatar.crowd.getPosition(id)[1]+1.6
                    window.avatar.crowd.setPosition(id,[
                        obj.position.x,
                        obj.position.y-1.6,//+3.85,
                        obj.position.z,
                    ])  
                    window.avatar.crowd.update()
                }

                // dragControlsRender();
            });

            // 拖拽结束
            dragControls.addEventListener('dragend', function (event) {
                console.log("createDragControls dragend");
                orbitControls.enabled = true;
            });
        }
    }
    onPanel=false//鼠标是否位于控制面板上
    #checkOnPanel(){
        const self=this
        if(document.getElementsByClassName('lil-gui allow-touch-styles root autoPlace').length>1)
        document.getElementsByClassName('lil-gui allow-touch-styles root autoPlace')[0].onclick=()=>{
            self.onPanel=true
        }
    }
    static rotation(rot,absAngle){
        console.log(rot,absAngle)
        const o = new THREE.Object3D()
        o.rotation.set(rot[0],rot[1],rot[2])
        o.updateMatrix() 
        o.matrix.multiply(new THREE.Matrix4().makeRotationX(absAngle[0]));
        o.matrix.multiply(new THREE.Matrix4().makeRotationY(absAngle[1]));
        o.matrix.multiply(new THREE.Matrix4().makeRotationZ(absAngle[2]));
        const pos=new THREE.Vector3()
        const qua=new THREE.Quaternion()
        const sca=new THREE.Vector3()
        o.matrix.decompose ( pos, qua, sca ) 
        console.log("qua",qua)
        return qua
    }
}