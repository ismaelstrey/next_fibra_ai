export function getFiberColor(fiberType: string): string {
  const colorMap: { [key: string]: string } = {
    '6': '#FF0000',   // Red
    '12': '#00FF00',  // Green
    '24': '#0000FF',  // Blue
    '48': '#FFA500',  // Orange
    '96': '#800080'   // Purple
  };

  return colorMap[fiberType] || '#CCCCCC'; // Returns gray as default if fiber type not found
}
