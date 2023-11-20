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

  switch (theme.theme) {
    case "light":
      logoSrc = "/keyLogo.svg";
      break;
    case "dark":
      logoSrc = "/keyLogoWhite1.png";
      break;
    case "system":
      // Determine if the system theme is light or dark
      const isSystemDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      logoSrc = isSystemDark ? "/keyLogoWhite1.png" : "/keyLogo.svg";
      break;
    default:
      logoSrc = "/keyLogo.svg";
  }

  return (
    <div>
      <img src={logoSrc} height={height} width={width} />
    </div>
  );
}
