import React, { useState, useEffect } from "react";

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

interface RectangleProperties {
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
}

interface CircleProperties {
  radius?: number;
  fill?: string;
  stroke?: string;
}

interface TriangleProperties {
  points?: number[];
  fill?: string;
  stroke?: string;
}

type ShapeProperties = RectangleProperties | CircleProperties | TriangleProperties;

interface CanvasMenuProps {
  currentShape: ShapeType;
  setCurrentShape: React.Dispatch<React.SetStateAction<ShapeType>>;
  updateShapeProperties: (properties: ShapeProperties) => void;
  shapes: Shape[];
  selectedShapeId: number | null;
  setSelectedShapeId: (id: number | null) => void;
  deleteShape: () => void;
}

const CanvasMenu: React.FC<CanvasMenuProps> = ({
  currentShape,
  setCurrentShape,
  updateShapeProperties,
  shapes,
  selectedShapeId,
  setSelectedShapeId,
  deleteShape
}) => {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [radius, setRadius] = useState(50);
  const [fill, setFill] = useState("#ff0000");
  const [stroke, setStroke] = useState("#000000");

  useEffect(() => {
    if (selectedShapeId !== null) {
      const selectedShape = shapes.find(shape => shape.id === selectedShapeId);
      if (selectedShape) {
        if (selectedShape.type === "rectangle") {
          setWidth(selectedShape.width);
          setHeight(selectedShape.height);
        } else if (selectedShape.type === "circle") {
          setRadius(selectedShape.radius);
        }
        setFill(selectedShape.fill);
        setStroke(selectedShape.stroke || "#000000");
      }
    }
  }, [selectedShapeId, shapes]);

  const handleUpdateProperties = () => {
    if (selectedShapeId === null) return;

    const selectedShape = shapes.find(shape => shape.id === selectedShapeId);
    if (!selectedShape) return;

    const baseProperties = {
      fill,
      stroke,
    };

    let properties: ShapeProperties;
    
    if (selectedShape.type === "rectangle") {
      properties = {
        ...baseProperties,
        width,
        height,
      };
    } else if (selectedShape.type === "circle") {
      properties = {
        ...baseProperties,
        radius,
      };
    } else {
      properties = baseProperties;
    }

    updateShapeProperties(properties);
  };

  return (
    <div className="w-100 bg-blue-100 shadow-md rounded-lg">
<div className="flex flex-col"> </div>
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Выберите фигуру</h3>
          <div className="flex gap-2">
            <button 
              className={`px-4 py-2 rounded ${currentShape === "rectangle" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setCurrentShape("rectangle")}
            >
              Rectangle
            </button>
            <button 
              className={`px-4 py-2 rounded ${currentShape === "circle" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setCurrentShape("circle")}
            >
              Circle
            </button>
            <button 
              className={`px-4 py-2 rounded ${currentShape === "triangle" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setCurrentShape("triangle")}
            >
              Triangle
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Список фигур</h4>
          <button 
              className="px-4 py-2 bg-red-500 text-white rounded"
              onClick={deleteShape}>Delete</button>
          <div className="max-h-52 overflow-y-auto space-y-2">
            {shapes.map((shape) => (
              <button
                key={shape.id}
                className={`w-full text-left px-4 py-2 rounded ${selectedShapeId === shape.id ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                onClick={() => setSelectedShapeId(shape.id)}
              >
                {shape.type} #{shape.id}
              </button>
            ))}
          </div>
        </div>

        {selectedShapeId !== null && (
          <div className="space-y-4">
            <h4 className="font-medium">Свойства фигуры</h4>
            
            {(shapes.find(s => s.id === selectedShapeId)?.type === "rectangle" || 
              shapes.find(s => s.id === selectedShapeId)?.type === "triangle") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block">Width</label>
                  <input
                    id="width"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block">Height</label>
                  <input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>
            )}

            {shapes.find(s => s.id === selectedShapeId)?.type === "circle" && (
              <div className="space-y-2">
                <label className="block">Radius</label>
                <input
                  id="radius"
                  type="number"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block">Fill Color</label>
              <input
                id="fill"
                type="color"
                value={fill}
                onChange={(e) => setFill(e.target.value)}
                className="w-full h-10"
              />
            </div>

            <div className="space-y-2">
              <label className="block">Stroke Color</label>
              <input
                id="stroke"
                type="color"
                value={stroke}
                onChange={(e) => setStroke(e.target.value)}
                className="w-full h-10"
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        {selectedShapeId !== null && (
          <button 
            className="w-full px-4 py-2 bg-green-500 text-white rounded"
            onClick={handleUpdateProperties}
          >
            Update
          </button>
        )}
      </div>
    </div>
  );
};

export default CanvasMenu;