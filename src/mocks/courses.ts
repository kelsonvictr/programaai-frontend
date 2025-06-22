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
}

export const courses: Course[] = [
  {
    id: 2,
    title: "Bootcamp: AppSec Moderno com IA (Turma 01)",
    description: `Em um cenário onde ciberataques estão cada vez mais sofisticados, a segurança de aplicações não pode mais ser reativa — ela precisa ser inteligente. Neste bootcamp prático de 20 horas, você vai mergulhar no universo da segurança ofensiva e defensiva, utilizando Inteligência Artificial para identificar vulnerabilidades em tempo real.

Você aprenderá a integrar Python, Kali Linux, Burp Suite, OWASP ZAP, ferramentas de DevSecOps e pipelines de CI/CD com abordagens modernas como Shift Left Security. O conteúdo inclui desde fundamentos do OWASP Top 10, exploração de falhas em ambientes controlados, até a construção de automações com IA para prevenir exploits em produção. Também abordamos boas práticas de arquitetura segura em ambientes em nuvem (AWS/GCP), uso de Keycloak para autenticação robusta, e como configurar camadas de proteção com Cloudflare, WAF e IAM.

Com a experiência do professor Digenaldo Neto — Engenheiro de Segurança na Jusbrasil com passagens pela Globo, ServiceNet e Anchor Loans — você terá acesso a vivências de ponta aplicadas em grandes sistemas distribuídos do mercado.`,
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
    bio: "Engenheiro de Segurança na Jusbrasil, Digenaldo possui ampla experiência em segurança da informação, arquitetura distribuída e desenvolvimento com Golang e Python. Atuou em grandes empresas como Globo, Anchor Loans, Jusbrasil e ServiceNet Tecnologia, liderando times e projetos voltados à segurança de aplicações, alta escalabilidade, APIs públicas e arquitetura de autenticação com Keycloak. É mestre em Tecnologia da Informação pela IFPB e certificado em práticas modernas de segurança e hacking ético.",
  },
  {
    id: 3,
    title: "Bootcamp: Java Starter (Turma 01)",
    description: `Você quer começar sua jornada com Java da forma certa, do básico à prática moderna de desenvolvimento backend? Este curso foi feito para quem nunca programou ou precisa reciclar sua base em Java, com aulas ao vivo e conteúdo direto ao ponto. São 20 horas de prática intensa, onde você vai:

- Aprender desde variáveis, estruturas de decisão e repetição até orientação a objetos;
- Criar projetos práticos com IntelliJ, Java moderno (versões atuais), Maven, Spring Boot e banco de dados PostgreSQL;
- Construir APIs REST com boas práticas, realizar operações CRUD, e proteger rotas com autenticação;
- Entender conceitos como DTOs, serviços, controladores, repositórios, injeção de dependência e testes unitários;
- Fazer deploy em produção com ferramentas gratuitas e integração com o front-end.

O professor Higor Souza tem sólida experiência como desenvolvedor backend em empresas como Conexa, Global Hitss e Captalys, e traz para o curso uma abordagem clara, prática e divertida para quem quer realmente aprender e entender como o Java é usado no mundo real.`,
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
    bio: "Especialista em Java, Spring Boot e AWS Lambda, Higor atua há mais de 4 anos com desenvolvimento backend, entregando soluções robustas e inovadoras. Já passou por empresas como Captalys, Phoebus, Global Hitss e atualmente está na Conexa. Com forte base em microserviços, testes automatizados e integração com APIs externas, também é experiente em bancos de dados como PostgreSQL e MongoDB. Higor se destaca por sua capacidade de liderar melhorias técnicas com foco em qualidade e performance.",
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
  }
]
