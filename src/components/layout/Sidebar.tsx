import { menuItems } from "@/constants/menuItems";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { LogOutIcon, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { AdicionarCidadeModal } from "../cidade/AdicionarCidadeModal";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { fazerLogout } = useAuth();
    const [modalCidadeAberto, setModalCidadeAberto] = useState(false);
    const { sidebarVisible, toggleSidebar } = useTheme();
    const handleLogout = async () => {
        try {
            await fazerLogout();
            toast.success('Logout realizado com sucesso!');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            toast.error('Ocorreu um erro ao fazer logout');
        }
    };
    const abrirModalAdicionarCidade = () => {
        setModalCidadeAberto(true);
    };
    return (
        <>
            <motion.div
                className="hidden md:flex md:flex-col md:fixed md:inset-y-0"
                initial={{ width: sidebarVisible ? 256 : 65 }}
                animate={{ width: sidebarVisible ? 256 : 65 }}
                transition={{ duration: 0.2 }}>
                <div className="flex flex-col flex-grow border-r border-border bg-card px-4 py-5 relative">
                    <div className="flex items-center justify-between h-14 mb-8">
                        <h1 className={`text-2xl font-bold text-primary ${!sidebarVisible && 'hidden'}`}>FibraDoc</h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="rounded-full text-primary"
                            aria-label={sidebarVisible ? "Ocultar menu" : "Mostrar menu"}
                        >
                            {sidebarVisible ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </Button>
                    </div>
                    <nav className={`flex flex-col space-y-1 overflow-hidden ${sidebarVisible ? 'items-start justify-start' : "items-center justify-center"}`}>
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-accent-foreground bg-transparent hover:bg-transparent'
                                        }`}
                                    title={item.label}
                                >
                                    <span className={sidebarVisible ? "mr-3" : "mx-auto"}>{item.icon}</span>
                                    {sidebarVisible && item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="mt-auto">
                        <div className="border-t border-border pt-4">
                            <div className={`flex items-center ${sidebarVisible ? 'px-4' : 'justify-center'} py-4`}>
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground" suppressHydrationWarning>
                                        {session?.user?.name?.charAt(0) || 'U'}
                                    </div>
                                </div>
                                {sidebarVisible && <div className="ml-3">
                                    <p className="text-sm font-medium text-primary/90" suppressHydrationWarning>{session?.user?.name || 'Usuário'}</p>
                                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>{session?.user?.email}</p>
                                </div>}
                            </div>
                        
                        </div>
                        <div className="flex w-full justify-center flex-col">
                          <Button
                                variant="outline"
                                className={`flex text-primary/50  cursor-pointer  ${sidebarVisible ? 'justify-start' : 'justify-center p-0 border-0 bg-transparent hover:bg-transparent hover:text-primary'}`}
                                onClick={abrirModalAdicionarCidade}
                                title="Adicionar Cidade"
                            >
                                <PlusCircle className={`h-5 w-5 ${sidebarVisible ? 'mr-2' : ''}`} />
                                {sidebarVisible && 'Adicionar Cidade'}
                            </Button>
                            <Button

                                variant="ghost"
                                className={` text-rose-500 cursor-pointer ${sidebarVisible ? 'justify-start w-full mt-2' : 'justify-center p-0 border-0 bg-transparent hover:bg-transparent hover:text-primary'}`}
                                onClick={handleLogout}
                                title="Sair"
                            >
                                <LogOutIcon className={`h-5 w-5 ${sidebarVisible ? 'mr-2' : ''}`} />
                                {sidebarVisible && 'Sair'}
                            </Button>
                          </div>
                    </div>
                    <AdicionarCidadeModal
                        aberto={modalCidadeAberto}
                        aoMudarEstado={setModalCidadeAberto}
                        aoAdicionar={() => {
                            // Recarregar dados ou atualizar lista de cidades se necessário
                        }}
                    />
                </div>
            </motion.div>





        </>
    )
}
