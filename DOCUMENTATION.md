# 📘 PhysicLab - Motor de Física & Simulação Numérica

## Visão Geral
**PhysicLab** é uma aplicação web interativa desenvolvida para demonstrar e comparar métodos de integração numérica em tempo real. O projeto serve como uma prova de conceito de engenharia de software avançada, separando rigorosamente a lógica matemática (Engine) da camada de apresentação (UI).

O objetivo principal é visualizar a diferença de precisão entre o método de **Euler** (comum em jogos simples) e **Runge-Kutta 4** (padrão em simulações científicas), além de demonstrar colisões 3D e conservação de energia.

---

## 🏗 Arquitetura do Sistema

O projeto segue o padrão de **Separação de Preocupações (SoC)**. O motor físico não possui dependências do React ou do DOM, permitindo que ele rode em qualquer ambiente JavaScript (Node.js, Web Workers, etc.).

### Estrutura de Pastas
```
/
├── engine/               # Lógica Pura (TypeScript)
│   ├── math/             # Vetores e Integradores Numéricos
│   ├── physics/          # Entidades Físicas (Partículas)
│   └── systems/          # Mundo Físico e Resolução de Colisões
├── components/           # Camada Visual (React + Three.js)
│   ├── Scene3D.tsx       # Renderização WebGL (Loop Fixo)
│   ├── DataCharts.tsx    # Gráficos em Tempo Real
│   └── ControlPanel.tsx  # Inputs do Usuário
├── App.tsx               # Orquestrador da Aplicação
└── types.ts              # Definições de Tipos Compartilhadas
```

---

## 🧮 Núcleo Matemático (Engine)

### 1. Vetores (`Vector.ts`)
Implementação de vetores Euclidianos 3D **imutáveis**.
*   **Decisão de Design:** A imutabilidade foi priorizada para garantir a segurança algorítmica do RK4 (que requer estados hipotéticos futuros sem alterar o presente).
*   **Nota de Performance:** Em um ambiente de produção extrema (ex: milhares de partículas), classes mutáveis (`VectorMutable`) seriam preferíveis para reduzir a pressão no Garbage Collector.

### 2. Integradores (`Integrators.ts`)
O coração da simulação. O sistema suporta dois métodos:

#### A. Método de Euler (1ª Ordem)
A abordagem mais simples e computacionalmente barata.
$$x_{n+1} = x_n + v \cdot \Delta t$$
$$v_{n+1} = v_n + a \cdot \Delta t$$
*   **Problema:** Assume que a aceleração é constante durante todo o passo de tempo. Isso gera um "drift" de energia, fazendo com que órbitas espiralem para fora e projéteis voem mais longe do que deveriam. Requer $\Delta t$ muito pequeno para estabilidade.

#### B. Runge-Kutta 4 (RK4 - 4ª Ordem)
Realiza quatro amostragens de inclinação (derivadas) dentro de um único passo de tempo, **recalculando as forças em cada estágio** para obter uma média ponderada precisa.
1.  $k_1$: Estado inicial.
2.  $k_2$: Estado em $t + \Delta t/2$ usando $k_1$.
3.  $k_3$: Estado em $t + \Delta t/2$ usando $k_2$.
4.  $k_4$: Estado em $t + \Delta t$ usando $k_3$.

$$x_{n+1} = x_n + \frac{\Delta t}{6} (k_1 + 2k_2 + 2k_3 + k_4)$$

*   **Vantagem:** Margem de erro drasticamente menor ($O(\Delta t^4)$). Em sistemas conservativos, a perda/ganho de energia é insignificante para intervalos de tempo razoáveis.

### 3. Sistema de Colisões (`PhysicsWorld.ts`)
*   **Detecção:** Discreta (Esfera-Esfera).
*   **Resolução:** Separação posicional (para evitar *sinking*) seguida de resolução de impulso elástico.

---

## ⚠ Limitações Conhecidas & Trade-offs

Como toda simulação numérica, existem simplificações conscientes:

1.  **Colisões Discretas vs CCD:** O sistema verifica colisões a cada passo de tempo (Discrete Collision Detection). Se a velocidade de uma partícula for extrema ($v > r / \Delta t$), pode ocorrer **Tunneling** (atravessar objetos). A solução seria implementar *Continuous Collision Detection* (CCD), fora do escopo atual.
2.  **Integração através de Descontinuidades:** O RK4 assume funções suaves. Colisões são descontinuidades instantâneas na velocidade. Matematicamente, o ideal seria integrar até o momento exato da colisão, resolver, e continuar. Aqui, resolvemos a colisão e depois integramos, o que é aceitável para simulações visuais.
3.  **Fixed Timestep vs Frame Rate:** A simulação roda em um laço acumulador fixo dentro do `useFrame` do React Three Fiber. Isso garante determinismo físico independente da taxa de quadros (FPS) do monitor do usuário.

---

## 🚀 Como Executar

O projeto é construído sobre uma stack React moderna.

1.  **Instalação de Dependências:**
    O projeto depende de `react`, `three`, `@react-three/fiber`, `@react-three/drei` e `recharts`.

2.  **Inicialização:**
    O ponto de entrada é `index.tsx`, que monta o componente `App`.

3.  **Uso:**
    *   Selecione "Comparação (Euler vs RK4)" para ver a teoria em ação.
    *   Selecione "Colisões Múltiplas 3D" para ver o stress-test do motor físico.