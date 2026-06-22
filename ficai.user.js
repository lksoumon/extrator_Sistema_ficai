// ==UserScript==
// @name         Extrator de Dados FICAI SEDUC/MT
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Extrai dados da tabela do painel FICAI e exporta para CSV
// @author       Você
// @match        http://ficai.seduc.mt.gov.br/*
// @grant        none
// @updateURL    https://github.com/lksoumon/extrator_Sistema_ficai/raw/refs/heads/main/ficai.user.js
// @downloadURL  https://github.com/lksoumon/extrator_Sistema_ficai/raw/refs/heads/main/ficai.user.js
// ==/UserScript==

(function() {
    'use strict';

    let todosOsDados = [];
    let extraindo = false;
    let paginaAtual = 1;

    const btn = document.createElement('button');
    btn.innerText = 'Iniciar Extração FICAI';
    btn.style.position = 'fixed';
    btn.style.bottom = '20px';
    btn.style.right = '20px';
    btn.style.zIndex = '999999';
    btn.style.padding = '15px 20px';
    btn.style.backgroundColor = '#d32f2f';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '5px';
    btn.style.cursor = 'pointer';
    btn.style.fontWeight = 'bold';
    btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';

    document.body.appendChild(btn);

    function extrairDadosDaTabela() {
        const linhas = document.querySelectorAll("#Grid1ContainerTbl tbody tr");

        linhas.forEach(linha => {
            const getTextoColuna = (index) => {
                const celula = linha.querySelector(`td[data-colindex='${index}'] span`);
                return celula ? celula.innerText.trim() : "";
            };

            const codFicai = getTextoColuna(0);
            const categoria = getTextoColuna(1);
            const nomeAluno = getTextoColuna(2);
            const escola = getTextoColuna(3);
            const situacao = getTextoColuna(4);
            const abertura = getTextoColuna(5);
            const tramitada = getTextoColuna(6);

            const imgPrazo = linha.querySelector("td[data-colindex='15'] img");
            let statusPrazo = "Desconhecido";
            if (imgPrazo) {
                const src = imgPrazo.getAttribute('src') || "";
                if (src.includes("BolaVerde")) {
                    statusPrazo = "Dentro do Prazo (Verde)";
                } else if (src.includes("BolaVermelha")) {
                    statusPrazo = "Fora do Prazo (Vermelha)";
                }
            }

            if (codFicai) {
                todosOsDados.push([codFicai, categoria, nomeAluno, escola, situacao, abertura, tramitada, statusPrazo]);
            }
        });
    }

    function baixarCSV(dados) {
        const cabecalhos = ["Cod. Ficai", "Categoria", "Nome do Aluno", "Escola", "Situação", "Abertura", "Tramitada", "Status Prazo"];
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += cabecalhos.join(";") + "\r\n";

        dados.forEach(linha => {
            const linhaFormatada = linha.map(valor => `"${(valor || "").replace(/"/g, '""')}"`);
            csvContent += linhaFormatada.join(";") + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);

        const dataHoje = new Date().toISOString().split('T')[0];
        link.setAttribute("download", `extracao_ficai_${dataHoje}.csv`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function finalizarProcesso() {
        btn.innerText = 'Finalizado! Gerando CSV...';
        btn.style.backgroundColor = '#388e3c';

        baixarCSV(todosOsDados);

        setTimeout(() => {
            btn.innerText = 'Iniciar Extração FICAI';
            btn.style.backgroundColor = '#d32f2f';
            extraindo = false;
            todosOsDados = [];
            paginaAtual = 1;
        }, 3000);
    }

    function loopExtracao() {
        if (!extraindo) return;

        btn.innerText = `Extraindo página ${paginaAtual}... Aguarde.`;
        btn.style.backgroundColor = '#f57c00';

        extrairDadosDaTabela();

        // Localiza o span que contém o botão "Próximo"
        const spanProximo = document.getElementById("TPROXIMO");

        // Verifica se o span existe E se ele NÃO contém a classe gx-invisible E se o display não é 'none'
        const temProximaPagina = spanProximo &&
                                 !spanProximo.classList.contains("gx-invisible") &&
                                 spanProximo.style.display !== "none";

        if (temProximaPagina) {
            const btnProximo = spanProximo.querySelector("a");
            if (btnProximo) {
                btnProximo.click();
                paginaAtual++;
                setTimeout(loopExtracao, 3500);
            } else {
                finalizarProcesso();
            }
        } else {
            // Chegou na última página (botão oculto)
            finalizarProcesso();
        }
    }

    btn.addEventListener('click', () => {
        if (extraindo) return;

        const confirmar = confirm("Iniciar extração? O script vai navegar pelas páginas sozinho. Por favor, não clique em nada até o download do arquivo CSV ser concluído.");
        if (confirmar) {
            extraindo = true;
            todosOsDados = [];
            paginaAtual = 1;
            loopExtracao();
        }
    });

})();
