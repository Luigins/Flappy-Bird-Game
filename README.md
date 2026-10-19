# 🐤 Flappy Bird - Retro Edition

Uma versão pratica do clássico jogo **Flappy Bird**, desenvolvida utilizando **HTML5**, **CSS3** e **JavaScript**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 🕹️ Demonstração e Jogabilidade

O objetivo é simples: navegue o pássaro pelos obstáculos de canos sem colidir com as estruturas ou com o chão. Cada conjunto de canos ultrapassado concede **1 ponto**.

### Controles
* **Espaço** ou **Clique do Mouse/Toque na Tela**: Faz o pássaro pular (ganhar altura).
* **Reiniciar**: Pressione **Espaço** ou clique na tela quando estiver na tela de *Game Over*.

---

## ✨ Recursos e Destaques Técnicos

- 🎨 **Design Procedural no Canvas:**
  - Degradê vetorial nos canos para simular iluminação 3D e bocais destacados.
  - Pássaro animado com asas dinâmicas e rotação proporcional à velocidade de queda.
  - Céu em gradiente suave com efeito parallax de nuvens navegando no fundo.
  - Chão com padrão de rolagem infinita contínua.
- 👾 **Estética Arcade Retro:**
  - Fonte pixelada 8-bits importada do *Google Fonts* (`Press Start 2P`).
  - Moldura de gabinete arcade simulando uma tela de console vintage.
- 💾 **Persistência de Dados (`localStorage`):**
  - Armazenamento automático do recorde pessoal do jogador (*Best Score*) mesmo após fechar o navegador.
- 📐 **Física e Colisão em Tempo Real:**
  - Simulação de gravidade e cálculo de colisão com modelo AABB (*Axis-Aligned Bounding Box*).

---

## 📁 Estrutura do Projeto

```text
flappy-bird-retro/
├── index.html     # Estrutura do Canvas e carregamento de fontes
├── style.css      # Estilização da página, moldura arcade e layout
├── game.js        # Lógica completa do jogo, física e renderização
└── README.md      # Documentação do projeto
```

---

## 🚀 Como Executar o Projeto

Não é necessário instalar nenhum ambiente de execução complexo ou gerenciador de pacotes (`npm`/`yarn`).

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/flappy-bird-retro.git
   ```

2. **Navegue até a pasta do projeto:**
   ```bash
   cd flappy-bird-retro
   ```

3. **Abra o jogo:**
   * Dê um duplo clique no arquivo `index.html` para abrir diretamente no seu navegador de preferência.
   * **OU** utilize a extensão **Live Server** no VS Code para rodar um servidor local com *Hot Reload*.

---
