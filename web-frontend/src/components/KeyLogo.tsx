import { useTheme } from "./theme-provider";

export default function KeyLogo({
  height = 100,
  width = 100,
}: {
  height?: number;
  width?: number;
}) {
  const theme = useTheme();
  let logoSrc;

  switch (theme) {
    case "light":
      logoSrc = "/keyLogoBlack.png";
      break;
    case "dark":
      logoSrc = "/keyLogoWhite1.png";
      break;
    default:
      logoSrc = "/keyLogoBlack.png";
  }

  return (
    <div>
      <img src={logoSrc} height={height} width={width} />
    </div>
  );
}
