import { SplitterInfo } from "@/types/fibra";

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

/**
 * Converte um objeto de estilo CSS em uma string de estilo inline
 * @param styleObject - Objeto com propriedades CSS
 * @returns String de estilo CSS formatada
 */
export function styleObjectToString(styleObject: React.CSSProperties): string {
  return Object.entries(styleObject)
    .map(([key, value]) => {
      // Converte camelCase para kebab-case
      const cssProperty = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssProperty}: ${value}`;
    })
    .join('; ');
}

const color = {
  1: { nome: 'Verde', hex: '#008000' },
  2: { nome: 'Amarela', hex: '#FFFF00' },
  3: { nome: 'Branca', hex: '#FFFFFF' },
  4: { nome: 'Azul', hex: '#0000FF' },
  5: { nome: 'Vermelha', hex: '#FF0000' },
  6: { nome: 'Violeta', hex: '#8A2BE2' },
  7: { nome: 'Marrom', hex: '#A52A2A' },
  8: { nome: 'Rosa', hex: '#FFC0CB' },
  9: { nome: 'Preta', hex: '#000000' },
  10: { nome: 'Cinza', hex: '#808080' },
  11: { nome: 'Laranja', hex: '#FFA500' },
  12: { nome: 'Água-marinha', hex: '#7FFFD4' },
}


/**
 * Cria uma função que recebe um numero de 1 a 12 e retorna o hex da cor
 * @param numero - Numero da cor
 * @returns Hex da cor
 */
export function getColor(numero: number): string {
  return color[numero as keyof typeof color]?.hex ?? '#000000';
}

export function getColorSpliter(spliter: SplitterInfo) {
  switch (spliter.tipo) {
    case '1/8':
      return '#FF0000'; // Red
    case '1/16':
      return '#00FF00'; // Green
    case '1/2':
      return '#0000FF'; // Blue
    default:
      return '#000000'; // Black
  }
}
