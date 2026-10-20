import React, { useMemo } from 'react';

export const StringLights: React.FC = () => {
  // Generate catenary strings of glowing bulbs crossing between x = -10 and x = +10 at various z positions
  const lightStrings = useMemo(() => {
    const zCoords = [24, 15, 8, 0, -8, -15, -24, -36];
    const bulbList: { pos: [number, number, number]; color: string; hasLight: boolean }[] = [];
    const colors = ['#f5b041', '#e74c3c', '#2ecc71', '#3498db', '#f1c40f', '#e84393'];

    zCoords.forEach((z, zIdx) => {
      for (let x = -9; x <= 9; x += 0.9) {
        // Catenary dip: y = 5.6 - cosh or parabolic dip
        const dip = 5.4 - Math.sin(((x + 9) / 18) * Math.PI) * 1.6;
        const color = colors[Math.floor(Math.random() * colors.length)];
        bulbList.push({
          pos: [x, dip, z],
          color,
          hasLight: (bulbList.length % 7 === 0)
        });
      }
    });

    return bulbList;
  }, []);

  // Floating Sky Paper Lanterns (Tukkal / Akash Kandil)
  const skyLanterns = useMemo(() => {
    return [
      [-12, 18, 10],
      [14, 22, 5],
      [-15, 25, -10],
      [16, 20, -25],
      [6, 28, -40],
      [-8, 30, -45]
    ] as [number, number, number][];
  }, []);

  return (
    <group>
      {/* Hanging Fairy Light Bulbs */}
      {lightStrings.map((item, idx) => (
        <group key={idx} position={item.pos}>
          <mesh>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshBasicMaterial color={item.color} />
          </mesh>
          {item.hasLight && (
            <pointLight color={item.color} intensity={18} distance={7} />
          )}
        </group>
      ))}

      {/* High Floating Sky Lanterns (Akash Kandils) */}
      {skyLanterns.map((pos, idx) => (
        <group key={idx} position={pos}>
          <mesh>
            <cylinderGeometry args={[0.5, 0.4, 0.9, 8]} />
            <meshStandardMaterial
              color="#e67e22"
              emissive="#f39c12"
              emissiveIntensity={0.8}
              transparent
              opacity={0.85}
            />
          </mesh>
          <pointLight color="#f39c12" intensity={30} distance={15} />
        </group>
      ))}

      {/* Glowing Earthen Diyas along walkway edge */}
      {[-2, 2].map((x) =>
        [28, 20, 12, 4, -4, -12, -20, -28].map((z, idx) => (
          <group key={`${x}-${z}-${idx}`} position={[x, 0.05, z]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.08, 0.08, 8]} />
              <meshStandardMaterial color="#d35400" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#ffcc00" />
            </mesh>
            <pointLight color="#ffaa00" intensity={6} distance={2.5} />
          </group>
        ))
      )}
    </group>
  );
};
