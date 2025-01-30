import { useState, useRef } from "react";
import { Stage, Layer, Rect, Circle, Line } from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from 'konva/lib/Node';
import CanvasMenu from "./components/Menu";


type ShapeType = "rectangle" | "circle" | "triangle";

interface BaseShape {
  id: number;
  type: ShapeType;
  x: number;
  y: number;
  fill: string;
  stroke?: string;
}

interface RectangleShape extends BaseShape {
  type: "rectangle";
  width: number;
  height: number;
}

interface CircleShape extends BaseShape {
  type: "circle";
  radius: number;
}

interface TriangleShape extends BaseShape {
  type: "triangle";
  points: number[];
}

type Shape = RectangleShape | CircleShape | TriangleShape;

interface ShapeProperties {
  width?: number;
  height?: number;
  radius?: number;
  fill?: string;
  stroke?: string;
}

const App = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<ShapeType>("rectangle");
  const [selectedShapeId, setSelectedShapeId] = useState<number | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const isRightClickDragging = useRef(false);
  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);

  const createShape = (pos: { x: number; y: number }): Shape => {
    const baseShape = {
      id: shapes.length,
      x: pos.x,
      y: pos.y,
      fill:
        currentShape === "rectangle"
          ? "#ff0000"
          : currentShape === "circle"
          ? "#0000ff"
          : "#00ff00",
      stroke: "#000000",
    };

    switch (currentShape) {
      case "rectangle":
        return {
          ...baseShape,
          type: "rectangle",
          width: 0,
          height: 0,
        };
      case "circle":
        return {
          ...baseShape,
          type: "circle",
          radius: 0,
        };
      case "triangle":
        return {
          ...baseShape,
          type: "triangle",
          points: [0, 0, 0, 0, 0, 0],
        };
    }
  };

  const handleRightClickDrag = (e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 2) return;
    e.evt.preventDefault();

    if (selectedShapeId === null) return;

    if (!isRightClickDragging.current) {
      isRightClickDragging.current = true;
      lastMousePosition.current = { x: e.evt.clientX, y: e.evt.clientY };
      return;
    }

    if (lastMousePosition.current) {
      const deltaX = e.evt.clientX - lastMousePosition.current.x;
      const deltaY = e.evt.clientY - lastMousePosition.current.y;

      const newShapes = [...shapes];
      const shape = newShapes.find((s) => s.id === selectedShapeId);
      if (shape) {
        shape.x += deltaX;
        shape.y += deltaY;
      }

      setShapes(newShapes);
      lastMousePosition.current = { x: e.evt.clientX, y: e.evt.clientY };
    }
  };

  const endRightClickDrag = () => {
    isRightClickDragging.current = false;
    lastMousePosition.current = null;
  };

  const startDrawing = (e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    setDrawing(true);
    const newShape = createShape(pos);
    setShapes([...shapes, newShape]);
  };

  const drawShape = (e: KonvaEventObject<MouseEvent>) => {
    if (!drawing) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const newShapes = [...shapes];
    const lastShape = newShapes[newShapes.length - 1];

    switch (lastShape.type) {
      case "rectangle": {
        const rectangleShape = lastShape as RectangleShape;
        rectangleShape.width = pos.x - rectangleShape.x;
        rectangleShape.height = pos.y - rectangleShape.y;
        break;
      }
      case "circle": {
        const circleShape = lastShape as CircleShape;
        circleShape.radius = Math.max(
          Math.abs(pos.x - circleShape.x),
          Math.abs(pos.y - circleShape.y)
        );
        break;
      }
      case "triangle": {
        const triangleShape = lastShape as TriangleShape;
        const width = pos.x - triangleShape.x;
        const height = pos.y - triangleShape.y;
        triangleShape.points = [0, 0, width, 0, width / 2, -height];
        break;
      }
    }

    setShapes(newShapes);
  };

  const endDrawing = () => setDrawing(false);

  const handleDragEnd = (e: KonvaEventObject<DragEvent>, index: number) => {
    const newShapes = [...shapes];
    const shape = newShapes[index];
    if (shape) {
      newShapes[index] = {
        ...shape,
        x: e.target.x(),
        y: e.target.y(),
      };
      setShapes(newShapes);
    }
  };

  const updateShapeProperties = (properties: ShapeProperties) => {
    if (selectedShapeId === null) return;

    setShapes(
      shapes.map((shape) => {
        if (shape.id !== selectedShapeId) return shape;

        const baseUpdate = {
          ...shape,
          fill: properties.fill ?? shape.fill,
          stroke: properties.stroke ?? shape.stroke,
        };

        switch (shape.type) {
          case "rectangle":
            return {
              ...baseUpdate,
              width: properties.width ?? shape.width,
              height: properties.height ?? shape.height,
            };
          case "circle":
            return {
              ...baseUpdate,
              radius: properties.radius ?? shape.radius,
            };
          case "triangle":
            return baseUpdate;
        }
      })
    );
  };

  const deleteShape = () => {
    if (selectedShapeId === null) return;
    setShapes(shapes.filter((shape) => shape.id !== selectedShapeId));
    setSelectedShapeId(null);
  };

  const renderShape = (shape: Shape, index: number) => {
    const shapeProps = {
      draggable: true,
      onDragEnd: (e: KonvaEventObject<DragEvent>) => handleDragEnd(e, index),
      onClick: () => setSelectedShapeId(shape.id),
      onContextMenu: (e: KonvaEventObject<MouseEvent>) => {
        e.evt.preventDefault();
        setSelectedShapeId(shape.id);
      },
      stroke: shape.stroke,
      fill: shape.fill,
      x: shape.x,
      y: shape.y,
    };

    switch (shape.type) {
      case "rectangle":
        return (
          <Rect key={shape.id} {...shapeProps} width={shape.width} height={shape.height} />
        );
      case "circle":
        return <Circle key={shape.id} {...shapeProps} radius={shape.radius} />;
      case "triangle":
        return <Line key={shape.id} {...shapeProps} points={shape.points} closed />;
    }
  };

  const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 0) {
      endDrawing();
    }
    endRightClickDrag();
  };

  return (
    <div className="flex h-screen">
      <CanvasMenu
        currentShape={currentShape}
        setCurrentShape={setCurrentShape}
        updateShapeProperties={updateShapeProperties}
        shapes={shapes}
        selectedShapeId={selectedShapeId}
        setSelectedShapeId={setSelectedShapeId}
        deleteShape={deleteShape}
      />
      
      <div className="flex-1">
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          ref={stageRef}
          onMouseDown={startDrawing}
          onMouseMove={drawShape}
          onMouseUp={handleMouseUp}
          onContextMenu={handleRightClickDrag}
        >
          <Layer>{shapes.map((shape, index) => renderShape(shape, index))}</Layer>
        </Stage>
      </div>
    </div>
  );
};

export default App;