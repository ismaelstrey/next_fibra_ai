import { menuItems } from "@/app/dashboard/layout";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { LogOutIcon } from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const { fazerLogout } = useAuth();
    const handleLogout = async () => {
        try {
            await fazerLogout();
            toast.success('Logout realizado com sucesso!');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            toast.error('Ocorreu um erro ao fazer logout');
        }
    };
    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
            <div className="flex flex-col flex-grow border-r border-border bg-card px-4 py-5">
                <div className="flex items-center justify-center h-14 mb-8">
                    <h1 className="text-2xl font-bold text-primary">FibraDoc</h1>
                </div>
                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    }`}
                            >
                                <span className="mr-3">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="mt-auto">
                    <div className="border-t border-border pt-4">
                        <div className="flex items-center px-4 py-2">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground" suppressHydrationWarning>
                                    {session?.user?.name?.charAt(0) || 'U'}
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium" suppressHydrationWarning>{session?.user?.name || 'Usuário'}</p>
                                <p className="text-xs text-muted-foreground" suppressHydrationWarning>{session?.user?.email}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full mt-2 justify-start"
                            onClick={handleLogout}
                        >
                            <LogOutIcon className="h-5 w-5 mr-2" />
                            Sair
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}