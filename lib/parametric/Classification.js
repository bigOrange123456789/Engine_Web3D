import {Parameter}from "./Parameter.js"
import {CoderDecoder}from "./CoderDecoder.js"
const MAX_VALUE=Number.MAX_VALUE
// import {PCA}from"./PCA"
// import numeric from 'numeric'
// window.numeric=numeric

const CylinderParam={}
const CubeParam={}
export class Classification{
    static downloadJson(){
        // const str=JSON.stringify(CylinderParam , null, "\t")
        let str=JSON.stringify(CylinderParam)
        var link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.href = URL.createObjectURL(new Blob([str], { type: 'text/plain' }));
        link.download ="CylinderParam"+window.iii+".json";
        link.click();
    
        str=JSON.stringify(CubeParam)
        link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.href = URL.createObjectURL(new Blob([str], { type: 'text/plain' }));
        link.download ="CubeParam"+window.iii+".json";
        link.click();
    }
    constructor(mesh, matrixList){//(x,y,z)、方向(012)、h/2、r
        this.mesh=mesh
        this.matrixList=matrixList
        // this.pca=
            // new PCA(mesh)
        this._init()
        const type=this._judge()
        this.getParam(type)
    }
    getParam(type){
        this.type=type
        this.param=new Parameter(this.mesh,type).param
        if(type=='else')return
        // console.log("this.param",this.param)
        this.param.material=this.mesh.material
        const code=CoderDecoder.encoder(this.matrixList,this.param)
        if(type=='cylinder')
            CylinderParam[this.mesh.name]=code
        if(type=='cube')
            CubeParam[this.mesh.name]=code
        this.code=code
        this.mesh2=CoderDecoder.decoder(code)//mesh
    }

    _init(){
        const mesh=this.mesh
        const geometry=mesh.geometry
        this.geometry=geometry
        geometry.computeVertexNormals()
        geometry.computeBoundingBox()
        const pos   =geometry.attributes.position.array//PCA
        this.normal   =geometry.attributes.normal.array
        const count =geometry.attributes.position.count

        // console.log(geometry,geometry.boundingBox)
        const box_max=[
            geometry.boundingBox.max.x,
            geometry.boundingBox.max.y,
            geometry.boundingBox.max.z
            // -Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE
        ]
        const box_min=[
            geometry.boundingBox.min.x,
            geometry.boundingBox.min.y,
            geometry.boundingBox.min.z
            // Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE
        ]
        // for(let i=0;i<count;i++){
        //     let position=[
        //         pos[i*3+0],
        //         pos[i*3+1],
        //         pos[i*3+2]
        //     ]
        //     for(let j=0;j<3;j++){
        //         if(box_max[j]<position[j])
        //             box_max[j]=position[j]
        //         if(box_min[j]>position[j])
        //             box_min[j]=position[j]
        //     }
        // }
        const scale={
            x:(box_max[0]-box_min[0])/2,
            y:(box_max[1]-box_min[1])/2,
            z:(box_max[2]-box_min[2])/2,
        }
        this.scale=[scale.x,scale.y,scale.z]
        if(scale.x==0)scale.x=1
        if(scale.y==0)scale.y=1
        if(scale.z==0)scale.z=1
        // if(scale.x==0||scale.y==0||scale.z==0)alert("圆柱检测异常")
        const center={
            x:(box_max[0]+box_min[0])/2,
            y:(box_max[1]+box_min[1])/2,
            z:(box_max[2]+box_min[2])/2,
        }

        this.positions=[]
        for(let i=0;i<count;i++){
            let x=pos[i*3+0]
            let y=pos[i*3+1]
            let z=pos[i*3+2]
            // let normal=[
            //     nor[i*3+0],
            //     nor[i*3+1],
            //     nor[i*3+2]
            // ]
            // if(normal[0]!=0&&normal[1]!=0&&normal[2]!=0)
            this.positions.push([
                (x-center.x)/scale.x,//[-1,1]
                (y-center.y)/scale.y,
                (z-center.z)/scale.z
            ])
        }
    }

