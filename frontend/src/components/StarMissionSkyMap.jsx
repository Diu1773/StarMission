/**
 * StarMissionSkyMap — 경성(서울) 실제 별하늘 + 산악지형(3D 투영)
 * WebGL Milky Way + Canvas 2D (mag<3.5 ~150개, 캐시 없음)
 * 힌트 없음 — 별자리 선만 표시, 클릭하면 정/오답 피드백
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const SEOUL = { lat: 37.57, lon: 126.98 };

const TIME_SLOT_UTC = {
  afterTwilight:  11 * 60,
  beforeMoonrise: 13 * 60,
  moonHigh:       15 * 60,
  dawn:           19 * 60,
};

// ── 클릭 가능한 명명 별 목록 ────────────────────────────────────────────────────
const NAMED_STARS = [
  { ra: 37.95,  dec: 89.26, name: '북극성 (Polaris)',           isPolaris: true,
    desc: '천구 북극에서 0.7° 이내에 있어 하룻밤 내내 거의 움직이지 않는다. 고도는 관측지의 위도(서울 37.6°)와 거의 같다. 독립투사들은 이 별로 북쪽 방향을 확인했다.' },
  { ra: 165.93, dec: 61.75, name: '두베 (α UMa)',
    desc: '큰곰자리 α별. 북두칠성 국자 끝 별로, 메라크와 연결한 선의 약 5배 거리에 북극성이 있다.' },
  { ra: 165.46, dec: 56.38, name: '메라크 (β UMa)',
    desc: '큰곰자리 β별. 두베와 함께 "포인터 스타"라 불린다. 이 두 별이 북극성을 가리킨다.' },
  { ra: 178.46, dec: 53.69, name: '페크다 (γ UMa)',
    desc: '큰곰자리 γ별. 북두칠성 국자 바닥 중간 별.' },
  { ra: 183.86, dec: 57.03, name: '메그레즈 (δ UMa)',
    desc: '큰곰자리 δ별. 북두칠성에서 가장 어두운 별. 국자와 자루가 만나는 지점.' },
  { ra: 193.51, dec: 55.96, name: '알리오스 (ε UMa)',
    desc: '큰곰자리 ε별. 북두칠성 자루의 첫 번째 별이자 큰곰자리에서 가장 밝은 별.' },
  { ra: 200.98, dec: 54.93, name: '미자르 (ζ UMa)',
    desc: '큰곰자리 ζ별. 자루 중간. 바로 옆에 알코르라는 약한 별이 있어 시력 테스트에 쓰였다.' },
  { ra: 206.89, dec: 49.31, name: '알카이드 (η UMa)',
    desc: '큰곰자리 η별. 북두칠성 자루 끝. 다른 국자 별들과 달리 다른 방향으로 움직이는 별.' },
  { ra:  10.13, dec: 56.54, name: '셰다르 (α Cas)',
    desc: '카시오페이아자리 α별. W자 한쪽 끝에 위치한다.' },
  { ra:   2.29, dec: 59.15, name: '카프 (β Cas)',
    desc: '카시오페이아자리 β별. W자 끝 별로 북극성 방향 참고에 쓰인다.' },
  { ra:  14.18, dec: 60.72, name: '감마 카시오페이아 (γ Cas)',
    desc: '카시오페이아자리 γ별. W자 중심으로 가장 밝다. 가끔 밝기가 변하는 변광성.' },
  { ra:  21.45, dec: 60.24, name: '루크바흐 (δ Cas)',
    desc: '카시오페이아자리 δ별. W자 네 번째 별.' },
  { ra:  28.60, dec: 63.67, name: '세긴 (ε Cas)',
    desc: '카시오페이아자리 ε별. W자 반대쪽 끝.' },
  { ra: 279.23, dec: 38.78, name: '직녀성 (Vega, α Lyr)',
    desc: '거문고자리 α별. 여름철 대삼각형의 꼭짓점이자 가장 밝다(0등급). 독립운동 시기 여름 밤하늘을 밝혔다.' },
  { ra: 297.70, dec:  8.87, name: '견우성 (Altair, α Aql)',
    desc: '독수리자리 α별. 여름철 대삼각형의 한 꼭짓점. 빠른 자전으로 적도 지름이 극 지름의 1.2배에 달한다.' },
  { ra: 310.36, dec: 45.28, name: '데네브 (Deneb, α Cyg)',
    desc: '백조자리 α별. 여름철 대삼각형의 꼭짓점. 초거성으로 실제 광도는 태양의 약 10만 배.' },
  { ra: 213.92, dec: 19.18, name: '아르크투루스 (Arcturus, α Boo)',
    desc: '목동자리 α별. 봄하늘에서 가장 밝은 별(-0.05등급). 북두칠성 자루를 따라 "봄의 대곡선"으로 찾는다.' },
  { ra: 101.29, dec:-16.72, name: '시리우스 (Sirius, α CMa)',
    desc: '큰개자리 α별. 전천에서 가장 밝은 별(-1.46등급). 겨울 동쪽 하늘 낮게 빛난다.' },
  { ra:  88.79, dec:  7.41, name: '베텔게우스 (Betelgeuse, α Ori)',
    desc: '오리온자리 α별. 붉은 초거성으로 밝기가 불규칙하게 변한다. 언젠가 초신성이 될 별.' },
  { ra:  78.63, dec: -8.20, name: '리겔 (Rigel, β Ori)',
    desc: '오리온자리 β별. 오리온 발의 청백색 별(0.1등급)로 이름은 "왼발"이라는 아랍어.' },
  { ra:  79.17, dec: 45.99, name: '카펠라 (Capella, α Aur)',
    desc: '마차부자리 α별. 겨울 북쪽 하늘의 노란 밝은 별(0.1등급). 두 거성이 서로 도는 쌍성이다.' },
  { ra:  68.98, dec: 16.51, name: '알데바란 (Aldebaran, α Tau)',
    desc: '황소자리 α별. 겨울 히아데스 성단 방향의 붉은 거성. 이름은 "뒤따르는 것"이라는 뜻.' },
  { ra: 116.33, dec: 28.03, name: '폴룩스 (Pollux, β Gem)',
    desc: '쌍둥이자리 β별. 쌍둥이자리에서 더 밝은 별(1.1등급). 행성이 발견된 거성.' },
  { ra: 152.09, dec: 11.97, name: '레굴루스 (Regulus, α Leo)',
    desc: '사자자리 α별. "작은 왕"이라는 뜻. 황도에 매우 가깝다. 봄하늘 사자의 심장.' },
  { ra: 201.30, dec:-11.16, name: '스피카 (Spica, α Vir)',
    desc: '처녀자리 α별. 봄하늘 청백색 별(1.0등급). 아르크투루스에서 곡선을 그려 찾는다.' },
  { ra: 114.83, dec:  5.22, name: '프로키온 (Procyon, α CMi)',
    desc: '작은개자리 α별. 겨울 대삼각형의 한 꼭짓점(0.4등급). 이름은 "개 앞의 것"이라는 뜻.' },
  { ra: 247.35, dec:-26.43, name: '안타레스 (Antares, α Sco)',
    desc: '전갈자리 α별. "화성의 적수"라는 뜻의 붉은 초거성. 여름 남쪽 하늘 낮게 보인다.' },
  { ra: 113.65, dec: 31.89, name: '카스토르 (Castor, α Gem)',
    desc: '쌍둥이자리 α별. 실제로는 6개 별이 모인 복잡한 다중성계. 맨눈으로는 하나로 보인다.' },
];

// ── 천문 계산 ──────────────────────────────────────────────────────────────────
function getLST(date, lonDeg) {
  const JD = date.getTime() / 86_400_000 + 2_440_587.5;
  const GMST = (18.697374558 + 24.06570982441 * (JD - 2451545.0)) % 24;
  return ((GMST + lonDeg / 15) % 24 + 24) % 24;
}
function raDecToAltAz(raDeg, decDeg, latDeg, lstH) {
  const ha  = ((lstH * 15 - raDeg) * Math.PI) / 180;
  const dec = (decDeg * Math.PI) / 180;
  const lat = (latDeg * Math.PI) / 180;
  const sinAlt = Math.sin(lat)*Math.sin(dec) + Math.cos(lat)*Math.cos(dec)*Math.cos(ha);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const cosAz = (Math.sin(dec)-Math.sin(alt)*Math.sin(lat))/(Math.cos(alt)*Math.cos(lat)+1e-12);
  const sinAz = -Math.cos(dec)*Math.sin(ha)/(Math.cos(alt)+1e-12);
  const az = (Math.atan2(sinAz, cosAz) * 180) / Math.PI;
  return [(alt * 180) / Math.PI, (az % 360 + 360) % 360];
}
function project(alt, az, alt0, az0, scale, cx, cy) {
  const da = ((az - az0) * Math.PI) / 180;
  const a  = (alt  * Math.PI) / 180;
  const a0 = (alt0 * Math.PI) / 180;
  const cosC = Math.sin(a0)*Math.sin(a) + Math.cos(a0)*Math.cos(a)*Math.cos(da);
  const c = Math.acos(Math.max(-1, Math.min(1, cosC)));
  if (c > Math.PI - 0.02) return null;
  const sinC = Math.sin(c);
  const k = sinC < 1e-6 ? 1 : c / sinC;
  return [cx + Math.cos(a)*Math.sin(da)*scale*k,
          cy - (Math.cos(a0)*Math.sin(a)-Math.sin(a0)*Math.cos(a)*Math.cos(da))*scale*k];
}
function azDiff(a1, a2) {
  let d = ((a1 - a2) % 360 + 360) % 360;
  return d > 180 ? d - 360 : d;
}
function currentUtcMinutes() { const n=new Date(); return n.getUTCHours()*60+n.getUTCMinutes(); }
function buildSimDate(m) { const d=new Date(); d.setUTCHours(0,0,0,0); d.setUTCMinutes(m); return d; }
function fmtKST(m) { const k=(m+9*60)%(24*60); return `${String(Math.floor(k/60)).padStart(2,'0')}:${String(k%60).padStart(2,'0')}`; }

// ── 태양·달 위치 계산 ────────────────────────────────────────────────────────
function getSunRADec(date) {
  const JD = date.getTime() / 86_400_000 + 2_440_587.5;
  const n  = JD - 2451545.0;
  // 태양 황경 (간이 공식)
  const L  = ((280.460 + 0.9856474 * n) % 360 + 360) % 360;
  const g  = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
  const lam = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180;
  const eps = 23.4393 * Math.PI / 180; // 황도 경사
  const ra  = (Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) * 180 / Math.PI + 360) % 360;
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam)) * 180 / Math.PI;
  return { ra, dec };
}

/**
 * 달 위치를 천문 계산으로 구함 (간이 버전)
 * - 태양 RA 기준으로 위상별 오프셋(new:0°, half:90°, full:180°) 적용
 * - 달 적위는 황도면을 따라 근사 계산
 * @returns [altDeg, azDeg] — 지평좌표
 */
