/** @type {import('tailwindcss').Config} */

// 生成 0 - 2000 的像素映射，实现 1:1 px
const pxMap = Array.from({ length: 2001 }).reduce((acc, _, i) => {
  acc[i] = `${i}px`;
  return acc;
}, {});

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // 扩展 spacing, fontSize, lineHeight, borderWidth 以支持数字直接对应 px
      spacing: pxMap,
      fontSize: pxMap,
      lineHeight: pxMap,
      borderWidth: pxMap,
      
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
