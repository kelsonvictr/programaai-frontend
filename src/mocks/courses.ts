// src/mocks/courses.ts
export interface Course {
  id: number
  title: string
  description: string
  duration: string
  price: string
  obsPrice?: string
  imageUrl: string
  bannerSite: string
  professor: string
  linkedin: string
  datas: string[]
  horario: string
  modalidade: string
  bio: string
  prerequisitos?: string[]
  publicoAlvo?: string[]
  oQueVaiAprender?: string[]
  modulos?: string[]
}

export const courses: Course[] = [
  {
    id: 5,
    title: "Bootcamp: Meu Primeiro App com TypeScript e React Native (Turma 01)",
    description: `Você já conhece ReactJS ou outro framework web e quer expandir seus horizontes? Este bootcamp é a ponte entre o mundo web e o universo dos apps!

  Ao longo de 20 horas de aula, vamos construir um app completo com autenticação e CRUD usando Firebase como backend. Antes de mergulhar no React Native, você vai aprender a base de TypeScript e entender por que esse superset de JavaScript se tornou padrão na criação de aplicações modernas. Tudo isso com orientação direta, foco em boas práticas e resultado prático na tela do seu celular.`,
    duration: "20 horas",
    price: "R$199,99",
    obsPrice: "promoção de lançamento, no pix",
    imageUrl: "/coursecard-reactnative.png",
    bannerSite: "/banner-site-reactnative.png",
    professor: "Kelson Almeida",
    linkedin: "https://www.linkedin.com/in/kelson-almeida/",
    datas: ["26/07/2025", "02/08/2025", "23/08/2025"],
    horario: "08:00 - 12:00 e 13:00 - 15:00",
    modalidade: "PRESENCIAL | REMOTO AO VIVO",
    bio: "Desenvolvedor Senior na NTT Data, atuando no banco Itaú. Professor universitário na UNIESP - Centro Universitário e Mestre em Informática pela UFPB. Criador da programa ai, é apaixonado por ensinar e por tecnologias como Java, Kotlin, JavaScript/TypeScript, React e Python. Mais de 100 alunos já passaram pelo seu Curso Presencial de Programação Fullstack, que une didática prática e experiência de mercado.",
    prerequisitos: [
      "Já ter tido algum contato com ReactJS (mesmo que básico)",
      "Conhecimento geral de JavaScript (variáveis, funções, arrays, etc.)",
      "Interesse em aprender como funciona um app mobile na prática",
      "Notebook próprio com permissão para instalar ferramentas de desenvolvimento"
    ],
    publicoAlvo: [
      "Pessoas que já estudaram um pouco de ReactJS e querem experimentar o mundo mobile",
      "Desenvolvedores web em início de jornada que desejam criar seu primeiro app com TypeScript",
      "Estudantes ou autodidatas que já criaram algo com ReactJS e querem aprender sobre apps com Firebase",
      "Quem já conhece a base do front-end e quer transformar esse conhecimento em um app real"
    ],
    oQueVaiAprender: [
      "Fundamentos essenciais do TypeScript e como usá-lo com segurança em projetos React Native",
      "Configurar um projeto React Native com Expo de forma rápida e prática",
      "Criar um app mobile com múltiplas telas e navegação moderna (Stack + Tabs)",
      "Construir um sistema de autenticação com Firebase Authentication",
      "Salvar e recuperar dados com Firebase Firestore em tempo real",
      "Organizar um projeto completo com boas práticas de código e estrutura de pastas",
      "Publicar seu app em modo de teste no seu próprio celular"
    ],
    modulos: [
      "Introdução ao TypeScript: tipos, interfaces, inferência e boas práticas",
      "Configuração do ambiente com Expo e criação do primeiro app",
      "Criação de componentes reutilizáveis com props e useState",
      "Navegação entre telas com React Navigation (Stack e Tabs)",
      "Integração com Firebase Authentication (registro, login e logout)",
      "Leitura e escrita de dados no Firebase Firestore",
      "Estilização com Flexbox e organização visual do app",
      "Publicação do app em modo de teste e próximos passos no mundo mobile"
    ]
  },
  {
    id: 3,
    title: "Bootcamp: AppSec Moderno com IA (Turma 01)",
    description: `Em um cenário onde os ciberataques evoluem mais rápido que as defesas tradicionais, a segurança de aplicações precisa ser proativa, automatizada e inteligente. Neste bootcamp prático de 20 horas, você vai explorar as fronteiras entre segurança ofensiva, defensiva e o uso de Inteligência Artificial aplicada a AppSec.

  A jornada passa por fundamentos como o OWASP Top 10, princípios CIA, DevSecOps e compliance (ISO 27001, LGPD, PCI-DSS), além de práticas modernas como Shift Left Security e análise de código assistida por IA. Você vai aprender a utilizar ferramentas como Burp Suite, OWASP ZAP, Semgrep e SonarQube, integrar segurança em pipelines CI/CD e aplicar testes SAST, DAST e IAST de forma eficaz.

  Também abordaremos segurança em APIs REST, GraphQL e gRPC, ambientes em nuvem como AWS e GCP, containers, escaneamento de imagens e práticas robustas de controle de acesso (JWT, OAuth2, OpenFGA).

  O conteúdo é altamente prático: desde ataques simulados em ambientes controlados (Juice Shop, DVWA, Hackazon) até a automação de defesas com IA, incluindo revisão de pull requests, análise de vulnerabilidades e resposta a incidentes com apoio de LLMs como o ChatGPT.`,
    duration: "20 horas",
    price: "R$199,99",
    obsPrice: "promoção de lançamento, no pix",
    imageUrl: "/coursecard-appsec.png",
    bannerSite: "/banner-site-appsec.png",
    professor: "Digenaldo Neto",
    linkedin: "https://www.linkedin.com/in/digenaldo/",
    datas: ["06/09/2025", "13/09/2025", "20/09/2025"],
    horario: "08:00 - 12:00 e 13:00 - 15:00",
    modalidade: "PRESENCIAL | REMOTO AO VIVO",
    bio: "Engenheiro de Segurança na Jusbrasil, Digenaldo é mestre em Tecnologia da Informação (IFPB) com pesquisa focada em detecção de ataques DDoS via machine learning. Possui mais de 10 anos de experiência em engenharia de software, com ênfase em segurança da informação, sistemas distribuídos e cloud. Atuou em projetos de grande visibilidade na Rede Globo, como Big Brother Brasil e Cartola FC, e hoje lidera iniciativas em autenticação, segurança de APIs e arquitetura resiliente na Jusbrasil. É especializado em Golang e Python e práticas modernas de cibersegurança.",
    prerequisitos: [
      "Lógica de programação e estruturas básicas (if, loops, funções)",
      "Leitura e escrita de código simples em Python, JavaScript ou Java",
      "Entendimento básico de HTTP/HTTPS, requisições e headers",
      "Conhecimento sobre a diferença entre cliente e servidor e o papel de uma API",
      "Capacidade de instalar e executar ferramentas em sistemas Linux (preferencialmente via terminal)",
      "Noções básicas de Git e GitHub (clonar repositório, abrir pull request)"
    ],
    publicoAlvo: [
      "Desenvolvedores iniciantes ou em transição que querem aprender segurança de aplicações com IA",
      "Profissionais de TI que buscam práticas modernas de AppSec e compliance",
      "Estudantes e entusiastas de tecnologia que desejam aplicar IA em segurança ofensiva e defensiva"
    ],
    oQueVaiAprender: [
      "Compreender os princípios fundamentais de segurança (CIA) e o papel de AppSec no ciclo de vida seguro do software",
      "Usar IA para auxiliar em secure coding, revisão de pull requests e refatoração de código",
      "Identificar e mitigar vulnerabilidades com ferramentas como OWASP ZAP, Burp Suite, Semgrep e SonarQube",
      "Aplicar DevSecOps, compliance (OWASP, ISO 27001, LGPD, PCI-DSS) e 'shifting left' no desenvolvimento",
      "Garantir segurança em APIs REST, GraphQL, gRPC e arquiteturas em nuvem (AWS, GCP, Kubernetes)",
      "Realizar ataques simulados em ambientes controlados com uso ético de IA"
    ],
    modulos: [
      "Fundamentos de AppSec e Inteligência Artificial",
      "Desenvolvimento Seguro com IA (secure coding, geração assistida, refatoração)",
      "Análise e Testes de Segurança com Ferramentas e IA (SAST, DAST, IAST, OWASP Top 10)",
      "Segurança em APIs, Cloud e Projeto Prático Final (AWS, GCP, Kubernetes, ataques simulados)"
    ]
  },
  {
  id: 2,
  title: "Bootcamp Amazing Data Intelligence: do zero ao analytics engineering (Turma 01)",
  description: `Você está prestes a descobrir o poder dos dados em decisões estratégicas. Este bootcamp intensivo de 20 horas foi pensado para transformar iniciantes em profissionais prontos para atuar em engenharia analítica, combinando fundamentos de dados com práticas de mercado.

Você aprenderá a construir pipelines de dados do zero, entender modelagem para BI, aplicar boas práticas de governança e visualizar dados com ferramentas poderosas como PowerBI, Metabase, dbt, Athena e Glue. Também abordaremos ETL com PySpark e Airflow, consumo de dados com SQL avançado e integração em ambientes de nuvem (AWS/GCP).

O curso é conduzido por Wuldson Franco, especialista com atuação em empresas como A3Data, Rede Mater Dei, UNIESP e NTT Data. Wuldson combina experiência acadêmica com projetos reais no setor de saúde e grande volume de dados, oferecendo uma visão completa de como transformar dados em decisões com eficiência, rastreabilidade e impacto de negócio real.`,
  duration: "12 horas",
  price: "R$180,00",
  obsPrice: "promoção de lançamento, no pix",
  imageUrl: "/coursecard-amazing-data.png",
  bannerSite: "/banner-site-amazing.png",
  professor: "Wuldson Franco",
  linkedin: "https://www.linkedin.com/in/wuldsonfranco/",
  datas: ["16/08/2025", "30/08/2025"],
  horario: "08:00 - 12:00 e 13:00 - 15:00",
  modalidade: "PRESENCIAL | REMOTO AO VIVO",
  bio: "Especialista em Engenharia de Dados e Analytics com sólida experiência em projetos de BI e dados no setor de saúde, financeiro e telecon. Professor universitário, Product Owner e mentor técnico em tecnologias como AWS, Google Cloud, Python, SQL, Airflow, dbt e PySpark. Certificado em Big Data e nuvem, atua como referência em engenharia analítica, desenvolvendo pipelines e indicadores para grandes volumes de dados.",
  prerequisitos: [
    "Conhecimento básico de SQL",
    "Noções de lógica de programação (qualquer linguagem)",
    "**Desejável experiência com ambiente Linux ou Docker (mas não obrigatório)",
    "Vontade de aprender e colocar a mão na massa!"
  ],
  publicoAlvo: [
    "Profissionais que desejam migrar ou se especializar em engenharia de dados",
    "Analistas de BI, cientistas de dados e desenvolvedores que queiram entender pipelines de dados completos",
    "Estudantes e recém-formados em TI, Ciência de Dados, Estatística, Engenharia ou áreas correlatas",
    "Líderes e gestores que precisam compreender a base técnica da inteligência analítica moderna"
  ],
  oQueVaiAprender: [
    "Como construir um pipeline de dados completo, do ingestion à camada de analytics",
    "Arquiteturas de dados modernas (medallion architecture, data lakes, data warehouses)",
    "Ferramentas essenciais como Docker, Python, PostgreSQL e Metabase",
    "Boas práticas em ETL/ELT para dados estruturados e semiestruturados",
    "Transformação de dados em insights com dashboards e relatórios avançados",
    "Introdução à governança e qualidade de dados"
  ],
  modulos: [
    "Fundamentos da Engenharia de Dados e Analytics",
    "Construindo Pipelines com Python: Leitura e escrita de dados em diversos formatos",
    "Integração e Armazenamento com PostgreSQL: configurando um data lake e modelagem de esquemas bronze, silver e gold",
    "Conceitos-chave: ETL, ELT, Data Lake, Data Warehouse, arquiteturas modernas",
    "Visualização e Análise de Dados: construção de dashboards com Metabase e storytelling de dados"
  ]
},
  {
    id: 4,
    title: "Bootcamp: Java Starter (Turma 01)",
    description: `Comece sua jornada na programação com Java de forma prática e guiada!
O Java Starter é um curso voltado para iniciantes que desejam aprender os fundamentos da programação utilizando a linguagem Java, aliando teoria essencial com prática direta em sala. Ao longo do curso, o aluno aprenderá desde conceitos básicos como variáveis e estruturas de controle, até orientação a objetos e programação funcional com expressões lambda. O conteúdo também serve como base sólida para quem deseja futuramente se aprofundar em frameworks como o Spring Boot, em nossa Jornada Spring.

Durante as aulas, os alunos também serão orientados a utilizar ferramentas modernas como o ChatGPT, aprendendo a usar a inteligência artificial como aliada para estudar, revisar conceitos, resolver exercícios e desenvolver autonomia na solução de problemas de código.

Você quer começar sua jornada com Java da forma certa, do básico à prática moderna? Este curso foi feito para quem está em transição de carreira, precisa aprimorar seu conhecimento em programação ou reciclar sua base em Java. Com aulas ao vivo e conteúdo direto ao ponto, o Java Starter oferece uma abordagem clara, prática e divertida para quem quer realmente aprender e entender como o Java é usado no mundo real. Ao longo da formação, você irá aprender estruturas básicas e modernas da linguagem Java, com foco em aplicar os conceitos de forma prática e gradual, desde os fundamentos até as boas práticas do desenvolvimento back-end atual.`,
    duration: "20 horas",
    price: "R$199,99",
    obsPrice: "promoção de lançamento, no pix",
    imageUrl: "/coursecard-javastarter.png",
    bannerSite: "/banner-site-javastarter.png",
    professor: "Higor Souza",
    linkedin: "https://www.linkedin.com/in/higor-souza-andrade/",
    datas: ["27/09/2025", "04/10/2025", "18/10/2025"],
    horario: "08:00 - 12:00 e 13:00 - 15:00",
    modalidade: "PRESENCIAL | REMOTO AO VIVO",
    bio: "Com mais de 10 anos de experiência no mercado de tecnologia, atua há 5 anos como desenvolvedor de software. Atualmente atua como desenvolvedor back-end com foco nas tecnologias Java e Spring. Possui vivência em projetos dos setores de meios de pagamento, marketplaces e precificação de crédito, com forte atuação na manutenção e evolução de soluções baseadas em microserviços em ambientes de cloud computing — sempre buscando evoluir essas soluções com performance, qualidade e visão de negócio. Além da atuação técnica, ministra cursos de programação com foco em iniciantes, adotando uma abordagem moderna que integra o uso de inteligência artificial, como o ChatGPT, para acelerar o aprendizado, desenvolver o raciocínio lógico e incentivar a autonomia dos alunos.",
    prerequisitos: [
      "Ter tido algum contato com programação ou alguma linguagem de programação",
      "Ter familiaridade básica com o uso de computador (copiar/colar, abrir arquivos, usar navegador)",
      "Noções básicas com lógica de programação",
      "Notebook próprio com permissão para instalar ferramentas de desenvolvimento"
    ],
    publicoAlvo: [
      "Iniciantes em programação com conhecimento básico de linguagem de programação",
      "Estudantes universitários",
      "Profissionais de outras áreas em transição de carreira",
      "Pessoas com interesse em tecnologia e desenvolvimento de software"
    ],
    oQueVaiAprender: [
      "Fundamentos da linguagem Java",
      "Estrutura e hierarquia de código",
      "Variáveis, tipos primitivos e operadores",
      "Condicionais, laços de repetição e arrays",
      "Estruturas de dados: List, Set, Map e TreeSet",
      "Criação de classes, trabalhar com objetos e uso de POO",
      "Boas práticas e tratamento de exceções",
      "Programação funcional com lambdas e streams",
      "Como utilizar o ChatGPT para estudar programação"
    ],
    modulos: [
      "Conceitos básicos",
      "Funções e métodos",
      "Operadores e estruturas de controle",
      "Arrays, listas, conjuntos e mapas",
      "Classes, objetos e orientação a objetos",
      "Programação funcional e lambdas",
      "Módulo essencial (data/hora e formatação)",
      "Exercícios práticos com entrega e revisão"
    ]
  },
]
