# Como executar na rede local

Para executar a aplicação em ambiente de desenvolvimento e torná-la acessível na rede local, siga os passos abaixo:

## 1. Configuração do ambiente

### 1.1. Arquivo .env.production

Edite o arquivo `.env.production` e ajuste o endereço IP do backend:

```
VITE_API_URL=http://SEU_IP_AQUI:8080
```

Substitua `SEU_IP_AQUI` pelo IP da máquina onde o backend está rodando.

## 2. Executando em desenvolvimento

```bash
npm run dev
```

Isso iniciará o servidor Vite em modo de desenvolvimento, acessível em:
- `http://localhost:5173` (local)
- `http://SEU_IP:5173` (rede)

## 3. Criando uma versão de produção

Para construir uma versão de produção:

```bash
npm run build
```

Isto criará um diretório `dist` com os arquivos otimizados para produção.

## 4. Testando a versão de produção localmente

Para testar a versão de produção localmente:

```bash
npm run preview
```

Isso também estará disponível na rede local.

## 5. Implantando em produção

Para implantar em um servidor web:

1. Copie os arquivos gerados na pasta `dist` para o servidor web
2. Configure o servidor web (Apache, Nginx, etc.) para servir os arquivos estáticos

### Nota importante sobre rotas do React Router

Se você estiver usando React Router com modo histórico (o padrão), você precisará configurar o servidor web para redirecionar todas as solicitações para `index.html` para permitir que o React Router gerencie as rotas do lado do cliente.

#### Exemplo de configuração para Nginx:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    root /caminho/para/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