    _atCube(){
        let distanceX=0
        let distanceY=0
        let distanceZ=0
        // console.log(this.positions)
        for(let i=0;i<this.positions.length;i++){
            let x=this.positions[i][0]
            let y=this.positions[i][1]
            let z=this.positions[i][2]
            let xd=Math.min(Math.abs(1-x),Math.abs(-1-x))
            let yd=Math.min(Math.abs(1-y),Math.abs(-1-y))
            let zd=Math.min(Math.abs(1-z),Math.abs(-1-z))
            if(this.scale[0]==0)xd=0;
            if(this.scale[1]==0)yd=0;
            if(this.scale[2]==0)zd=0;
            distanceX=Math.max(distanceX,xd)//distanceX+=xd
            distanceY=Math.max(distanceY,yd)
            distanceZ=Math.max(distanceZ,zd)
        }
        // console.log([distanceX,distanceY,distanceZ])
        // return [
        //     distanceX/this.positions.length,
        //     distanceY/this.positions.length,
        //     distanceZ/this.positions.length
        // ]
        // {//计算辅助球半径
        //     let h_half=0,r_top=0
        //     if(Math.min(distanceX,distanceY,distanceZ)==distanceX){
        //         h_half=this.scale[0]
        //         r_top =(this.scale[1]+this.scale[2])/2
        //     }else if(Math.min(distanceX,distanceY,distanceZ)==distanceY){
        //         h_half=this.scale[1]
        //         r_top =(this.scale[0]+this.scale[2])/2
        //     }else if(Math.min(distanceX,distanceY,distanceZ)==distanceZ){
        //         h_half=this.scale[2]
        //         r_top =(this.scale[0]+this.scale[1])/2
        //     }
        //     this.radius=Math.pow(//辅助球半径
        //         Math.pow(h_half,2)+Math.pow(r_top,2),
        //         0.5)
        // }
        return [distanceX,distanceY,distanceZ]
    }

