package com.cofrinho.cofrinho;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CofrinhoService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private MetaFinanceiraRepository metaFinanceiraRepository;

    public List<Usuario> buscarUsuariosPorNome(String nome) {
        return usuarioRepository.findAllByNome(nome);
    }

    @Transactional
    public Usuario criarNovoUsuario(String nome) {
        Usuario novoUsuario = new Usuario(nome);
        return usuarioRepository.save(novoUsuario);
    }

    @Transactional
    public MetaFinanceira criarMeta(Long usuarioId, String descricao, double valorObjetivo) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        MetaFinanceira meta = new MetaFinanceira(descricao, valorObjetivo);
        usuario.adicionarMeta(meta);
        
        return metaFinanceiraRepository.save(meta);
    }

    @Transactional
    public void depositar(Long metaId, double valor) {
        MetaFinanceira meta = metaFinanceiraRepository.findById(metaId)
            .orElseThrow(() -> new RuntimeException("Meta não encontrada"));
        
        try {
            meta.depositar(valor);
            metaFinanceiraRepository.save(meta);
        } catch (IllegalStateException | IllegalArgumentException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    public MetaFinanceira buscarMeta(Long metaId) {
        return metaFinanceiraRepository.findById(metaId)
            .orElseThrow(() -> new RuntimeException("Meta não encontrada"));
    }

    public Usuario buscarUsuario(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public List<MetaFinanceira> listarMetasDoUsuario(Long usuarioId) {
        Usuario usuario = buscarUsuario(usuarioId);
        return usuario.getMetas();
    }
} 