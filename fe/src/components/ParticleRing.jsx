// src/components/ParticleRing.jsx
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { pointsInner, pointsOuter } from "../utils/particleUtils";

console.log("Imported Canvas:", Canvas);
console.log("Imported useFrame:", useFrame);
console.log("Imported OrbitControls:", OrbitControls);
console.log("Imported Sphere:", Sphere);
console.log("Imported pointsInner:", pointsInner);
console.log("Imported pointsOuter:", pointsOuter);

const ParticleRing = () => {
  console.log("Rendering ParticleRing");
  return (
    <div className="relative top-0 left-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75 }}
        style={{ height: "100vh" }}
        className="bg-slate-900"
      >
        <OrbitControls maxDistance={20} minDistance={10} />
        <directionalLight  />
        <pointLight  position={[-30, 0, -30]} power={10.0} />
        <PointCircle />
      </Canvas>

      <h1 className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-slate-200 font-medium text-2xl md:text-5xl pointer-events-none">
        Drag & Zoom
      </h1>
    </div>
  );
};

const PointCircle = () => {
  console.log("Rendering PointCircle");
  console.log("pointsInner in PointCircle:", pointsInner);
  console.log("pointsOuter in PointCircle:", pointsOuter);
  const ref = useRef(null);

  useFrame(({ clock }) => {
    console.log("useFrame running, ref.current:", ref.current);
    if (ref.current?.rotation) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={ref}>
      {pointsInner.map((point) => (
        <Point key={point.idx} position={point.position} color={point.color} />
      ))}
      {pointsOuter.map((point) => (
        <Point key={point.idx} position={point.position} color={point.color} />
      ))}
    </group>
  );
};

const Point = ({ position, color }) => {
  console.log("Rendering Point with position:", position, "color:", color);
  return (
    <Sphere position={position} args={[0.1, 10, 16]}>
      <meshStandardMaterial
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.5}
        color={color}
      />
    </Sphere>
  );
};

export default ParticleRing;