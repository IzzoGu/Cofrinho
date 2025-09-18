package com.cofrinho.cofrinho;
import java.util.Scanner;

public class cofrinhoDigital {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Criar usuário
        System.out.print("Digite seu nome: ");
        String nome = sc.nextLine();
        Usuario usuario = new Usuario(nome);

        // Criar meta
        System.out.print("Digite o nome da meta (ex: viagem): ");
        String descricao = sc.nextLine();
        System.out.print("Digite o valor da meta: ");
        double valorMeta = sc.nextDouble();
        MetaFinanceira meta = new MetaFinanceira(descricao, valorMeta);

        usuario.adicionarMeta(meta);

        // Depositar valor
        System.out.print("Digite o valor que deseja depositar: ");
        double deposito = sc.nextDouble();
        meta.depositar(deposito);

        // Verificar progresso
        System.out.println("Progresso na meta '" + meta.getDescricao() + "': " + meta.getValorAtual() + " / " + meta.getValorObjetivo());
        if (meta.atingiuMeta()) {
            System.out.println("Parabéns! Você atingiu a meta!");
        } else {
            System.out.println("Continue economizando!");
        }

        sc.close();
    }
}
