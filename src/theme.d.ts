import { PaletteOptions } from "@mui/material/styles";

// MUI 테마 타입 확장
declare module "@mui/material/styles" {
  interface TypeBackground {
    left: string;
    right: string;
  }

  interface PaletteOptions {
    background?: Partial<TypeBackground>;
  }
}