function getMoonAltAz(phase, simMin, lat) {
  const date = buildSimDate(simMin);
  const { ra: sunRa } = getSunRADec(date);
  const phaseOff = phase === 'full' ? 180 : phase === 'half' ? 90 : 0;
  const moonRa   = (sunRa + phaseOff + 360) % 360;
  // 달 적위: 황도면 근사 (ε × sin(λ_moon))
  const eps    = 23.4393 * Math.PI / 180;
  const moonDec = Math.asin(Math.sin(eps) * Math.sin(moonRa * Math.PI / 180)) * 180 / Math.PI;
  const lst    = getLST(date, SEOUL.lon);
  return raDecToAltAz(moonRa, moonDec, lat, lst);
}

// ── 산악 지형 고도 함수 (azimuth → degrees above horizon) ─────────────────────
function terrainAlt(azDeg) {
  const a = azDeg * (Math.PI / 180);
  let h = 4.5;
  h += Math.sin(a * 1.8 + 0.30) * 4.0;
  h += Math.sin(a * 3.5 + 1.80) * 2.5;
  h += Math.sin(a * 7.2 + 0.70) * 1.5;
  h += Math.sin(a * 15.1 + 2.4) * 0.7;
  h += Math.sin(a * 29.3 + 3.8) * 0.3;
  return Math.max(1.2, Math.min(14.0, h));
}

