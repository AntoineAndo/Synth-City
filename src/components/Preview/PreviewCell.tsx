export type PointerType = "primary" | "secondary";

type Props = {
  x: number;
  z: number;
  color?: string;
};

export const PreviewCell = ({ x, z, color }: Props) => {
  return (
    <mesh position={[x, 0.01, z]} rotation={[0, 0, 0]}>
      <boxGeometry args={[1, 0.01, 1]} />
      <meshStandardMaterial transparent opacity={0.3} color={color} />
    </mesh>
  );
};
