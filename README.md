# 🏦 Monitor de Transações RabbitMQ

Sistema completo para monitoramento de transações em tempo real usando **Java Spring Boot** + **RabbitMQ** + **Node.js** com interface web moderna.

## 📋 Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────┐    ┌─────────────────┐
│   Java Spring   │───▶│  RabbitMQ   │───▶│   Node.js App   │
│   (Producer)    │    │   (Queue)   │    │   (Consumer)    │
└─────────────────┘    └─────────────┘    └─────────────────┘
        │                                          │
        ▼                                          ▼
┌─────────────────┐                    ┌─────────────────┐
│   REST API      │                    │   Web Interface │
│  (Envio JSON)   │                    │ (Visualização)  │
└─────────────────┘                    └─────────────────┘
```

## 🐳 1. Configurando com Docker Compose (Recomendado)

### **Crie o arquivo `docker-compose.yml`:**

```yaml
services:
  rabbitmq:
    image: rabbitmq:3.13-management
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: 123
    ports:
      - 5672:5672
      - 15672:15672
```

### **Execute os serviços:**

```bash
docker-compose up -d
docker-compose ps
docker-compose logs rabbitmq
docker-compose down
```

### **Verifique se estão funcionando:**

* **RabbitMQ AMQP:** localhost:5672 (admin/123)
* **RabbitMQ Management:** [http://localhost:15672](http://localhost:15672) (admin/123)

## 🐳 Alternativa: Docker Run Individual

**RabbitMQ:**

```bash
docker run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=123 \
  rabbitmq:3.13-management
```

## ☕ 2. Aplicação Java Spring Boot

### **Configuração `application.properties`:**

```properties
# Aplicação
spring.application.name=project-queue-listener

# RabbitMQ
broker.exchange.name=banco.exchange
broker.queue.name=transacao.queue
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=admin
spring.rabbitmq.password=123
```

### **Como executar a aplicação Java:**

```bash
# Na raiz do projeto Java
mvn clean install
mvn spring-boot:run

# Ou usando o JAR
java -jar target/project-queue-listener-0.0.1-SNAPSHOT.jar
```

### **Testando o endpoint Java:**

```bash
curl -X POST http://localhost:8080/transacoes \
-H "Content-Type: application/json" \
-d '{
  "nomeCliente": "João Silva",
  "tipo": "CREDITO",
  "valor": 1500.50,
  "data": "2025-01-15"
}'
```

## 🟢 3. Aplicação Node.js (Consumer)

### **Instalação:**

```bash
mkdir rabbitmq-transaction-viewer
cd rabbitmq-transaction-viewer
npm init -y
npm install express socket.io amqplib cors
```

### **Estrutura do projeto Node.js:**

```
rabbitmq-transaction-viewer/
├── package.json
├── server.js
├── public/
│   └── index.html
└── README.md
```

### **Executando:**

```bash
node server.js
```

### **Acessando:**

* **Interface Web:** [http://localhost:3000](http://localhost:3000)
* **API Status:** [http://localhost:3000/api/status](http://localhost:3000/api/status)
* **API Transações:** [http://localhost:3000/api/transacoes](http://localhost:3000/api/transacoes)

## 🔗 4. Fluxo Completo do Sistema

### **1. Envio de Transação:**

```bash
POST http://localhost:8080/transacoes
{
  "nomeCliente": "Maria Santos",
  "tipo": "PIX",
  "valor": 250.00,
  "data": "15/03/2025"
}
```

### **2. Processamento:**

1. Spring Boot recebe o POST
2. Converte para JSON e envia para RabbitMQ
3. Node.js consome da fila
4. WebSocket envia para interface em tempo real
5. Transação aparece na tela instantaneamente

### **3. Resultado na Interface:**

```
✅ Transação processada: Maria Santos - PIX - R$ 250,00
```

## 🚀 5. Quick Start Completo

### **Passo 1: Infraestrutura com Docker Compose**

```bash
docker-compose up -d
docker-compose ps
```

### **Passo 2: Java Application**

```bash
cd sua-aplicacao-java
mvn spring-boot:run
```

### **Passo 3: Node.js Consumer**

```bash
cd rabbitmq-transaction-viewer
npm install
node server.js
```

### **Passo 4: Teste**

```bash
curl -X POST http://localhost:8080/transacoes \
-H "Content-Type: application/json" \
-d '{"nomeCliente":"Teste","tipo":"SAQUE","valor":100.00,"data":"21/09/2025"}'
```

### **Passo 5: Visualize**

Acesse [http://localhost:3000](http://localhost:3000) e veja a transação aparecer em tempo real! 🎉

## 🛠️ Troubleshooting

### **Docker Compose não inicia:**

```bash
docker-compose ps
docker-compose logs
docker-compose restart
docker-compose down
docker-compose up -d
```

### **RabbitMQ não conecta:**

```bash
docker-compose ps | grep rabbitmq
docker-compose logs rabbitmq
curl -u admin:123 http://localhost:15672/api/overview
```

### **Java não envia para fila:**

* Verifique credenciais no `application.properties`
* Confirme que RabbitMQ está na porta 5672
* Verifique logs da aplicação Spring

### **Node.js não recebe mensagens:**

* Confirme que a fila `transacao.queue` existe
* Verifique se as credenciais estão corretas
* Teste a conexão: [http://localhost:3000/api/status](http://localhost:3000/api/status)

### **Interface não atualiza:**

* Verifique console do browser para erros JavaScript
* Confirme que WebSocket conecta (deve mostrar "Conectado")
* Teste enviar transação e observe logs do Node.js

## 🔧 Configurações Importantes

### **Portas utilizadas:**

* Java Spring Boot: 8080
* Node.js Interface: 3000
* RabbitMQ AMQP: 5672
* RabbitMQ Management: 15672

### **Credenciais padrão:**

* RabbitMQ: admin / 123

### **Nomes das filas:**

* Exchange: banco.exchange
* Queue: transacao.queue