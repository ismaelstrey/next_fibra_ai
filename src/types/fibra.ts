interface SplitterInfo {
    tipo: '1/8' | '1/16' | '1/2';
    posicao: number;
}

interface SpliterType {
    atendimento: boolean;
    caixaId: string;
    capilarEntradaId?: string | null;
    id: string;
    tipo: '1/8' | '1/16' | '1/2';
}

interface CaboAS {
    id: number;
    nome: string;
    ativo: boolean;
}

interface ParteInternaCTOProps {
    /**
     * Lista de splitters instalados
     */
    splitters?: SplitterInfo[];

    /**
     * Lista de cabos AS conectados
     */
    cabosAS?: CaboAS[];
}

export type {
    SplitterInfo,
    CaboAS,
    ParteInternaCTOProps,
    SpliterType
}