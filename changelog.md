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