// 소나무 그리기
function drawPine(ctx, x, baseY, treeH) {
  const w = treeH * 0.30;
  ctx.beginPath();
  ctx.moveTo(x, baseY - treeH);
  ctx.lineTo(x - w*0.50, baseY - treeH*0.58);
  ctx.lineTo(x - w*0.35, baseY - treeH*0.58);
  ctx.lineTo(x - w*0.70, baseY - treeH*0.28);
  ctx.lineTo(x - w, baseY);
  ctx.lineTo(x + w, baseY);
  ctx.lineTo(x + w*0.70, baseY - treeH*0.28);
  ctx.lineTo(x + w*0.35, baseY - treeH*0.58);
  ctx.lineTo(x + w*0.50, baseY - treeH*0.58);
  ctx.closePath();
  ctx.fill();
}


// ── WebGL 셰이더 ───────────────────────────────────────────────────────────────
const VERT=`attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0,1);}`;
const FRAG=`precision highp float;
varying vec2 v;uniform vec2 u_r,u_c;uniform float u_s,u_a0,u_z0,u_lat,u_lst,u_moon;
vec2 unp(vec2 sc,out float vis){
  float nx=(sc.x-u_c.x)/u_s,ny=(u_c.y-sc.y)/u_s,rho=sqrt(nx*nx+ny*ny),c=rho;
  if(c>3.12){vis=0.;return vec2(0.);}
  if(rho<1e-6){vis=1.;return vec2(u_a0,u_z0);}
  float a0=radians(u_a0),az0=radians(u_z0),sC=sin(c),cC=cos(c);
  float alt=asin(clamp(cC*sin(a0)+(ny*sC*cos(a0))/rho,-1.,1.));
  float az=az0+atan(nx*sC,rho*cos(a0)*cC-ny*sin(a0)*sC);
  vis=1.-smoothstep(2.7,3.12,c);
  return vec2(degrees(alt),mod(degrees(az)+360.,360.));
}
vec3 atm(float a){
  float t=clamp((a+90.)/180.,0.,1.);
  vec3 nd=vec3(.5,1.5,6.)/255.,bh=vec3(2.,5.,14.)/255.,hz=vec3(18.,32.,62.)/255.,lo=vec3(10.,20.,48.)/255.,ze=vec3(1.,3.,12.)/255.;
  if(t<.5)return mix(nd,bh,smoothstep(0.,.7,t/.5));
  float u=(t-.5)/.5;return mix(mix(hz,lo,smoothstep(0.,.12,u)),ze,smoothstep(.4,.95,u));
}
void main(){
  vec2 sc=vec2(v.x*u_r.x,(1.-v.y)*u_r.y);float vis=0.;vec2 aa=unp(sc,vis);
  vec3 outCol=vec3(.006,.010,.024);
  vec3 col=outCol;
  if(vis>.001){
    vec3 inCol=atm(aa.x);
    float horizonFade=clamp((aa.x)/40.,0.0,1.0);
    vec3 moonSky=vec3(.06,.10,.20)*(1.0+0.5*(1.0-horizonFade));
    inCol+=moonSky*u_moon*(0.6+0.4*horizonFade);
    col=mix(outCol,inCol,vis);
  }
  float vd=distance(sc,u_c),vr=max(u_r.x,u_r.y)*.82;
  col*=1.-smoothstep(vr*.7,vr,vd)*.18;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`;
function mkSh(gl,t,src){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);return s;}
function createGl(canvas){
  const gl=canvas.getContext('webgl',{alpha:false,antialias:true});if(!gl)return null;
  const prog=gl.createProgram();
  gl.attachShader(prog,mkSh(gl,gl.VERTEX_SHADER,VERT));
  gl.attachShader(prog,mkSh(gl,gl.FRAGMENT_SHADER,FRAG));
  gl.linkProgram(prog);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  return{gl,prog,buf,a:gl.getAttribLocation(prog,'a'),
    u:{r:gl.getUniformLocation(prog,'u_r'),c:gl.getUniformLocation(prog,'u_c'),
      s:gl.getUniformLocation(prog,'u_s'),a0:gl.getUniformLocation(prog,'u_a0'),
      z0:gl.getUniformLocation(prog,'u_z0'),lat:gl.getUniformLocation(prog,'u_lat'),
      lst:gl.getUniformLocation(prog,'u_lst'),
      moon:gl.getUniformLocation(prog,'u_moon')}};
}
function destroyGl(s){if(!s)return;const{gl}=s;gl.deleteBuffer(s.buf);gl.deleteProgram(s.prog);}

