package com.cofrinho.cofrinho;

import java.util.List;
import java.util.Scanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import com.cofrinho.cofrinho.Usuario;

@SpringBootApplication
public class CofrinhoApplication {

	public static void main(String[] args) {
		ApplicationContext context = SpringApplication.run(CofrinhoApplication.class, args);
		CofrinhoService service = context.getBean(CofrinhoService.class);
		Scanner sc = new Scanner(System.in);

		try {
			// Criar ou recuperar usuário
			System.out.print("Digite seu nome: ");
			String nome = sc.nextLine();
			System.out.println("Nome digitado: " + nome);
			
			List<Usuario> usuarios = service.buscarUsuariosPorNome(nome);
			Usuario usuario;
			
			if (usuarios.isEmpty()) {
				System.out.println("Usuário não encontrado. Criando novo usuário...");
				usuario = service.criarNovoUsuario(nome);
			} else if (usuarios.size() == 1) {
				usuario = usuarios.get(0);
				System.out.println("Usuário encontrado!");
			} else {
				System.out.println("Encontrados múltiplos usuários com esse nome. Por favor, selecione um:");
				for (int i = 0; i < usuarios.size(); i++) {
					Usuario u = usuarios.get(i);
					System.out.println((i + 1) + ". " + u.getNome() + " (ID: " + u.getId() + ")");
				}
				int escolha = lerInteiro(sc, "Digite o número do usuário: ", 1, usuarios.size());
				usuario = usuarios.get(escolha - 1);
			}
			
			System.out.println("Bem-vindo, " + usuario.getNome() + "!");
			
			boolean continuar = true;
			while (continuar) {
				// Mostrar metas existentes
				List<MetaFinanceira> metas = service.listarMetasDoUsuario(usuario.getId());
				if (!metas.isEmpty()) {
					System.out.println("\nSuas metas atuais:");
					for (int i = 0; i < metas.size(); i++) {
						MetaFinanceira m = metas.get(i);
						String status = m.isConcluida() ? "[CONCLUÍDA] " : "";
						System.out.println((i + 1) + ". " + status + m.getDescricao() + 
										" - Progresso: " + m.getValorAtual() + 
										"/" + m.getValorObjetivo());
					}
				}
				
				// Menu de opções
				System.out.println("\nO que você deseja fazer?");
				System.out.println("1. Criar nova meta");
				System.out.println("2. Fazer um depósito em uma meta existente");
				System.out.println("3. Sair");
				
				int opcao = lerInteiro(sc, "Digite sua opção: ", 1, 3);
				
				if (opcao == 1) {
					criarNovaMeta(service, usuario, sc);
				} else if (opcao == 2) {
					if (metas.isEmpty()) {
						System.out.println("Você ainda não tem metas cadastradas!");
						System.out.print("Deseja criar uma nova meta? (S/N): ");
						String resposta = sc.nextLine().toUpperCase();
						if (resposta.equals("S")) {
							criarNovaMeta(service, usuario, sc);
						}
					} else {
						// Depositar em meta existente
						int escolhaMeta = lerInteiro(sc, "Escolha a meta para depósito (1-" + metas.size() + "): ", 1, metas.size());
						MetaFinanceira metaEscolhida = metas.get(escolhaMeta - 1);
						
						if (metaEscolhida.isConcluida()) {
							System.out.println("Esta meta já foi concluída e não aceita mais depósitos.");
							continue;
						}
						
						double deposito = lerDouble(sc, "Digite o valor que deseja depositar: ");
						try {
							service.depositar(metaEscolhida.getId(), deposito);
							
							metaEscolhida = service.buscarMeta(metaEscolhida.getId());
							System.out.println("Depósito realizado com sucesso!");
							System.out.println("Progresso atual: " + metaEscolhida.getValorAtual() + 
											"/"+ metaEscolhida.getValorObjetivo());
							
							if (metaEscolhida.atingiuMeta()) {
								System.out.println("\nParabéns! Você atingiu a meta!");
								System.out.print("Deseja criar uma nova meta? (S/N): ");
								String resposta = sc.nextLine().toUpperCase();
								if (resposta.equals("S")) {
									criarNovaMeta(service, usuario, sc);
								}
							} else {
								System.out.println("Continue economizando!");
							}
						} catch (RuntimeException e) {
							System.out.println("Erro: " + e.getMessage());
						}
					}
				} else if (opcao == 3) {
					continuar = false;
				}
			}
			
			System.out.println("\nObrigado por usar o Cofrinho! Até a próxima!");
			
		} catch (Exception e) {
			System.err.println("Erro ao processar operação: " + e.getMessage());
			e.printStackTrace();
		} finally {
			sc.close();
		}
	}

	private static void criarNovaMeta(CofrinhoService service, Usuario usuario, Scanner sc) {
		System.out.print("Digite o nome da meta (ex: viagem): ");
		String descricao = sc.nextLine();
		
		double valorMeta = lerDouble(sc, "Digite o valor da meta: ");
		MetaFinanceira meta = service.criarMeta(usuario.getId(), descricao, valorMeta);
		System.out.println("Meta criada com sucesso! ID: " + meta.getId());
		
		// Perguntar se quer fazer um depósito inicial
		System.out.print("Deseja fazer um depósito inicial? (S/N): ");
		String resposta = sc.nextLine().toUpperCase();
		if (resposta.equals("S")) {
			double deposito = lerDouble(sc, "Digite o valor do depósito: ");
			service.depositar(meta.getId(), deposito);
			meta = service.buscarMeta(meta.getId());
			System.out.println("Depósito realizado! Novo saldo: " + meta.getValorAtual());
			
			if (meta.atingiuMeta()) {
				System.out.println("\nParabéns! Você atingiu a meta!");
				System.out.print("Deseja criar uma nova meta? (S/N): ");
				resposta = sc.nextLine().toUpperCase();
				if (resposta.equals("S")) {
					criarNovaMeta(service, usuario, sc);
				}
			}
		}
	}

	private static int lerInteiro(Scanner sc, String mensagem, int min, int max) {
		while (true) {
			try {
				System.out.print(mensagem);
				String entrada = sc.nextLine();
				int valor = Integer.parseInt(entrada);
				if (valor >= min && valor <= max) {
					return valor;
				} else {
					System.out.println("Por favor, digite um número entre " + min + " e " + max);
				}
			} catch (NumberFormatException e) {
				System.out.println("Por favor, digite um número válido.");
			}
		}
	}

	private static double lerDouble(Scanner sc, String mensagem) {
		while (true) {
			try {
				System.out.print(mensagem);
				String entrada = sc.nextLine();
				double valor = Double.parseDouble(entrada);
				if (valor > 0) {
					return valor;
				} else {
					System.out.println("Por favor, digite um valor maior que zero.");
				}
			} catch (NumberFormatException e) {
				System.out.println("Por favor, digite um valor válido.");
			}
		}
	}
}


