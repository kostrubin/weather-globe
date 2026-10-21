import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  layerById,
  palette,
  position,
  sample,
  advanceWind,
} from "../data/model";
import type { FieldFrame, Place } from "../data/model";
interface Props {
  frame: FieldFrame | null;
  place: Place;
  focus: Place | null;
  reset: number;
  zoom: number;
  windFrame: FieldFrame | null;
  low: boolean;
  reduced: boolean;
  wind: boolean;
  onSelect: (p: Place) => void;
  onFailure: () => void;
}
const vertex = `varying vec3 p; void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const fragment = `precision highp float; varying vec3 p; uniform sampler2D field; uniform sampler2D paletteMap; uniform vec4 bounds;uniform vec2 size;uniform vec2 domain;uniform bool ready;
 void main(){vec3 n=normalize(p);float lon=degrees(atan(-n.z,n.x));float lat=degrees(asin(clamp(n.y,-1.,1.)));vec2 uv=(vec2(lon,lat)-bounds.xy)/(bounds.zw-bounds.xy);vec3 c=vec3(.055,.11,.16);
 if(ready&&uv.x>=0.&&uv.x<=1.&&uv.y>=0.&&uv.y<=1.){bool global=bounds.z-bounds.x>359.;vec2 g=vec2(uv.x*(global?size.x:size.x-1.),uv.y*(size.y-1.));vec2 cell=floor(g);vec2 f=fract(g);vec2 a=(cell+.5)/size;vec2 b=(cell+1.5)/size;if(!global)b.x=min(b.x,1.-.5/size.x);b.y=min(b.y,1.-.5/size.y);float v00=texture2D(field,a).r;float v10=texture2D(field,vec2(b.x,a.y)).r;float v01=texture2D(field,vec2(a.x,b.y)).r;float v11=texture2D(field,b).r;float v=min(min(v00,v10),min(v01,v11))< -99990.?-99999.:mix(mix(v00,v10,f.x),mix(v01,v11,f.x),f.y);
 if(v> -99990.){float t=clamp((v-domain.x)/(domain.y-domain.x),0.,1.);c=texture2D(paletteMap,vec2((t*255.+.5)/256.,.5)).rgb;}else{c+=mod(floor(gl_FragCoord.x/5.)+floor(gl_FragCoord.y/5.),2.)*.015;}}
 gl_FragColor=vec4(c,1.);}`;
function Surface({ frame }: { frame: FieldFrame | null }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          field: { value: null },
          paletteMap: { value: null },
          bounds: { value: new THREE.Vector4(-180, -90, 180, 90) },
          size: { value: new THREE.Vector2(1, 1) },
          domain: { value: new THREE.Vector2(-40, 40) },
          ready: { value: false },
        },
        toneMapped: false,
      }),
    [],
  );
  const { invalidate } = useThree();
  useEffect(() => {
    if (!frame) {
      material.uniforms.ready.value = false;
      invalidate();
      return;
    }
    const def = layerById(frame.layer),
      values = Float32Array.from(frame.values, (v) =>
        Number.isFinite(v) ? v : -99999,
      ),
      tex = new THREE.DataTexture(
        values,
        frame.width,
        frame.height,
        THREE.RedFormat,
        THREE.FloatType,
      );
    tex.minFilter = tex.magFilter = THREE.NearestFilter;
    tex.wrapS =
      frame.model === "cams_europe"
        ? THREE.ClampToEdgeWrapping
        : THREE.RepeatWrapping;
    tex.needsUpdate = true;
    const colors = new Uint8Array(256 * 4);
    for (let i = 0; i < 256; i++) {
      colors.set(
        [
          ...palette(
            def.domain[0] + (i / 255) * (def.domain[1] - def.domain[0]),
            def,
          ),
          255,
        ],
        i * 4,
      );
    }
    const lut = new THREE.DataTexture(colors, 256, 1);
    lut.minFilter = lut.magFilter = THREE.LinearFilter;
    lut.needsUpdate = true;
    material.uniforms.field.value = tex;
    material.uniforms.paletteMap.value = lut;
    material.uniforms.domain.value.set(...def.domain);
    material.uniforms.bounds.value.set(...frame.bounds);
    material.uniforms.size.value.set(frame.width, frame.height);
    material.uniforms.ready.value = true;
    invalidate();
    return () => {
      tex.dispose();
      lut.dispose();
    };
  }, [frame, material, invalidate]);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh material={material}>
      <sphereGeometry args={[1, 96, 64]} />
    </mesh>
  );
}
function Geography() {
  const { invalidate } = useThree();
  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/coastlines.geojson`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        const vertices: number[] = [];
        for (const f of data.features) {
          const lines =
            f.geometry.type === "LineString"
              ? [f.geometry.coordinates]
              : f.geometry.coordinates;
          for (const line of lines)
            for (let i = 1; i < line.length; i++)
              vertices.push(
                ...position(line[i - 1][1], line[i - 1][0], 1.002),
                ...position(line[i][1], line[i][0], 1.002),
              );
        }
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(vertices, 3),
        );
        invalidate();
      })
      .catch(() => {});
    return () => controller.abort();
  }, [geometry, invalidate]);
  const grid = useMemo(() => {
    const v: number[] = [];
    for (let lat = -60; lat <= 60; lat += 30)
      for (let lon = -180; lon < 180; lon += 3)
        v.push(...position(lat, lon, 1.001), ...position(lat, lon + 3, 1.001));
    for (let lon = -180; lon < 180; lon += 30)
      for (let lat = -90; lat < 90; lat += 3)
        v.push(...position(lat, lon, 1.001), ...position(lat + 3, lon, 1.001));
    return new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.Float32BufferAttribute(v, 3),
    );
  }, []);
  useEffect(
    () => () => {
      geometry.dispose();
      grid.dispose();
    },
    [geometry, grid],
  );
  return (
    <>
      <lineSegments geometry={geometry} raycast={() => {}}>
        <lineBasicMaterial
          color="#132b3c"
          transparent
          opacity={0.8}
          toneMapped={false}
        />
      </lineSegments>
      <lineSegments geometry={grid} raycast={() => {}}>
        <lineBasicMaterial
          color="#afcdd4"
          transparent
          opacity={0.1}
          toneMapped={false}
        />
      </lineSegments>
    </>
  );
}
function Atmosphere() {
  return (
    <mesh raycast={() => {}}>
      <sphereGeometry args={[1.026, 64, 40]} />
      <shaderMaterial
        transparent
        side={THREE.BackSide}
        depthWrite={false}
        vertexShader={`varying vec3 n;varying vec3 v;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`}
        fragmentShader={`varying vec3 n;varying vec3 v;void main(){float f=pow(1.-abs(dot(n,v)),4.);gl_FragColor=vec4(.29,.67,.77,f*.38);}`}
        toneMapped={false}
      />
    </mesh>
  );
}
function Wind({
  frame,
  low,
  enabled,
}: {
  frame: FieldFrame | null;
  low: boolean;
  enabled: boolean;
}) {
  const count = low ? 2048 : 8192;
  const state = useMemo(() => {
    const coords = new Float32Array(count * 2),
      ages = new Float32Array(count),
      verts = new Float32Array(count * 6);
    let seed = 42;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < count; i++) {
      coords[i * 2] = (Math.asin(random() * 2 - 1) * 180) / Math.PI;
      coords[i * 2 + 1] = random() * 360 - 180;
      ages[i] = random() * 10;
    }
    return {
      coords,
      ages,
      verts,
      geometry: new THREE.BufferGeometry().setAttribute(
        "position",
        new THREE.BufferAttribute(verts, 3),
      ),
    };
  }, [count]);
  const { invalidate } = useThree();
  useEffect(() => {
    invalidate();
    return () => state.geometry.dispose();
  }, [state, invalidate]);
  useFrame((_, delta) => {
    if (!enabled || document.hidden || !frame?.u || !frame.v) return;
    const dt = Math.min(delta, 0.04);
    for (let i = 0; i < count; i++) {
      let lat = state.coords[i * 2],
        lon = state.coords[i * 2 + 1];
      const u = sample(frame, lat, lon, frame.u),
        v = sample(frame, lat, lon, frame.v);
      state.ages[i] += dt;
      if (state.ages[i] > 8 || u === null || v === null) {
        state.ages[i] = 0;
        lat = ((i * 73.137) % 160) - 80;
        lon = ((i * 137.507 + performance.now() * 0.001) % 360) - 180;
      }
      const next =
        u !== null && v !== null
          ? advanceWind(lat, lon, u, v, dt * 3000)
          : [lat, lon];
      const tail =
        u !== null && v !== null
          ? advanceWind(lat, lon, -u, -v, 6000)
          : [lat, lon];
      state.verts.set(position(tail[0], tail[1], 1.005), i * 6);
      state.verts.set(position(next[0], next[1], 1.005), i * 6 + 3);
      state.coords[i * 2] = next[0];
      state.coords[i * 2 + 1] = next[1];
    }
    state.geometry.attributes.position.needsUpdate = true;
    invalidate();
  });
  return enabled && frame?.u ? (
    <lineSegments
      geometry={state.geometry}
      frustumCulled={false}
      raycast={() => {}}
    >
      <lineBasicMaterial
        color="#f0fff7"
        transparent
        opacity={0.62}
        toneMapped={false}
      />
    </lineSegments>
  ) : null;
}
function Scene(props: Props) {
  const { camera, gl, invalidate } = useThree(),
    controls = useRef<OrbitControls | null>(null),
    flight = useRef<THREE.Vector3 | null>(null),
    frames = useRef<number[]>([]);
  useEffect(() => {
    const c = new OrbitControls(camera, gl.domElement);
    c.enablePan = false;
    c.minDistance = 1.5;
    c.maxDistance = 5;
    c.enableDamping = true;
    c.dampingFactor = 0.12;
    c.rotateSpeed = 0.55;
    c.zoomSpeed = 0.8;
    const change = () => invalidate(),
      start = () => {
        flight.current = null;
        invalidate();
      };
    c.addEventListener("change", change);
    c.addEventListener("start", start);
    controls.current = c;
    return () => {
      c.removeEventListener("change", change);
      c.removeEventListener("start", start);
      c.dispose();
    };
  }, [camera, gl, invalidate]);
  useEffect(() => {
    const p = props.focus ?? props.place;
    flight.current = new THREE.Vector3(
      ...position(p.latitude, p.longitude, 3.1),
    );
    invalidate();
  }, [props.focus, props.reset]); // selection camera is an explicit action
  const previousZoom = useRef(props.zoom);
  useEffect(() => {
    const delta = props.zoom - previousZoom.current;
    previousZoom.current = props.zoom;
    if (!delta) return;
    camera.position.multiplyScalar(Math.pow(0.84, delta));
    const d = camera.position.length();
    camera.position.setLength(Math.max(1.5, Math.min(5, d)));
    invalidate();
  }, [props.zoom]);
  useEffect(() => {
    const fail = (e: Event) => {
      e.preventDefault();
      props.onFailure();
    };
    gl.domElement.addEventListener("webglcontextlost", fail);
    performance.mark("globe-first-frame");
    const ctx = gl.getContext(),
      ext = ctx.getExtension("WEBGL_debug_renderer_info");
    window.__weather = {
      ...window.__weather,
      renderer: ctx.getParameter(
        ext ? ext.UNMASKED_RENDERER_WEBGL : ctx.RENDERER,
      ),
    };
    return () => gl.domElement.removeEventListener("webglcontextlost", fail);
  }, [gl, props.onFailure]);
  useFrame((_, delta) => {
    if (document.hidden) return;
    controls.current?.update();
    if (flight.current) {
      if (props.reduced || camera.position.distanceTo(flight.current) < 0.005) {
        camera.position.copy(flight.current);
        flight.current = null;
      } else camera.position.lerp(flight.current, 0.18);
      camera.lookAt(0, 0, 0);
      invalidate();
    }
    if (delta < 0.3) {
      frames.current.push(delta * 1000);
      if (frames.current.length > 600) frames.current.shift();
    }
    window.__weather = {
      ...window.__weather,
      cameraDistance: camera.position.length(),
      drawCalls: gl.info.render.calls,
      textures: gl.info.memory.textures,
      geometries: gl.info.memory.geometries,
      frameDurations: frames.current,
    };
  });
  useEffect(() => {
    const id = setTimeout(() => {
      window.__weather = {
        ...window.__weather,
        drawCalls: gl.info.render.calls,
        textures: gl.info.memory.textures,
        geometries: gl.info.memory.geometries,
      };
    }, 300);
    return () => clearTimeout(id);
  }, [props.frame, gl]);
  useEffect(() => {
    window.__weather.inspect = (x: number, y: number) => {
      const rect = gl.domElement.getBoundingClientRect(),
        ray = new THREE.Raycaster();
      ray.setFromCamera(
        new THREE.Vector2(
          ((x - rect.left) / rect.width) * 2 - 1,
          1 - ((y - rect.top) / rect.height) * 2,
        ),
        camera,
      );
      const point = ray.ray.intersectSphere(
        new THREE.Sphere(new THREE.Vector3(), 1),
        new THREE.Vector3(),
      );
      if (!point || !props.frame) return null;
      const lat = (Math.asin(point.y) * 180) / Math.PI,
        lon = (Math.atan2(-point.z, point.x) * 180) / Math.PI,
        value = sample(props.frame, lat, lon);
      return {
        lat,
        lon,
        value,
        color:
          value === null ? null : palette(value, layerById(props.frame.layer)),
      };
    };
  }, [props.frame, camera, gl]);
  useEffect(() => {
    const visible = () => {
      if (!document.hidden) invalidate();
    };
    document.addEventListener("visibilitychange", visible);
    return () => document.removeEventListener("visibilitychange", visible);
  }, [invalidate]);
  const pointer = useRef<[number, number]>([0, 0]);
  return (
    <group
      onPointerDown={(e) => {
        pointer.current = [e.clientX, e.clientY];
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (
          Math.hypot(
            e.clientX - pointer.current[0],
            e.clientY - pointer.current[1],
          ) > 6
        )
          return;
        const p = e.point.clone().normalize();
        props.onSelect({
          name: "",
          latitude: (Math.asin(p.y) * 180) / Math.PI,
          longitude: (Math.atan2(-p.z, p.x) * 180) / Math.PI,
        });
      }}
    >
      <Surface frame={props.frame} />
      <Geography />
      <Atmosphere />
      <Wind
        frame={props.windFrame}
        low={props.low}
        enabled={props.wind && !props.reduced}
      />
      <mesh
        raycast={() => {}}
        position={position(props.place.latitude, props.place.longitude, 1.012)}
      >
        <sphereGeometry args={[0.013, 16, 12]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  );
}
class Boundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function Globe(props: Props) {
  return (
    <Boundary onFailure={props.onFailure}>
      <Canvas
        camera={{
          position: position(-22, -60, 3.1),
          fov: 43,
          near: 0.1,
          far: 20,
        }}
        dpr={props.low ? 1 : 1.5}
        frameloop="demand"
        gl={{
          antialias: !props.low,
          alpha: true,
          powerPreference: "low-power",
          toneMapping: THREE.NoToneMapping,
        }}
      >
        <Scene {...props} />
      </Canvas>
    </Boundary>
  );
}
