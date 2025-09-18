package com.cofrinho.cofrinho;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class CofrinhoDigitalTest {

    @Autowired
    private CofrinhoService cofrinhoService;

    @Test
    public void testCriarUsuario() {
        // Criar um novo usuário
        Usuario usuario = cofrinhoService.criarNovoUsuario("Teste");
        
        // Verificar se o usuário foi criado corretamente
        assertNotNull(usuario);
        assertEquals("Teste", usuario.getNome());
        assertNotNull(usuario.getId());
    }

    @Test
    public void testCriarMeta() {
        // Criar um usuário para o teste
        Usuario usuario = cofrinhoService.criarNovoUsuario("Teste Meta");
        
        // Criar uma meta para o usuário
        MetaFinanceira meta = cofrinhoService.criarMeta(usuario.getId(), "Viagem", 1000.0);
        
        // Verificar se a meta foi criada corretamente
        assertNotNull(meta);
        assertEquals("Viagem", meta.getDescricao());
        assertEquals(1000.0, meta.getValorObjetivo());
        assertEquals(0.0, meta.getValorAtual());
        assertFalse(meta.atingiuMeta());
    }

    @Test
    public void testDepositar() {
        // Criar um usuário e uma meta
        Usuario usuario = cofrinhoService.criarNovoUsuario("Teste Deposito");
        MetaFinanceira meta = cofrinhoService.criarMeta(usuario.getId(), "Carro", 5000.0);
        
        // Fazer um depósito
        cofrinhoService.depositar(meta.getId(), 1000.0);
        
        // Buscar a meta atualizada
        MetaFinanceira metaAtualizada = cofrinhoService.buscarMeta(meta.getId());
        
        // Verificar se o depósito foi registrado corretamente
        assertEquals(1000.0, metaAtualizada.getValorAtual());
        assertFalse(metaAtualizada.atingiuMeta());
        
        // Fazer outro depósito para atingir a meta
        cofrinhoService.depositar(meta.getId(), 4000.0);
        metaAtualizada = cofrinhoService.buscarMeta(meta.getId());
        
        // Verificar se a meta foi atingida
        assertEquals(5000.0, metaAtualizada.getValorAtual());
        assertTrue(metaAtualizada.atingiuMeta());
    }
} 