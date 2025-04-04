import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const boiler = {
  async criarAlgo(dados) {
    try {
      const novoBoiler = await prisma.boiler.create({
        data: {
          dadoUm: dados.talDado,
          dadoDois: dados.oDadoQueVoceEnviouLaDoFront
        },
      });
      return novoBoiler;
    } catch (error) {
      console.error("Erro ao criar o boiler:", error);
      throw error;
    }
  }
};

