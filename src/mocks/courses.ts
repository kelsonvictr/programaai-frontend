// src/mocks/courses.ts
export interface Course {
  id: number
  title: string
  description: string
  duration: string
  price: string
  imageUrl: string
  bannerSite: string
  professor: string
  linkedin: string
  datas: string[]
  horario: string
  modalidade: string
}

export const courses: Course[] = [
  /*{
    id: 1,
    title: "Bootcamp: Programação do Zero",
    description:
      "Pensado para quem nunca programou, este curso intensivo de 20 horas vai te levar da lógica de programação até a criação de projetos web simples com JavaScript, HTML5 e CSS3. Aprenda a estruturar páginas responsivas, manipular o DOM e introduzir conceitos de versionamento com Git/GitHub. Perfeito para quem busca uma base sólida, sem “encheção de linguiça”, e já sair construindo suas primeiras aplicações do zero!",
    duration: "30 horas",
    price: "R$199,99 (promoção de lançamento)",
    imageUrl: "https://via.placeholder.com/300x150?text=ReactJS",
    bannerSite: "react-native.png",
    professor: "Kelson Victor",
    linkedin: "https://www.linkedin.com/in/",
    datas: ["12/07/2025", "26/07/2025", "09/08/2025"],
    horario: "08:00 - 12:00 e 13:00 - 15:00",
    modalidade: "PRESENCIAL | REMOTO AO VIVO"
  },*/
  {
    id: 2,
    title: "Bootcamp: AppSec Moderno com IA",
    description:
      "Em apenas 20 horas, você vai mergulhar nas mais avançadas técnicas de segurança de aplicações, integrando inteligência artificial para detecção e mitigação de vulnerabilidades em tempo real. Do mapeamento de ataques comuns até a automatização de testes de penetração com Python, Kali Linux e ferramentas de nuvem (AWS/GCP), aprenda a criar pipelines de DevSecOps que garantem código sólido desde o desenvolvimento. Ideal para engenheiros de software e profissionais de segurança que querem dominar uma abordagem proativa e prática de AppSec.",
    duration: "20 horas",
    price: "R$199,99 (promoção de lançamento)",
    imageUrl: "/coursecard-appsec.png",
    bannerSite: "appsec.png",
    professor: "Digenaldo Neto",
    linkedin: "https://www.linkedin.com/in/",
    datas: ["19/07/2025", "02/08/2025", "16/08/2025"],
    horario: "08:00 - 12:00 e 13:00 - 15:00",
    modalidade: "PRESENCIAL | REMOTO AO VIVO"
  },
  {
    id: 3,
    title: "Bootcamp: Java Starter",
    description:
      "Aprenda Java do zero ao deploy em apenas 20 horas de aula ao vivo, presencial ou remoto. Começamos pela sintaxe básica e orientada a objetos, avançando para frameworks essenciais como Spring Boot e Maven, além de práticas de teste automatizado. Com foco em aplicações corporativas, você sairá preparado para atuar como Desenvolvedor Backend Pleno, entendendo desde a arquitetura de micro-serviços até conexões seguras com bancos de dados.",
    duration: "20 horas",
    price: "R$199,99 (promoção de lançamento)",
    imageUrl: "./coursecard-javastarter.png",
    bannerSite: "java-starter.png",
    professor: "Higor Souza",
    linkedin: "https://www.linkedin.com/in/",
    datas: ["26/07/2025", "09/08/2025", "23/08/2025"],
    horario: "08:00 - 12:00 e 13:00 - 15:00",
    modalidade: "PRESENCIAL | REMOTO AO VIVO"
  },
  {
    id: 4,
    title: "Bootcamp Amazing Data Intelligence: do zero ao analytics engineering",
    description:
      "E SE A PRÓXIMA DECISÃO IMPORTANTE DA SUA EMPRESA ESTIVER ESCONDIDA NOS DADOS? Descubra como transformar dados brutos em insights estratégicos com engenharia analítica moderna.",
    duration: "20 horas",
    price: "R$199,99 (promoção de lançamento)",
    imageUrl: "coursecard-amazing-data.png",
    bannerSite: "amazing.png",
    professor: "Wuldson Franco",
    linkedin: "https://www.linkedin.com/in/",
    datas: ["02/08/2025", "16/08/2025", "30/08/2025"],
    horario: "08:00 - 12:00 e 13:00 - 15:00",
    modalidade: "PRESENCIAL | REMOTO AO VIVO"
  }
]
