import { memo } from "react";
import { NodeProps, NodeResizer } from "reactflow";
import { NodeData } from "@/lib/types";
import { NodeHandles } from "./NodeHandles";
import { NODE_STYLES, HANDLE_COLORS } from "@/lib/constants";
import { ImageIcon } from "@/components/icons";

export const ImageNode = memo(({ id: _id, data, selected }: NodeProps<NodeData>) => {
  const style = NODE_STYLES.image;

  return (
    <div
      className="relative flex items-center justify-center cursor-grab active:cursor-grabbing rounded overflow-hidden"
      style={{
        width: data.width,
        height: data.height,
        backgroundColor: data.imageUrl ? "transparent" : "rgba(30, 30, 46, 0.4)",
        border: selected ? `2px solid ${style.handleColor}` : `${data.borderWidth}px solid ${data.borderColor}`,
        boxShadow: selected
          ? `0 0 0 2px ${style.borderColor}, 0 0 20px ${style.selectedShadowColor}`
          : "none",
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={50}
        minHeight={50}
        handleClassName="!w-2.5 !h-2.5 !bg-indigo-500 !border-white !rounded-full"
        lineClassName="!border-indigo-500"
      />
      {data.imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.imageUrl}
            alt={data.label || "Image node"}
            className="w-full h-full object-contain pointer-events-none"
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs">Нет изображения</span>
        </div>
      )}
      <NodeHandles colorClass={HANDLE_COLORS[style.handleColor]} />
    </div>
  );
});
ImageNode.displayName = "ImageNode";
