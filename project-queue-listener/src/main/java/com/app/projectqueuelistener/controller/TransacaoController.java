package com.app.projectqueuelistener.controller;

import com.app.projectqueuelistener.domain.Transacao;
import com.app.projectqueuelistener.service.TransacaoProducerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/transacoes")
public class TransacaoController {

    private final TransacaoProducerService producerService;

    public TransacaoController(TransacaoProducerService producerService) {
        this.producerService = producerService;
    }

    @PostMapping
    public ResponseEntity<Transacao> enviarTransacao(@RequestBody Transacao transacao) {
        producerService.enviarTransacao(transacao);
        return new ResponseEntity<>(transacao, HttpStatus.CREATED);
    }
}
