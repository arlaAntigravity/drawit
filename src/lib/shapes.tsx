import React from "react";
import { NodeType } from "@/lib/types";

export interface ShapeConfig {
  type: NodeType;
  label: string;
  icon: React.ReactNode;
}

export const SHAPES: ShapeConfig[] =
  [
    {
      type: "rectangle",
      label: "Прямоугольник",
      icon: (
        <svg
          width="40"
          height="24"
          viewBox="0 0 40 24"
          className="stroke-indigo-400"
        >
          <rect
            x="2"
            y="2"
            width="36"
            height="20"
            fill="none"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      type: "roundedRect",
      label: "Скруглённый",
      icon: (
        <svg
          width="40"
          height="24"
          viewBox="0 0 40 24"
          className="stroke-green-400"
        >
          <rect
            x="2"
            y="2"
            width="36"
            height="20"
            rx="6"
            fill="none"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      type: "diamond",
      label: "Ромб",
      icon: (
        <svg
          width="40"
          height="30"
          viewBox="0 0 40 30"
          className="stroke-amber-400"
        >
          <polygon
            points="20,2 38,15 20,28 2,15"
            fill="none"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      type: "ellipse",
      label: "Эллипс",
      icon: (
        <svg
          width="40"
          height="24"
          viewBox="0 0 40 24"
          className="stroke-pink-400"
        >
          <ellipse
            cx="20"
            cy="12"
            rx="18"
            ry="10"
            fill="none"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      type: "text",
      label: "Текст",
      icon: (
        <svg
          width="40"
          height="24"
          viewBox="0 0 40 24"
          className="fill-violet-400"
        >
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fontWeight="bold"
          >
            Aa
          </text>
        </svg>
      ),
    },
    {
      type: "cylinder",
      label: "База данных",
      icon: (
        <svg
          width="32"
          height="36"
          viewBox="0 0 32 36"
          className="stroke-cyan-400"
        >
          <ellipse
            cx="16"
            cy="6"
            rx="14"
            ry="5"
            fill="none"
            strokeWidth="2"
          />
          <line
            x1="2"
            y1="6"
            x2="2"
            y2="30"
            strokeWidth="2"
          />
          <line
            x1="30"
            y1="6"
            x2="30"
            y2="30"
            strokeWidth="2"
          />
          <ellipse
            cx="16"
            cy="30"
            rx="14"
            ry="5"
            fill="none"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      type: "triangle",
      label: "Треугольник",
      icon: (
        <svg
          width="40"
          height="30"
          viewBox="0 0 40 30"
          className="stroke-red-400"
        >
          <polygon
            points="20,2 38,28 2,28"
            fill="none"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      type: "group",
      label: "Группа",
      icon: (
        <svg
          width="40"
          height="28"
          viewBox="0 0 40 28"
          className="stroke-indigo-400"
        >
          <rect
            x="2"
            y="2"
            width="36"
            height="24"
            rx="3"
            fill="none"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <rect
            x="2"
            y="2"
            width="36"
            height="8"
            rx="3"
            fill="currentColor"
            className="fill-indigo-400/30"
          />
        </svg>
      ),
    },
  ];
