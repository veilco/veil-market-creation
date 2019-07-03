import { useState, useCallback, useLayoutEffect } from "react";

function getDimensionObject(node: HTMLElement) {
  const rect = node.getBoundingClientRect();

  if ((rect as DOMRect).toJSON) {
    return (rect as DOMRect).toJSON();
  } else {
    const anyRect: any = rect;
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top || anyRect.y,
      left: rect.left || anyRect.x,
      x: anyRect.x || rect.left,
      y: anyRect.y || rect.top,
      right: rect.right,
      bottom: rect.bottom
    };
  }
}

function useDimensions() {
  const [dimensions, setDimensions] = useState<Partial<DOMRect>>({});
  const [node, setNode] = useState<HTMLElement | null>(null);

  const ref = useCallback(node => {
    setNode(node);
  }, []);

  useLayoutEffect(() => {
    if (node) {
      const measure = () =>
        window.requestAnimationFrame(() =>
          setDimensions(getDimensionObject(node))
        );
      measure();

      window.addEventListener("resize", measure);
      window.addEventListener("scroll", measure);

      return () => {
        window.removeEventListener("resize", measure);
        window.removeEventListener("scroll", measure);
      };
    }
  }, [node]);

  return [ref, dimensions, node] as [() => void, Partial<DOMRect>, HTMLElement];
}

export default useDimensions;
