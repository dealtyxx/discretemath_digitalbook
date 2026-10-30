import{r as c,c as St,j as t,R as Ie,u as jt}from"./index-puyYC48Z.js";import{u as fe,a as wt,_ as je,D as At,V as N,b as _e,P as Ye,O as et,R as Et,I as Mt,F as We,c as we,d as X,W as _t,B as Ne,S as tt,e as Nt,U as He,f as $e,M as Bt,g as Q,L as Lt,h as Ct,i as Pt,C as Ae,s as Fe,G as Ot,j as zt,k as Ut}from"./GraphicsBoundary-CtFZxZJN.js";import{F as ve}from"./Formula-tfxjAYVf.js";const se=new N,Be=new N,kt=new N,Ge=new _e;function Dt(s,e,n){const a=se.setFromMatrixPosition(s.matrixWorld);a.project(e);const i=n.width/2,r=n.height/2;return[a.x*i+i,-(a.y*r)+r]}function Tt(s,e){const n=se.setFromMatrixPosition(s.matrixWorld),a=Be.setFromMatrixPosition(e.matrixWorld),i=n.sub(a),r=e.getWorldDirection(kt);return i.angleTo(r)>Math.PI/2}function Rt(s,e,n,a){const i=se.setFromMatrixPosition(s.matrixWorld),r=i.clone();r.project(e),Ge.set(r.x,r.y),n.setFromCamera(Ge,e);const o=n.intersectObjects(a,!0);if(o.length){const l=o[0].distance;return i.distanceTo(n.ray.origin)<l}return!0}function It(s,e){if(e instanceof et)return e.zoom;if(e instanceof Ye){const n=se.setFromMatrixPosition(s.matrixWorld),a=Be.setFromMatrixPosition(e.matrixWorld),i=e.fov*Math.PI/180,r=n.distanceTo(a);return 1/(2*Math.tan(i/2)*r)}else return 1}function Wt(s,e,n){if(e instanceof Ye||e instanceof et){const a=se.setFromMatrixPosition(s.matrixWorld),i=Be.setFromMatrixPosition(e.matrixWorld),r=a.distanceTo(i),o=(n[1]-n[0])/(e.far-e.near),l=n[1]-o*e.far;return Math.round(o*r+l)}}const Ee=s=>Math.abs(s)<1e-10?0:s;function nt(s,e,n=""){let a="matrix3d(";for(let i=0;i!==16;i++)a+=Ee(e[i]*s.elements[i])+(i!==15?",":")");return n+a}const Ht=(s=>e=>nt(e,s))([1,-1,1,1,1,-1,1,1,1,-1,1,1,1,-1,1,1]),$t=(s=>(e,n)=>nt(e,s(n),"translate(-50%,-50%)"))(s=>[1/s,1/s,1/s,1,-1/s,-1/s,-1/s,-1,1/s,1/s,1/s,1,1,1,1,1]);function Ft(s){return s&&typeof s=="object"&&"current"in s}const Gt=c.forwardRef(({children:s,eps:e=.001,style:n,className:a,prepend:i,center:r,fullscreen:o,portal:l,distanceFactor:h,sprite:u=!1,transform:f=!1,occlude:d,onOcclude:m,castShadow:w,receiveShadow:S,material:g,geometry:B,zIndexRange:b=[16777271,0],calculatePosition:T=Dt,as:p="div",wrapperClass:y,pointerEvents:W="auto",...O},F)=>{const{gl:Y,camera:_,scene:x,size:j,raycaster:he,events:ut,viewport:ft}=fe(),[L]=c.useState(()=>document.createElement(p)),me=c.useRef(null),P=c.useRef(null),Ue=c.useRef(0),ie=c.useRef([0,0]),ee=c.useRef(null),pe=c.useRef(null),J=l?.current||ut.connected||Y.domElement.parentNode,H=c.useRef(null),re=c.useRef(!1),ae=c.useMemo(()=>d&&d!=="blending"||Array.isArray(d)&&d.length&&Ft(d[0]),[d]);c.useLayoutEffect(()=>{const C=Y.domElement;d&&d==="blending"?(C.style.zIndex=`${Math.floor(b[0]/2)}`,C.style.position="absolute",C.style.pointerEvents="none"):(C.style.zIndex=null,C.style.position=null,C.style.pointerEvents=null)},[d]),c.useLayoutEffect(()=>{if(P.current){const C=me.current=St.createRoot(L);if(x.updateMatrixWorld(),f)L.style.cssText="position:absolute;top:0;left:0;pointer-events:none;overflow:hidden;";else{const v=T(P.current,_,j);L.style.cssText=`position:absolute;top:0;left:0;transform:translate3d(${v[0]}px,${v[1]}px,0);transform-origin:0 0;`}return J&&(i?J.prepend(L):J.appendChild(L)),()=>{J&&J.removeChild(L),C.unmount()}}},[J,f]),c.useLayoutEffect(()=>{y&&(L.className=y)},[y]);const ke=c.useMemo(()=>f?{position:"absolute",top:0,left:0,width:j.width,height:j.height,transformStyle:"preserve-3d",pointerEvents:"none"}:{position:"absolute",transform:r?"translate3d(-50%,-50%,0)":"none",...o&&{top:-j.height/2,left:-j.width/2,width:j.width,height:j.height},...n},[n,r,o,j,f]),ht=c.useMemo(()=>({position:"absolute",pointerEvents:W}),[W]);c.useLayoutEffect(()=>{if(re.current=!1,f){var C;(C=me.current)==null||C.render(c.createElement("div",{ref:ee,style:ke},c.createElement("div",{ref:pe,style:ht},c.createElement("div",{ref:F,className:a,style:n,children:s}))))}else{var v;(v=me.current)==null||v.render(c.createElement("div",{ref:F,style:ke,className:a,children:s}))}});const K=c.useRef(!0);wt(C=>{if(P.current){_.updateMatrixWorld(),P.current.updateWorldMatrix(!0,!1);const v=f?ie.current:T(P.current,_,j);if(f||Math.abs(Ue.current-_.zoom)>e||Math.abs(ie.current[0]-v[0])>e||Math.abs(ie.current[1]-v[1])>e){const G=Tt(P.current,_);let R=!1;ae&&(Array.isArray(d)?R=d.map(V=>V.current):d!=="blending"&&(R=[x]));const te=K.current;if(R){const V=Rt(P.current,_,he,R);K.current=V&&!G}else K.current=!G;te!==K.current&&(m?m(!K.current):L.style.display=K.current?"block":"none");const oe=Math.floor(b[0]/2),mt=d?ae?[b[0],oe]:[oe-1,0]:b;if(L.style.zIndex=`${Wt(P.current,_,mt)}`,f){const[V,Te]=[j.width/2,j.height/2],xe=_.projectionMatrix.elements[5]*Te,{isOrthographicCamera:Re,top:pt,left:xt,bottom:vt,right:gt}=_,bt=Ht(_.matrixWorldInverse),yt=Re?`scale(${xe})translate(${Ee(-(gt+xt)/2)}px,${Ee((pt+vt)/2)}px)`:`translateZ(${xe}px)`;let q=P.current.matrixWorld;u&&(q=_.matrixWorldInverse.clone().transpose().copyPosition(q).scale(P.current.scale),q.elements[3]=q.elements[7]=q.elements[11]=0,q.elements[15]=1),L.style.width=j.width+"px",L.style.height=j.height+"px",L.style.perspective=Re?"":`${xe}px`,ee.current&&pe.current&&(ee.current.style.transform=`${yt}${bt}translate(${V}px,${Te}px)`,pe.current.style.transform=$t(q,1/((h||10)/400)))}else{const V=h===void 0?1:It(P.current,_)*h;L.style.transform=`translate3d(${v[0]}px,${v[1]}px,0) scale(${V})`}ie.current=v,Ue.current=_.zoom}}if(!ae&&H.current&&!re.current)if(f){if(ee.current){const v=ee.current.children[0];if(v!=null&&v.clientWidth&&v!=null&&v.clientHeight){const{isOrthographicCamera:G}=_;if(G||B)O.scale&&(Array.isArray(O.scale)?O.scale instanceof N?H.current.scale.copy(O.scale.clone().divideScalar(1)):H.current.scale.set(1/O.scale[0],1/O.scale[1],1/O.scale[2]):H.current.scale.setScalar(1/O.scale));else{const R=(h||10)/400,te=v.clientWidth*R,oe=v.clientHeight*R;H.current.scale.set(te,oe,1)}re.current=!0}}}else{const v=L.children[0];if(v!=null&&v.clientWidth&&v!=null&&v.clientHeight){const G=1/ft.factor,R=v.clientWidth*G,te=v.clientHeight*G;H.current.scale.set(R,te,1),re.current=!0}H.current.lookAt(C.camera.position)}});const De=c.useMemo(()=>({vertexShader:f?void 0:`
          /*
            This shader is from the THREE's SpriteMaterial.
            We need to turn the backing plane into a Sprite
            (make it always face the camera) if "transfrom"
            is false.
          */
          #include <common>

          void main() {
            vec2 center = vec2(0., 1.);
            float rotation = 0.0;

            // This is somewhat arbitrary, but it seems to work well
            // Need to figure out how to derive this dynamically if it even matters
            float size = 0.03;

            vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
            vec2 scale;
            scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
            scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

            bool isPerspective = isPerspectiveMatrix( projectionMatrix );
            if ( isPerspective ) scale *= - mvPosition.z;

            vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale * size;
            vec2 rotatedPosition;
            rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
            rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
            mvPosition.xy += rotatedPosition;

            gl_Position = projectionMatrix * mvPosition;
          }
      `,fragmentShader:`
        void main() {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
      `}),[f]);return c.createElement("group",je({},O,{ref:P}),d&&!ae&&c.createElement("mesh",{castShadow:w,receiveShadow:S,ref:H},B||c.createElement("planeGeometry",null),g||c.createElement("shaderMaterial",{side:At,vertexShader:De.vertexShader,fragmentShader:De.fragmentShader})))}),st=parseInt(Et.replace(/\D+/g,"")),it=st>=125?"uv1":"uv2",Ve=new Ne,le=new N;class Le extends Mt{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],n=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],a=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(a),this.setAttribute("position",new We(e,3)),this.setAttribute("uv",new We(n,2))}applyMatrix4(e){const n=this.attributes.instanceStart,a=this.attributes.instanceEnd;return n!==void 0&&(n.applyMatrix4(e),a.applyMatrix4(e),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let n;e instanceof Float32Array?n=e:Array.isArray(e)&&(n=new Float32Array(e));const a=new we(n,6,1);return this.setAttribute("instanceStart",new X(a,3,0)),this.setAttribute("instanceEnd",new X(a,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,n=3){let a;e instanceof Float32Array?a=e:Array.isArray(e)&&(a=new Float32Array(e));const i=new we(a,n*2,1);return this.setAttribute("instanceColorStart",new X(i,n,0)),this.setAttribute("instanceColorEnd",new X(i,n,n)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new _t(e.geometry)),this}fromLineSegments(e){const n=e.geometry;return this.setPositions(n.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ne);const e=this.attributes.instanceStart,n=this.attributes.instanceEnd;e!==void 0&&n!==void 0&&(this.boundingBox.setFromBufferAttribute(e),Ve.setFromBufferAttribute(n),this.boundingBox.union(Ve))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new tt),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,n=this.attributes.instanceEnd;if(e!==void 0&&n!==void 0){const a=this.boundingSphere.center;this.boundingBox.getCenter(a);let i=0;for(let r=0,o=e.count;r<o;r++)le.fromBufferAttribute(e,r),i=Math.max(i,a.distanceToSquared(le)),le.fromBufferAttribute(n,r),i=Math.max(i,a.distanceToSquared(le));this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}class rt extends Le{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const n=e.length-3,a=new Float32Array(2*n);for(let i=0;i<n;i+=3)a[2*i]=e[i],a[2*i+1]=e[i+1],a[2*i+2]=e[i+2],a[2*i+3]=e[i+3],a[2*i+4]=e[i+4],a[2*i+5]=e[i+5];return super.setPositions(a),this}setColors(e,n=3){const a=e.length-n,i=new Float32Array(2*a);if(n===3)for(let r=0;r<a;r+=n)i[2*r]=e[r],i[2*r+1]=e[r+1],i[2*r+2]=e[r+2],i[2*r+3]=e[r+3],i[2*r+4]=e[r+4],i[2*r+5]=e[r+5];else for(let r=0;r<a;r+=n)i[2*r]=e[r],i[2*r+1]=e[r+1],i[2*r+2]=e[r+2],i[2*r+3]=e[r+3],i[2*r+4]=e[r+4],i[2*r+5]=e[r+5],i[2*r+6]=e[r+6],i[2*r+7]=e[r+7];return super.setColors(i,n),this}fromLine(e){const n=e.geometry;return this.setPositions(n.attributes.position.array),this}}class Ce extends Nt{constructor(e){super({type:"LineMaterial",uniforms:He.clone(He.merge([$e.common,$e.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new _e(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`,fragmentShader:`
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${st>=154?"colorspace_fragment":"encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(n){this.uniforms.diffuse.value=n}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(n){n===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(n){this.uniforms.linewidth.value=n}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(n){!!n!="USE_DASH"in this.defines&&(this.needsUpdate=!0),n===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(n){this.uniforms.dashScale.value=n}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(n){this.uniforms.dashSize.value=n}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(n){this.uniforms.dashOffset.value=n}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(n){this.uniforms.gapSize.value=n}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(n){this.uniforms.opacity.value=n}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(n){this.uniforms.resolution.value.copy(n)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(n){!!n!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),n===!0?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(e)}}const ge=new Q,qe=new N,Ze=new N,A=new Q,E=new Q,U=new Q,be=new N,ye=new Ct,M=new Lt,Je=new N,ce=new Ne,de=new tt,k=new Q;let D,Z;function Ke(s,e,n){return k.set(0,0,-e,1).applyMatrix4(s.projectionMatrix),k.multiplyScalar(1/k.w),k.x=Z/n.width,k.y=Z/n.height,k.applyMatrix4(s.projectionMatrixInverse),k.multiplyScalar(1/k.w),Math.abs(Math.max(k.x,k.y))}function Vt(s,e){const n=s.matrixWorld,a=s.geometry,i=a.attributes.instanceStart,r=a.attributes.instanceEnd,o=Math.min(a.instanceCount,i.count);for(let l=0,h=o;l<h;l++){M.start.fromBufferAttribute(i,l),M.end.fromBufferAttribute(r,l),M.applyMatrix4(n);const u=new N,f=new N;D.distanceSqToSegment(M.start,M.end,f,u),f.distanceTo(u)<Z*.5&&e.push({point:f,pointOnLine:u,distance:D.origin.distanceTo(f),object:s,face:null,faceIndex:l,uv:null,[it]:null})}}function qt(s,e,n){const a=e.projectionMatrix,r=s.material.resolution,o=s.matrixWorld,l=s.geometry,h=l.attributes.instanceStart,u=l.attributes.instanceEnd,f=Math.min(l.instanceCount,h.count),d=-e.near;D.at(1,U),U.w=1,U.applyMatrix4(e.matrixWorldInverse),U.applyMatrix4(a),U.multiplyScalar(1/U.w),U.x*=r.x/2,U.y*=r.y/2,U.z=0,be.copy(U),ye.multiplyMatrices(e.matrixWorldInverse,o);for(let m=0,w=f;m<w;m++){if(A.fromBufferAttribute(h,m),E.fromBufferAttribute(u,m),A.w=1,E.w=1,A.applyMatrix4(ye),E.applyMatrix4(ye),A.z>d&&E.z>d)continue;if(A.z>d){const p=A.z-E.z,y=(A.z-d)/p;A.lerp(E,y)}else if(E.z>d){const p=E.z-A.z,y=(E.z-d)/p;E.lerp(A,y)}A.applyMatrix4(a),E.applyMatrix4(a),A.multiplyScalar(1/A.w),E.multiplyScalar(1/E.w),A.x*=r.x/2,A.y*=r.y/2,E.x*=r.x/2,E.y*=r.y/2,M.start.copy(A),M.start.z=0,M.end.copy(E),M.end.z=0;const g=M.closestPointToPointParameter(be,!0);M.at(g,Je);const B=Pt.lerp(A.z,E.z,g),b=B>=-1&&B<=1,T=be.distanceTo(Je)<Z*.5;if(b&&T){M.start.fromBufferAttribute(h,m),M.end.fromBufferAttribute(u,m),M.start.applyMatrix4(o),M.end.applyMatrix4(o);const p=new N,y=new N;D.distanceSqToSegment(M.start,M.end,y,p),n.push({point:y,pointOnLine:p,distance:D.origin.distanceTo(y),object:s,face:null,faceIndex:m,uv:null,[it]:null})}}}class at extends Bt{constructor(e=new Le,n=new Ce({color:Math.random()*16777215})){super(e,n),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,n=e.attributes.instanceStart,a=e.attributes.instanceEnd,i=new Float32Array(2*n.count);for(let o=0,l=0,h=n.count;o<h;o++,l+=2)qe.fromBufferAttribute(n,o),Ze.fromBufferAttribute(a,o),i[l]=l===0?0:i[l-1],i[l+1]=i[l]+qe.distanceTo(Ze);const r=new we(i,2,1);return e.setAttribute("instanceDistanceStart",new X(r,1,0)),e.setAttribute("instanceDistanceEnd",new X(r,1,1)),this}raycast(e,n){const a=this.material.worldUnits,i=e.camera;i===null&&!a&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const r=e.params.Line2!==void 0&&e.params.Line2.threshold||0;D=e.ray;const o=this.matrixWorld,l=this.geometry,h=this.material;Z=h.linewidth+r,l.boundingSphere===null&&l.computeBoundingSphere(),de.copy(l.boundingSphere).applyMatrix4(o);let u;if(a)u=Z*.5;else{const d=Math.max(i.near,de.distanceToPoint(D.origin));u=Ke(i,d,h.resolution)}if(de.radius+=u,D.intersectsSphere(de)===!1)return;l.boundingBox===null&&l.computeBoundingBox(),ce.copy(l.boundingBox).applyMatrix4(o);let f;if(a)f=Z*.5;else{const d=Math.max(i.near,ce.distanceToPoint(D.origin));f=Ke(i,d,h.resolution)}ce.expandByScalar(f),D.intersectsBox(ce)!==!1&&(a?Vt(this,n):qt(this,i,n))}onBeforeRender(e){const n=this.material.uniforms;n&&n.resolution&&(e.getViewport(ge),this.material.uniforms.resolution.value.set(ge.z,ge.w))}}class Zt extends at{constructor(e=new rt,n=new Ce({color:Math.random()*16777215})){super(e,n),this.isLine2=!0,this.type="Line2"}}const Jt=c.forwardRef(function({points:e,color:n=16777215,vertexColors:a,linewidth:i,lineWidth:r,segments:o,dashed:l,...h},u){var f,d;const m=fe(b=>b.size),w=c.useMemo(()=>o?new at:new Zt,[o]),[S]=c.useState(()=>new Ce),g=(a==null||(f=a[0])==null?void 0:f.length)===4?4:3,B=c.useMemo(()=>{const b=o?new Le:new rt,T=e.map(p=>{const y=Array.isArray(p);return p instanceof N||p instanceof Q?[p.x,p.y,p.z]:p instanceof _e?[p.x,p.y,0]:y&&p.length===3?[p[0],p[1],p[2]]:y&&p.length===2?[p[0],p[1],0]:p});if(b.setPositions(T.flat()),a){n=16777215;const p=a.map(y=>y instanceof Ae?y.toArray():y);b.setColors(p.flat(),g)}return b},[e,o,a,g]);return c.useLayoutEffect(()=>{w.computeLineDistances()},[e,w]),c.useLayoutEffect(()=>{l?S.defines.USE_DASH="":delete S.defines.USE_DASH,S.needsUpdate=!0},[l,S]),c.useEffect(()=>()=>{B.dispose(),S.dispose()},[B]),c.createElement("primitive",je({object:w,ref:u},h),c.createElement("primitive",{object:B,attach:"geometry"}),c.createElement("primitive",je({object:S,attach:"material",color:n,vertexColors:!!a,resolution:[m.width,m.height],linewidth:(d=i??r)!==null&&d!==void 0?d:1,dashed:l,transparent:g===4},h)))}),ot=["a","b","c"];function I(s){if(!Number.isInteger(s)||s<0||s>7)throw new RangeError("子集掩码必须是 0 到 7 的整数")}function Pe(s){return I(s),ot.filter((e,n)=>(s&1<<n)!==0)}function Me(s){const e=Pe(s);return e.length===0?"∅":`{${e.join(", ")}}`}function Kt(s){const e=Pe(s);return e.length===0?"\\varnothing":`\\{${e.join(",")}\\}`}function Xt(s){I(s);let e=0;for(let n=0;n<3;n+=1)(s&1<<n)!==0&&(e+=1);return e}function Qt(s){return I(s),[0,1,2].map(e=>(s&1<<e)===0?-1.35:1.35)}const z=Array.from({length:8},(s,e)=>({mask:e,label:Me(e),tex:Kt(e),elements:Pe(e),rank:Xt(e),position:Qt(e)})),Oe=z.flatMap(s=>[0,1,2].filter(e=>(s.mask&1<<e)===0).map(e=>({id:`${s.mask}-${s.mask|1<<e}`,lower:s.mask,upper:s.mask|1<<e,bit:e})));function ne(s,e){return I(s),I(e),(s&~e)===0}function lt(s,e){I(s),I(e);const n=ne(s,e),a=ne(e,s),i=s===e?"equal":n?"aSubset":a?"bSubset":"incomparable",r={equal:"A = B：二者互为子集",aSubset:"A ⊆ B：A 是 B 的子集",bSubset:"B ⊆ A：B 是 A 的子集",incomparable:"A 与 B 互不包含"}[i],o={equal:"A=B",aSubset:"A\\subseteq B",bSubset:"B\\subseteq A",incomparable:"A\\nsubseteq B\\ \\text{且}\\ B\\nsubseteq A"}[i];return{intersection:s&e,union:s|e,aSubsetB:n,bSubsetA:a,relation:i,relationText:r,relationTex:o}}function ue(s,e){return I(s),I(e),ne(s,e)?Oe.filter(n=>ne(s,n.lower)&&ne(n.upper,e)):[]}function Yt(s,e){const n=lt(s,e),a=[...ue(n.intersection,s),...ue(n.intersection,e)],i=[...ue(s,n.union),...ue(e,n.union)];return{intersection:[...new Map(a.map(r=>[r.id,r])).values()],union:[...new Map(i.map(r=>[r.id,r])).values()]}}const ct=[2.5,4.65,7.53],$={surface:"#fcfcfb",ink:"#142330",lineStrong:"#c3c2b7",series1:"#2a78d6",series2:"#eb6834",series3:"#1baf7a"};function Xe(){if(typeof document>"u")return $;const s=getComputedStyle(document.documentElement),e=(n,a)=>s.getPropertyValue(n).trim()||a;return{surface:e("--surface",$.surface),ink:e("--ink",$.ink),lineStrong:new Ae(e("--line-strong",$.lineStrong)).lerp(new Ae(e("--series-1",$.series1)),.28).getStyle(),series1:e("--series-1",$.series1),series2:e("--series-2",$.series2),series3:e("--series-3",$.series3)}}function en(){const[s,e]=c.useState(Xe);return c.useEffect(()=>{const n=()=>e(Xe());n();const a=new MutationObserver(n);return a.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme","class","style"]}),()=>a.disconnect()},[]),s}function dt(s,e){const n=e.intersection.some(i=>i.id===s.id),a=e.union.some(i=>i.id===s.id);return n&&a?"both":n?"intersection":a?"union":null}function ze(s,e,n,a){return[s.mask===e?"A":"",s.mask===n?"B":"",s.mask===a.intersection?"交":"",s.mask===a.union?"并":""].filter(Boolean).join("·")}function tn({resetToken:s,command:e}){const n=c.useRef(null),{camera:a}=fe();return c.useEffect(()=>{a.position.set(...ct),a.lookAt(0,0,0),n.current&&(n.current.target.set(0,0,0),n.current.update())},[a,s]),c.useEffect(()=>{if(!e)return;const i=n.current?.target??new N,r=a.position.clone().sub(i);if(e.action==="left"||e.action==="right")r.applyAxisAngle(new N(0,1,0),e.action==="left"?Math.PI/12:-Math.PI/12);else{const o=r.length(),l=e.action==="zoom-in"?.85:1.18;r.setLength(Math.min(13,Math.max(4,o*l)))}a.position.copy(i).add(r),a.lookAt(i),n.current?.update()},[a,e]),t.jsx(Ut,{ref:n,makeDefault:!0,enableDamping:!0,dampingFactor:.08,enablePan:!1,minDistance:4,maxDistance:13,rotateSpeed:.65,zoomSpeed:.75})}function nn({node:s,a:e,b:n,target:a,operations:i,colors:r,labelPortal:o,onSelect:l}){const h=fe(b=>b.size.height),u=Math.min(8,h/350*8),f=s.mask===e,d=s.mask===n,m=s.mask===i.intersection,w=s.mask===i.union,S=ze(s,e,n,i),g=f?r.series1:d||w?r.series2:m?r.series3:r.surface,B=b=>{b.stopPropagation(),l(s.mask)};return t.jsxs("group",{position:s.position,onClick:B,children:[t.jsxs("mesh",{children:[d?t.jsx("boxGeometry",{args:[.36,.36,.36]}):m?t.jsx("octahedronGeometry",{args:[.24,0]}):t.jsx("sphereGeometry",{args:[.215,24,24]}),t.jsx("meshStandardMaterial",{color:g,roughness:.52,metalness:.04})]}),f&&t.jsxs("mesh",{rotation:[Math.PI/2,0,0],children:[t.jsx("torusGeometry",{args:[.32,.025,8,32]}),t.jsx("meshBasicMaterial",{color:r.series1})]}),w&&t.jsxs("mesh",{children:[t.jsx("sphereGeometry",{args:[.285,12,8]}),t.jsx("meshBasicMaterial",{color:r.series2,wireframe:!0,transparent:!0,opacity:.8})]}),t.jsx(Gt,{portal:o,position:[0,.38,0],center:!0,distanceFactor:u,zIndexRange:[20,0],children:t.jsxs("button",{type:"button",className:`ch02-scene-label ${f?"selected-a":""} ${d?"selected-b":""}`,onClick:b=>{b.stopPropagation(),l(s.mask)},"aria-label":`${s.label}${S?`，标记 ${S}`:""}，点击选择`,"aria-pressed":a==="A"?f:d,children:[t.jsx("span",{children:s.label}),S&&t.jsx("small",{children:S})]})})]})}function sn({a:s,b:e,target:n,operations:a,relations:i,resetToken:r,command:o,onSelect:l}){const h=jt(),u=en(),f=c.useRef(null);return t.jsxs("div",{className:"three-scene ch02-three-scene diagram-stage",children:[t.jsxs(zt,{frameloop:h?"always":"never",camera:{position:ct,fov:42,near:.1,far:100},dpr:[1,2],gl:{antialias:!0,alpha:!0},"aria-label":"可旋转缩放的三维布尔立方体；拖动旋转，滚轮缩放，节点标签也可键盘选择",children:[t.jsx("ambientLight",{intensity:1.25}),t.jsx("directionalLight",{position:[4,6,5],intensity:2.1}),t.jsx(tn,{resetToken:r,command:o}),Oe.map(d=>{const m=dt(d,i),w=m==="intersection"?u.series3:m==="union"?u.series2:m==="both"?u.series1:u.lineStrong;return t.jsx(Jt,{points:[z[d.lower].position,z[d.upper].position],color:w,lineWidth:m?2.8:1.5,transparent:!0,opacity:m?1:.7,dashed:m==="union"||m==="both",dashSize:.13,gapSize:.09},d.id)}),z.map(d=>t.jsx(nn,{node:d,a:s,b:e,target:n,operations:a,colors:u,labelPortal:f,onSelect:l},d.mask))]}),t.jsx("div",{ref:f,className:"ch02-html-layer"})]})}const Se={0:{x:310,y:370},1:{x:110,y:270},2:{x:310,y:270},4:{x:510,y:270},3:{x:110,y:170},5:{x:310,y:170},6:{x:510,y:170},7:{x:310,y:70}};function Qe({a:s,b:e,operations:n,relations:a,target:i,onSelect:r}){return t.jsx("div",{className:"diagram-stage ch02-hasse-stage",children:t.jsxs("svg",{className:"svg-lab ch02-hasse",viewBox:"0 0 620 430",role:"group","aria-label":`二维哈斯图，向上表示包含。点击节点填入 ${i}；Enter 或空格也可选择。`,children:[t.jsx("title",{children:"三元素集合的幂集哈斯图：8 个子集与 12 条覆盖边"}),Oe.map(o=>{const l=Se[o.lower],h=Se[o.upper],u=dt(o,a);return t.jsx("line",{className:`ch02-hasse-edge ${u?`is-${u}`:""}`,x1:l.x,y1:l.y,x2:h.x,y2:h.y,children:t.jsxs("title",{children:[Me(o.lower)," 被 ",Me(o.upper)," 直接覆盖"]})},o.id)}),z.map(o=>{const l=Se[o.mask],h=o.mask===s,u=o.mask===e,f=o.mask===n.intersection,d=o.mask===n.union,m=ze(o,s,e,n),w=Math.max(32,m.length*12+12),S=["ch02-node-base",h?"selected-a":"",u?"selected-b":"",f?"is-intersection":"",d?"is-union":""].filter(Boolean).join(" ");return t.jsxs("g",{className:"ch02-hasse-node",transform:`translate(${l.x} ${l.y})`,role:"button",tabIndex:0,"aria-label":`${o.label}${m?`，${m}`:""}，填入 ${i}`,"aria-pressed":i==="A"?h:u,onClick:()=>r(o.mask),onKeyDown:g=>{(g.key==="Enter"||g.key===" ")&&(g.preventDefault(),r(o.mask))},children:[t.jsxs("title",{children:[o.label,"；",m||"未选中","；点击填入 ",i]}),t.jsx("ellipse",{className:"ch02-node-halo",rx:"63",ry:"38"}),d&&t.jsx("ellipse",{className:"ch02-union-ring",rx:"62",ry:"37"}),f&&t.jsx("path",{className:"ch02-intersection-marker",d:"M 0 -37 L 64 0 L 0 37 L -64 0 Z"}),h&&t.jsx("ellipse",{className:"ch02-a-ring",rx:"59",ry:"34"}),t.jsx("rect",{className:S,x:"-54",y:"-28",width:"108",height:"56",rx:u?7:28}),t.jsx("text",{className:"ch02-node-label",textAnchor:"middle",dominantBaseline:"central",children:o.label}),m&&t.jsxs("g",{className:"ch02-svg-badge",transform:"translate(0 -48)",children:[t.jsx("rect",{x:-w/2,y:-11,width:w,height:20,rx:4}),t.jsx("text",{textAnchor:"middle",dominantBaseline:"central",children:m})]})]},o.mask)})]})})}function rn(){return t.jsxs("div",{className:"legend ch02-relation-legend","aria-label":"节点和路径图例",children:[t.jsxs("span",{className:"legend-item",children:[t.jsx("i",{className:"ch02-legend-shape ring",children:"A"}),"选择 A（圆环）"]}),t.jsxs("span",{className:"legend-item",children:[t.jsx("i",{className:"ch02-legend-shape square",children:"B"}),"选择 B（方框）"]}),t.jsxs("span",{className:"legend-item",children:[t.jsx("i",{className:"swatch aqua"}),"交集路径（“交”标记）"]}),t.jsxs("span",{className:"legend-item",children:[t.jsx("i",{className:"ch02-legend-dash"}),"并集路径（虚线与“并”标记）"]})]})}function cn({onComplete:s}){const[e,n]=c.useState(Fe),[a,i]=c.useState(()=>Fe()?"3d":"2d"),[r,o]=c.useState(1),[l,h]=c.useState(6),[u,f]=c.useState("A"),[d,m]=c.useState(0),[w,S]=c.useState(null),g=c.useMemo(()=>lt(r,l),[r,l]),B=c.useMemo(()=>Yt(r,l),[r,l]),b=z[r],T=z[l],p=z[g.intersection],y=z[g.union],W=x=>{u==="A"?o(x):h(x),f(u==="A"?"B":"A")},O=()=>{o(1),h(6),f("A"),m(x=>x+1)},F=x=>{S(j=>({action:x,id:(j?.id??0)+1}))},Y=x=>{S(null),i(x)},_=()=>{n(!1),i("2d"),S(null)};return t.jsx("div",{className:"ch02-lab",children:t.jsxs("div",{className:"lab-workspace ch02-workspace",children:[t.jsx("div",{className:"lab-column",children:t.jsxs("section",{className:"visualization-panel","aria-labelledby":"ch02-visual-title",children:[t.jsxs("div",{className:"panel-heading",children:[t.jsxs("div",{children:[t.jsxs("h3",{id:"ch02-visual-title",children:["P(","{","a,b,c","}",") 的布尔立方体"]}),t.jsx("small",{children:"8 个子集 · 12 条覆盖边"})]}),t.jsxs("div",{className:"segmented",role:"group","aria-label":"立方体视图",children:[t.jsx("button",{className:a==="3d"?"active":"",onClick:()=>Y("3d"),"aria-pressed":a==="3d",disabled:!e,title:e?void 0:"当前环境无法启用三维视图",children:"三维立方体"}),t.jsx("button",{className:a==="2d"?"active":"",onClick:()=>Y("2d"),"aria-pressed":a==="2d",children:"二维哈斯图"})]})]}),!e&&t.jsx("p",{className:"graphics-fallback-note",role:"status",children:"当前环境无法启用三维视图，已显示二维哈斯图；子集选择和集合运算仍可完整使用。"}),a==="3d"?t.jsx(Ot,{onUnavailable:_,fallback:t.jsx(Qe,{a:r,b:l,operations:g,relations:B,target:u,onSelect:W}),children:t.jsx(sn,{a:r,b:l,target:u,operations:g,relations:B,resetToken:d,command:w,onSelect:W})}):t.jsx(Qe,{a:r,b:l,operations:g,relations:B,target:u,onSelect:W}),t.jsx("div",{className:"ch02-view-actions",children:t.jsx("p",{className:"fallback-note",children:a==="3d"?"拖动旋转、滚轮或双指缩放；也可使用下方按钮，或 Tab 到节点标签后按 Enter。坐标轴分别对应 a、b、c 是否属于子集。":"越向上元素越多；每条边连接恰好相差一个元素的子集。Tab 选择节点，Enter 或空格确认。"})}),a==="3d"&&t.jsxs("div",{className:"ch02-camera-controls",role:"group","aria-label":"三维相机键盘等价控制",children:[t.jsx("button",{type:"button",className:"mini-button",onClick:()=>F("left"),children:"视角左旋"}),t.jsx("button",{type:"button",className:"mini-button",onClick:()=>F("right"),children:"视角右旋"}),t.jsx("button",{type:"button",className:"mini-button",onClick:()=>F("zoom-in"),children:"放大"}),t.jsx("button",{type:"button",className:"mini-button",onClick:()=>F("zoom-out"),children:"缩小"}),t.jsxs("button",{type:"button",className:"mini-button",onClick:()=>m(x=>x+1),children:[t.jsx(Ie,{size:14}),"重置视角"]})]}),t.jsx(rn,{})]})}),t.jsx("div",{className:"lab-column",children:t.jsxs("section",{className:"control-panel","aria-labelledby":"ch02-selection-title",children:[t.jsxs("div",{className:"panel-heading",children:[t.jsx("h3",{id:"ch02-selection-title",children:"选择两个子集"}),t.jsx("small",{children:"点击后自动切换 A / B"})]}),t.jsxs("div",{className:"segmented",role:"group","aria-label":"当前节点填入位置",children:[t.jsx("button",{className:u==="A"?"active":"",onClick:()=>f("A"),"aria-pressed":u==="A",children:"下一节点填入 A"}),t.jsx("button",{className:u==="B"?"active":"",onClick:()=>f("B"),"aria-pressed":u==="B",children:"下一节点填入 B"})]}),t.jsxs("p",{className:"small muted",children:["当前填入 ",t.jsx("strong",{children:u}),"。下列按钮与三维节点、二维节点使用同一状态。"]}),t.jsx("div",{className:"ch02-subset-picker",role:"group","aria-label":`从 8 个子集中选择，填入 ${u}`,children:z.map(x=>{const j=ze(x,r,l,g);return t.jsxs("button",{className:j.includes(u)?"active":"",onClick:()=>W(x.mask),"aria-pressed":u==="A"?x.mask===r:x.mask===l,children:[t.jsx("span",{children:x.label}),j&&t.jsx("small",{children:j})]},x.mask)})}),t.jsxs("details",{className:"ch02-data-details",children:[t.jsx("summary",{children:"查看 8 个子集的数据表"}),t.jsx("div",{className:"ch02-table-scroll",tabIndex:0,role:"region","aria-label":"幂集子集数据表，可横向滚动",children:t.jsxs("table",{className:"data-table",children:[t.jsx("thead",{children:t.jsxs("tr",{children:[t.jsx("th",{children:"子集"}),t.jsx("th",{children:"a,b,c 是否属于"}),t.jsx("th",{children:"基数"}),t.jsx("th",{children:"操作"})]})}),t.jsx("tbody",{children:z.map(x=>t.jsxs("tr",{children:[t.jsx("td",{children:x.label}),t.jsx("td",{children:ot.map((j,he)=>(x.mask&1<<he)!==0?"1":"0").join("")}),t.jsx("td",{children:x.rank}),t.jsx("td",{children:t.jsxs("button",{className:"mini-button",onClick:()=>W(x.mask),children:["填入 ",u]})})]},x.mask))})]})})]}),t.jsx("div",{className:"callout",children:"位掩码口径：a、b、c 分别对应第 0、1、2 位。交集是按位与，并集是按位或；覆盖边两端只差一个二进制位。"}),t.jsxs("div",{className:"ch02-structure-section",role:"region","aria-labelledby":"ch02-structure-title",children:[t.jsxs("div",{className:"panel-heading",children:[t.jsx("h3",{id:"ch02-structure-title",children:"覆盖关系读法"}),t.jsx("small",{children:"不是任意子集两两连线"})]}),t.jsxs("ul",{className:"status-list ch02-structure-list",children:[t.jsxs("li",{children:[t.jsx("span",{children:"顶点数 |P(U)| = 2³"}),t.jsx("strong",{children:"8"})]}),t.jsxs("li",{children:[t.jsx("span",{children:"每层基数 1, 3, 3, 1"}),t.jsx("strong",{children:"4 层"})]}),t.jsxs("li",{children:[t.jsx("span",{children:"仅连接相差一个元素的子集"}),t.jsx("strong",{children:"12 边"})]})]}),t.jsx("p",{className:"small muted",children:"绿色实线路径指向交集（最大下界），橙色虚线路径指向并集（最小上界）。若两条路径重合，则使用较粗的点划线，并由节点“交 / 并”徽标明确区分。"})]})]})}),t.jsxs("section",{className:"math-panel ch02-operation-panel","aria-labelledby":"ch02-operation-title",children:[t.jsxs("div",{className:"panel-heading",children:[t.jsx("h3",{id:"ch02-operation-title",children:"交、并与包含关系"}),t.jsx("small",{children:"随节点选择同步重算"})]}),t.jsxs("div",{className:"ch02-operation-formulas",children:[t.jsx(ve,{tex:`A=${b.tex},\\qquad B=${T.tex}`}),t.jsx("div",{className:"math-readout",children:t.jsx(ve,{tex:`A\\cap B=${p.tex},\\qquad A\\cup B=${y.tex}`})})]}),t.jsxs("div",{className:"readout-grid","aria-live":"polite",children:[t.jsxs("div",{className:"readout-item",children:[t.jsx("span",{children:"选择 A"}),t.jsx("strong",{children:b.label})]}),t.jsxs("div",{className:"readout-item",children:[t.jsx("span",{children:"选择 B"}),t.jsx("strong",{children:T.label})]}),t.jsxs("div",{className:"readout-item",children:[t.jsx("span",{children:"交集 A ∩ B"}),t.jsx("strong",{children:p.label})]}),t.jsxs("div",{className:"readout-item",children:[t.jsx("span",{children:"并集 A ∪ B"}),t.jsx("strong",{children:y.label})]})]}),t.jsxs("div",{className:"ch02-inclusion-result",role:"status",children:[t.jsx(ve,{tex:g.relationTex,display:!1}),t.jsx("span",{children:g.relationText})]})]}),t.jsxs("div",{className:"ch02-button-row",children:[t.jsxs("button",{className:"mini-button",onClick:O,children:[t.jsx(Ie,{size:14}),"恢复初始选择"]}),t.jsx("button",{className:"completion-button",onClick:s,children:"完成布尔立方体实验"})]})]})})}export{cn as default};
//# sourceMappingURL=Chapter02Lab-DVyBx4uC.js.map
