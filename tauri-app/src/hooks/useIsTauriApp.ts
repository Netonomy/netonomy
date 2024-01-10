export default function useIsTauriApp() {
  return typeof window.__TAURI__ !== "undefined";
}
