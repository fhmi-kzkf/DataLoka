export const ECHARTS_EDITORIAL_THEME = {
  colors: {
    siennaBrown: "#5d2a1a",
    inkBlack: "#17191c",
    blushPeach: "#fbe1d1",
    blushPeachWash: "rgba(251, 225, 209, 0.45)",
    slateGray: "#777b86",
    ashGray: "#979799",
    smokeGray: "#a3a6af",
    mistGray: "#f2f2f3",
    paperWhite: "#ffffff",
  },
  palette: [
    "#5d2a1a", // Sienna Brown primary
    "#17191c", // Ink Black secondary
    "#fbe1d1", // Blush Peach accent
    "#777b86", // Slate Gray
    "#979799", // Ash Gray
    "#a3a6af", // Smoke Gray
    "#d1fae5", // Soft Mint
    "#e0f2fe", // Soft Sky
  ],
  grid: {
    top: "12%",
    left: "3%",
    right: "4%",
    bottom: "8%",
    containLabel: true,
  },
  axisLine: {
    lineStyle: {
      color: "#ececec",
      width: 1,
    },
  },
  splitLine: {
    lineStyle: {
      color: "#f5f5f6",
      type: "dashed" as const,
    },
  },
  axisLabel: {
    color: "#777b86",
    fontSize: 11,
    fontFamily: "var(--font-sohne), sans-serif",
  },
  tooltip: {
    backgroundColor: "#17191c",
    borderColor: "#17191c",
    borderWidth: 0,
    padding: [8, 12],
    textStyle: {
      color: "#ffffff",
      fontSize: 12,
      fontFamily: "var(--font-sohne), sans-serif",
    },
    extraCssText:
      "border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100;",
  },
};
