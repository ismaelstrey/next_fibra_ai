'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileTextIcon, DownloadIcon, FilterIcon, BarChart3Icon, PieChartIcon, LineChartIcon } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Registrar componentes do Chart.js
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement,
  Title
);

/**
 * Página de relatórios
 * Exibe gráficos e estatísticas sobre a infraestrutura de fibra óptica
 */
export default function RelatoriosPage() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes');
  
  // Dados para o gráfico de distribuição de caixas por tipo
  const dadosCaixasPorTipo = {
    labels: ['CTO', 'CEO'],
    datasets: [
      {
        label: 'Quantidade',
        data: [65, 35],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Dados para o gráfico de distribuição de cabos por tipo
  const dadosCabosPorTipo = {
    labels: ['6 vias', '12 vias', '24 vias', '48 vias', '96 vias'],
    datasets: [
      {
        label: 'Quantidade (km)',
        data: [5, 12, 19, 8, 3],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Dados para o gráfico de manutenções por mês
  const dadosManutencoesPorMes = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Preventivas',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Corretivas',
        data: [2, 3, 8, 5, 6, 4],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Dados para o gráfico de crescimento da rede
  const dadosCrescimentoRede = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Extensão da Rede (km)',
        data: [42, 49, 52, 58, 65, 72],
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  // Opções para os gráficos
  const opcoesGraficos = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  // Estatísticas gerais
  const estatisticas = [
    { titulo: 'Total de Caixas', valor: '120', icone: <BoxIcon className="h-5 w-5 text-blue-500" /> },
    { titulo: 'Extensão da Rede', valor: '72 km', icone: <RulerIcon className="h-5 w-5 text-green-500" /> },
    { titulo: 'Manutenções no Mês', valor: '7', icone: <ToolIcon className="h-5 w-5 text-orange-500" /> },
    { titulo: 'Cidades Atendidas', valor: '2', icone: <MapPinIcon className="h-5 w-5 text-purple-500" /> },
  ];

  // Animações
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="container mx-auto p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <FileTextIcon className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Relatórios e Estatísticas</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <select 
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={periodoSelecionado}
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
          >
            <option value="semana">Última Semana</option>
            <option value="mes">Último Mês</option>
            <option value="trimestre">Último Trimestre</option>
            <option value="semestre">Último Semestre</option>
            <option value="ano">Último Ano</option>
          </select>
          <Button className="flex items-center gap-1">
            <DownloadIcon className="h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
      </header>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
              <BoxIcon className="h-5 w-5 text-blue-500 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Caixas</p>
              <h3 className="text-2xl font-bold">120</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900 mr-4">
              <RulerIcon className="h-5 w-5 text-green-500 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Extensão da Rede</p>
              <h3 className="text-2xl font-bold">72 km</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900 mr-4">
              <ToolIcon className="h-5 w-5 text-orange-500 dark:text-orange-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Manutenções no Mês</p>
              <h3 className="text-2xl font-bold">7</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
              <MapPinIcon className="h-5 w-5 text-purple-500 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cidades Atendidas</p>
              <h3 className="text-2xl font-bold">2</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2" />
              Distribuição de Caixas por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Pie data={dadosCaixasPorTipo} options={opcoesGraficos} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3Icon className="h-5 w-5 mr-2" />
              Distribuição de Cabos por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Bar data={dadosCabosPorTipo} options={opcoesGraficos} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3Icon className="h-5 w-5 mr-2" />
              Manutenções por Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Bar data={dadosManutencoesPorMes} options={opcoesGraficos} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <LineChartIcon className="h-5 w-5 mr-2" />
              Crescimento da Rede
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Line data={dadosCrescimentoRede} options={opcoesGraficos} />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// Componentes de ícones adicionais
function BoxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function RulerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8H3" />
      <path d="M7 4v4" />
      <path d="M17 4v4" />
      <path d="M12 4v4" />
      <path d="M3 8v12h18V8" />
    </svg>
  );
}

function ToolIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}