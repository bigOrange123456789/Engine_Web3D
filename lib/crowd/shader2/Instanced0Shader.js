import {vs_MeshStandardMaterial} from "./vs_MeshStandardMaterial.js"
import {vs_anim} from "./vs_anim.js"

import {fs_MeshStandardMaterial} from "./fs_MeshStandardMaterial.js"
const VS={
	"MeshStandardMaterial":vs_MeshStandardMaterial.shader,
	"anim":vs_anim.shader,
}
const FS={
	"MeshStandardMaterial":fs_MeshStandardMaterial.shader
}
export class Instanced0Shader{
	constructor(opt){
		let frag =FS["MeshStandardMaterial"]
		if(opt.scattering){
			
		}
		this.fragmentShader=frag
		// const isInstancedMesh=opt["isInstancedMesh"]
		this.vertexShader=VS["MeshStandardMaterial"]
		// this.addGlsl(
		// 	VS["MeshStandardMaterial"],
		// 	VS["anim"]//opt["isSimShader"]?VS["anim_sim"]:VS["anim"]//VS["anim_sim"]//
		// )
		
		
	}
	addGlsl(origin,str0,tag){
		if(!tag)tag='#include <common>' 
		var str1='\n' + str0+ '\n' + tag + '\n' 
		return origin
				.replace( tag, str1 );
	}
}