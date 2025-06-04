// src/router/repo/repoPagamentos.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const pagamento = {
  async listarPagamentos() {
    try {
      const pagamentos = await prisma.pagamento.findMany({
        select: {
          pagamentoid: true, //
          valor: true, //
          status: true, //
          data: true, //
          usuarioid: true, //
          formaPagamento: true, //
          transacao: true //
        }
      });
      return pagamentos; //
    } catch (error) {
      console.error("Erro ao listar pagamentos:", error); //
      throw new Error("Erro ao listar pagamentos"); //
    }
  },

  async criarPagamento(dados) {
    try {
      const novoPagamento = await prisma.pagamento.create({
        data: {
          valor: dados.valor, //
          status: dados.status, //
          data: dados.data, //
          usuarioid: dados.usuarioid, //
          transacao: dados.transacao, //
          ordem: { connect: { ordemid: dados.ordemId } }, // CORREÇÃO: Conectar à ordem usando o ID da ordem
          formaPagamento: dados.formaPagamento, //
          cartao: dados.cartao, //
          parcelas: dados.parcelas //
        }
      });
      return novoPagamento; //
    } catch (error) {
      console.error("Erro ao criar pagamento:", error); //
      throw new Error("Erro ao criar pagamento"); //
    }
  },

  async atualizarPagamento(id, dados) {
    try {
      const pagamentoAtualizado = await prisma.pagamento.update({
        where: { pagamentoid: id }, //
        data: dados //
      });
      return pagamentoAtualizado; //
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error); //
      throw new Error("Erro ao atualizar pagamento"); //
    }
  },

  async deletarPagamento(id) {
    try {
      await prisma.pagamento.delete({
        where: { pagamentoid: id } //
      });
      return { message: "Pagamento deletado com sucesso" }; //
    } catch (error) {
      console.error("Erro ao deletar pagamento:", error); //
      throw new Error("Erro ao deletar pagamento"); //
    }
  }
};