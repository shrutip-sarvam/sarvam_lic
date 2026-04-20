import { useCallback } from 'react';
import { BoundingBox } from '../types/block.types';

export interface ScreenBbox {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface VisualGroundingOptions {
  imageWidth: number;
  imageHeight: number;
  containerWidth: number;
  containerHeight: number;
}

export function useVisualGrounding(options: VisualGroundingOptions) {
  const { imageWidth, imageHeight, containerWidth, containerHeight } = options;

  const scale = Math.min(
    containerWidth / (imageWidth || 1),
    containerHeight / (imageHeight || 1)
  );
  const offsetX = (containerWidth - imageWidth * scale) / 2;
  const offsetY = (containerHeight - imageHeight * scale) / 2;

  const transformBbox = useCallback(
    (bbox: BoundingBox): ScreenBbox => {
      const x = bbox.x * scale + offsetX;
      const y = bbox.y * scale + offsetY;
      const width = bbox.width * scale;
      const height = bbox.height * scale;
      return { x, y, width, height, centerX: x + width / 2, centerY: y + height / 2 };
    },
    [scale, offsetX, offsetY]
  );

  const hitTest = useCallback(
    (tapX: number, tapY: number, bboxes: Array<{ id: string; bbox: BoundingBox }>) => {
      return bboxes.filter(({ bbox }) => {
        const sb = transformBbox(bbox);
        return tapX >= sb.x && tapX <= sb.x + sb.width && tapY >= sb.y && tapY <= sb.y + sb.height;
      });
    },
    [transformBbox]
  );

  return { transformBbox, hitTest, scale, offsetX, offsetY };
}
