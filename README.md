# FlexFlow — Gestão Jurídica Inteligente

> Protótipo de plataforma para escritórios de advocacia e departamentos jurídicos: dashboard de métricas, controle de prazos, alertas de vencimento e checklist de compliance LGPD. Tudo derivado de dados reais, sem números fixos de fachada.

**[Acessar o protótipo ao vivo](https://adcs-dev.github.io/flexflow/)**

---

## Motivação

O FlexFlow nasceu de um problema concreto observado durante minha atuação no Tribunal de Justiça do Amazonas: advogados frequentemente chegavam a atendimentos sem saber o estado atual dos próprios processos, se havia decisão recente, prazo próximo ou manifestação pendente. Prazo perdido é passivo jurídico, e a falta de visibilidade era a raiz do problema.

É a evolução de um protótipo anterior focado apenas em controle de prazos. O FlexFlow expande a ideia para o que seria uma plataforma completa: centralizar a operação jurídica e dar visibilidade por métricas.

---

## Funcionalidades

- **Dashboard derivado dos dados reais.** Os indicadores (processos ativos, prazos urgentes, concluídos, conformidade LGPD) e o gráfico de status são calculados a partir dos processos cadastrados, não são números fixos.
- **Gestão de processos.** Cadastro com validação, filtros por status e prioridade, busca por número ou cliente, visualização em modal e exclusão.
- **Controle de prazos.** Cálculo automático de dias restantes, com destaque visual para vencimentos próximos.
- **Alertas proativos.** Lista de prazos dos próximos 7 dias, ordenada por urgência.
- **Checklist LGPD funcional.** A porcentagem de conformidade é calculada conforme os itens marcados, atualizando o dashboard em tempo real.
- **Persistência local.** Os dados ficam salvos no navegador via LocalStorage.

---

## Decisões técnicas

| Decisão | Motivo |
|---|---|
| Dashboard calculado, não fixo | Um painel com números de fachada quebra a credibilidade. Tudo reflete os dados reais. |
| Escape de HTML em todo input | Proteção contra XSS. Dados do usuário nunca são injetados como HTML cru. |
| Modal de detalhes no lugar de `alert()` | Experiência consistente com o resto da interface. |
| LocalStorage | Persistência adequada à fase de protótipo, sem backend. |
| Sem dependências de framework | HTML, CSS e JavaScript puro, para manter o projeto leve e transparente. |

---

## Tecnologias

HTML5, CSS3 (design system com variáveis, layout responsivo) e JavaScript (ES6+, organizado em classe, sem bibliotecas externas além de ícones e fontes).

---

## Sobre o uso de IA no desenvolvimento

A concepção, a arquitetura e a lógica de negócio do projeto são minhas, a partir de um problema que observei na prática. Usei assistentes de IA (Claude e ChatGPT) como ferramenta de execução: escrever e revisar trechos de código e acelerar a parte visual, sempre com acompanhamento e correção minha a cada etapa. O resultado reflete decisões de produto que tomei, não saída automática de uma ferramenta.

---

## Próximos passos

- [ ] Backend com autenticação e banco de dados
- [ ] Multi-tenancy (cada escritório com ambiente isolado)
- [ ] Relatórios exportáveis (PDF, Excel)
- [ ] Módulo LGPD com mapeamento de dados pessoais
- [ ] Integração com sistemas de tribunais quando houver API pública

---

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](./LICENSE).

---

## Autor

Desenvolvido por **Adriano Selis**
Estudante de Direito e de Engenharia de Software, com foco em produtos jurídicos e compliance.

[GitHub: adcs-dev](https://github.com/adcs-dev)
