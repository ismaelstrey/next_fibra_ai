import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@radix-ui/react-dialog";
import { motion } from "framer-motion";

interface OnboardingProps {
  open: boolean;
  onClose: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent asChild>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-xl max-w-md mx-auto"
        >
          <DialogTitle className="text-xl font-bold mb-2">Bem-vindo ao Fibra AI!</DialogTitle>
          <DialogDescription className="mb-4 text-zinc-600 dark:text-zinc-300">
            Este é um tutorial interativo para apresentar as principais funcionalidades do sistema. Use os filtros, camadas e busca global para explorar a infraestrutura de fibra óptica. Novos recursos de onboarding serão adicionados nas próximas versões.
          </DialogDescription>
          <DialogClose asChild>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Começar</button>
          </DialogClose>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};