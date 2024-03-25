import * as THREE from "three"
import {Tool} from "../Tool.js"
export class Obstacle{
    #xMax=+80
    #xMin=-80
    #y   =49
    #zMax=45+25
    #zMin=-75
    #rowNum=32//5
    #colNum=24+5//5
    #voxelSize=5

    #grid=
    [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0],[0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,1,1,0,0,1,0,0,0,1,1,0,0,0,0],[0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,1,1,1,1,1,1],[0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,1,0,1,1,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0],[0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,1,0,0,0,1,1,1,1,1,0,0,0,0],[0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1,0,0,0,0],[0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,1,1,1,1,1,1],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
        // []//二维网格数组  用来标记每个位置是否有障碍物 [0:没有障碍物，1:有障碍物]
    #gridWeight=
        []//二维网格数组 用来标记每个位置的权重 [0:该位置有障碍物或不可到达终点，else:到目标地的距离]
    #meshList=[] //与平面相交的全部mesh
    #voxels=[] //体素方块
    #destination=[19,28]//终点 r,c

    constructor(building){
        window.obstacle=this
        this.building=building
        console.log(PF)
        const self=this
        window.getObstacle=()=>{
            self.getObstacle()
        }
        window.start0=()=>{
            self.start()
        }
    }
    start(){
        this.initVoxels()
        this.getObstacle()
        this.initGridWeight()
        
    }
    initGridWeight(){
        const self=this
        const getPath=(i,j)=>{
            const grid = new PF.Grid(self.#rowNum,self.#colNum);//生成网格
            for(let i=0;i<self.#rowNum;i++){
                for(let j=0;j<self.#colNum;j++){
                    if(self.#grid[i][j]){//有障碍物
                        grid.setWalkableAt(i,j,false);//索引编号从0开始
                    }
                }
            }
            const finder = new PF.AStarFinder({
                allowDiagonal: true,//允许对角线
                dontCrossCorners: false,//不要拐弯?
                heuristic: PF.Heuristic["manhattan"],//启发式["曼哈顿"]
                weight: 1
            });
            return finder.findPath(
                i,j,
                self.#destination[0],
                self.#destination[1], 
                grid)

        }
        

        for(let i=0;i<this.#rowNum;i++){
            this.#gridWeight.push([])
            for(let j=0;j<this.#colNum;j++){
                if(this.#grid[i][j]==1){//有障碍物
                    this.#gridWeight[i].push(0)
                    this.#voxels[i][j].path=null
                }else{
                    const path = getPath(i,j)
                    if(path.length>0)console.log(path)
                    this.#gridWeight[i].push(path.length)
                    this.#voxels[i][j].path=path
                }
            }
        }
    }
    saveGrid(){
        this.saveJson(this.#grid,"grid.json")
    }
    saveGridWeight(){
        this.saveJson(this.#gridWeight,"gridWeight.json")
    }
    initVoxels(){
        const getB=()=>{
            const geometry = new THREE.BoxGeometry( this.#voxelSize,this.#voxelSize,this.#voxelSize );
            const material = new THREE.MeshPhongMaterial( {
                    color: 0x654321,
                    transparent:true,
                    opacity:0.5
                } );
            material.color.r=material.color.g=0.1
            return new THREE.Mesh( geometry, material );
        }
        
        for(let i=0;i<this.#rowNum;i++){
            this.#voxels.push([])
            for(let j=0;j<this.#colNum;j++){
                const b=getB()//box.clone()
                b.r=i
                b.c=j
                b.position.set(
                    this.#xMin+i*this.#voxelSize,
                    this.#y,
                    this.#zMin+j*this.#voxelSize,
                )
                window.scene.add(b)
                this.#voxels[i].push(b)
            }
        }
        if(this.#grid.length==0){
            for(let i=0;i<this.#rowNum;i++){
                this.#grid.push([])
                for(let j=0;j<this.#colNum;j++){
                    this.#grid[i].push(0)
                }
            }
        }else{
            for(let i=0;i<this.#rowNum;i++){
                for(let j=0;j<this.#colNum;j++){
                    if(this.#grid[i][j]){
                        const color=this.#voxels[i][j].material.color
                        color.r=color.g=1
                    }
                }
            }
        }
    }
    getObstacle(){
        const meshes=this.building.meshes
        for(let id in meshes){
            const mesh=meshes[id]
            if(!this.#InY2(mesh.lod[0],[this.#y-1,this.#y+0.5])){
                mesh.visible=false
                this.#meshList.push(mesh.lod[0])
            }
        }
        if(false){//显示检测的平面
            const geometry = new THREE.BoxGeometry( 1000000, 0.1, 50000 );
            const material = new THREE.MeshPhongMaterial( {
                color: 0x654321,
                transparent:true,
                opacity:0.5
            } );
            const floor = new THREE.Mesh( geometry, material );
            floor.position.y=this.#y
            window.floor=floor
            window.scene.add(floor)
        }
        if(false)//自动获取障碍物所在位置
        for(let i=0;i<this.#voxels.length;i++){
            console.log(i,this.#voxels.length)
            for(let j=0;j<this.#voxels[i].length;j++){
                const v=this.#voxels[i][j]
                for(let mesh of this.#meshList){
                    const boxList=this.#getBoxList(mesh)//mesh.boxList
                    for(let k=0;k<boxList.length;k++){
                        const b=boxList[k]
                        if(
                            ((b.min.x<=v.position.x-this.#voxelSize/2)&&(v.position.x-this.#voxelSize/2<=b.max.y))||
                            ((b.min.z<=v.position.z+this.#voxelSize/2)&&(v.position.z+this.#voxelSize/2<=b.max.z))
                        )v.material.color.r=v.material.color.g=0.5//true;
                    }

                }
            }
        }

        const arr=[]
        for(let i=0;i<this.#voxels.length;i++){
            for(let j=0;j<this.#voxels[i].length;j++){
                arr.push(this.#voxels[i][j])
            }
        }
        const self=this
        Tool.rayCaster(
            window.camera,
            arr,
            (v)=>{
                console.log(v,v.path,v.r+","+v.c)
                if(self.#grid[v.r][v.c]){
                    v.material.color.r=v.material.color.g=0.1
                    self.#grid[v.r][v.c]=0
                }else{
                    v.material.color.r=v.material.color.g=1
                    self.#grid[v.r][v.c]=1
                }
                
            }
        )
    }
    #getBoxList(instancedMesh){
        const boxList=[]//这个实例化组的所有包围盒
        for(let i=0;i<instancedMesh.count;i++){
            const matrix=new THREE.Matrix4()
            instancedMesh.getMatrixAt(i,matrix)
            instancedMesh.updateMatrixWorld()
            instancedMesh.geometry.computeBoundingBox()
            const box = instancedMesh.geometry.boundingBox.clone()
            box.applyMatrix4(matrix)
            box.applyMatrix4(instancedMesh.matrixWorld)
            boxList.push(box)
        }
        return boxList
    }
    #InY2(mesh,yl){//46-56
        if(mesh instanceof THREE.InstancedMesh){
            const boxList=[]//这个实例化组的所有包围盒
            for(let i=0;i<mesh.count;i++){
                const matrix=new THREE.Matrix4()
                mesh.getMatrixAt(i,matrix)
                mesh.updateMatrixWorld()
                mesh.geometry.computeBoundingBox()
                var box = mesh.geometry.boundingBox.clone()

                box.applyMatrix4(matrix)
                box.applyMatrix4(mesh.matrixWorld)
                // if(
                //     (yl[0]<=box.min.y&&box.min.y<=yl[1])||
                //     (yl[0]<=box.max.y&&box.max.y<=yl[1])
                //     )return true
                boxList.push(box)

                if(
                    (box.min.y<=yl[1])&&
                    (yl[0]<=box.max.y)
                    ){
                        mesh.boxList=boxList
                        if(false){
                            const b=new THREE.BoxGeometry(
                                box.max.x-box.min.x,
                                box.max.y-box.min.y,
                                box.max.z-box.min.z
                            )
                            const l=new THREE.Line(b, new THREE.LineDashedMaterial({color : 0x9B30FF}))
                            l.position.set(
                                (box.max.x+box.min.x)/2,
                                (box.max.y+box.min.y)/2,
                                (box.max.z+box.min.z)/2,
                            )
                            window.scene.add(l)
                        }
                        // console.log("x:"+box.min.x+","+box.max.x,"z:"+box.min.z+","+box.max.z)
                        return true
                    }
            }
            return false
        } else {
            var box = new THREE.Box3().setFromObject(mesh)
            return (yl[0]<=box.min.y&&box.min.y<=yl[1])||
                   (yl[0]<=box.max.y&&box.max.y<=yl[1])//return box.min.y<ymax && box.max.y>ymin //&&box.max.z>-7766
        }
    }
    saveJson(data,name){
        const jsonData = JSON.stringify(data);//JSON.stringify(data, null, 2); // Convert JSON object to string with indentation
        
        const myBlob = new Blob([jsonData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(myBlob)
        link.download = name
        link.click()
    }
}