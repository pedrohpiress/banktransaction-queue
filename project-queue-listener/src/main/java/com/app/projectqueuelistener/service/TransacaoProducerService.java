package com.app.projectqueuelistener.service;

import com.app.projectqueuelistener.config.RabbitMQConfig;
import com.app.projectqueuelistener.domain.Transacao;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class TransacaoProducerService {

    private final RabbitTemplate rabbitTemplate;
    private final RabbitMQConfig rabbitMQConfig;
    private final ObjectMapper objectMapper;

    public TransacaoProducerService(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper, RabbitMQConfig rabbitMQConfig) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
        this.rabbitMQConfig = rabbitMQConfig;
    }

    public void enviarTransacao(Transacao transacao) {
        try {
            String json = objectMapper.writeValueAsString(transacao);
            rabbitTemplate.convertAndSend(rabbitMQConfig.getExchangeName(), "", json);
            System.out.println("Transação enviada -> " + json);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Erro ao converter transação em JSON", e);
        }
    }

}
