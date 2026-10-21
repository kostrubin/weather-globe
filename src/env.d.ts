/// <reference types="vite/client" />
interface Window {
  __weather: {
    renderer?: string;
    drawCalls?: number;
    textures?: number;
    geometries?: number;
    frameDurations?: number[];
    frame?: import("./data/model").FieldFrame;
    status?: string;
    ready?: boolean;
    [key: string]: unknown;
  };
}
