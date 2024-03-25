
import * as THREE from "three";
import pako from 'pako';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
export class IndirectMaterial extends THREE.ShaderMaterial {
	static loadGLSL(name){
		return new Promise((resolve, reject) => {
				let xhr = new XMLHttpRequest();
				xhr.onload=()=>resolve(xhr.responseText)
				xhr.onerror =  event => reject(event);
				xhr.open('GET',"./shader/"+name+".glsl" )
				xhr.overrideMimeType("text/html;charset=utf-8")
				xhr.send()
			})
	}
	static async Json2Texture(){
		return new Promise( (resolve, reject) => { 
			new THREE.FileLoader().load(
				'probeIrradiance.json',
				data => {
					const J=JSON.parse( data )
					console.log(J)
					const texture=array2Texture(J.data, J.width,J.height)
					texture.param=J.param
					texture.param.origin=new THREE.Vector3(
						J.param.origin.x,
						J.param.origin.y,
						J.param.origin.z
					)
					texture.param.probeGridSpacing=new THREE.Vector3(
						J.param.probeGridSpacing.x,
						J.param.probeGridSpacing.y,
						J.param.probeGridSpacing.z
					)
					texture.param.probeGridCounts=[
						J.param.probeGridCounts['0'],
						J.param.probeGridCounts['1'],
						J.param.probeGridCounts['2']
					]
					console.log(J)
					// self.uniforms.probeIrradiance.value.image=texture
					console.log("texture",texture)
					resolve(texture)
				}
			)
		} );
		function array2Texture(array0, w,h) {
			const array=[]
			for(let i=0;i<array0.length/3;i++){
				array.push(array0[3*i  ])
				array.push(array0[3*i+1])
				array.push(array0[3*i+2])
				array.push(0)
			}
			let data = new Float32Array(w * h * 4); // RGB:3 RGBA:4
			data.set(array);
			let texture = new THREE.DataTexture(
				data, w, h, 
				THREE.RGBAFormat,// 使用RGB三个通道 //THREE.RGBAFormat 四个通道
				THREE.FloatType);
			texture.needsUpdate = true;
			return texture;
		}
		function array2Texture_old(array, w,h) {
			let data = new Float32Array(w * h * 3); // RGB:3 RGBA:4
			data.set(array);
			let texture = new THREE.DataTexture(
				data, w, h, 
				THREE.RGBFormat,// 使用RGB三个通道 //THREE.RGBAFormat 四个通道
				THREE.FloatType);
			texture.needsUpdate = true;
			return texture;
		}
	}
	static async Hdr2Texture(){
		return new Promise( (resolve, reject) => { 
			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'probeIrradiance.hdr', true);
			xhr.responseType = 'arraybuffer';
			xhr.onload = function() {
				var buffer = xhr.response;
				// 解析HDR文件
				var loader = new RGBELoader();
				var texture = loader.parse(buffer);
				resolve(texture)
			};
			xhr.send();
		} )
	}
	static async pre(cb){
		IndirectMaterial.prototype.vertexShader  = 
		// await IndirectMaterial.loadGLSL('vert_MeshStandardMaterial')
		await IndirectMaterial.loadGLSL('indirectVS')//document.getElementById('indirectVS').innerHTML
		IndirectMaterial.prototype.fragmentShader= 
		// await IndirectMaterial.loadGLSL('frag_MeshStandardMaterial')
		await IndirectMaterial.loadGLSL('indirectFS')//document.getElementById('indirectFS').innerHTML
		
		// console.log("vertexShader:",  IndirectMaterial.prototype.vertexShader)
		// console.log("fragmentShader:",IndirectMaterial.prototype.fragmentShader)

		IndirectMaterial.prototype.probeIrradiance=await IndirectMaterial.Json2Texture()
		console.log("probeIrradiance",IndirectMaterial.prototype.probeIrradiance)
		if(cb)cb()
	}
	static async pre_old(cb){
		IndirectMaterial.prototype.vertexShader  = document.getElementById('indirectVS').textContent//await IndirectMaterial.loadGLSL('indirectVS')//
		IndirectMaterial.prototype.fragmentShader= document.getElementById('indirectFS').textContent//await IndirectMaterial.loadGLSL('indirectFS')//
		IndirectMaterial.prototype.probeIrradiance=await IndirectMaterial.DataTexture2Json()
		if(cb)cb()
	}
    constructor(materialOld) {
		// const param={
		// 	exposure:2,
		// 	tonemapping:true,
		// 	gamma:true,
		// 	viewBias:0.3,
		// 	normalBias:0.1,
		// 	numIrradianceTexels:6,
		// 	numDistanceTexels:6,
		// 	origin:new THREE.Vector3 (-0.4000000059604645,  5.400000095367432,  -0.25) ,
		// 	probeGridCounts:[11, 11, 11],
		// 	probeGridSpacing:new THREE.Vector3( 2.0399999618530273,  1,  0.8999999761581421)
		// }
		const param=IndirectMaterial.prototype.probeIrradiance.param
		// console.log(param)
		// console.log(IndirectMaterial.prototype.probeIrradiance.param)
		
		IndirectMaterial.prototype.probeIrradiance.needsUpdate = true;
		// console.log("IndirectMaterial.prototype.probeIrradiance",IndirectMaterial.prototype.probeIrradiance)
		super({//new THREE.ShaderMaterial({//
			uniforms: {
				//Declare texture uniform in shader
				GBufferd: { type: 't', value: null },
				probeIrradiance: { 
					type: 't', 
					value: IndirectMaterial.prototype.probeIrradiance//null 
				},
				probeDistance: { type: 't', value: null },
				screenWidth: { value: window.innerWidth },
				screenHeight: { value: window.innerHeight },
				notCompareFlag: { value: false },
				dGI: { value: true },
				exposure: { value : param.exposure },
				tonemapping: { value: param.tonemapping },
				gamma: { value: param.gamma },
				DDGIVolume: {
				  value: {
					origin: new THREE.Vector3(0, 0, 0),
					probeGridCounts: new Int32Array(3),
					probeGridSpacing: new THREE.Vector3(0, 0, 0),
					viewBias: param.viewBias,
					normalBias: param.normalBias,
					probeNumIrradianceTexels: param.numIrradianceTexels,
					probeNumDistanceTexels: param.numDistanceTexels,
					probeIrradianceEncodingGamma: 5.0
				  }
				},
				colorMap: { type: "t", value: null },
				emissiveColor: { value: new THREE.Vector3(0, 0, 0) },
				emissiveMap: { type: "t", value: null },
				useMap: { value: false },
				useEmissiveMap: { value: false },
				originColor: { value: new THREE.Vector3(0, 0, 0) },
		
			  },
			vertexShader: IndirectMaterial.prototype.vertexShader,
			fragmentShader: IndirectMaterial.prototype.fragmentShader
		})
		// console.log(materialOld.type)
		// this.type="MeshStandardMaterial"
		// for(let i in materialOld){
		// 	if(
		// 		i!=="type"
		// 		&&i!="uniforms"
		// 		&&i!="vertexShader"
		// 		&&i!="fragmentShader"
		// 	)
		// 		this[i]=materialOld[i]
		// }
		this.uniforms.GBufferd.value = this._initLitRenderTarget().texture
		this.uniforms.DDGIVolume.value.origin = param.origin
		this.uniforms.DDGIVolume.value.probeGridCounts = param.probeGridCounts
		this.uniforms.DDGIVolume.value.probeGridSpacing = param.probeGridSpacing
		this.needsUpdate = true

		if (materialOld.color) {
			this.uniforms.originColor.value = materialOld.color
		}
		if (materialOld.map != null) {
			this.uniforms.useMap.value = true
			materialOld.map.encoding = THREE.sRGBEncoding
			this.uniforms.colorMap.value = materialOld.map
		}
		if (materialOld.emissive.x != 0 && materialOld.emissive.y != 0 && materialOld.emissive.z != 0) {
			this.uniforms.emissiveColor.value = materialOld.emissive;
		}
		if (materialOld.emissiveMap != null) {
			this.uniforms.useEmissiveMap.value = true;
			materialOld.emissiveMap.encoding = THREE.sRGBEncoding
			this.uniforms.emissiveMap.value = node.material.emissiveMap;
		}
		window.indirectMaterial=this
		
		// const tagList=[
		// 	"type",
		// 	"isMeshStandardMaterial",
			
		// 	"roughness",
		// 	"metalness",
		// 	"map",
		// 	"lightMap",
		// 	"lightMapIntensity",
		// 	"aoMap",
		// 	"aoMapIntensity",
		// 	"emissive",
		// 	"emissiveIntensity",
		// 	"emissiveMap",
		// 	"bumpMap",
		// 	"bumpScale",
		// ]
		// for(let i=0;i<tagList.length;i++){
		// 	const tag=tagList[i]
		// 	this[tag]=materialOld[tag]
		// }
    }
	_initLitRenderTarget(){
		const litRenderTarget = new THREE.WebGLRenderTarget(
			window.innerWidth,
			window.innerHeight,
			{
			  minFilter: THREE.NearestFilter,
			  magFilter: THREE.NearestFilter,
			  format: THREE.RGBAFormat,
			  type: THREE.FloatType
			}
		)
		litRenderTarget.texture.type = 1015
		litRenderTarget.texture.format = 1023

		function onWindowResize() {
			litRenderTarget.setSize(window.innerWidth, window.innerHeight)
			requestAnimationFrame(onWindowResize);
		}
		onWindowResize() 
		return litRenderTarget 
	}
	probeIrradianceUpdate(irradianceLoader){
		this.uniforms.probeIrradiance.value = irradianceLoader
		// if(!window.flag00){
		// 	window.flag00=true
		// 	this.DataTexture2Json()
		// }
	}
	DataTexture2Json(){
		const image=this.uniforms.probeIrradiance.value.image
		let k0=0
		for(let k=image.data.length-1;k>=0&&image.data[k]==0;k++,k0++);
		console.log(k0)
		const data=[]
		for(let i=0;i<image.data.length-k0;i++)
			data.push(image.data[i].toFixed(9))
		// 将场景对象转换为 JSON 字符串
		const J= JSON.stringify({
			data:data,
			height:image.height,
			width:image.width
		});
		const link = document.createElement('a');
		link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(J);
		link.download = 'probeIrradiance.json';
		document.body.appendChild(link);
		link.click();
	}
	DataTexture2Hdr(){
		// const probeIrradiance=this.uniforms.probeIrradiance.value
		// // 创建一个DataTexture对象
		// const width = probeIrradiance.image.width;
		// const height = probeIrradiance.image.height;
		// const data = new Float32Array(width * height * 4);
		// const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);

		// // 导出为hdr文件
		// const exporter = new THREE.WebGLRenderTarget();
		// const hdrData = exporter.fromTexture(texture).data;
		// const blob = new Blob([hdrData], { type: 'application/octet-stream' });
		// const url = URL.createObjectURL(blob);

		// // 下载文件
		// const link = document.createElement('a');
		// link.href = url;
		// link.download = 'probeIrradiance.hdr';
		// link.click();
		const dataTexture=this.uniforms.probeIrradiance.value
		console.log("dataTexture", dataTexture)

		// 假设有一个名为dataTexture的THREE.DataTexture对象
		const width = dataTexture.image.width;
		const height = dataTexture.image.height;

		// 将DataTexture的数据转换为32位浮点数数组
		const dataArray = new Float32Array(dataTexture.image.data);

		// 创建一个二进制文件缓冲区
		// const buffer = new ArrayBuffer(4 * width * height);
		// console.log(4 * width * height,buffer)
		// const view = new Float32Array(buffer);
		// console.log("dataArray",dataArray)
		// view.set(dataArray);
		const view =dataArray

		// 将数据进行gzip压缩
		const gzippedData = pako.gzip(view, { to: 'string' });

		// 将压缩后的数据转换为Base64字符串
		const base64Data = btoa(String.fromCharCode(...gzippedData));

		// 保存数据到本地hdr文件
		const csvContent = 'data:application/octet-stream;base64,' + base64Data;
		const link = document.createElement('a');
		link.href = csvContent;
		link.download = 'data.hdr';
		document.body.appendChild(link);
		link.click();
	}
	Json2DataTexture(){
		const self=this
		new THREE.FileLoader().load(
			'probeIrradiance.json',
			 data => {
				const J=JSON.parse( data )
				const texture=array2Texture(J.data, J.width,J.height)
				self.uniforms.probeIrradiance.value.image=texture
				// return texture
			}
		)
		function array2Texture(array, w,h) {
            let data = new Float32Array(w * h * 3); // RGB:3 RGBA:4
            data.set(array);
            let texture = new THREE.DataTexture(
				data, w, h, 
				THREE.RGBFormat,// 使用RGB三个通道 //THREE.RGBAFormat 四个通道
				THREE.FloatType);
            texture.needsUpdate = true;
            return texture;
        }
	}
}