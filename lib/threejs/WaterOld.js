import {
	Color,
	FrontSide,
	Matrix4,
	Mesh,
	ShaderMaterial,
	UniformsLib,
	UniformsUtils,
	Vector3,
} from 'three';

/**
 * Work based on :
 * https://github.com/Slayvin: Flat mirror for three.js
 * https://home.adelphi.edu/~stemkoski/ : An implementation of water shader based on the flat mirror
 * http://29a.ch/ && http://29a.ch/slides/2012/webglwater/ : Water shader explanations in WebGL
 */

class Water extends Mesh {

	constructor( geometry, options = {} ) {

		super( geometry );

		this.isWater = true;

		const scope = this;

		const alpha = options.alpha !== undefined ? options.alpha : 1.0;
		const time = options.time !== undefined ? options.time : 0.0;
		const normalSampler = options.waterNormals !== undefined ? options.waterNormals : null;
		const sunDirection = options.sunDirection !== undefined ? options.sunDirection : new Vector3( 0.70707, 0.70707, 0.0 );
		const sunColor = new Color( options.sunColor !== undefined ? options.sunColor : 0xffffff );
		const waterColor = new Color( options.waterColor !== undefined ? options.waterColor : 0x7F7F7F );
		const eye = options.eye !== undefined ? options.eye : new Vector3( 0, 0, 0 );
		const distortionScale = options.distortionScale !== undefined ? options.distortionScale : 20.0;
		const side = options.side !== undefined ? options.side : FrontSide;
		const fog = options.fog !== undefined ? options.fog : false;



		const textureMatrix = new Matrix4();

		const mirrorShader = {

			uniforms: UniformsUtils.merge( [
				UniformsLib[ 'fog' ],
				UniformsLib[ 'lights' ],
				{
					'normalSampler': { value: null },
					'mirrorSampler': { value: null },
					'alpha': { value: 1.0 },
					'time': { value: 0.0 },
					'time2': { value: 0.0 },
					'size': { value: 1.0 },
					'distortionScale': { value: 20.0 },
					'textureMatrix': { value: new Matrix4() },
					'sunColor': { value: new Color( 0x7F7F7F ) },
					'sunDirection': { value: new Vector3( 0.70707, 0.70707, 0 ) },
					'eye': { value: new Vector3() },
					'waterColor': { value: new Color( 0x555555 ) }
				}
			] ),

			vertexShader: /* glsl */`
				uniform mat4 textureMatrix;
				uniform float time;
				uniform float time2;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				#include <common>
				#include <fog_pars_vertex>
				#include <shadowmap_pars_vertex>
				#include <logdepthbuf_pars_vertex>

				void main() {
					mirrorCoord = modelMatrix * vec4( position, 1.0 );
					worldPosition = mirrorCoord.xyzw;
					mirrorCoord = textureMatrix * mirrorCoord;
					vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );
					gl_Position = projectionMatrix * mvPosition;

				#include <beginnormal_vertex>
				#include <defaultnormal_vertex>
				#include <logdepthbuf_vertex>
				#include <fog_vertex>
				#include <shadowmap_vertex>
			}`,

			fragmentShader: /* glsl */`
				uniform sampler2D mirrorSampler;
				uniform float alpha;
				uniform float time;
				uniform float time2;
				uniform float size;
				uniform float distortionScale;
				uniform sampler2D normalSampler;
				uniform vec3 sunColor;
				uniform vec3 sunDirection;
				uniform vec3 eye;
				uniform vec3 waterColor;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				vec4 getNoise1( vec2 uv ) {
					vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);
					vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );
					vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );
					vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );
					vec4 noise = texture2D( normalSampler, uv0 ) +
						texture2D( normalSampler, uv1 ) +
						texture2D( normalSampler, uv2 ) +
						texture2D( normalSampler, uv3 );
					return noise * 0.5 - 1.0;
				}
				vec4 getNoise0( vec2 uv ) {
					// float t=time%2.;
					// if(t>1)t=2.-t;
					float a=time;
					float b=1.-time;

					vec2 uv0 = ( uv / 103.0 ) + vec2(0);
					vec2 uv1 = uv / 107.0-vec2( 0 );
					vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( 0 );
					vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( 0 );
					vec4 noise = texture2D( normalSampler, uv0 ) +
						texture2D( normalSampler, uv1 ) +
						texture2D( normalSampler, uv2 ) +
						texture2D( normalSampler, uv3 );
					return noise*0.5  - 1.0;
				}
				vec4 getNoise( vec2 uv ) {
					// float t=time%2.;
					// if(t>1)t=2.-t;
					float a=time;
					float b=1.-time;
					float c=2.*time2*0.5-.5;
					float d=1.-2.*time2*0.5;

					return a*getNoise0(uv)+b*getNoise0(1.-uv)+c*getNoise0(0.5*uv)+d*getNoise0(1.-0.5*uv);
				}

				void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {
					vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );
					float direction = max( 0.0, dot( eyeDirection, reflection ) );
					specularColor += pow( direction, shiny ) * sunColor * spec;
					diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;
				}

				#include <common>
				#include <packing>
				#include <bsdfs>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <lights_pars_begin>
				#include <shadowmap_pars_fragment>
				#include <shadowmask_pars_fragment>
				vec4 test(float a){
					vec4 noise = getNoise( worldPosition.xz * size *a);
					vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );
					return dot(surfaceNormal,vec3(1.))*vec4(1.)-0.65;
				}

				void main() {

					#include <logdepthbuf_fragment>
					

					gl_FragColor=0.5*test(20.)+0.5*test(1.);
					gl_FragColor.r-=0.3;
					// gl_FragColor.b+=0.3;


					#include <tonemapping_fragment>
					#include <fog_fragment>
				}`

		};

		const material = new ShaderMaterial( {
			fragmentShader: mirrorShader.fragmentShader,
			vertexShader: mirrorShader.vertexShader,
			uniforms: UniformsUtils.clone( mirrorShader.uniforms ),
			lights: true,
			side: side,
			fog: fog
		} );

		material.uniforms[ 'mirrorSampler' ].value = null;
		material.uniforms[ 'textureMatrix' ].value = textureMatrix;
		material.uniforms[ 'alpha' ].value = alpha;
		material.uniforms[ 'time' ].value = time;
		material.uniforms[ 'normalSampler' ].value = normalSampler;
		material.uniforms[ 'sunColor' ].value = sunColor;
		material.uniforms[ 'waterColor' ].value = waterColor;
		material.uniforms[ 'sunDirection' ].value = sunDirection;
		material.uniforms[ 'distortionScale' ].value = distortionScale;

		material.uniforms[ 'eye' ].value = eye;

		scope.material = material;


	}

}

export { Water };
