6.0.15
  - [FEAT] Adding yaml config files
6.0.14
  - [BUGFIX] Ajustando bug que fazia o log do tempo de resposta ficar sem a URL
6.0.13
  - [BUGFIX] Ajustando a ordem de chamada do cors
6.0.12
  - [BUGFIX] Updating npm libs
6.0.11
  - [FEAT] Adding config do middlewares
6.0.10
  - [BUGFIX] Fix res.send warning and fix xml2js security error
6.0.9
  - [CHORE] Updating soap lib
6.0.8
  - [FEAT] Adding the possibility to send the request_id as a parameter 
6.0.7
  - [FEAT] Dont log response time for urls in ignore list
6.0.6
  - [FEAT] Adding headerCallback to response log
6.0.5
  - [FEAT] Adding automatic timer for response logs and bodyCallback to response log
6.0.4
  - [FEAT] loging cache hits when this.config.cache.logHits is enabled
6.0.3
  - [CHORE] updating jwt lib
6.0.2
  - [CHORE] Fix jwt bug
6.0.1
  - [CHORE] Exporting baseserver
6.0.0
  - [BUGFIX] Fix server names
5.0.6-beta
  - [BUGFIX] Adding _scope property to use scope on server.use middleware
5.0.5-beta
    [NODE 18]
4.0.6
 - [BUGFIX] Bugfix on new way to add snfUsers
4.0.5
 - [FEAT] Improvements on new way to add snfUsers
4.0.4
 - [FEAT] New way to add snfUsers
4.0.3
 - [FEAT] Adding requestPath on requestlog
4.0.2
 - [FEAT] Adding username on requestlog
4.0.1
 - [FEAT] Adding username on requestlog
4.0.0
 - [FEAT] Atualizando a versao do restify e do cors
3.0.7
 - [FEAT] Repassando as configuacoes da configuracao para o SQL Server
3.0.5
 - [BUGFIX] SNF_CRYPTO_KEY
3.0.4
 - [BUGFIX] SNF_CRYPTO_KEY
3.0.3
 - [FEAT] adding suport to encryption at basic authorization database
3.0.2
 - [FEAT] adding crypt and decrypt methods
3.0.1
 - [FEAT] Adding basic authorization on database feature
3.0.0
 - [FEAT] removing mongoose dependence
2.1.10
 - [FEAT] rollback  mongoose dependence
2.1.9
 - [FEAT] removing mongoose dependence
2.1.8
 - [FEAT] Adicionado importação de rotas declaradas em arquivos ts 
2.1.7
 - [FEAT] Essa implementação tem como propósito evitar de ter que efetuar o build na aplicação antes da execução de qualquer teste. Atualmente o build é necessário quando a aplicação está configurada com Typescript, e possui o arquivo '.snf'.
2.1.6
 - [BUGFIX] Corrigindo problema com o pretty format
2.1.5
 - [BUGFIX] Corrigindo security issues npm
2.1.4
 - [BUGFIX] Travando a versao do restify enquando nao resolvem o problema da nova versao deles
2.1.3
 - [FEATURE] Incluindo a opcao de ignorar todas as rotas no request response logger botando *
2.1.2
 - [BUGFIX] Removendo pacotes nao utilizados e atualizando bibliotecas com bugs de seguranca 
2.1.0
 - [FEATURE] Adicionando o conceito de arquivo `.snf` e a variável "dir" para alterar a estrutura de diretórios padrão no framework
2.0.31
 - [FEATURE] Incluindo suporte a variaveis de ambiente
2.0.30
 - [FEATURE] Melhorando o log do response, colocando o status e o request id como campos buscaveis
2.0.29
 - [FEATURE] Removendo a dependencia do oracledb e mssql que agora precisam ser incluidas manualmente
2.0.26
 - [FEATURE] Melhorando o metodo de inclusao de ssl
2.0.23
 - [FEATURE] Incluindo auditoria
2.0.21
 - [FEATURE] Adicionando custom errors na documentacao
2.0.20
 - [FEATURE] Incluindo suporte a inclusão de certidficados para contornar o problema de UNABLE_TO_VERIFY_LEAF_SIGNATURE
2.0.16
 - [FEATURE] Incluindo a possibilidade de enviar uma funcao que sera executada após o listen
2.0.15
 - [FEATURE] Incluindo o user no scope
2.0.14
 - [FEATURE] Adicionando suporte a vários usuários no Basic Athentication. Também incluimos o usuário no log de 2 formas ( automatica e manual ) usando o bunyan fields.
2.0.12
 - [FEATURE] Adicionando modalidade de autorização pelo auth0
2.0.11
 - [BUGFIX] Corrigindo bug do server close para conexões no Redis
2.0.9
 - [FEATURE] Incluindo suporte a ignore de rotas no RequestAndResponseLogger
2.0.8
 - [BUGFIX] Logs no mongo para reconnect
2.0.7
 - [BUGFIX] Resolvendo problema do hostname no log
2.0.6
 - [FEATURE] Add process.stdout stream to bunyan
2.0.5
 - [BUGFIX] Solving Promise sql error
2.0.4
 - [BUGFIX] Solving jwt decode error
2.0.3
 - [FEATURE] Incluindo suporte a fila amqp
2.0.2
 - [FEATURE] Incluindo suporte a fila amqp
2.0.1
 - [BUGFIX] Resolvendo problema que acontecia quando não configuravamos nenhum db
2.0.0
 - [FEATURE] Incluindo suporte a ORACLE e SQL SERVER
1.0.15
 - [FEATURE] Incluindo suporte ao SSL
1.0.14
 - [BUGFIX] Resolvendo bugs de log
1.0.13
 - [BUGFIX] Resolvendo bugs de log
1.0.12
 - [FEATURE] Add hostname on healthcheck
1.0.11
 - [BUGFIX] Resolvendo BUG do log que fazia com que Exceptions não fossem gravadas
1.0.10
 - [BUGFIX] Resolvendo BUG do log que fazia com que Exceptions não fossem gravadas
1.0.9
 - [FEATURE] Add environment on healthcheck
1.0.8
 - [BUGFIX] Fix to getHostname on Windows machines