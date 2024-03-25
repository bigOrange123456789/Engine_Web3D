import * as THREE from "three";
import { BVHTree } from "./BVH";
export class CrowdLod {
    open=true//是否开启LOD功能
    needWander=false//当需要自动漫游的时候，不再等到相机移动结束才更新
    bvhOpen=true;//false;//默认使用八叉树
    radius = 1//1000//0.6//1 //化身包围球的最大半径
    cameraStatePre = ""//上一次更新的时候相机的状态
    cameraStatePreFrame = ""//上一帧相机的状态
    constructor(opt) {
        let crowd
        if(typeof(opt.crowd)=="undefined"){//如果只传入了一个参数
            crowd=opt
        }else{//如果传入了一组参数
            crowd=opt.crowd
            for(let i in opt)
                for(let tag of ["open","bvhOpen","radius","needWander"])//实时进行LOD刷新，使用八叉树，包围球半径
                    if(i==tag)
                        this[i]=opt[i]
        }
        this.refreshUnit=crowd
        this.crowd = crowd;
        this.countAll = crowd.count
        // console.log(this.crowd)
        // 构建bvh
        this.bvh = null;
        this.camera = crowd.camera;

        this.lod_distance = crowd.lod_distance//[15,25,50,75,100]//2000,10000
        this.lod_distance_max = this.lod_distance[this.lod_distance.length - 1]
        this.lod_distanceSqua = []
        for (let i = 0; i < this.lod_distance.length; i++) {
            this.lod_distanceSqua.push(
                Math.pow(this.lod_distance[i], 2)
            )
        }
        console.log(this.lod_distanceSqua)
        this.frustum = new THREE.Frustum()
        setTimeout(()=>{
           CrowdLod.frustumCulling(this)//启动遮挡剔除 
        },3000)
        
        // window.test=()=>{
        //     CrowdLod.frustumCulling(scope)
        // }
        var scope = this
        window.addEventListener('resize', () => {
            scope.cameraStatePre = ""
        }, false)
    }
    getCameraState() {
        var p = this.camera.position
        var r = this.camera.rotation
        return p.x + "," + p.y + "," + p.z + ","
            + r.x + "," + r.y + "," + r.z
    }

    AABBDect(frustum, aabbBox) {
        for (let i = 0; i < frustum.planes.length; i++) {
            let p = new THREE.Vector3(aabbBox.min.x,aabbBox.min.y,aabbBox.min.z);
            if (frustum.planes[i].normal.x >= 0) p.x = aabbBox.max.x;
            if (frustum.planes[i].normal.y >= 0) p.y = aabbBox.max.y;
            if (frustum.planes[i].normal.z >= 0) p.z = aabbBox.max.z;
            // let n = new THREE.Vector3(aabbBox.max.x,aabbBox.max.y,aabbBox.max.z);
            // if (frustum.planes[i].normal.x >= 0) n.x = aabbBox.min.x;
            // if (frustum.planes[i].normal.x >= 0) n.y = aabbBox.min.y;
            // if (frustum.planes[i].normal.x >= 0) n.z = aabbBox.min.z;
            let nt = (frustum.planes[i].normal.x * p.x) + (frustum.planes[i].normal.y * p.y) + (frustum.planes[i].normal.z * p.z);
            if (nt < -frustum.planes[i].constant) {
                return false
            }
        }
        return true;
    }

    TraverseBVH(root, frustum, Array) {
        // console.log("TraverseBVH");
        if (!this.AABBDect(frustum, root.aabbbox)) {
            return null;
        }
        let stack = []
        stack.push(root);
        while (stack.length > 0) {
            root = stack.pop()
            if (root.prev != null && this.AABBDect(frustum, root.prev.aabbbox)) {
                stack.push(root.prev)
            }
            if (root.next != null && this.AABBDect(frustum, root.next.aabbbox)) {
                stack.push(root.next);
            }
            if (root.prev == null && root.next == null) {
                for (let i=0;i<root.contentArray.length; i++) {
                    Array.push(root.contentArray[i]);
                }
            }
        }
    }

