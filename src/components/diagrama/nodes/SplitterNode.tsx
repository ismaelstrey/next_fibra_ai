'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import Image from 'next/image';
import { getColor, getFiberColor, styleObjectToString } from '@/functions/color';


/**
 * Componente de nó personalizado para Splitter
 */
export function SplitterNode({ data, id }: NodeProps) {
  return (
    <div className="h-auto">

  
      <div>
         <Image className='rotate-270' alt='Spliter' src="/spliter.svg" width={160} height={150}/>
          <Handle
            type="target"
            position={Position.Left}
            id={data.portaEntrada}
            style={{ backgroundColor: '#fff' }}
          />
    
       
          {data.portasSaida.map((porta: string, index: number) => {
            // Cria o objeto de estilo
            const cor = getColor(((index === 0) ? 1 :index+1))
            const handleStyle = { 
              backgroundColor: cor, 
              top: 20*index 
            };
            
   
            console.log(`Handle ${index} style string:`, cor);
            
            return (
              <Handle
                key={index}
                type="source"
                position={Position.Right}
                id={porta}
                style={handleStyle}
              />        
            );
          })}

      </div>
    </div>
  );
}