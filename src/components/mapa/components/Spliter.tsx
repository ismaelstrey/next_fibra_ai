import { Badge } from "@/components/ui/badge";
import { Trash } from "lucide-react";


interface SpliterProps {
    tipo: string;
    index: number;
    id: string;
    removerSplitter(id: string): void;
}

export default function Spliter({
    removerSplitter,
    tipo,
    index,
    id,

}: SpliterProps) {








    return (
        <div className={`p-3 text-accent rounded-md border border-blue-300 ${tipo === '1/8' ? 'bg-red-500' : tipo === '1/16' ? 'bg-green-500' : 'bg-blue-500'}`}>
            <div className="flex items-center justify-between">
                <span>Splitter {tipo}</span>
                <Badge variant="secondary">Posição {index + 1}</Badge>
                <span title={`Deletar Spliter ${tipo} posição ${index + 1}`}> <Trash className='cursor-pointer hover:scale-110' onClick={() => removerSplitter(id)} /></span>


            </div>
        </div>
    );
}