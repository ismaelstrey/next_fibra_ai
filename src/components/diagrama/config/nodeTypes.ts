import { NodeTypes, EdgeTypes } from 'reactflow';
import { CaboNode } from '../nodes/CaboNode2';
import { SplitterNode } from '../nodes/SplitterNode';
import { ConexaoEdge } from '../edges/ConexaoEdge';

/**
 * Definição dos tipos de nós personalizados
 */
export const nodeTypes: NodeTypes = {
  cabo: CaboNode,
  splitter: SplitterNode,
};

/**
 * Definição dos tipos de arestas personalizadas
 */
export const edgeTypes: EdgeTypes = {
  conexao: ConexaoEdge,
};