// 별 색상/크기
function ciToCol(ci){if(ci<-.1)return'#c8daff';if(ci<.3)return'#eef2ff';if(ci<.6)return'#fff8f0';if(ci<1)return'#ffd8a0';return'#ffb080';}
function magR(mag,sc){const b=mag<1?3.0:mag<1.5?2.5:mag<2?2.1:mag<2.5?1.8:mag<3?1.5:1.2;return b*Math.min(1.5,sc/200);}
function magA(mag){return mag<1?1:mag<1.5?.97:mag<2?.93:mag<2.5?.88:mag<3?.80:.72;}


const DEFAULT_FOV=72, CY=0.60;

// 달 위상별 시뮬 파라미터
const MOON_PARAMS = {
  full: { skyBrightness: 0.85, starMagLimit: 1.8, moonRadius: 22, moonAlpha: 1.0,  ambientGlow: 0.55, label: '보름달' },
  half: { skyBrightness: 0.35, starMagLimit: 2.7, moonRadius: 17, moonAlpha: 0.9,  ambientGlow: 0.25, label: '상현달' },
  new:  { skyBrightness: 0.05, starMagLimit: 3.5, moonRadius:  9, moonAlpha: 0.55, ambientGlow: 0.05, label: '그믐달' },
};

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────
export default function StarMissionSkyMap({ selectedTime, moonPhase = null, interactive = true, height: heightProp = null }) {
  const bgRef   = useRef(null);
  const cvRef   = useRef(null);
  const contRef = useRef(null);
  const glRef   = useRef(null);
  const rafRef     = useRef(null);
  const settleRef  = useRef(null);
  const interRef   = useRef(false);
  const dragRef    = useRef(null);   // {x, y, az, alt}
  const animRef    = useRef(null);
  const starsRef   = useRef([]);     // mag < 3.5 별
  const projNamed  = useRef([]);     // 현재 프레임에 투영된 명명 별

  const viewRef = useRef({ az: 0, alt: 58 }); // 북쪽 바라보기
  const fovRef  = useRef(DEFAULT_FOV);

  const initMin = TIME_SLOT_UTC[selectedTime] ?? 15*60;
  const [simMin, setSimMin] = useState(initMin);
  const [isLive, setIsLive] = useState(false);
  const [dims, setDims] = useState({ w: 760, h: 460 });
  const [ver, setVer]   = useState(0);
  const [hitResult, setHitResult] = useState(null); // { name, isPolaris, desc, x, y }
  const [solved, setSolved] = useState(false);

  const simMinRef = useRef(simMin);
  useEffect(() => { simMinRef.current = simMin; }, [simMin]);
  const lst = getLST(buildSimDate(simMin), SEOUL.lon);

  const reqRender = useCallback(() => {
    // RAF를 취소하고 새로 스케줄 — 드래그 중 매 프레임 갱신 보장
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => { rafRef.current=null; setVer(v=>v+1); });
  }, []);
  const startInter = useCallback((ms=120) => {
    interRef.current=true;
    if(settleRef.current)clearTimeout(settleRef.current);
    settleRef.current=setTimeout(()=>{interRef.current=false;reqRender();settleRef.current=null;},ms);
    reqRender();
  },[reqRender]);
  const finishInter = useCallback(() => {
    interRef.current=false;
    if(settleRef.current){clearTimeout(settleRef.current);settleRef.current=null;}
    reqRender();
  },[reqRender]);

  // 별 카탈로그 (mag < 3.5만)
  useEffect(() => {
    import('../data/stars_catalog.json').then(m=>{
      starsRef.current = m.default.filter(s=>s[2]<3.5);
      reqRender();
    }).catch(()=>{});
  },[reqRender]);

  // 실시간 시계
  useEffect(() => {
    if(!isLive)return;
    const s=()=>setSimMin(currentUtcMinutes());
    s(); const id=setInterval(s,60000); return()=>clearInterval(id);
  },[isLive]);

  // 크기 감지
  useEffect(() => {
    if(!contRef.current)return;
    const ro=new ResizeObserver(([e])=>{
      const w=Math.floor(e.contentRect.width);
      const h = heightProp ? heightProp : Math.max(340,Math.floor(w*.58));
      setDims({w,h});
    });
    ro.observe(contRef.current);return()=>ro.disconnect();
  },[heightProp]);

  // 마운트: 북쪽, 지형이 잘 보이는 고도(38°)로 시작
  useEffect(() => {
    viewRef.current={az:0,alt:38};fovRef.current=DEFAULT_FOV;reqRender();
  },[]); // eslint-disable-line

  // 정리
  useEffect(()=>()=>{
    if(rafRef.current)cancelAnimationFrame(rafRef.current);
    if(settleRef.current)clearTimeout(settleRef.current);
    if(animRef.current)cancelAnimationFrame(animRef.current);
    destroyGl(glRef.current);glRef.current=null;
  },[]);

  const getScale = useCallback(() =>
    Math.min(dims.w,dims.h)*.5/Math.max(fovRef.current*Math.PI/360,1e-6)
  ,[dims]);

  // ── WebGL 배경 ──────────────────────────────────────────────────────────────
  useEffect(()=>{
    const canvas=bgRef.current;if(!canvas)return;
    let state=glRef.current;
    if(!state||state.gl.canvas!==canvas){destroyGl(state);try{state=createGl(canvas);}catch{state=null;}glRef.current=state;}
    if(!state)return;
    const{w,h}=dims,dpr=Math.min(window.devicePixelRatio??1,2);
    canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;
    const scale=getScale(),{az:az0,alt:alt0}=viewRef.current,cx=w/2,cy=h*CY;
    const{gl,prog,buf,u}=state;
    gl.viewport(0,0,canvas.width,canvas.height);gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
    gl.useProgram(prog);gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.enableVertexAttribArray(state.a);gl.vertexAttribPointer(state.a,2,gl.FLOAT,false,0,0);
    const mp=moonPhase&&MOON_PARAMS[moonPhase]?MOON_PARAMS[moonPhase]:null;
    const [mAltGL] = mp ? getMoonAltAz(moonPhase, simMin, SEOUL.lat) : [0];
    const moonElevFactor = mp ? Math.max(0, Math.min(1, 1 + mAltGL / 15)) : 0;
    const moonBright = mp ? mp.skyBrightness * moonElevFactor : 0;
    gl.uniform2f(u.r,canvas.width,canvas.height);
    gl.uniform2f(u.c,cx*dpr,cy*dpr);gl.uniform1f(u.s,scale*dpr);
    gl.uniform1f(u.a0,alt0);gl.uniform1f(u.z0,az0);gl.uniform1f(u.lat,SEOUL.lat);
    gl.uniform1f(u.lst,lst);
    if(u.moon)gl.uniform1f(u.moon,moonBright);
    gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);
  },[dims,ver,getScale,lst,moonPhase]);

  // ── Canvas 2D ──────────────────────────────────────────────────────────────
  useEffect(()=>{
    const canvas=cvRef.current;if(!canvas)return;
    const{w,h}=dims,dpr=Math.min(window.devicePixelRatio??1,2);
    canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const scale=getScale(),{az:az0,alt:alt0}=viewRef.current,cx=w/2,cy=h*CY;

    // 달 위상 파라미터
    const mp=moonPhase&&MOON_PARAMS[moonPhase]?MOON_PARAMS[moonPhase]:null;
    // 달 고도에 따라 실제 영향력 보정 (지평선 아래면 별에 영향 없음)
    const [mAlt2D] = mp ? getMoonAltAz(moonPhase, simMin, SEOUL.lat) : [0];
    const moonFactor2D = mp ? Math.max(0, Math.min(1, 1 + mAlt2D / 15)) : 0;
    // 달이 지평선 아래면 별이 더 잘 보임 (magLimit을 원래대로)
    const magLimit = mp
      ? 3.5 - (mp.starMagLimit < 3.5 ? (3.5 - mp.starMagLimit) * moonFactor2D : 0)
      : 3.5;

    // ── 별 렌더 (달 위상에 따라 등급 제한) ──────────────────────────────
    const cats=starsRef.current;
    for(let i=0;i<cats.length;i++){
      const[ra,dec,mag,ci]=cats[i];
      if(mag>magLimit)continue; // 달이 밝으면 어두운 별 안 보임
      const[sA,sZ]=raDecToAltAz(ra,dec,SEOUL.lat,lst);
      if(sA<0)continue;
      const pt=project(sA,sZ,alt0,az0,scale,cx,cy);if(!pt)continue;
      const r=magR(mag,scale),fade=Math.max(.4,Math.min(1,(sA+4)/20));
      // 달 밝을수록 별 밝기도 약화 (대비)
      const moonDim=mp?(1-mp.skyBrightness*0.7):1;
      ctx.globalAlpha=magA(mag)*fade*moonDim;ctx.fillStyle=ciToCol(ci);
      if(mag<2){ctx.shadowColor=ciToCol(ci);ctx.shadowBlur=7;}
      ctx.beginPath();ctx.arc(pt[0],pt[1],r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    }
    ctx.globalAlpha=1;

    // ── 명명 별 투영 저장 (클릭 히트 테스트용) ────────────────────────────
    projNamed.current=NAMED_STARS.map(s=>{
      const[a,z]=raDecToAltAz(s.ra,s.dec,SEOUL.lat,lst);
      if(a<-8)return null;
      const pt=project(a,z,alt0,az0,scale,cx,cy);if(!pt)return null;
      // 지형 고도보다 낮으면 숨김
      if(a<terrainAlt(z)-0.5)return null;
      return{...s,pt,alt:a};
    }).filter(Boolean);

    // 명명 별에 희미한 클릭 가능 표시 (별 자체는 이미 카탈로그로 그려짐)
    // Polaris는 강조 없음, 학생이 찾아야 함

    // ── 달 디스크 (위상에 따라) ────────────────────────────────────────────
    if(mp){
      // 천문 계산으로 달 위치 동적 산출
      const [mAlt, mAz] = getMoonAltAz(moonPhase, simMin, SEOUL.lat);
      const moonPos = { alt: mAlt, az: mAz };
      const mPt=project(moonPos.alt,moonPos.az,alt0,az0,scale,cx,cy);
      if(mPt && moonPos.alt > 0 && moonPos.alt>terrainAlt(moonPos.az)-0.5){
        const mr=mp.moonRadius;
        ctx.save();
        ctx.globalAlpha=mp.moonAlpha;
        // 달무리 (밝은 위상일수록 강함)
        if(mp.ambientGlow>0.1){
          const haloGrad=ctx.createRadialGradient(mPt[0],mPt[1],mr*0.9,mPt[0],mPt[1],mr*5);
          haloGrad.addColorStop(0,`rgba(240,236,210,${0.32*mp.ambientGlow})`);
          haloGrad.addColorStop(0.4,`rgba(180,200,230,${0.14*mp.ambientGlow})`);
          haloGrad.addColorStop(1,'rgba(180,200,230,0)');
          ctx.fillStyle=haloGrad;
          ctx.beginPath();ctx.arc(mPt[0],mPt[1],mr*5,0,Math.PI*2);ctx.fill();
        }
        // 달 본체
        const moonGrad=ctx.createRadialGradient(mPt[0]-mr*0.2,mPt[1]-mr*0.2,mr*0.1,mPt[0],mPt[1],mr);
        moonGrad.addColorStop(0,'#fff8e8');
        moonGrad.addColorStop(0.7,'#f3e9c8');
        moonGrad.addColorStop(1,'#d4c89a');
        ctx.fillStyle=moonGrad;
        if(moonPhase==='full'){
          ctx.beginPath();ctx.arc(mPt[0],mPt[1],mr,0,Math.PI*2);ctx.fill();
        } else if(moonPhase==='half'){
          // 상현달: 오른쪽 반쪽
          ctx.beginPath();ctx.arc(mPt[0],mPt[1],mr,-Math.PI/2,Math.PI/2);ctx.closePath();ctx.fill();
          // 그림자 쪽 부드러운 음영
          const shadowGrad=ctx.createRadialGradient(mPt[0]+mr*0.1,mPt[1],mr*0.5,mPt[0]+mr*0.1,mPt[1],mr*1.05);
          shadowGrad.addColorStop(0,'rgba(40,45,60,0)');
          shadowGrad.addColorStop(1,'rgba(40,45,60,0.4)');
          ctx.fillStyle=shadowGrad;ctx.globalCompositeOperation='source-atop';
          ctx.beginPath();ctx.arc(mPt[0],mPt[1],mr,0,Math.PI*2);ctx.fill();
          ctx.globalCompositeOperation='source-over';
        } else {
          // 그믐달: 가는 초승달 (왼쪽으로 휨)
          ctx.beginPath();ctx.arc(mPt[0],mPt[1],mr,0,Math.PI*2);ctx.fill();
          // 오른쪽에서 살짝 어둡게 잘라내 초승달 모양
          ctx.globalCompositeOperation='destination-out';
          ctx.beginPath();ctx.arc(mPt[0]+mr*0.55,mPt[1],mr*0.95,0,Math.PI*2);ctx.fill();
          ctx.globalCompositeOperation='source-over';
        }
        // 가장자리 미세 글로우
        ctx.strokeStyle='rgba(255,250,220,0.3)';ctx.lineWidth=0.6;
        ctx.beginPath();ctx.arc(mPt[0],mPt[1],mr,0,Math.PI*2);ctx.stroke();
        ctx.restore();
      }
    }

    // ── 월출광 (달이 지평선 ±14° 안에 있을 때 지평선 글로우) ───────────────────
    if(mp){
      const [mAlt, mAz] = getMoonAltAz(moonPhase, simMin, SEOUL.lat);
      const dA=Math.abs(azDiff(mAz,az0));
      if(mAlt>-14 && mAlt<8 && dA<90){
        // 달 방위각의 능선 위 지점에 글로우 (지형에 딱 붙게)
        const ridgeAlt=terrainAlt(mAz);
        const hPt=project(ridgeAlt, mAz, alt0, az0, scale, cx, cy);
        if(hPt && hPt[0]>-w*0.2 && hPt[0]<w*1.2){
          // 지평선에 가까울수록 강하고, 달이 위상이 밝을수록 강함
          const intensity=Math.max(0,1-Math.abs(mAlt)/14)*mp.ambientGlow;
          if(intensity>0.01){
            const rad=scale*0.28; // 좁고 집중된 글로우
            const warm=moonPhase==='full'?'230,215,175':moonPhase==='half'?'210,190,145':'190,165,120';
            const cool='160,185,215';
            ctx.save();
            ctx.translate(hPt[0],hPt[1]);
            // 위쪽 번짐 방지: clip으로 hPt 아래 + 약간 위만 허용
            ctx.beginPath();ctx.rect(-w, -rad*0.18, w*3, rad*1.5);ctx.clip();
            ctx.scale(2.2, 0.22); // 수평으로 매우 넓고 수직으로 극도로 납작
            const g=ctx.createRadialGradient(0,0,0,0,0,rad);
            g.addColorStop(0,`rgba(${warm},${0.60*intensity})`);
            g.addColorStop(0.30,`rgba(${warm},${0.20*intensity})`);
            g.addColorStop(0.65,`rgba(${cool},${0.06*intensity})`);
            g.addColorStop(1,`rgba(${cool},0)`);
            ctx.fillStyle=g;
            ctx.beginPath();ctx.arc(0,0,rad,0,Math.PI*2);ctx.fill();
            ctx.restore();
          }
        }
      }
    }

    // ── 3D 지형 (azimuth + altitude → project) ────────────────────────────
    const TSTEP=2; // 2°마다 샘플
    const ridgePts=[];
    for(let i=0;i<360/TSTEP;i++){
      const az=(i*TSTEP)%360;
      const dA=Math.abs(azDiff(az,az0));
      if(dA>95)continue; // 시야 바깥 제외
      const tA=terrainAlt(az);
      const pt=project(tA,az,alt0,az0,scale,cx,cy);
      if(!pt)continue;
      if(pt[0]<-w*.3||pt[0]>w*1.3)continue;
      ridgePts.push({az,pt,tA});
    }
    ridgePts.sort((a,b)=>a.pt[0]-b.pt[0]);

    if(ridgePts.length>3){
      // 지형 채우기
      const mtnGrad=ctx.createLinearGradient(0,h*.55,0,h);
      mtnGrad.addColorStop(0,'rgba(6,14,32,.0)');
      mtnGrad.addColorStop(.15,'rgba(6,14,32,.97)');
      mtnGrad.addColorStop(1,'rgba(2,4,10,1)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(ridgePts[0].pt[0],h+10);
      for(const{pt}of ridgePts)ctx.lineTo(pt[0],pt[1]);
      ctx.lineTo(ridgePts[ridgePts.length-1].pt[0],h+10);
      ctx.closePath();
      ctx.fillStyle=mtnGrad;ctx.fill();

      // 능선 라인 제거 (사용자 요청)

      // 소나무 (능선 위 로컬 피크)
      ctx.fillStyle='rgba(4,8,20,1)';
      const treeStep=10;
      for(let i=0;i<Math.floor(360/treeStep);i++){
        const az=i*treeStep;
        const dA=Math.abs(azDiff(az,az0));if(dA>90)continue;
        const tA=terrainAlt(az);
        const tAPrev=terrainAlt((az+360-treeStep)%360);
        const tANext=terrainAlt((az+treeStep)%360);
        if(tA<4.5)continue; // 낮은 지역엔 나무 없음
        // 나무 꼭대기는 능선 위 1.5°
        const treeTipAlt=tA+1.5;
        const basePt=project(tA,az,alt0,az0,scale,cx,cy);
        const tipPt=project(treeTipAlt,az,alt0,az0,scale,cx,cy);
        if(!basePt||!tipPt)continue;
        if(basePt[0]<-10||basePt[0]>w+10)continue;
        const treeH=basePt[1]-tipPt[1]; // 화면상 나무 높이 (px)
        if(treeH<4)continue;
        drawPine(ctx,basePt[0],basePt[1],treeH*1.2);
      }
      ctx.restore();
    }

    // ── 상태 바 ────────────────────────────────────────────────────────────
    ctx.textAlign='left';ctx.font='9px monospace';
    ctx.fillStyle='rgba(100,130,180,.38)';
    const lH=Math.floor(lst),lM=Math.floor((lst%1)*60);
    ctx.fillText(`경성(서울) 37.6°N · LST ${String(lH).padStart(2,'0')}h${String(lM).padStart(2,'0')}m · KST ${fmtKST(simMin)}`,8,h-7);
  },[dims,ver,getScale,lst,simMin,moonPhase]);

  // ── 인터랙션 ──────────────────────────────────────────────────────────────
  const onDown=useCallback(e=>{
    dragRef.current={x:e.clientX,y:e.clientY,az:viewRef.current.az,alt:viewRef.current.alt};
    startInter();
  },[startInter]);

  const onMove=useCallback(e=>{
    if(dragRef.current&&e.buttons===1){
      const scale=getScale();
      const dx=e.clientX-dragRef.current.x,dy=e.clientY-dragRef.current.y;
      const a0r=(dragRef.current.alt*Math.PI)/180;
      viewRef.current={
        az:((dragRef.current.az-(dx/scale)*(180/Math.PI)/Math.cos(a0r+1e-9))%360+360)%360,
        alt:Math.max(5,Math.min(89,dragRef.current.alt+(dy/scale)*(180/Math.PI))),
      };
      if(animRef.current){cancelAnimationFrame(animRef.current);animRef.current=null;}
      startInter();
      if(cvRef.current)cvRef.current.style.cursor='grabbing';
    }else if(cvRef.current){cvRef.current.style.cursor='grab';}
  },[getScale,startInter]);

  const onUp=useCallback(e=>{
    const hasDragged=dragRef.current&&Math.hypot(e.clientX-dragRef.current.x,e.clientY-dragRef.current.y)>6;
    dragRef.current=null;
    if(cvRef.current)cvRef.current.style.cursor='grab';
    finishInter();
    if(hasDragged)return;
    if(!interactive)return; // 시뮬 모드에서는 별 클릭 비활성화

    // 클릭: 가장 가까운 명명 별 히트 테스트
    const rect=cvRef.current?.getBoundingClientRect();if(!rect)return;
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    let best=null,bestD=24;
    for(const s of projNamed.current){
      const d=Math.hypot(mx-s.pt[0],my-s.pt[1]);
      if(d<bestD){bestD=d;best=s;}
    }
    if(best){
      setHitResult({...best,x:mx,y:my});
      if(best.isPolaris)setSolved(true);
    }else{
      setHitResult(null);
    }
  },[finishInter,interactive]);

  useEffect(()=>{
    const c=cvRef.current;if(!c)return;
    const h=e=>{
      e.preventDefault();
      fovRef.current=Math.max(25,Math.min(110,fovRef.current*(e.deltaY>0?1.1:.9)));
      if(animRef.current){cancelAnimationFrame(animRef.current);animRef.current=null;}
      startInter(160);
    };
    c.addEventListener('wheel',h,{passive:false});return()=>c.removeEventListener('wheel',h);
  },[startInter]);

  // 터치 이벤트 (모바일·터치스크린)
  useEffect(()=>{
    const c=cvRef.current;if(!c)return;
    let lastDist=null;

    const onTouchStart=e=>{
      e.preventDefault();
      if(e.touches.length===1){
        const t=e.touches[0];
        dragRef.current={x:t.clientX,y:t.clientY,az:viewRef.current.az,alt:viewRef.current.alt};
        startInter();
      } else if(e.touches.length===2){
        lastDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      }
    };
    const onTouchMove=e=>{
      e.preventDefault();
      if(e.touches.length===1&&dragRef.current){
        const t=e.touches[0];
        const scale=getScale();
        const dx=t.clientX-dragRef.current.x,dy=t.clientY-dragRef.current.y;
        const a0r=(dragRef.current.alt*Math.PI)/180;
        viewRef.current={
          az:((dragRef.current.az-(dx/scale)*(180/Math.PI)/Math.cos(a0r+1e-9))%360+360)%360,
          alt:Math.max(5,Math.min(89,dragRef.current.alt+(dy/scale)*(180/Math.PI))),
        };
        if(animRef.current){cancelAnimationFrame(animRef.current);animRef.current=null;}
        startInter();
      } else if(e.touches.length===2&&lastDist!==null){
        const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
        fovRef.current=Math.max(25,Math.min(110,fovRef.current*(lastDist/d)));
        lastDist=d;
        startInter(160);
      }
    };
    const onTouchEnd=e=>{
      e.preventDefault();
      const hasDragged=dragRef.current&&e.changedTouches.length>0&&
        Math.hypot(e.changedTouches[0].clientX-dragRef.current.x,e.changedTouches[0].clientY-dragRef.current.y)>8;
      lastDist=null;
      dragRef.current=null;
      finishInter();
      if(hasDragged)return;
      // 탭 → 별 클릭
      if(e.changedTouches.length===0)return;
      const t=e.changedTouches[0];
      const rect=c.getBoundingClientRect();
      const mx=t.clientX-rect.left,my=t.clientY-rect.top;
      let best=null,bestD=30;
      for(const s of projNamed.current){
        const d=Math.hypot(mx-s.pt[0],my-s.pt[1]);
        if(d<bestD){bestD=d;best=s;}
      }
      if(best){setHitResult({...best,x:mx,y:my});if(best.isPolaris)setSolved(true);}
      else setHitResult(null);
    };

    c.addEventListener('touchstart',onTouchStart,{passive:false});
    c.addEventListener('touchmove',onTouchMove,{passive:false});
    c.addEventListener('touchend',onTouchEnd,{passive:false});
    return()=>{
      c.removeEventListener('touchstart',onTouchStart);
      c.removeEventListener('touchmove',onTouchMove);
      c.removeEventListener('touchend',onTouchEnd);
    };
  },[startInter,finishInter,getScale]);

  // 팝업 위치 계산 (화면 밖으로 나가지 않도록)
  const popupStyle = hitResult ? (() => {
    const pw=260,ph=140;
    let left=hitResult.x+14,top=hitResult.y-ph/2;
    if(left+pw>dims.w-8)left=hitResult.x-pw-14;
    if(top<8)top=8;
    if(top+ph>dims.h-8)top=dims.h-ph-8;
    return{left,top,width:pw};
  })() : null;

  return (
    <div className="starmission-skymap-wrap">
      {/* 컨트롤 */}
      <div className="starmission-skymap-controls">
        <input type="range" min={0} max={1439} step={1} value={simMin}
          style={{flex:1,accentColor:'var(--color-star-400)'}}
          onChange={e=>{setIsLive(false);setSimMin(Number(e.target.value));startInter(200);}} />
        <span style={{fontSize:'var(--text-xs)',color:'var(--color-text-muted)',minWidth:44,textAlign:'right'}}>
          {fmtKST(simMin)} KST
        </span>
        <button type="button"
          className={`btn btn--ghost${isLive?' active':''}`}
          style={{fontSize:'var(--text-xs)',padding:'4px 10px',whiteSpace:'nowrap'}}
          onClick={()=>{setIsLive(true);setSimMin(currentUtcMinutes());}}>
          실시간
        </button>
      </div>

      {/* 지시문 */}
      {interactive && !solved && (
        <div className="starmission-sky-instruction">
          ✦ 별을 클릭해 북극성을 찾아보세요
        </div>
      )}
      {interactive && solved && (
        <div className="starmission-sky-instruction starmission-sky-solved">
          ✓ 북극성을 찾았습니다! 이 별을 기준으로 방향을 잡을 수 있습니다.
        </div>
      )}
      {!interactive && moonPhase && (()=>{
        const [mA] = getMoonAltAz(moonPhase, simMin, SEOUL.lat);
        const moonUp = mA > 0;
        const label = MOON_PARAMS[moonPhase]?.label;
        const msg = moonPhase==='new'
          ? '🌑 그믐달은 태양과 함께 지므로 밤하늘에 보이지 않습니다. 별이 가장 잘 보입니다.'
          : moonUp
            ? `🌙 ${label} — 현재 하늘 위에 있습니다. 드래그해서 찾아보세요.`
            : `🌙 ${label} — 이 시간에는 지평선 아래에 있습니다.`;
        return <div className="starmission-sky-instruction">{msg}</div>;
      })()}

      {/* 캔버스 */}
      <div ref={contRef} className="starmission-skymap-container" style={{height:`${dims.h}px`}}>
        <canvas ref={bgRef} className="starmission-sky-canvas starmission-sky-bg" aria-hidden="true"/>
        <canvas ref={cvRef} className="starmission-sky-canvas" style={{cursor:'grab'}}
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp}
          onMouseLeave={()=>{dragRef.current=null;finishInter();}}/>


        {/* 클릭 피드백 팝업 */}
        {hitResult && popupStyle && (
          <div className="starmission-hit-popup" style={popupStyle}>
            <button className="starmission-hit-close" onClick={()=>setHitResult(null)}>✕</button>
            {hitResult.isPolaris ? (
              <>
                <div className="starmission-hit-badge starmission-hit-correct">✓ 정답!</div>
                <div className="starmission-hit-name">{hitResult.name}</div>
              </>
            ) : (
              <>
                <div className="starmission-hit-badge starmission-hit-wrong">✗ 아닙니다</div>
                <div className="starmission-hit-name">{hitResult.name}</div>
              </>
            )}
            <div className="starmission-hit-desc">{hitResult.desc}</div>
          </div>
        )}

        <div className="starmission-sky-badge">
          HYG v3.8 · mag&lt;3.5 · 드래그 이동 · 스크롤 줌
        </div>
      </div>
    </div>
  );
}
