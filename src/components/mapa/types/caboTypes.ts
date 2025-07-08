import { TuboAPI } from "@/hooks/useTubo"

export type Coordenada = {
  lat: number
  lng: number
}

export type Rota = {
  id: string
  nome: string
  tipoCabo: string
  fabricante: string | null
  status: string
  distancia: number
  profundidade: number | null
  tipoPassagem: string
  coordenadas: Coordenada[]
  cor: string | null
  observacoes: string
  criadoEm: string
  atualizadoEm: string
  cidadeId: string | null
}

export type Capilar = {
  id: string
  numero: number
  tipo: string
  comprimento: number
  status: string
  potencia: number
  cidadeId: string | null
  spliterId: string | null
  tuboId: string
}

export type Tubo = {
  id: string
  numero: number
  quantidadeCapilares: number
  tipo: string
  rotaId: string
  capilares: Capilar[]
  rota: Rota
}

export type Cabo = {
  id: string
  nome: string
  tipoCabo: string
  fabricante: string | null
}

export type CaboAs = {
  cabo?: Cabo
  tubo: TuboAPI[]
}

export type ItemCabo = {
  caboAs?: CaboAs
}