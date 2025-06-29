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
    id: 2,
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
    datas: ["19/07/2025", "02/08/2025", "16/08/2025"],
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
    id: 3,
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
    datas: ["26/07/2025", "09/08/2025", "23/08/2025"],
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
  {
    id: 4,
    title: "Bootcamp Amazing Data Intelligence: do zero ao analytics engineering (Turma 01)",
    description: `Você está prestes a descobrir o poder dos dados em decisões estratégicas. Este bootcamp intensivo de 20 horas foi pensado para transformar iniciantes em profissionais prontos para atuar em engenharia analítica, combinando fundamentos de dados com práticas de mercado.

Você aprenderá a construir pipelines de dados do zero, entender modelagem para BI, aplicar boas práticas de governança e visualizar dados com ferramentas poderosas como PowerBI, Metabase, dbt, Athena e Glue. Também abordaremos ETL com PySpark e Airflow, consumo de dados com SQL avançado e integração em ambientes de nuvem (AWS/GCP).

O curso é conduzido por Wuldson Franco, especialista com atuação em empresas como A3Data, Rede Mater Dei, UNIESP e NTT Data. Wuldson combina experiência acadêmica com projetos reais no setor de saúde e grande volume de dados, oferecendo uma visão completa de como transformar dados em decisões com eficiência, rastreabilidade e impacto de negócio real.`,
    duration: "20 horas",
    price: "R$199,99",
    obsPrice: "promoção de lançamento, no pix",
    imageUrl: "/coursecard-amazing-data.png",
    bannerSite: "/banner-site-amazing.png",
    professor: "Wuldson Franco",
    linkedin: "https://www.linkedin.com/in/wuldsonfranco/",
    datas: ["02/08/2025", "16/08/2025", "30/08/2025"],
    horario: "08:00 - 12:00 e 13:00 - 15:00",
    modalidade: "PRESENCIAL | REMOTO AO VIVO",
    bio: "Com passagens por empresas como A3Data, UNIESP, NTT Data, Hospital Nossa Senhora das Neves e Rede Mater Dei, Wuldson é um engenheiro de dados com sólida formação em Big Data e BI para o setor de saúde. Atua com ferramentas como PySpark, Airflow, dbt, PowerBI, Metabase, Glue, S3 e Athena. Também é professor universitário nas áreas de Banco de Dados e Engenharia Analítica, com MBA e certificações internacionais. Sua trajetória une prática de mercado com conhecimento acadêmico para transformar dados em decisões estratégicas.",
    prerequisitos: [
      "Interesse por dados e suas aplicações",
      "Noções básicas de lógica ou Excel",
      "Familiaridade com leitura de gráficos e tabelas",
      "Curiosidade em entender como dados geram valor para negócios",
      "Notebook com navegador moderno (não precisa saber programar)"
    ]

  }
]
