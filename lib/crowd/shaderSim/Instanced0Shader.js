import {vs_MeshStandardMaterial} from "./vs_MeshStandardMaterial.js"
import {vs_anim} from "./vs_anim.js"
import {vs_anim_sim} from "./vs_anim_sim.js"
import {vs_anim_no} from "./vs_anim_no.js"

import {fs_MeshStandardMaterial} from "./fs_MeshStandardMaterial.js"
import {fs_lights_physical_pars_fragment_Scattering} from "./fs_lights_physical_pars_fragment_Scattering.js"
const VS={
	"MeshStandardMaterial":vs_MeshStandardMaterial.shader,
	"anim":vs_anim.shader,
	"anim_sim":vs_anim_sim.shader,
	"anim_no":vs_anim_no.shader
}
const FS={
	"MeshStandardMaterial":fs_MeshStandardMaterial.shader,
	"lights_physical_pars_fragment_Scattering":fs_lights_physical_pars_fragment_Scattering.shader
}
export class Instanced0Shader{
	constructor(opt){
		let frag =FS["MeshStandardMaterial"]
		if(opt.scattering){
			frag = frag.replace( 
				'#include <lights_physical_pars_fragment>', 
				'#include <lights_physical_pars_fragment>'+
				FS["lights_physical_pars_fragment_Scattering"]
			)
		}
		this.fragmentShader=frag
		// const isInstancedMesh=opt["isInstancedMesh"]
		if(opt["isInstancedMesh"]){
			this.vertexShader=this.addGlsl(
				VS["MeshStandardMaterial"],
				opt["isSimShader"]?VS["anim_sim"]:VS["anim"]//VS["anim_sim"]//
			)
		}else{
			this.vertexShader=this.addGlsl(
				VS["MeshStandardMaterial"],
				VS["anim_no"]
			)
		}
		
		
	}
	addGlsl(origin,str0,tag){
		if(!tag)tag='#include <common>' 
		var str1='\n' + str0+ '\n' + tag + '\n' 
		return origin
				.replace( tag, str1 );
	}
}