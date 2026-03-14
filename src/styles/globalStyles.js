import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
:root {
    /* 🎨 Cores */
    --colorT0: #fff;
    --colorT1: #000;
    --colorT2: #292929ff;
    --colorT3: #555555ff;
    --colorT4: #4d4d4dff;
    --colorT5: #8a8a8aff;
    --colorT6: #999999ff;
    --colorT7: #c0c0c0ff;
    --colorT8: #d8d8d8ff;
    --colorT9: #dfdfdfff;
    --colorT10: #eeeeeeff;
    --colorT11: #f7f7f7ff;
    --colorT12: #f5f5f5;
    --colorD1: #0098fdff;
    --colorD1a:rgba(0, 112, 187, 1);
    --colorD2: #00c3ffff;
    --colorE1: #bce3ff;
    --colorE1a: #71c4ff;
    --colorE1b: #9fd7ff;
    --colorD2a: #0011ff1f;
    --colorD2b: #0011ff2d;
    --colorD3: #a80000ff;
    --colorD4: #ff4f4fff;
    --colorD4a: rgb(218, 67, 67);
    --colorD5: #00d312ff;
    --colorD5a: #e8ffe9ff;
    --colorBg1: #fff;
    --colorBg2: #fffdf5ff;
    --colorBg3: #fffdf5ff;
    --colorBg4: #fffdf5ff;
    --colorBg5: #fffdf5ff;
    --colorBg6: #f1f1f1ff;
    --color-text: #111827;

    /* 🔠 Fontes e tamanhos */
    --fsOO: 0.6rem;
    --fsO: 0.7rem;
    --fsPP: 0.8rem;
    --fsP: 0.9rem;
    --fsM: 1rem;
    --fsMM: 1.2rem;
    --fsG: 1.3rem;
    --fsGG: 1.5rem;
    --fsX: 2rem;
    --fsXX: 2.3rem;

@media (max-width: 1200px) {
    --fsOO: 0.4rem;
    --fsO: 0.5rem;
    --fsPP: 0.6rem;
    --fsP: 0.7rem;
    --fsM: 0.8rem;
    --fsMM: 1rem;
    --fsG: 1.1rem;
    --fsGG: 1.3rem;
    --fsX: 1.8rem;
    --fsXX: 2.1rem;
}

@media (max-width: 800px) {
    --fsOO: 0.4rem;
    --fsO: 0.5rem;
    --fsPP: 0.6rem;
    --fsP: 0.7rem;
    --fsM: 0.8rem;
    --fsMM: 0.9rem;
    --fsG: 1rem;
    --fsGG: 1.1rem;
    --fsX: 1.7rem;
    --fsXX: 1.9rem;
}

@media (max-width: 600px) {
    --fsOO: 0.2rem;
    --fsO: 0.3rem;
    --fsPP: 0.4rem;
    --fsP: 0.5rem;
    --fsM: 0.6rem;
    --fsMM: 0.7rem;
    --fsG: 0.8rem;
    --fsGG: 0.9rem;
    --fsX: 1.5rem;
    --fsXX: 1.7rem;
}

@media (max-width: 500px) {
    --fsOO: 0.2rem;
    --fsO: 0.3rem;
    --fsPP: 0.4rem;
    --fsP: 0.5rem;
    --fsM: 0.6rem;
    --fsMM: 0.7rem;
    --fsG: 0.8rem;
    --fsGG: 0.9rem;
    --fsX: 1.1rem; // <-- alterado
    --fsXX: 1.3rem; // <-- alterado
}


    /* 📱 Breakpoints */
    --breakpoint-mobile: 480px;
    --breakpoint-tablet: 768px;
    --breakpoint-desktop: 1280px;
  }

* {
  margin: 0px;
  padding: 0px;
  box-sizing: border-box;
  font-family: "Roboto", sans-serif;
   outline: none;
}

img {
  display: block;
  max-width: 100%;
  max-height: 100%;
}

ul {
  list-style: none;
  margin: 0px;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
`;