    _getRadius(){//这种辅助球半径计算方法也是合理的//改为在_atCube()中计算
        let radius=0
        for(let i=0;i<this.positions.length;i++){
            let x=this.positions[i][0]
            let y=this.positions[i][1]
            let z=this.positions[i][2]
            // let normal=[
            //     this.normal[i*3+0],
            //     this.normal[i*3+1],
            //     this.normal[i*3+2]
            // ]
            // if(normal[0]!=0&&normal[1]!=0&&normal[2]!=0)
            radius+=Math.pow(
              Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2),
              0.5
            );
        }
        // this.axis=//判断出来轴的方向
        radius/=this.positions.length
        this.radius=radius
        return radius
    }
    _atSphere(){
        const radius=this._getRadius()
        let errorSum=0
        let count=0
        for(let i=0;i<this.positions.length;i++){
            let x=this.positions[i][0]
            let y=this.positions[i][1]
            let z=this.positions[i][2]
            const radius0=Math.pow(
              Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2),
              0.5
            );

            // let normal=[
            //     this.normal[i*3+0],
            //     this.normal[i*3+1],
            //     this.normal[i*3+2]
            // ]
            // // console.log(normal[0]!=0&&normal[1]!=0&&normal[2]!=0)
            // if(normal[0]!=0&&normal[1]!=0&&normal[2]!=0)
            {
                errorSum+=Math.abs(radius-radius0)
                count++
            }
            
            // console.log(
            //     // x,y,z
            //     radius,
            //     radius0,
            //     Math.abs(radius-radius0),
            // )
        }
        if(count==0)return MAX_VALUE
        // console.log(errorSum/this.positions.length,"radius:",radius)
        const errorSumPercentage=(errorSum/count)/radius
        return errorSumPercentage
        const flag=errorSumPercentage<this.threshold2
        // console.log(errorSumPercentage<this.threshold2,errorSumPercentage,this.threshold2)
        return flag
    }

    _getAreaTriangle(A,B,C){
        const Sub=(a,b)=>{
            return[a[0]-b[0],a[1]-b[1],a[2]-b[2]]
        }
        const CrossProduct=(a,b)=>{
            const x1=a[0],y1=a[1],z1=a[2]
            const x2=b[0],y2=b[1],z2=b[2]
            return[y1*z2-z1*y2,z1*x2-x1*z2,x1*y2-y1*x2]
        }
        const Norm=(a)=>{
            const x=a[0],y=a[1],z=a[2]
            return Math.pow(
                Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2),
            0.5)
        }
        const v1=Sub(A,C)
        const v2=Sub(B,C)
        // console.log(A,B,C,v1,v2)
        const v3=CrossProduct(v1,v2)
        return Norm(v3)/2
    }
    _getAreaBottom(flag_axle,flag_PN){// x,y,z +-//0,1,2,   1,-1
        let areaBottom=0
        let index
        // console.log(this.geometry.index)
        if(!this.geometry.index){
            console.log(this.geometry)
            index=[]
            const count=this.geometry.attributes.position.count
            for(let i=0;i<count;i++)index.push(i)
        }else{
            index=this.geometry.index.array
        }
        // const index=this.geometry.index.array

        const positions=this.positions
        for(let i=0;i<index.length/3;i++){
            const a=index[3*i+0]
            const b=index[3*i+1]
            const c=index[3*i+2]
            const x=positions[a]
            const y=positions[b]
            const z=positions[c]
            // console.log(
            //     flag_PN,x,
            //     Math.abs(flag_PN*x[flag_axle]-1)<this.threshold1
            // )
            if(
                Math.abs(flag_PN*x[flag_axle]-1)<this.threshold1&&
                Math.abs(flag_PN*y[flag_axle]-1)<this.threshold1&&
                Math.abs(flag_PN*z[flag_axle]-1)<this.threshold1){
                    areaBottom+=this._getAreaTriangle(x,y,z)
                    // console.log(x,y,z,"area:",this._getAreaTriangle(x,y,z))
                }
        }
        return areaBottom
    }
    _getArea(disCube){
        if(this.areaP&&this.areaN)return
        const getAxle=(disCube)=>{
            const distanceX=disCube[0]
            const distanceY=disCube[1]
            const distanceZ=disCube[2]
            if(Math.min(distanceX,distanceY,distanceZ)==distanceX){
                return 0
            }else if(Math.min(distanceX,distanceY,distanceZ)==distanceY){
                return 1
            }else{
                return 2
            }
        }
        let axle=getAxle(disCube)//,radius//
        this.areaP=this._getAreaBottom(axle,+1)
        this.areaN=this._getAreaBottom(axle,-1)
    }

    _isFilled(disCube){
        this._getArea(disCube)

        const area =Math.pow(1,2)*Math.PI
        const error1=Math.abs(area-this.areaP)/area
        const error2=Math.abs(area-this.areaN)/area
        return Math.max(error1,error2)
    }
    _isFilledCube(disCube){
        this._getArea(disCube)

        const area =2*2//Math.pow(1,2)*Math.PI
        const error1=Math.abs(area-this.areaP)/area
        const error2=Math.abs(area-this.areaN)/area
        return Math.max(error1,error2)
    }

    threshold1=0.2                  //投影误差
    threshold2=1.8/100//4//4//0.2   //半径误差
    threshold3=0.1//100//1.0                  //面积误差
    _judge(){
        if(this.positions.length<=0){
            return 'else'
        }

        const disCube=this._atCube()
        const atCube3=
            // disCube[0]<this.threshold1&&disCube[1]<this.threshold1&&disCube[2]<this.threshold1
            Math.max(disCube[0],disCube[1],disCube[2])<this.threshold1
        const atCube1=
            Math.min(disCube[0],disCube[1],disCube[2])<this.threshold1
        const atSphere=this._atSphere()<this.threshold2


        const isFilled=
            atCube1&&atSphere&&!atCube3?//是否在圆柱上
                this._isFilled(disCube)<this.threshold3
                :
                false//不为圆柱肯定不满
        const isFilledCube=atCube3?//是否在圆柱上
            this._isFilledCube(disCube)<this.threshold3
            :
            false//不为圆柱肯定不满

        // console.log({
        //     "atCube3":atCube3,//?
        //     "atSphere":atSphere,
        //     "atCube1":atCube1,
        //     "isFilled":isFilled,
        //     "isFilledCube":isFilledCube
        // })
        if(atCube3&&atSphere&&isFilledCube)return'cube'
        else if(atCube1&&atSphere&&isFilled)return'cylinder'
        else return'else'
    }
}
//无法处理的构件：700
//典范构件:740
//需要PCA对齐的构件：3074
/**
 * 版本日志：
 * 更新了辅助球半径的计算方法-2024.03.05 21:38[error]
 * 之前的辅助球半径计算方法没有问题，错误出在了边缘点检测上
 * 
 * **/