
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Fusao {
    id: string;
    fibraOrigem: string; // ID da fibra de origem
    fibraDestino: string; // ID da fibra de destino ou porta do splitter
    cor: string;
}
interface Splitter {
    id: string;
    tipo: '1/2' | '1/4' | '1/8' | '1/16' | '1/32' | '1/64';
    balanceado: boolean;
    portaEntrada: string;
    portasSaida: string[];
}


interface Fusoes {
    spliter: Splitter;
    fibraOrigem: string;
    fibraDestino: string;
    cor: string;
    id: string;
    tipo: '1/8' | '1/16' | '1/2';
    balanceado: boolean;
    modoSelecao: boolean;
    portaEntrada?: string;
    fibraSelecionada?: string;
    fusoes?: Fusao[];

    associarFibraASplitter: (splitterId: string, portaId: string) => void;
}

export default function SpliterFusao({ spliter, modoSelecao, fibraSelecionada, fusoes, associarFibraASplitter }: Fusoes) {



    return (

        <Card key={spliter.id} className="overflow-hidden">
            <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Splitter {spliter.tipo}</div>
                    <Badge variant={spliter.balanceado ? "default" : "outline"}>
                        {spliter.balanceado ? 'Balanceado' : 'Desbalanceado'}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="border rounded-sm p-2">
                        <div className="text-xs font-medium mb-1">Entrada</div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`flex items-center w-full justify-start p-1 ${modoSelecao ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'}`}
                            disabled={!modoSelecao}
                            onClick={() => associarFibraASplitter(spliter.id, spliter.portaEntrada)}
                        >
                            <div className="w-4 h-4 rounded-full bg-blue-500" />
                            <span className="text-xs ml-2">Porta de entrada</span>
                            {modoSelecao && fibraSelecionada && (
                                <span className="ml-auto text-xs text-primary">Clique para conectar</span>
                            )}
                        </Button>
                    </div>

                    <div className="border rounded-sm p-2">
                        <div className="text-xs font-medium mb-1">Saídas ({spliter.portasSaida.length})</div>
                        <div className="grid grid-cols-4 gap-1">
                            {spliter.portasSaida.map((porta, index) => {
                                const conectada = fusoes?.some(fusao => fusao.fibraDestino === porta);
                                const fusaoCor = conectada
                                    ? fusoes?.find(fusao => fusao.fibraDestino === porta)?.cor
                                    : '#CCCCCC';

                                return (
                                    <Button
                                        key={porta}
                                        variant="ghost"
                                        size="sm"
                                        className={`flex flex-col items-center p-1 h-auto ${modoSelecao ? 'hover:bg-gray-100' : ''}`}
                                        disabled={!modoSelecao || conectada}
                                        onClick={() => associarFibraASplitter(spliter.id, porta)}
                                    >
                                        <div
                                            className={`w-3 h-3 rounded-full ${conectada ? 'ring-1 ring-offset-1' : ''}`}
                                            style={{ backgroundColor: conectada ? fusaoCor : '#CCCCCC' }}
                                        />
                                        <span className="text-xs mt-1">{index + 1}</span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

    )
}