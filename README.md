# Cofrinho
A3 programação 2025/2
# Cofrinho - Gerenciador de Metas Financeiras

Cofrinho é uma aplicação Java que permite aos usuários gerenciar suas metas financeiras de forma simples e intuitiva. A aplicação oferece duas interfaces: uma interface web moderna e uma interface de console.

## Funcionalidades

- Criação e gerenciamento de metas financeiras
- Acompanhamento do progresso das metas
- Depósitos em metas existentes
- Interface web responsiva e moderna
- Interface de console para uso via terminal
- Sistema de usuários com identificação por nome
- Persistência de dados com banco H2

## Tecnologias Utilizadas

- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- H2 Database
- Thymeleaf
- Bootstrap 5
- Maven

## Pré-requisitos

- Java 17 ou superior
- Maven
- Navegador web moderno (para interface web)

## Instalação

1. Clone o repositório:
```bash
git clone 
```

2. Navegue até o diretório do projeto:
```bash
cd cofrinho
```

3. Compile o projeto:
```bash
mvn clean install
```

## Executando a Aplicação

### Interface Web

1. Execute a aplicação:
```bash
mvn spring-boot:run
```

2. Acesse a aplicação no navegador:
```
http://localhost:9090/cofrinho
```

### Interface de Console

1. Execute a aplicação:
```bash
mvn spring-boot:run
```

## Uso

### Interface Web

1. Acesse a página inicial
2. Digite seu nome para login
3. No dashboard, você pode:
   - Criar novas metas financeiras
   - Visualizar o progresso das metas existentes
   - Fazer depósitos em metas
   - Acompanhar o status de conclusão das metas

### Interface de Console

1. Digite seu nome quando solicitado
2. Escolha entre as opções disponíveis:
   - Criar nova meta
   - Fazer depósito em meta existente
   - Sair

## Interface Web

A interface web oferece uma experiência moderna e intuitiva com:

- Design responsivo usando Bootstrap 5
- Tema personalizado com cores do Bradesco
- Animações de confete ao atingir metas
- Barras de progresso visuais
- Modais para criação de metas e depósitos
- Navegação intuitiva

## Segurança

- CSRF desabilitado para desenvolvimento
- Autenticação baseada em sessão
- Proteção contra acesso não autorizado

## Banco de Dados

- Banco de dados H2 em modo arquivo
- Console H2 disponível em `/h2-console`
- Migrações automáticas com Flyway
- Configuração de teste com banco em memória

## Testes

Para executar os testes:

```bash
mvn test
```

## Configuração

As configurações principais podem ser encontradas em:
- `application.properties` - Configurações gerais
- `application-test.properties` - Configurações de teste

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Recursos Adicionais

- Suporte a múltiplos usuários com mesmo nome
- Validação de entrada de dados
- Feedback visual imediato
- Persistência automática de dados
- Interface adaptativa para diferentes dispositivos 
