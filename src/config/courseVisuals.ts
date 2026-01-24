// src/config/courseVisuals.ts
// Configurações visuais para os course cards dinâmicos

export interface TechIcon {
  icon: string // Emoji ou character
  color: string
}

// Ícones de tecnologias disponíveis
export const TECH_ICONS: Record<string, TechIcon> = {
  python: { icon: '🐍', color: '#3776ab' },
  javascript: { icon: '⚡', color: '#f7df1e' },
  typescript: { icon: '📘', color: '#3178c6' },
  react: { icon: '⚛️', color: '#61dafb' },
  reactnative: { icon: '📱', color: '#61dafb' },
  nodejs: { icon: '🟢', color: '#339933' },
  java: { icon: '☕', color: '#007396' },
  go: { icon: '🐹', color: '#00add8' },
  kotlin: { icon: '🎯', color: '#7f52ff' },
  sql: { icon: '🗄️', color: '#4479a1' },
  docker: { icon: '🐳', color: '#2496ed' },
  aws: { icon: '☁️', color: '#ff9900' },
  security: { icon: '🔒', color: '#e74c3c' },
  fullstack: { icon: '🚀', color: '#667eea' },
  data: { icon: '📊', color: '#e67e22' },
  ai: { icon: '🤖', color: '#9b59b6' },
  n8n: { icon: '🔗', color: '#ea4b71' },
  microservices: { icon: '🏗️', color: '#3498db' },
  qa: { icon: '🧪', color: '#27ae60' },
  default: { icon: '💻', color: '#667eea' },
}

// Gradientes predefinidos
export const BG_GRADIENTS: Record<string, string> = {
  'blue-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'green-teal': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  'orange-red': 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
  'pink-purple': 'linear-gradient(135deg, #d53369 0%, #daae51 100%)',
  'blue-cyan': 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  'purple-pink': 'linear-gradient(135deg, #7f00ff 0%, #e100ff 100%)',
  'dark-blue': 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  'emerald': 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
  'sunset': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'ocean': 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)',
  'fire': 'linear-gradient(135deg, #f83600 0%, #f9d423 100%)',
  'forest': 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
  'default': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}

// Helper para obter configuração de tecnologia
export const getTechConfig = (tech: string | undefined): TechIcon => {
  if (!tech) return TECH_ICONS.default
  const normalized = tech.toLowerCase().trim()
  return TECH_ICONS[normalized] || TECH_ICONS.default
}

// Helper para obter gradiente
export const getGradient = (gradient: string | undefined): string => {
  if (!gradient) return BG_GRADIENTS.default
  return BG_GRADIENTS[gradient] || BG_GRADIENTS.default
}
