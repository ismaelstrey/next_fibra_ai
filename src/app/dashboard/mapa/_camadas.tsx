
import { LayersIcon, FilterIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import useMapa, { CamadasVisiveis, FiltrosMapa } from '@/hooks/useMapa';
import React from 'react';

export default function CamadasMaps() {
    const [active, setActive] = React.useState(false)

    const toggleActive = () => {
        setActive(!active);
    }

    const {
        camadasVisiveis,
        tipoCaboSelecionado,
        atualizarCamadasVisiveis,
        setTipoCaboSelecionado,
    } = useMapa();

    const handleToggleCamada = (tipo: keyof CamadasVisiveis, valor: boolean) => {
        atualizarCamadasVisiveis({ [tipo]: valor });
    };
    if (!active) {
        return (
            <LayersIcon className={`h-4 w-4 mr-2 cursor-pointer ${active ? 'text-cyan-500' : ''} `} onClick={toggleActive} />
        )
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center">
                    <LayersIcon className={`h-4 w-4 mr-2 cursor-pointer ${active ? 'text-cyan-500' : ''} `} onClick={toggleActive} />
                    Camadas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="caixas"
                        className="mr-2"
                        checked={camadasVisiveis.caixas}
                        onChange={(e) => handleToggleCamada('caixas', e.target.checked)}
                    />
                    <label htmlFor="caixas" className="text-sm">Caixas (CTO/CEO)</label>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="rotas"
                        className="mr-2"
                        checked={camadasVisiveis.rotas}
                        onChange={(e) => handleToggleCamada('rotas', e.target.checked)}
                    />
                    <label htmlFor="rotas" className="text-sm">Rotas de Cabos</label>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="fusoes"
                        className="mr-2"
                        checked={camadasVisiveis.fusoes}
                        onChange={(e) => handleToggleCamada('fusoes', e.target.checked)}
                    />
                    <label htmlFor="fusoes" className="text-sm">Pontos de Fusão</label>
                </div>

                <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Tipo de Cabo</p>
                    <ToggleGroup type="single" value={tipoCaboSelecionado} onValueChange={(value) => value && setTipoCaboSelecionado(value as any)}>
                        <ToggleGroupItem value="6" size="sm" className="text-xs">6</ToggleGroupItem>
                        <ToggleGroupItem value="12" size="sm" className="text-xs">12</ToggleGroupItem>
                        <ToggleGroupItem value="24" size="sm" className="text-xs">24</ToggleGroupItem>
                        <ToggleGroupItem value="48" size="sm" className="text-xs">48</ToggleGroupItem>
                        <ToggleGroupItem value="96" size="sm" className="text-xs">96</ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </CardContent>
        </Card>
    )

}