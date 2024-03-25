import * as THREE from "three";
export class Culling{//遮挡剔除和视锥剔除
    v//可见度计算工具
    camera
    meshes
    #prePoint2=""
    type="Pretreatment"//"Frustum"视锥剔除效果更好但是视点移动时计算量更大  "Pretreatment"预处理方式准确性更低但移动时计算量更低   
    constructor(param){
        this.v=param.visibility
        this.camera=param.visibility.camera
        this.meshes=param.visibility.meshes

        const scope=this
		const c=this.camera
		function setInterval0(){
            requestAnimationFrame(setInterval0)
			var point0=c.position.x+","+c.position.y+","+c.position.z
                    +c.rotation.x+","+c.rotation.y+","+c.rotation.z
            if(scope.#prePoint2!==point0){//如果视点发生了移动或旋转        
                if(scope.type=="Frustum")scope.#showOnlyEvsByFrustum()
                else scope.#showOnlyEvsByPretreatment()
                scope.#prePoint2=point0
                for(let i in self.meshes){
                    if(self.meshes[i].isShell){
                        self.meshes[i].lod[0].color.r=1
                        self.meshes[i].lod[0].color.g=0
                        self.meshes[i].lod[0].color.b=0
                    }//self.meshes[i].lod[0].visible=true
                }
			}
        }setInterval0()
    }
    update(){
        this.#prePoint2=""
    }
    #showOnlyEvsByPretreatment(){//用于渲染
        const self=this
        const posIndex=this.v.getPosIndex()[3]
        const visualList0=this.v.visualList[posIndex]
        if(visualList0){
            const d=this.v.getDirection()
            for(let i=0;i<this.v.componentNum;i++)
            if(this.meshes[i]){
                const vd1=i in visualList0["1"]?visualList0["1"][i]:0
                const vd2=i in visualList0["2"]?visualList0["2"][i]:0
                const vd3=i in visualList0["3"]?visualList0["3"][i]:0
                const vd4=i in visualList0["4"]?visualList0["4"][i]:0
                const vd5=i in visualList0["5"]?visualList0["5"][i]:0
                const vd6=i in visualList0["6"]?visualList0["6"][i]:0
                this.v.vd[i]=vd1*d[0]+vd2*d[1]+vd3*d[2]+vd4*d[3]+vd5*d[4]+vd6*d[5]
                if(this.meshes[i].lod){
                    for(let j=0;j<this.meshes[i].lod.length;j++){
                        self.meshes[i].lod[0].color.r=0
                        self.meshes[i].lod[0].color.g=0
                        self.meshes[i].lod[0].color.b=1
                    }//  this.meshes[i].lod[j].visible=false
                    if(this.v.vd[i]>Math.PI/(40)){
                        self.meshes[i].lod[1].color.r=1
                        self.meshes[i].lod[1].color.g=0
                        self.meshes[i].lod[1].color.b=0
                    }//this.meshes[i].lod[1].visible=true
                    else if(this.v.vd[i]>this.v.minvd){
                        self.meshes[i].lod[1].color.r=1
                        self.meshes[i].lod[1].color.g=0
                        self.meshes[i].lod[1].color.b=0
                    }// this.meshes[i].lod[0].visible=true
                }else{
                    //this.meshes[i].visible= this.vd[i]>this.v.minvd
                }
                this.meshes[i].used=true//这个mesh被使用了
            } 
            window.visibleArea={}
            if(visualList0["a"])
                for(let i=0;i<visualList0["a"].length;i++){
                    window.visibleArea[visualList0["a"][i]]=true
                }
        }
    }
    #showOnlyEvsByFrustum(){//用于渲染
        const posIndex=this.v.getPosIndex()[3]
        const visualList0=this.v.visualList[posIndex]
        if(visualList0){
            for(let i=0;i<this.v.componentNum;i++)
            if(this.meshes[i]){
                this.meshes[i].lod[1].visible=this.meshes[i].lod[0].visible=false
                for(let direction=1;direction<=6;direction++){
                    if(i in visualList0[direction]){
                        this.meshes[i].lod[1].visible=true
                        break
                    }
                }
                this.meshes[i].used=true//这个mesh被使用了
            } 
            if(true){//loadingoverall中的结果可视化，性能开销不大
                window.visibleArea={}
                if(visualList0["a"])
                    for(let i=0;i<visualList0["a"].length;i++)
                        window.visibleArea[visualList0["a"][i]]=true
            }
        }
        this.#cullingFrustum()
    }
    #cullingFrustum(){//视锥剔除
        if(!this.cullingFrustumNotFirstFlag){
            this.cullingFrustumNotFirstFlag=true
            return//跳过第一次的视锥剔除
        }//第一次的视锥剔除会出错，出错的原因现在还不清楚//出错原因可能是一帧无法完成全部包围球遮挡判断的计算 //出错的原因可能是初始数据包的解析问题
        
        const frustum = getFrustum(this.camera)
        for(let i in this.meshes){//for(let i=0; i<window.meshes.length; i++){
            var m=this.meshes[i]
            if(!m.bounding_sph){
                m.boundingSphere=computeSpheres(m.lod[1])
            }else if(m.visible)//if(!m.Obscured)
                m.visible=intersectSpheres(m.bounding_sph, frustum)
        }
        function computeSpheres(mesh){//开始计算包围球
            mesh.updateMatrixWorld()
            const bounding_sph=[]
            mesh.geometry.computeBoundingSphere()
            if(mesh.count)
                for(var j=0;j<mesh.count;j++){
                    const sphere = mesh.geometry.boundingSphere.clone()
                    var matrix=new THREE.Matrix4()
                    mesh.getMatrixAt(j,matrix)
                    sphere.applyMatrix4(matrix)
                    sphere.applyMatrix4(mesh.matrixWorld)
                    bounding_sph.push(sphere)
                    // window.scene.add(new THREE.Mesh(
                    //     sphere,
                    //     new THREE.MeshBasicMaterial({color:0.5})
                    // ))
                    // let a=new THREE.Mesh(sphere,new THREE.MeshBasicMaterial())
                    if(false){
                        const g=new THREE.SphereGeometry(sphere.radius)
                        const a=new THREE.Line(g, new THREE.LineDashedMaterial({color : 0x9B30FF}))
                        a.position.set(sphere.center.x,sphere.center.y,sphere.center.z)
                        window.scene.add(a)
                    }
                }
            else{
                const sphere = mesh.geometry.boundingSphere.clone()
                sphere.applyMatrix4(mesh.matrixWorld)
                bounding_sph.push(sphere)
            }
            return bounding_sph
        }
        function getFrustum(camera){
            var frustum = new THREE.Frustum();
            frustum.setFromProjectionMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
            return frustum;
        }
        function intersectSpheres(spheres, frustum){
            for(let i=0; i<spheres.length; i++)
                if(intersectSphere(spheres[i].center, spheres[i].radius, frustum))
                    return true
            return false
            function intersectSphere(center, radius, frustum) {
                const planes = frustum.planes;
                const negRadius = - radius;
                for(let i=0; i<planes.length; i++){
                    const distance = planes[ i ].distanceToPoint( center );//平面到点的距离，
                    if ( distance < negRadius ) //内正外负
                        return false;//不相交
                }
                return true;//相交
            }
        }
    }
}