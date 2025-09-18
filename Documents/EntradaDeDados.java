public class EntradaDeDados{
	public static void main(String[] args) throws java.IOException {
		
		char ch;
		
		System.out.print("Pressione qualquer tecla: ");
		ch = (char)System.in.read();
		
		System.out.println("A tecla pessionada foi: ");
				
	}
}

--scanner--

public class EntradaDeDados{
	public static void main(String[] args){
		
		Scanner input = new Scanner(System.in)
		
		System.out.print("Pressione qualquer tecla: ");
		ch = (char)input.nextLine();
		
		System.out.println("A tecla pessionada foi: ");				
	}
}
USE AULA3

CREATE TABLE ESTADO(
	EST_INT_ID INT NOT NULL IDENTITY(1,1),
	EST_STR_DESCRICAO VARCHAR(50) NOT NULL,
	EST_STR_SIGLA CHAR(2) NOT NULL,
	CONSTANT PK_ESTADO_ID PRIMARY KEY (EST_INT_ID),
	CONSTANT UK_ESTADO_SIGLA UNIQUE (EST_STR_SIGLA)
);

CREATE TABLE ESTADO(
	EST_INT_ID INT NOT NULL IDENTITY(1,1),
	EST_STR_DESCRICAO VARCHAR(50) NOT NULL,
	EST_STR_SIGLA CHAR(2) NOT NULL,
	CONSTRAINT PK_ESTADO_ID PRIMARY KEY (EST_INT_ID),
	CONSTRAINT UK_ESTADO_SIGLA UNIQUE (EST_STR_SIGLA)
);

ALTER TABLE CIDADE 
	ADD CONSTRAINT FK_CIDADE_ESTADO_ID FOREIGN KEY(EST_INT_ID)
		REFERENCES ESTADO (EST_INT_ID);


USE AULA3

	INSERT INTO ESTADO (EST_STR_DESCRIÇÃO, EST_STR_SIGLA) VALUES ('São paulo', 'SP');
	INSERT INTO ESTADO (EST_STR_DESCRIÇÃO, EST_STR_SIGLA) VALUES ('Minas Gerais', 'MG');
	INSERT INTO ESTADO (EST_STR_DESCRIÇÃO, EST_STR_SIGLA) VALUES ('Rio de Janeiro', 'RJ');
	INSERT INTO ESTADO (EST_STR_DESCRIÇÃO, EST_STR_SIGLA) VALUES ('Acre','AC');
	

