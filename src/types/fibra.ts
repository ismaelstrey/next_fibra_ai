interface SplitterInfo {
    tipo: '1/8' | '1/16' | '1/2';
    posicao: number;
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
    ParteInternaCTOProps
}