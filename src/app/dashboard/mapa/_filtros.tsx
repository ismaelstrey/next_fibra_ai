
import { FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useMapa, { FiltrosMapa } from '@/hooks/useMapa';
import React from 'react';

export default function FiltrosMaps() {
    const [active, setActive] = React.useState(false)

    const toggleActive = () => {
        setActive(!active);
    }

    const {
        filtros,
        atualizarFiltros
    } = useMapa();

    const handleAtualizarFiltro = (tipo: keyof FiltrosMapa, valor: any) => {
        atualizarFiltros({ [tipo]: valor });
    };
    if (!active) {
        return (

            <FilterIcon className={`h-4 w-4 mr-2 cursor-pointer ${active ? 'text-cyan-500' : ''} `} onClick={toggleActive} />

        )
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center">
                    <FilterIcon className={`h-4 w-4 mr-2 cursor-pointer ${active ? 'text-cyan-500 rotate-90' : ''} `} onClick={toggleActive} />
                    Filtros
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Tipo de Caixa</label>
                    <select
                        className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={filtros.tipoCaixa || ''}
                        onChange={(e) => handleAtualizarFiltro('tipoCaixa', e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="CTO">CTO</option>
                        <option value="CEO">CEO</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Tipo de Cabo</label>
                    <select
                        className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={filtros.tipoCabo || ''}
                        onChange={(e) => handleAtualizarFiltro('tipoCabo', e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="6">6 vias</option>
                        <option value="12">12 vias</option>
                        <option value="24">24 vias</option>
                        <option value="48">48 vias</option>
                        <option value="96">96 vias</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Cidade</label>
                    <select
                        className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={filtros.cidade || ''}
                        onChange={(e) => handleAtualizarFiltro('cidade', e.target.value)}
                    >
                        <option value="">Todas</option>
                        <option value="cidade1">Cidade 1</option>
                        <option value="cidade2">Cidade 2</option>
                    </select>
                </div>
                <Button className="w-full mt-2" variant="outline" size="sm">
                    Aplicar Filtros
                </Button>
            </CardContent>
        </Card>
    )

}