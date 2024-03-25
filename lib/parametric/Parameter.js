// import {PCA}from"./PCA"
// window.CylinderParam={}
export class Parameter{
    param={
        color:[null,null,null],

        type:'else',//cube、cylinder、else
        pos:{x:null,y:null,z:null},
        scale:[null,null,null],

        //圆柱
        direction:null,
        h_half:null,
        r:null,

        //cylinder param：[pos-xyx,d,h,r]
        //cube param:[pos_xyz,sca_xyz]

    }//x,y,z,forward,h/2,r
    constructor(mesh,type){//(x,y,z)、方向(012)、h/2、r
        this.mesh=mesh

        this.param.type=type
        this.param.color=[mesh.material.color.r,mesh.material.color.g,mesh.material.color.b]

        this._init()//位置、放缩
        this._atCube()//其它参数信息
    }

    _init(){
        const mesh=this.mesh
        const geometry=mesh.geometry
        const pos   =geometry.attributes.position.array//PCA
        const count =geometry.attributes.position.count

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
        this.param.scale=[scale.x,scale.y,scale.z]
        if(scale.x==0)scale.x=1
        if(scale.y==0)scale.y=1
        if(scale.z==0)scale.z=1
        // if(scale.x==0||scale.y==0||scale.z==0)alert("圆柱检测异常")
        const center={
            x:(box_max[0]+box_min[0])/2,
            y:(box_max[1]+box_min[1])/2,
            z:(box_max[2]+box_min[2])/2,
        }
        this.param.pos=center

        this.positions=[]
        for(let i=0;i<count;i++){
            let x=pos[i*3+0]
            let y=pos[i*3+1]
            let z=pos[i*3+2]
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
        for(let i=0;i<this.positions.length;i++){
            let x=this.positions[i][0]
            let y=this.positions[i][1]
            let z=this.positions[i][2]
            let xd=Math.min(Math.abs(1-x),Math.abs(-1-x))
            let yd=Math.min(Math.abs(1-y),Math.abs(-1-y))
            let zd=Math.min(Math.abs(1-z),Math.abs(-1-z))
            if(this.param.scale[0]==0)xd=0;
            if(this.param.scale[1]==0)yd=0;
            if(this.param.scale[2]==0)zd=0;
            distanceX+=xd
            distanceY+=yd
            distanceZ+=zd
        }
        if(Math.min(distanceX,distanceY,distanceZ)==distanceX){
            this.param.direction=0
            this.param.h_half=this.param.scale[0]
            this.param.r=(this.param.scale[1]+this.param.scale[2])/2
        }else if(Math.min(distanceX,distanceY,distanceZ)==distanceY){
            this.param.direction=1
            this.param.h_half=this.param.scale[1]
            this.param.r=(this.param.scale[0]+this.param.scale[2])/2
        }else if(Math.min(distanceX,distanceY,distanceZ)==distanceZ){
            this.param.direction=2
            this.param.h_half=this.param.scale[2]
            this.param.r=(this.param.scale[0]+this.param.scale[1])/2
        }
    }

}
