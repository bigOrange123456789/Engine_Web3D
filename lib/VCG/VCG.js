import * as THREE from "three"
export class VCG{
    show=true//false
    flagList=[]
    pointList=[//关联图中点在三维场景中的位置
        [-292.787112254054,12,205.41386188975224],[-240.08890383966343,12,177.34342387015047],[-183.69938801686325,12,118.56569654313331],[-228.2378450969062,12,222.87800482251228],[-285.9825516009827,12,256.58271912088367],[-320.6398494213508,12,323.72406552477514],[-173.07129186545473,12,421.21063056000895],[-105.56502716744247,12,316.2774065258244],[79.2169354860004,12,18.121866747896128],[141.20094205064913,12,-133.064607282961],[219.99213871552683,12,-86.74252824702822],[336.7700923747837,12,-71.31200102726363],[419.4550903171599,12,80.13973257751505],[386.9666391538042,12,168.3072298406735],[568.9748354205153,12,245.589207760378],[603.3475234019309,12,560.6504491395441],[313.6470446806331,12,523.3926828685612],[183.91543829590753,12,478.7727915079267],[-424.582951200398,12,144.49907284386543],[-351.56442719764806,12,-37.30784479095436],[-211.92000727706733,12,-221.03524437629716],[-156.8308235016184,12,-294.50239262541845],[23.77960408185015,12,-189.21206778787365],[60.07012770698128,12,-267.8793600947919],[150.1247728373146,12,-255.45226437294514],[300.1940072662183,12,-164.15159421770267],[309.87750231749186,9,87.9501169572765],[326.65526302211,9,49.13454281664967],[384.455387411259,9,5.7368716019111865],[26.95723324741178, 12, 161.12435557024958]
    ]
    linkList=[//关联图中边的两个端点在pointList中对应的编号
        [0,1],[4,3],[0,4],[3,1],[2,1],[18,0],[19,18],[20,19],[20,21],[22,21],[23,24],[24,25],[11,25],[11,28],[27,28],[12,28],[26,27],[26,13],[12,13],[16,13],[13,14],[15,15],[14,15],[16,15],[4,5],[6,7],[6,5],[7,4],[17,7],[17,16],[22,9],[10,9],[11,10],[23,22],[9,8],[10,8],[26,8],[7,29],[8,29],
    ]
    constructor(){
        for(let i of this.pointList){
            i[1]=12//让所有点高度都相同
            this.addFlag(i)
        }
        for(let i of this.linkList){
            this.addLine(
                this.flagList[i[0]],
                this.flagList[i[1]]
            )
        }

        
        window.test=this
        // window.s=()=>{
        //     self.s()
        // }
        
        if(false)
            this.clickDetection()
    }
    clickDetection(){
        const self=this
        let lineStart=false
        Test.rayCaster(
            window.camera,
            this.flagList,
            (obj,param)=>{
                console.log(obj,param)
                if(lineStart){//
                    self.addLine(lineStart,obj)
                    this.linkList.push(
                        [
                            lineStart.myId,
                            obj.myId
                        ]
                    )
                    lineStart=false
                }else{
                    lineStart=obj
                }
                
            })
    }
    record(){
        const pos=[
            window.camera.position.x,
            window.camera.position.y,
            window.camera.position.z
        ]
        this.addFlag(pos)
        this.pointList.push(pos)
    }
    printPointList(){
        let s=""
        for(let i of this.pointList){
            s=s+(
                "["+i[0]+","+i[1]+","+i[2]+"],"
            )
        }
        console.log(s)
    }
    printLinkList(){
        let s=""
        for(let i of this.linkList){
            s=s+(
                "["+i[0]+","+i[1]+"],"
            )
        }
        console.log(s)
    }
    addFlag(pos){
        const k=2.5
        const geometry = new THREE.BoxGeometry( k*3, 8, k*3 ); 
        const material = new THREE.MeshLambertMaterial( {color: 0xff0000} ); //( {color: 0x00ff00} ); 
        const cube = new THREE.Mesh( geometry, material ); 
        cube.position.set(pos[0],pos[1]-4,pos[2])
        cube.myId=this.flagList.length
        if(this.show)window.scene.add( cube );
        this.flagList.push(cube)
    }
    addLine(mesh1,mesh2){
        let line1 = new THREE.LineCurve3(
            mesh1.position,
            mesh2.position
            );
        var CurvePath = new THREE.CurvePath();// 创建CurvePath对象
        CurvePath.curves.push(line1);// 插入多段线条
        var geometry2 = new THREE.TubeGeometry(CurvePath, 1, 2.5*0.5, 5, false);
        var material = new THREE.MeshLambertMaterial({color: 0xf0f00f});
        var cube = new THREE.Mesh(geometry2, material);
        if(this.show)window.scene.add(cube);
        // this.linkList.push(
        //     [mesh1.myId,mesh2.myId]
        // )
    }
    toScene(scene){//将这个gragh逻辑结构添加到场景中

    }
    static rayCaster(camera,arr,cb){
        //视点拾取
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        window.posList00="["
        window.addEventListener( 'mousemove', event=>{//鼠标移动事件
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1 ;
        }, false );
        window.addEventListener('click',()=>{
                raycaster.setFromCamera( mouse, camera )
                const intersects = raycaster.intersectObjects( arr )
                if (intersects.length > 0) {
                    if(cb)cb(intersects[0].object,intersects[0])
                    const p=intersects[0].point
                    window.posList00+=("["+p.x+","+p.z+"],")
                }
        },false)
    }
}