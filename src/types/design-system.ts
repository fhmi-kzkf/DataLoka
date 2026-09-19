export type ButtonVariant = "filled" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type CardSurface = "mist" | "peach" | "elevated" | "canvas";
export type CardPadding = "none" | "sm" | "md" | "lg" | "editorial";

export type TextLinkVariant = "inline" | "nav";

export type AvatarBubbleVariant = "green" | "blue" | "peach";

export interface DesignTokens {
  colors: {
    inkBlack: "#17191c";
    paperWhite: "#ffffff";
    mistGray: "#f2f2f3";
    fogWhite: "#fafafb";
    slateGray: "#777b86";
    ashGray: "#979799";
    smokeGray: "#a3a6af";
    blushPeach: "#fbe1d1";
    siennaBrown: "#5d2a1a";
  };
  typography: {
    fontSignifier: string;
    fontSohne: string;
  };
  radii: {
    buttons: "9999px";
    cards: "24px";
    elevatedCards: "20px";
    inputs: "16px";
    images: "12px";
  };
}
