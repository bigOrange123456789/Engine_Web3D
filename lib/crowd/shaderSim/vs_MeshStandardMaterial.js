export class vs_MeshStandardMaterial{
    static shader=/* glsl */`
	#define STANDARD
	varying vec3 vViewPosition;

	#ifdef USE_TRANSMISSION

		varying vec3 vWorldPosition;

	#endif

	#include <common>
	#include <uv_pars_vertex>
	//#include <uv2_pars_vertex>
	#include <displacementmap_pars_vertex>
	#include <color_pars_vertex>
	#include <fog_pars_vertex>
	#include <normal_pars_vertex>
	#include <morphtarget_pars_vertex>
	#include <skinning_pars_vertex>
	#include <shadowmap_pars_vertex>
	#include <logdepthbuf_pars_vertex>
	#include <clipping_planes_pars_vertex>
	////////////////////////////////////////////////////////////////
	// float get0() { // 身体形变
	// 	float b=round(skinIndex[0]);
	// 	float A=textureType[0],
	// 		  B=textureType[1],
	// 		  C=textureType[2],
	// 		  D=textureType[3];
	// 	if(b > 30.5)return B;//手臂
	// 	else if((27.<=b&&b<=46.)||(55.<=b&&b<=74.))return A;//手部
	// 	else if(b > 25.5)return A;//头
	// 	// else if(b==19.||b==47.)return B;//肩部
	// 	// else if((20.<=b&&b<=22.)||(48.<=b&&b<=50.))return B;//肩部
	// 	else if((5.<=b&&b<=7.)||(78.<=b&&b<=80.))return D;//膝盖
	// 	else if ( b < 3.5 || (b > 5.5 && b < 6.5) )return C; // 肚子
	// 	else if(b > 15.5 && b < 16.5)return D;//膝盖
	// 	else if(12.5<b && b < 16.5)return D;//膝盖
	// 	else if((5.<=b&&b<=7.)||(78.<=b&&b<=80.))return D;//膝盖
	// 	else if(b==8.||b==81.)return D;//踝关节
	// 	else if((9.<=b&&b<=10.)||(82.<=b&&b<=83.))return D;//脚趾
	// 	else return D;
	// }
	float get0(){
		return textureType;//textureType[0];
	}
	////////////////////////////////////////////////////////////////
	void main() {
		// gl_Position=vec4(0.,0.,-1000.,1.);
		// return;
		#include <uv_vertex>
		//#include <uv2_vertex>
		////////////////////////////////////////////
		// #if defined( USE_UV ) || defined( USE_ANISOTROPY )

		// 	// vUv = vec3( uv, 1 ).xy;
		// 	vUv.x/=32.;

		// #endif
		#ifdef USE_MAP
			// if(vMapUv.x>0.5)vMapUv.x=1.-vMapUv.x;
			// vMapUv.x=0.995*vMapUv.x*2.;//vMapUv/=32.;
			// vMapUv.x=(vMapUv.x+get0())/32.;
			
			float cm=9.;//32.;
			float rm=5.;//1.;
			float col=textureType- floor(textureType/cm) *cm;//float(int(textureIndex) % int(textureCount[1]));
    		col=round(col);
    		if(col==cm)col=0.;
    		float row = (textureType - col) / cm;

			if(vMapUv.x>0.5)vMapUv.x=1.-vMapUv.x;
			vMapUv.x=0.95*vMapUv.x*2.;
			vMapUv.x = (vMapUv.x + col) / cm;
    		vMapUv.y = (vMapUv.y + row) / rm;

			

		#endif
		// vUv.x/=32.;
		////////////////////////////////////////////
		#include <color_vertex>

		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
		#include <normal_vertex>

		#include <begin_vertex>
		#include <morphtarget_vertex>
		#include <skinning_vertex>
		#include <displacementmap_vertex>
		///////////////////////////////////////////
		Vertex vertex;
		vertex.position=transformed;
		vertex.normal=vNormal;
		// transformed_temp=transformed;
		// vNormal_temp=vNormal;
		vertex=frameInterpolation(vertex);
		// transformed=transformed_temp;
		// vNormal=vNormal_temp;
		transformed=vertex.position;
		vNormal=vertex.normal;

		// vec4 temp=frameInterpolation(transformed);
		// transformed=temp.xyz;
		// float direction=temp.a;
		// instanceColorOut= instanceColorIn;//vNormal
		///////////////////////////////////////////
		#include <project_vertex>
		
		#include <logdepthbuf_vertex>
		#include <clipping_planes_vertex>

		vViewPosition = - mvPosition.xyz;

		#include <worldpos_vertex>
		#include <shadowmap_vertex>
		#include <fog_vertex>

	#ifdef USE_TRANSMISSION

		vWorldPosition = worldPosition.xyz;

	#endif
	}`;
}