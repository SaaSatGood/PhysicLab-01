📘 PhysicLab — Motor de Física & Simulação Numérica

PhysicLab é um motor de simulação física e integração numérica, desenvolvido em TypeScript, com foco em clareza matemática, arquitetura limpa e visualização interativa.
O projeto demonstra, na prática, as diferenças entre métodos numéricos simples e avançados aplicados a sistemas físicos reais.

🎯 Objetivo: mostrar como decisões algorítmicas impactam diretamente a precisão, estabilidade e conservação de energia em simulações computacionais.

🚀 Principais Funcionalidades

⚙️ Engine física desacoplada da UI

🧮 Comparação em tempo real entre:

Método de Euler (1ª ordem)

Runge-Kutta 4 (RK4 – 4ª ordem)

🧊 Simulação de colisões 3D (esfera–esfera)

📊 Gráficos de posição e energia em tempo real

🎮 Controles interativos de constantes físicas

🧠 Código fortemente tipado com TypeScript

🏗 Arquitetura do Sistema

O projeto segue rigorosamente o princípio de Separação de Preocupações (SoC).
A engine matemática não possui qualquer dependência do React, DOM ou Three.js, podendo ser executada em ambientes como Node.js ou Web Workers.

Estrutura de Pastas
/
├── engine/               # Lógica Pura (TypeScript)
│   ├── math/             # Vetores e Integradores Numéricos
│   ├── physics/          # Entidades Físicas (Partículas, Forças)
│   └── systems/          # Mundo Físico e Resolução de Colisões
├── components/           # Camada Visual (React + Three.js)
│   ├── Scene3D.tsx       # Renderização WebGL
│   ├── DataCharts.tsx    # Gráficos em Tempo Real
│   └── ControlPanel.tsx  # Inputs do Usuário
├── App.tsx               # Orquestrador da Aplicação
└── types.ts              # Tipos Compartilhados (sem dependência visual)

🧮 Núcleo Matemático (Engine)
🔹 Vetores Imutáveis (Vector.ts)

Vetores Euclidianos 3D são implementados como imutáveis.

Motivação:
Métodos como RK4 exigem a criação de estados intermediários hipotéticos. A imutabilidade evita efeitos colaterais e garante segurança matemática durante o cálculo.

💡 Observação: a imutabilidade prioriza clareza e correção. Versões mutáveis podem ser exploradas futuramente para otimização de performance.

🔹 Integradores Numéricos (Integrators.ts)
Método de Euler (1ª Ordem)

Abordagem simples e computacionalmente barata:

𝑥
𝑛
+
1
=
𝑥
𝑛
+
𝑣
𝑛
⋅
Δ
𝑡
x
n+1
	​

=x
n
	​

+v
n
	​

⋅Δt
𝑣
𝑛
+
1
=
𝑣
𝑛
+
𝑎
⋅
Δ
𝑡
v
n+1
	​

=v
n
	​

+a⋅Δt

Limitação:
Assume aceleração constante durante todo o passo de tempo, o que gera erro acumulado e instabilidade energética.

Runge-Kutta 4 (RK4 — 4ª Ordem)

Calcula uma média ponderada de quatro inclinações dentro do mesmo passo de tempo:

𝑥
𝑛
+
1
=
𝑥
𝑛
+
Δ
𝑡
6
(
𝑘
1
+
2
𝑘
2
+
2
𝑘
3
+
𝑘
4
)
x
n+1
	​

=x
n
	​

+
6
Δt
	​

(k
1
	​

+2k
2
	​

+2k
3
	​

+k
4
	​

)

Vantagens:

Erro global de ordem 
𝑂
(
Δ
𝑡
4
)
O(Δt
4
)

Estabilidade muito superior

Conservação de energia significativamente melhor em sistemas conservativos

🔹 Sistema de Colisões (PhysicsWorld.ts)

Detecção: Esfera–Esfera via distância Euclidiana

∥
𝑝
1
−
𝑝
2
∥
<
𝑟
1
+
𝑟
2
∥p
1
	​

−p
2
	​

∥<r
1
	​

+r
2
	​


Resolução:

Conservação do momento linear

Coeficiente de restituição configurável (0.0 a 1.0)

Correção de penetração para estabilidade numérica

🎨 Interface de Usuário (UI)

A UI consome os dados da engine em um loop de animação (~60 FPS).

🎥 Visualização 3D (Scene3D.tsx)

Desenvolvida com React Three Fiber

Sincroniza malhas 3D com os dados da engine

Trilhas de trajetória:

🔴 Euler

🔵 RK4

Conversão de coordenadas:

Engine: Y-down

Three.js: Y-up
(a conversão ocorre apenas na renderização)

📊 Gráficos em Tempo Real (DataCharts.tsx)

Implementados com Recharts:

📈 Posição vs Tempo

⚡ Energia Total

Energia Cinética:

𝐸
𝑘
=
1
2
𝑚
𝑣
2
E
k
	​

=
2
1
	​

mv
2

Energia Potencial Gravitacional:

𝐸
𝑝
=
𝑚
𝑔
ℎ
E
p
	​

=mgh

O gráfico evidencia o “drift” energético do método de Euler e a estabilidade do RK4.

🎛 Painel de Controle (ControlPanel.tsx)

Permite ajuste dinâmico de:

Gravidade

Passo de tempo (dt)

Coeficiente de restituição

Tipo de simulação ativa

⚠ Limitações Conhecidas

Detecção de colisões discreta (pode ocorrer tunneling em altas velocidades)

RK4 não lida naturalmente com descontinuidades (colisões são tratadas separadamente)

Euler requer dt significativamente menor para estabilidade

Imutabilidade prioriza correção matemática em detrimento de performance extrema

Essas decisões são conscientes e documentadas.

🛠 Tecnologias Utilizadas

TypeScript

React

Three.js

React Three Fiber

Recharts

Vite

▶️ Como Executar
# instalar dependências
npm install

# iniciar projeto
npm run dev


Abra http://localhost:5173 no navegador.

🧠 Motivação do Projeto

PhysicLab foi desenvolvido como um projeto educacional e técnico, unindo:

Física computacional

Métodos numéricos

Engenharia de software

Visualização interativa

O projeto serve como base para aplicações em:

Simulações científicas

Engines de jogos

Robótica

Sistemas de otimização

Modelagem matemática aplicada

📌 Autor

Rafael Cortes
Desenvolvedor Full Stack | Física Computacional | Simulações Numéricas
