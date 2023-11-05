export default function KeyLogo({
  height = 100,
  width = 100,
}: {
  height?: number;
  width?: number;
}) {
  return (
    <div>
      <img src="/keyLogoWhite1.png" height={height} width={width} />
    </div>
  );
}