    static frustumCullingOld(scope) { //每帧执行一次
        // let startTime = Date.now();
        var cameraState = scope.getCameraState()
        // if (cameraState == scope.cameraStatePreFrame&&scope.open)//相机停止了运动 且系统启动LOD功能
        if (scope.open)//系统启动LOD功能
          if (cameraState !== scope.cameraStatePre) {//如果先将状态发生了改变
            if(scope.bvhOpen){
            // if (true)
            //     if (true) {
                // 更新视锥体
                let matrix = new THREE.Matrix4().multiplyMatrices(scope.camera.projectionMatrix, scope.camera.matrixWorldInverse);
                scope.frustum.setFromProjectionMatrix(matrix);
                for (let i = 0; i < scope.countAll; i++) {//遍历所有化身的位置
                    if (scope.crowd.lodList[i] == -2) continue//lodList==-2指的是始终不显示这个化身
                    else scope.crowd.lodList[i] = -1
                }
                let p0 = scope.crowd.getPosition(0)
                if (scope.bvh == null && (p0[0]!= 0 || p0[1] != 0 || p0[2] != 0)) {
                    console.log("build BVH");
                    scope.bvh = BVHTree(scope.crowd, scope.radius);
                    // console.log(scope.bvh)
                }
                // 确定BVH的可视性
                var arrayList = []
                if (scope.bvh != null) scope.TraverseBVH(scope.bvh, scope.frustum, arrayList)
                // console.log(arrayList)
                for (let i = 0; i < arrayList.length; i++) {
                    let p = scope.crowd.getPosition(arrayList[i])
                    let point = new THREE.Vector3(p[0], p[1], p[2]);
                    var s = camera.position.clone().sub(point)
                    if (//距离非常远，lod精度最低
                        s.x >= scope.lod_distance_max
                        || s.y >= scope.lod_distance_max
                        || s.z >= scope.lod_distance_max
                    ) {
                        scope.crowd.lodList[arrayList[i]] = scope.lod_distance.length
                    } else {//距离较近具体判断lod等级
                        let distance = s.x * s.x + s.y * s.y + s.z * s.z
                        scope.crowd.lodList[arrayList[i]] = scope.lod_distanceSqua.length//4
                        for (let j = 0; j < scope.lod_distanceSqua.length; j++) {//j=0 1 2 3
                            if (distance < scope.lod_distanceSqua[j]) {
                                scope.crowd.lodList[arrayList[i]] = j
                                break
                            }
                        }
                    }
                }
            }else{
                let matrix = new THREE.Matrix4().multiplyMatrices(scope.camera.projectionMatrix, scope.camera.matrixWorldInverse);
                scope.frustum.setFromProjectionMatrix(matrix);

                for (let i = 0; i < scope.countAll; i++) {//遍历所有化身的位置
                    if (scope.crowd.lodList[i] == -2) continue//lodList==-2指的是始终不显示这个化身
                    // if (window.visibleArea)
                    //     if(!window.visibleArea[i]){
                    //         scope.crowd.lodList[i] = -1
                    //         continue
                    //     }
                    scope.crowd.lodList[i] = 0//默认显示最低等级的化身
                    let p = scope.crowd.getPosition(i)
                    let point = new THREE.Vector3(p[0], p[1], p[2]);
                    // 视锥剔除
                    // console.log(scope.frustum)
                    for (let j = 0; j < scope.frustum.planes.length-2; j++) {//遍历4个视锥面
                        if (scope.frustum.planes[j].distanceToPoint(point) < -scope.radius) {
                            scope.crowd.lodList[i] = -1//不可见
                            break
                        }
                    }
                    // LOD
                    if (scope.crowd.lodList[i] !== -1) {
                        var s = camera.position.clone().sub(point)
                        if (//距离非常远，lod精度最低
                            s.x >= scope.lod_distance_max
                            || s.y >= scope.lod_distance_max
                            || s.z >= scope.lod_distance_max
                        ) {
                            scope.crowd.lodList[i] = scope.lod_distance.length
                        } else {//距离较近具体判断lod等级
                            let distance = s.x * s.x + s.y * s.y + s.z * s.z
                            scope.crowd.lodList[i] = scope.lod_distanceSqua.length//4
                            for (let j = 0; j < scope.lod_distanceSqua.length; j++) {//j=0 1 2 3
                                if (distance < scope.lod_distanceSqua[j]) {
                                    scope.crowd.lodList[i] = j
                                    break
                                }
                            }
                        }
                    } else {
                        // scope.crowd.lodList[i]=scope.lod_distance.length//不可见的对象使用超低模渲染
                    }
                }
            }
            scope.crowd.update()
            scope.cameraStatePre = cameraState
          }
          scope.cameraStatePreFrame = cameraState
        //   requestAnimationFrame(() => {
        //     CrowdLod.frustumCulling(scope)
        //   })
        setTimeout(()=>{//每秒更新一次
            CrowdLod.frustumCulling(scope)
        },250)
    }
    static frustumCulling(scope) { //每帧执行一次
        // console.log(scope,scope.needWander)
        const usePoints=scope.crowd.getUsePoints()
        // let startTime = Date.now();
        var cameraState = scope.getCameraState()
        // let disScale=1
        if ((cameraState == scope.cameraStatePreFrame||scope.crowd.moveFlag)&&scope.open)//相机停止了运动 且系统启动LOD功能
        if (scope.open)//系统启动LOD功能
          if (cameraState == scope.cameraStatePreFrame||scope.crowd.moveFlag) {//如果先将状态发生了改变
            scope.crowd.moveFlag=false
            if(scope.bvhOpen){
            // if (true)
            //     if (true) {
                // 更新视锥体
                let matrix = new THREE.Matrix4().multiplyMatrices(scope.camera.projectionMatrix, scope.camera.matrixWorldInverse);
                scope.frustum.setFromProjectionMatrix(matrix);
                for (let i = 0; i < scope.countAll; i++) {//遍历所有化身的位置
                    if (scope.crowd.lodList[i] == -2) continue//lodList==-2指的是始终不显示这个化身
                    else scope.crowd.lodList[i] = -1
                }
                let p0 = scope.crowd.getPosition(0)
                if (scope.bvh == null && (p0[0]!= 0 || p0[1] != 0 || p0[2] != 0)) {
                    console.log("build BVH");
                    scope.bvh = BVHTree(scope.crowd, scope.radius);
                    // console.log(scope.bvh)
                }
                // 确定BVH的可视性
                var arrayList = []
                if (scope.bvh != null) scope.TraverseBVH(scope.bvh, scope.frustum, arrayList)
                // console.log(arrayList)
                for (let i = 0; i < arrayList.length; i++) {
                    let p = scope.crowd.getPosition(arrayList[i])
                    let point = new THREE.Vector3(p[0], p[1], p[2]);
                    var s = camera.position.clone().sub(point)
                    if (//距离非常远，lod精度最低
                        s.x >= scope.lod_distance_max
                        || s.y >= scope.lod_distance_max
                        || s.z >= scope.lod_distance_max
                    ) {
                        scope.crowd.lodList[arrayList[i]] = scope.lod_distance.length
                    } else {//距离较近具体判断lod等级
                        let distance = s.x * s.x + s.y * s.y + s.z * s.z
                        scope.crowd.lodList[arrayList[i]] = scope.lod_distanceSqua.length//4
                        for (let j = 0; j < scope.lod_distanceSqua.length; j++) {//j=0 1 2 3
                            if (distance < scope.lod_distanceSqua[j]) {
                                scope.crowd.lodList[arrayList[i]] = j
                                break
                            }
                        }
                    }
                }
            }else{
                let matrix = new THREE.Matrix4().multiplyMatrices(scope.camera.projectionMatrix, scope.camera.matrixWorldInverse);
                scope.frustum.setFromProjectionMatrix(matrix);

                for (let i = 0; i < scope.countAll; i++) {//遍历所有化身的位置
                    if (scope.crowd.lodList[i] == -2) continue//lodList==-2指的是始终不显示这个化身
                    // if (window.visibleArea)
                    //     if(!window.visibleArea[i]){
                    //         scope.crowd.lodList[i] = -1
                    //         continue
                    //     }
                    scope.crowd.lodList[i] = 0//默认显示最低等级的化身
                    let p = scope.crowd.getPosition(i)
                    let point = new THREE.Vector3(p[0], p[1], p[2]);
                    // 视锥剔除
                    // console.log(scope.frustum)
                    for (let j = 0; j < scope.frustum.planes.length-2; j++) {//遍历4个视锥面
                        if (scope.frustum.planes[j].distanceToPoint(point) < -scope.radius) {
                            scope.crowd.lodList[i] = -1//不可见
                            break
                        }
                    }
                    // LOD
                    const lodList_i=scope.crowd.lodList[i]
                    if(true){//if (scope.crowd.lodList[i] !== -1) {
                        var s = camera.position.clone().sub(point)
                        if (//距离非常远，lod精度最低
                            s.x >= scope.lod_distance_max
                            || s.y >= scope.lod_distance_max
                            || s.z >= scope.lod_distance_max
                        ) {
                            scope.crowd.lodList[i] = scope.lod_distance.length
                        } else {//距离较近具体判断lod等级
                            let distance = s.x * s.x + s.y * s.y + s.z * s.z
                            scope.crowd.lodList[i] = scope.lod_distanceSqua.length//4
                            for (let j = 0; j < scope.lod_distanceSqua.length; j++) {//j=0 1 2 3
                                if (distance < scope.lod_distanceSqua[j]) {
                                    
                                    scope.crowd.lodList[i] = j
                                    
                                        
                                    // scope.crowd.lodList[i] = 5
                                    break
                                }
                            }
                            if (lodList_i == -1){
                                if(distance>50*scope.radius)
                                if(scope.crowd.lodList[i] <scope.lod_distance.length-1)//越大约粗糙
                                    scope.crowd.lodList[i] =scope.lod_distance.length-1
                                   
                            }
                        }
                    } else {
                        //scope.crowd.lodList[i]=scope.lod_distance.length-1//不可见的对象使用超低模渲染
                    }
                }
            }
            scope.crowd.update()
            scope.cameraStatePre = cameraState
          }
          scope.cameraStatePreFrame = cameraState
          const rf=scope.crowd.getRefreshFrequency()
          if(typeof rf=="string"){//rf=="eachFrame"
            requestAnimationFrame(() => {
                CrowdLod.frustumCulling(scope)
            })
          }else{
            setTimeout(()=>{//每秒更新一次
                CrowdLod.frustumCulling(scope)
            },rf)
          }        
    }
}
