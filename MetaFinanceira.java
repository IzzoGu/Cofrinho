package com.cofrinho.cofrinho;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "metas_financeiras")
public class MetaFinanceira {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String descricao;
    private double valorObjetivo;
    private double valorAtual;
    private boolean concluida;
    
    @ManyToOne
    private Usuario usuario;

    public MetaFinanceira() {
        this.concluida = false;
    }

    public MetaFinanceira(String descricao, double valorObjetivo) {
        this.descricao = descricao;
        this.valorObjetivo = valorObjetivo;
        this.valorAtual = 0.0;
        this.concluida = false;
    }

    public boolean atingiuMeta() {
        return valorAtual >= valorObjetivo;
    }

    public void depositar(double valor) {
        if (concluida) {
            throw new IllegalStateException("Esta meta já foi concluída e não aceita mais depósitos.");
        }
        
        double novoValor = this.valorAtual + valor;
        if (novoValor > valorObjetivo) {
            throw new IllegalArgumentException("O depósito excede o valor objetivo da meta.");
        }
        
        this.valorAtual = novoValor;
        if (this.valorAtual >= this.valorObjetivo) {
            this.concluida = true;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public double getValorObjetivo() {
        return valorObjetivo;
    }

    public void setValorObjetivo(double valorObjetivo) {
        this.valorObjetivo = valorObjetivo;
    }

    public double getValorAtual() {
        return valorAtual;
    }

    public void setValorAtual(double valorAtual) {
        this.valorAtual = valorAtual;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public boolean isConcluida() {
        return concluida;
    }

    public void setConcluida(boolean concluida) {
        this.concluida = concluida;
    }
} 