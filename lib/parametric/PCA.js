import numeric from 'numeric'
export class PCA{
    constructor(mesh){
        this.mesh=mesh
        this._init()
    }
    _init(){
        this._initPos()
        this._initMat()
        this._initTrans()
        this._initPos2()
    }
    _initPos(){
        const geometry=this.mesh.geometry
        const pos   =geometry.attributes.position.array
        const count =geometry.attributes.position.count        
        
        this.positions=[]
        for(let i=0;i<count;i++){
            let x=pos[i*3+0]
            let y=pos[i*3+1]
            let z=pos[i*3+2]
            this.positions.push([
                x,y,z
            ])
        }
    }
    _initMat(){
        let m=[
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ]
        for(let i=0;i<this.positions.length;i++){
            let x=this.positions[i][0]
            let y=this.positions[i][0]
            let z=this.positions[i][0]
            const m0=[ 
                [x*x, x*y, x*z],
                [y*x, y*y, y*z],
                [z*x, z*y, z*z] 
            ]
            m=numeric.add(m,m0)
        }
        for(let i=0;i<3;i++){
            for(let j=0;j<3;j++){
                m[i][j]/=this.positions.length
            }
        }
        this.mat=m
    }
    _initTrans(){
        const result = numeric.eig(this.mat);
    
        let array = result.lambda.x;//[4, 1, 3, 2];// 原始数组
        let indexArray = array.map((value, index) => index);// 创建包含索引的新数组
        indexArray.sort((a, b) => array[a] - array[b]);// 对索引数组进行排序

        // 输出排序后的索引数组
        console.log(indexArray);
        const v1=result.E.x[indexArray[0]]
        const v2=result.E.x[indexArray[1]]
        const v3=result.E.x[indexArray[2]]
        this.trans=[
            v1,v2,v3
        ]
    }
    _initPos2(){
        const geometry=this.mesh.geometry
        const pos   =geometry.attributes.position.array
        const count =geometry.attributes.position.count        
        
        const positions2=[]
        const pos2      =[]
        const   t=this.trans
        for(let i=0;i<count;i++){
            let x=pos[i*3+0]
            let y=pos[i*3+1]
            let z=pos[i*3+2]
            positions2.push([//cover参数
                t[0][0]*x+t[1][0]*y+t[2][0]*z,
                t[0][1]*x+t[1][1]*y+t[2][1]*z,
                t[0][2]*x+t[1][2]*y+t[2][2]*z,
            ])
            pos2.push(t[0][0]*x+t[1][0]*y+t[2][0]*z)
            pos2.push(t[0][1]*x+t[1][1]*y+t[2][1]*z)
            pos2.push(t[0][2]*x+t[1][2]*y+t[2][2]*z)
        }
        geometry.attributes.position.arrayPCA=pos2
        this.positions2=positions2
    }
}