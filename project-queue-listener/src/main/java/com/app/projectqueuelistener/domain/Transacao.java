package com.app.projectqueuelistener.domain;

public class Transacao {
    private String nomeCliente;
    private String tipo;
    private Double valor;
    private String data;

    public String getNomeCliente() { return nomeCliente; }
    public void setNomeCliente(String nomeCliente) { this.nomeCliente = nomeCliente; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public Double getValor() { return valor; }
    public void setValor(Double valor) { this.valor = valor; }

    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
}

