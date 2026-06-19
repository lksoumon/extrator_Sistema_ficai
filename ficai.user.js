// ==UserScript==
// @name         Ficha Individual Analítica
// @namespace    http://tampermonkey.net/
// @version      1.52
// @description  Ferramentas para analisar a ficha individual do GPE/Sigeduca
// @author       Lucas S Monteiro
// @require https://code.jquery.com/jquery-3.6.0.min.js
// @match        http://sigeduca.seduc.mt.gov.br/ged/hwgedteladocumento.aspx?0,25
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @license MIT
// @updateURL    https://github.com/lksoumon/extrator_Sistema_ficai/raw/refs/heads/main/ficai.user.js
// @downloadURL  https://github.com/lksoumon/extrator_Sistema_ficai/raw/refs/heads/main/ficai.user.js
// @grant        none
// ==/UserScript==


function parseTable(htmlCode) {
  // Cria um elemento temporário para armazenar o código HTML
     htmlCode = htmlCode.replaceAll('<span style="font-size: 10px">', "");
    htmlCode = htmlCode.replaceAll('<span style="font-family: Arial">', "");
    htmlCode = htmlCode.replaceAll('</span>', "");
    //console.log(htmlCode);
   var tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlCode;

  // Obtém a tabela dentro do elemento temporário
  var table = tempDiv.querySelector('table');

  // Inicializa a matriz de saída
  var outputMatrix = [];

  // Obtém todas as linhas da tabela
  var rows = table.querySelectorAll('tr');

  // Itera sobre cada linha
  rows.forEach(function (row) {
    // Inicializa uma array para armazenar os valores da linha
    var rowValues = [];

    // Obtém todas as células da linha
    var cells = row.querySelectorAll('td');

    // Itera sobre cada célula
    cells.forEach(function (cell) {
      // Adiciona o valor da célula à array de valores da linha
      rowValues.push(cell.textContent.trim());
    });

    // Adiciona a array de valores da linha à matriz de saída
    outputMatrix.push(rowValues);
  });

  return outputMatrix;


}
function pegaCabecalho(dados){

    var cabecalho = []; var calcBimes = 1; var calcOdds = 1;
    //var dadosCabec = document.getElementById("content").getElementsByTagName("table")[4].getElementsByTagName("tr");
    var dadosCabec = dados;
    //console.log(dados);
        for (let u = 0; u < dadosCabec[0].getElementsByTagName("td").length; u++) {

            if(dadosCabec[0].getElementsByTagName("td")[u].rowSpan == 2){
                cabecalho.push(dadosCabec[0].getElementsByTagName("td")[u].getElementsByTagName("span")[0].textContent.trim());
            }

            if(dadosCabec[0].getElementsByTagName("td")[u].rowSpan == 1 && dadosCabec[0].getElementsByTagName("td")[u].colSpan==2){
                cabecalho.push("N"+calcBimes,"F"+calcBimes);
                calcBimes++;
            }
            if(dadosCabec[0].getElementsByTagName("td")[u].rowSpan == 1 && dadosCabec[0].getElementsByTagName("td")[u].colSpan==1){
                cabecalho.push("NR"+calcOdds);
                calcOdds++;
            }

           // if(dadosCabec[0].getElementsByTagName("td")[u].rowSpan == 1){
           //     if(dadosCabec[1].getElementsByTagName("td").length % 2 === 0){
           //         cabecalho.push("N"+calcBimes,"F"+calcBimes);
           //     }else{
           //         cabecalho.push("N"+calcBimes);
           //     }
           //     calcBimes++;
           // }


            //console.log(dadosCabec[0].getElementsByTagName("td")[u].getElementsByTagName("span")[0].textContent.trim());

        }
    //console.log(cabecalho);
    return cabecalho;
}
function coletarDados(){
    var infoCabecalho = pegaCabecalho(document.getElementById("content").getElementsByTagName("table")[4].getElementsByTagName("tr"));
    infoCabecalho.shift();
    //console.log(infoCabecalho);


    var output = {'dadosTurma':{},'alunos':{},'materias':[]};
    var tabelas =$('[id=content]');
    var escola = tabelas[0].getElementsByTagName("table")[2].getElementsByTagName("span")[2].textContent;
    var dadosTurma = document.getElementById("content").getElementsByTagName("p")[5].textContent;

    var aluno = document.getElementById("content").getElementsByTagName("table")[3].getElementsByTagName("span")[2].textContent.trim();
    var codigo = document.getElementById("content").getElementsByTagName("table")[3].getElementsByTagName("span")[24].textContent.trim();
    var matricula = document.getElementById("content").getElementsByTagName("table")[3].getElementsByTagName("span")[24].textContent.trim();
    var faltJust = document.getElementById("content").getElementsByTagName("table")[5].getElementsByTagName("span")[8].textContent.trim();
    var nascimento = document.getElementById("content").getElementsByTagName("table")[3].getElementsByTagName("span")[20].textContent.trim();


    var spans = document.getElementById("content").getElementsByTagName("p")[6].getElementsByTagName("span");
    var obs = spans[spans.length - 1].textContent.trim();



    output['alunos'][codigo] = {'notas':{},'resultado':'','dadosAluno':{'nome':aluno,'matricula':matricula,'totalFaltas':0,'faltasJust':faltJust,'nascimento':nascimento,'obs':obs}};


    var infos = dadosTurma.split("\n");
    var serie = infos[0].split(">");
    var temp = infos[1].split("TURMA:");
    var turno = temp[0];
    turno = turno.replace("TURNO: ", "");
    temp = temp[1].split("ANO LETIVO:");
    var turma = temp[0];
    var ano = temp[1];

    serie = serie[serie.length - 1];
    turno = turno.trim();
    turma = turma.trim();
    ano = ano.trim();
    serie = serie.trim();
    //var codigo = document.getElementById("content").getElementsByTagName("table")[3].getElementsByTagName("span")[26].textContent;
    //console.log(turno);console.log(turma);console.log(serie);

    output["dadosTurma"]["serie"] = serie;
    output["dadosTurma"]["turma"] = turma;
    output["dadosTurma"]["turno"] = turno;
    output["dadosTurma"]["ano"] = ano;
    output["dadosTurma"]["escola"] = escola.split(" - ")[0].trim();
    output["dadosTurma"]["nomeEscola"] = escola.split(" - ")[1].trim();
    output['alunos'][codigo]['resultado'] = document.getElementById("content").getElementsByTagName("table")[5].getElementsByTagName("span")[14].textContent.trim();


    let result = parseTable(document.getElementById("content").getElementsByTagName("table")[4].outerHTML);
    //console.log(result);

    //console.log([...result[1]]);

    var compara = 0;
    for (let i = 0; i < result.length; i++) {
        compara = 0;
        let qtdN = result[1].filter(v => String(v).trim() == "N").length;
        let qtdC = result[1].filter(v =>String(v).trim() == "C").length;
        let qtdNC = result[1].filter(v => String(v).trim() == "N/C").length;

        compara= result[0].length + result[1].length - qtdN - qtdC - qtdNC;
        //compara= result[0].length + (result[1].length / 2);
        compara = Math.floor(compara);


        if(i==0 || i==1){
            continue;
        }
        //console.log(result[i].length,compara);

        if(result[i].length == compara){
            result[i].shift();
        }



        // ---- [result[i][0] é a materia de cada linha --------
        output.alunos[codigo].notas[result[i][0]] = {};
        if (!output['materias'].includes(result[i][0])) {
            output['materias'].push(result[i][0]);
        }


        //console.log(result[i]);console.log(infoCabecalho);
        for (let j = 1; j < result[i].length; j++) {
            output.alunos[codigo].notas[result[i][0]][infoCabecalho[j]] = result[i][j];
            if(infoCabecalho[j] == "TF"){
                    output['alunos'][codigo]['dadosAluno']['totalFaltas'] = output['alunos'][codigo]['dadosAluno']['totalFaltas'] + Number(result[i][j]);
            }
        }

        //output['alunos'][codigo]['notas'].push(result[i]);
    }
    //---------------------------------- roda os demais -------------------------------------
    for (let k = 1; k < tabelas.length; k++) {
        result = parseTable(tabelas[k].getElementsByTagName("table")[4].outerHTML);


        infoCabecalho = pegaCabecalho(tabelas[k].getElementsByTagName("table")[4].getElementsByTagName("tr"));
        infoCabecalho.shift();

        //console.log(result);
        //console.log(tabelas[k]);
        codigo = tabelas[k].getElementsByTagName("table")[3].getElementsByTagName("span")[24].textContent.trim();
        aluno = tabelas[k].getElementsByTagName("table")[3].getElementsByTagName("span")[2].textContent.trim();
        matricula = tabelas[k].getElementsByTagName("table")[3].getElementsByTagName("span")[24].textContent.trim();
        faltJust = tabelas[k].getElementsByTagName("table")[5].getElementsByTagName("span")[8].textContent.trim();
        nascimento = tabelas[k].getElementsByTagName("table")[3].getElementsByTagName("span")[20].textContent.trim();

        spans = tabelas[k].getElementsByTagName("p")[6].getElementsByTagName("span");
        obs = spans[spans.length - 1].textContent.trim();


        //console.log(codigo);
        if( output['alunos'][codigo] ){}else{
            output['alunos'][codigo] = {'notas':{},'resultado':'','dadosAluno':{'nome':aluno,'matricula':matricula,'totalFaltas':0,'faltasJust':faltJust,'nascimento':nascimento,'obs':obs}};
        }
        compara = 0;
        for (let i = 0; i < result.length; i++) {
            //compara= result[0].length + (result[1].length / 2);
            let qtdN = result[1].filter(v => String(v).trim() == "N").length;
            let qtdC = result[1].filter(v =>String(v).trim() == "C").length;
            let qtdNC = result[1].filter(v => String(v).trim() == "N/C").length;

            compara= result[0].length + result[1].length - qtdN - qtdC - qtdNC;
            //compara= result[0].length + (result[1].length / 2);
            compara = Math.floor(compara);

            if(i==0 || i==1){
                continue;
            }
            compara = Math.floor(compara); //console.log(result[i].length,compara);
            if(result[i].length == compara){//console.log('foi');
                result[i].shift();
            }
            output['alunos'][codigo]['resultado'] = tabelas[k].getElementsByTagName("table")[5].getElementsByTagName("span")[14].textContent.trim();


            output.alunos[codigo].notas[result[i][0]] = {};
            if (!output['materias'].includes(result[i][0])) {
                output['materias'].push(result[i][0]);
            }
            //console.log(result[i]);console.log(infoCabecalho);
            for (let j = 1; j < result[i].length; j++) {
                output.alunos[codigo].notas[result[i][0]][infoCabecalho[j]] = result[i][j];

                if(infoCabecalho[j] == "TF"){
                    output['alunos'][codigo]['dadosAluno']['totalFaltas'] = output['alunos'][codigo]['dadosAluno']['totalFaltas'] + Number(result[i][j]);
                }

            }


            //output['alunos'][codigo]['notas'].push(result[i]);
        }
    }

    return output;
}
function MapaDeNotas(dataArray,item,titulo) {
    // Abrir uma nova janela
    var windowFeatures = 'width=${screenWidth},height=${screenHeight}';
    var novaJanela = window.open('', '_blank',windowFeatures);

    let porcentagemDisciplina =[];
    var stringas = ['AVC','INT','BAS','-'];
    var corStringas={'AVC':'#baf235','INT':'#f2a735','BAS':'#f72525','-':'#919bab'};
    var corNotas=['#f72525','#f72525','#f72525','#f73e25','#f73e25','#f73e25','#b3f538','#b3f538','#94f51d','#94f51d','#94f51d'];
    var resultadoStringas = ['TRANSF. ESCOLA - MAT. PROGRE. PARC.','TRANSF. ESCOLA - MAT. EXTRAORD.','RECLASSIFICADO','APROVADO','REPROVADO','REPROVADO POR FALTA','TRANSFERIDO DA ESCOLA','TRANSFERIDO DA TURMA','PROGRESSÃO PARCIAL','MATRÍCULA EXTRAORDINÁRIA','AFASTADO POR DESISTÊNCIA','EM PROGRESSÃO'];
    var corResultado={'TRANSF. ESCOLA - MAT. PROGRE. PARC.':'#919bab','TRANSF. ESCOLA - MAT. EXTRAORD.':'#919bab','RECLASSIFICADO':'#919bab','AFASTADO POR DESISTÊNCIA':'#f28e30','MATRÍCULA EXTRAORDINÁRIA':'#d9d168','APROVADO':'#5665db','REPROVADO':'#cc5718','REPROVADO POR FALTA':'#cc5718','TRANSFERIDO DA ESCOLA':'#919bab','TRANSFERIDO DA TURMA':'#919bab','PROGRESSÃO PARCIAL':'#6cbfcc','EM PROGRESSÃO':'#6cbfcc'}

    var tabelaHTML = `
  <style type="text/css">
    th.rotate { height: 280px; white-space: nowrap; }
    th.rotate > div { transform: translate(0px, 120px) rotate(270deg); width: 20px; }
    thead { display: table-header-group; }
  </style>
`;


    tabelaHTML += '<h3 style="text-align:center;">'+titulo+' - '+dataArray.dadosTurma.turma+' '+dataArray.dadosTurma.turno+'</h3>';

    tabelaHTML += '<table border="1"><thead><tr>';
    tabelaHTML += '<th>Codigo</th><th>nome</th><th>Situa.</th>';


    for (var i = 0; i < dataArray.materias.length; i++) {
        porcentagemDisciplina.push(0);

        var t = '';
        if (dataArray.materias[i].length > 21) {
            t = dataArray.materias[i].substring(0, 21) + '...';
        } else {
            t = dataArray.materias[i];
        }

        tabelaHTML += '<th class="rotate"><div><span>' + t + '</span></div></th>';



    }
    tabelaHTML += '<th class="rotate"><div><span>Total Faltas confimadas</span></div></th>';
    tabelaHTML += '<th class="rotate"><div><span>Qtde. Notas abaixo da média</span></div></th>';
    tabelaHTML += '</tr></thead><tbody>';

    Object.entries(dataArray.alunos)
        .sort((a, b) => a[1].dadosAluno.nome.localeCompare(b[1].dadosAluno.nome, 'pt', { sensitivity: 'base' }))
        .forEach(function eachKey([cod, value]) {

//    Object.keys(dataArray.alunos)
//        .forEach(function eachKey(cod) {//console.log(dataArray.alunos[cod]);
        var faltaTotal = 0;
        tabelaHTML += '<tr>';
        tabelaHTML += '<td>' + cod + '</td>';
        tabelaHTML += '<td>' + dataArray.alunos[cod].dadosAluno.nome + '</td>';
        var corRes = 'white';
        if (resultadoStringas.includes(dataArray.alunos[cod].resultado)) {
            //alert('foi');
            corRes = corResultado[dataArray.alunos[cod].resultado];
        }else{corRes = 'white';}

        let qtdeVermelha = 0;

         tabelaHTML += '<td style="text-align:center;background-color: '+corRes+'">' +  dataArray.alunos[cod].resultado + '</td>';
        var not = 0; var cor = '';
         for (var i = 0; i < dataArray.materias.length; i++) {
              var Valor = '';//console.log(dataArray.alunos[cod].notas[dataArray.materias[i]]);
             if(dataArray.alunos[cod].notas[dataArray.materias[i]] == undefined){
                 Valor = '-';
             }else{
                 faltaTotal += Number(dataArray.alunos[cod].notas[dataArray.materias[i]].TF);
                  if(dataArray.alunos[cod].notas[dataArray.materias[i]][item] == undefined){
                      Valor = '-';
                  }else{
                      Valor = dataArray.alunos[cod].notas[dataArray.materias[i]][item];


                  }
                 //console.log(item,  dataArray.alunos[cod].notas[dataArray.materias[i]]['N1']   );
             }


             if (stringas.includes(Valor)) {
                 cor = corStringas[Valor];
                 not = Valor;
             } else {
                 var cc = parseFloat(Valor);
                 not = cc.toFixed(1);
                 cc = Math.round(cc);
                 cor = corNotas[cc];

                 if(cc<6){
                      qtdeVermelha ++;
                      porcentagemDisciplina[i]++;
                      }
             }


             tabelaHTML += '<td style="text-align:center;background-color: '+cor+'">' + Valor + '</td>';
         }
        tabelaHTML += '<td style="text-align:center;background-color: '+'white'+'">' +( faltaTotal - Number(dataArray.alunos[cod].dadosAluno.faltasJust) )+ '</td>';

        let corQtdeVermelha = 'white';
        if(qtdeVermelha > 0 && qtdeVermelha <= 4 ){corQtdeVermelha = 'yellow';}
        if(qtdeVermelha > 4 ){corQtdeVermelha = 'red';}

        tabelaHTML += '<td style="text-align:center;background-color: '+corQtdeVermelha+'">' +( qtdeVermelha )+ '</td>';
        tabelaHTML += '</tr>';
    });

    const porcentagens = porcentagemDisciplina.map(valor => Math.round((valor / Object.keys(dataArray.alunos).length) * 100) + "%");

    console.log(porcentagens);
    tabelaHTML += '<td style="text-align:center;">%</td>';
    tabelaHTML += '<td>Porcentagem de notas abaixo da média</td>';
    tabelaHTML += '<td style="text-align:center;">por disciplina</td>';
    for (const p of porcentagens) {
        //console.log(p);
        tabelaHTML += '<td style="text-align:center;background-color: '+'white'+'">' + p + '</td>';
    }

        tabelaHTML += '</tbody></table>';

        // Adicionar tabela ao conteúdo da nova janela
        novaJanela.document.write(tabelaHTML);







}
function MapaDeTodasNotas(dataArray) {
    // Abrir uma nova janela
    var windowFeatures = 'width=${screenWidth},height=${screenHeight}';
    var novaJanela = window.open('', '_blank',windowFeatures);


    var stringas = ['AVC','INT','BAS','-'];
    var corStringas={'AVC':'#baf235','INT':'#f2a735','BAS':'#f72525','-':'#919bab'};
    var corNotas=['#f72525','#f72525','#f72525','#f72525','#f72525','#f73e25','#f2a735','#b3f538','#b3f538','#baf235','#94f51d'];


    var tabelaHTML = `
  <style type="text/css">
    th.rotate { height: 280px; white-space: nowrap; }
    th.rotate > div { transform: translate(0px, 120px) rotate(270deg); width: 20px; }
    thead { display: table-header-group; }
  </style>
`;


    tabelaHTML += '<h3 style="text-align:center;"> Notas de todos os bimestres - '+dataArray.dadosTurma.turma+' '+dataArray.dadosTurma.turno+'</h3>';

    tabelaHTML += '<table border="1"><thead><tr>';
    tabelaHTML += '<th>Codigo</th><th>nome</th><th>Situa.</th><th>Bim.</th>';





    for (var i = 0; i < dataArray.materias.length; i++) {
        var t = '';
        if (dataArray.materias[i].length > 21) {
            t = dataArray.materias[i].substring(0, 21) + '...';
        } else {
            t = dataArray.materias[i];
        }

        tabelaHTML += '<th class="rotate"><div><span>' + t + '</span></div></th>';
    }

    tabelaHTML += '<th class="rotate"><div><span>Total Faltas confirmadas</span></div></th>';
    tabelaHTML += '</tr></thead><tbody>';

    Object.keys(dataArray.alunos).forEach(function eachKey(cod) {
        var faltaTotal = 0;
        var spawn;
        var mediaano = new Array(dataArray.materias.length).fill(0); // Inicializar a média anual com 0 para todas as matérias

        for (var k = 1; k <= 6; k++) {
            tabelaHTML += '<tr>';
            if (k == 1) {
                spawn = 'rowspan="6"';
                tabelaHTML += '<td ' + spawn + ' >' + cod + '</td>';
                tabelaHTML += '<td ' + spawn + '>' + dataArray.alunos[cod].dadosAluno.nome + '</td>';
                tabelaHTML += '<td ' + spawn + '>' + dataArray.alunos[cod].resultado + '</td>';
            } else {
                spawn = '';
            }

            if (k < 5) {
                tabelaHTML += '<td>' + k + 'ºbim</td>';
                var cor = '';

                for (var i = 0; i < dataArray.materias.length; i++) {
                    var Valor = '';

                    if (dataArray.alunos[cod].notas[dataArray.materias[i]] == undefined) {
                        Valor = '-';
                    } else {
                        faltaTotal += Number(dataArray.alunos[cod].notas[dataArray.materias[i]].TF);
                        if (dataArray.alunos[cod].notas[dataArray.materias[i]]['N' + k] == undefined) {
                            Valor = '-';
                        } else {
                            Valor = dataArray.alunos[cod].notas[dataArray.materias[i]]['N' + k];
                            if (!isNaN(Valor)) {
                                mediaano[i] += Number(Valor); // Somar a nota para calcular a média anual
                            }
                        }
                    }

                    if (stringas.includes(Valor)) {
                        cor = corStringas[Valor];
                    } else {
                        var cc = parseFloat(Valor);
                        var not = cc.toFixed(1);
                        cc = Math.floor(cc);
                        cor = corNotas[cc];
                    }

                    tabelaHTML += '<td style="text-align:center;background-color: ' + cor + '">' + Valor + '</td>';
                }
            } else if (k == 5) {
                tabelaHTML += '<td>Média</td>';
                for (var t = 0; t < dataArray.materias.length; t++) {
                    var mediaFinal = (mediaano[t] / 4).toFixed(2); // Calcula a média anual e arredonda para 2 casa decimal

                    if (mediaFinal == 0){
                        tabelaHTML += '<td style="text-align:center;background-color: lightblue ">-</td>';
                    } else {
                        tabelaHTML += '<td style="text-align:center;background-color: lightblue ">' + mediaFinal + '</td>';
                    }

                }
            } else {
                tabelaHTML += '<td>P/Aprov.</td>';
                for (var u = 0; u < dataArray.materias.length; u++) {
                    var mediaApr = (24 - (mediaano[u])).toFixed(2); // Calcula a média anual e arredonda para 2 casa decimal

                    if (mediaApr == 24){
                        tabelaHTML += '<td style="text-align:center;background-color: lightblue ">-</td>';
                    } else if (mediaApr < 0){
                        tabelaHTML += '<td style="text-align:center;background-color: lightblue ">AP</td>';
                    }else {
                        tabelaHTML += '<td style="text-align:center;background-color: lightblue ">' + mediaApr + '</td>';
                    }

                }
            }

            if (k == 1) {
                tabelaHTML += '<td ' + spawn + ' style="text-align:center;background-color: white">' + (faltaTotal - Number(dataArray.alunos[cod].dadosAluno.faltasJust)) + '</td>';
            }

            tabelaHTML += '</tr>';
        }
    });





        tabelaHTML += '</tbody></table>';

        // Adicionar tabela ao conteúdo da nova janela
        novaJanela.document.write(tabelaHTML);







}
function semNotas(bim,dataArray){

    var arrayOutput = {};


    Object.keys(dataArray.alunos).forEach(function(key) {
        //console.log(key + ': ' + pessoa[key]);
        if(dataArray.alunos[key].resultado == "CURSANDO"){
            //arrayOutput[key+' - '+dataArray.alunos[key].dadosAluno.nome] = '';
            Object.keys(dataArray.alunos[key].notas).forEach(function(keyM) {
                //console.log(keyM + ': ' + dataArray.alunos[key].notas[keyM]);
                for (var i = 1; i <= bim; i++) {
                    if(dataArray.alunos[key].notas[keyM]['N'+i] == "-"){

                        if (arrayOutput[key+' - '+dataArray.alunos[key].dadosAluno.nome] === undefined) {
                            arrayOutput[key+' - '+dataArray.alunos[key].dadosAluno.nome] = '';
                        }

                        arrayOutput[key+' - '+dataArray.alunos[key].dadosAluno.nome]= arrayOutput[key+' - '+dataArray.alunos[key].dadosAluno.nome]+ `- ${keyM}: ${i}º bimestre sem nota<br>`;


                    }
                }

            });

        }
    });

        // Abrir uma nova janela
    var windowFeatures = 'width=${screenWidth},height=${screenHeight}';
    var novaJanela = window.open('', '_blank',windowFeatures);
    var turmaUnica = dataArray.dadosTurma.turma + ' - ' + dataArray.dadosTurma.turno;
    var semNotaHTML = `<h1>${turmaUnica}</h1><h2>Alunos sem lançamentos de nota até o ${bim}º bimestre</h2>`;
    console.log(arrayOutput);
    if(Object.keys(arrayOutput).length === 0 ){
        semNotaHTML = semNotaHTML + `<h5>Sem problemas de lançamentos de notas identificadas! </h5>`;
    }
    Object.keys(arrayOutput).forEach(function(key) {
        //console.log(key + ': ' + arrayOutput[key]);
        semNotaHTML = semNotaHTML + `<h5>${key}</h5><span>${arrayOutput[key]}</span>`;
    });
    // Adicionar tabela ao conteúdo da nova janela
    //console.log(semNotaHTML);
        novaJanela.document.write(semNotaHTML);
}


function migrarNotas(bim,dataArray){

    var stringOutput = '{';
    var notaB = '';

    Object.keys(dataArray.alunos).forEach(function(key) {
        //console.log(dataArray.alunos[key].notas);

        //if(dataArray.alunos[key].resultado == "CURSANDO"){
            //arrayOutput[key+' - '+dataArray.alunos[key].dadosAluno.nome] = '';
            Object.keys(dataArray.alunos[key].notas).forEach(function(keyM) {
                console.log(keyM + ': ', 'N'+bim,dataArray.alunos[key].notas[keyM]['N'+bim]);
                //for (var i = 1; i <= bim; i++) {
                    if(dataArray.alunos[key].notas[keyM]['N'+bim] != "-" && dataArray.alunos[key].notas[keyM]['N'+bim] != undefined ){
                        notaB = dataArray.alunos[key].notas[keyM]['N'+bim].replace(".", ",");

                        stringOutput = stringOutput +"'"+keyM+"':'" + notaB +"',";

                        //arrayOutput[key+' - '+dataArray.alunos[key].dadosAluno.nome]= arrayOutput[key+' - '+dataArray.alunos[key].dadosAluno.nome]+ `- ${keyM}: ${i}º bimestre sem nota<br>`;


                    }
                //}

            });

        //}
    });

    stringOutput = stringOutput + "}";
    stringOutput = stringOutput.replace(",}", "}");
    console.log(stringOutput);

     // Cria um elemento de texto temporário para copiar
    const tempInput = document.createElement("textarea");
    tempInput.value = stringOutput;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // Para dispositivos móveis
    try {
        document.execCommand("copy");
        alert("Notas Copiadas - Agora cole no lançamento de notas usando outro sript");
    } catch (err) {
      console.error('Erro ao copiar: ', err);
    }


}

function gerarPCA(dataArray,nome){
    // Abrir uma nova janela
    var windowFeatures = 'width=${screenWidth},height=${screenHeight}';
    var novaJanela = window.open('', '_blank',windowFeatures);
    var escola = dataArray.dadosTurma.nomeEscola;
    var turma = dataArray.dadosTurma.turma;
    var turno = dataArray.dadosTurma.turno;
    var serie = dataArray.dadosTurma.serie;

    var tabelaHTML = `
  <!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Plano de Recomposição</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
    }
    h1, h2, h3, h4 {
      text-align: center;
      margin: 4px 0;
    }
    .titulo {
      margin-top: 30px;
      text-align: center;
      font-weight: bold;
      font-size: 18px;
    }
    .subtitulo {
      text-align: center;
      font-size: 16px;
      margin-bottom: 20px;
    }
    .info {
      margin: 20px 0;
      font-size: 13px;
    }
    table, th, td {
      border: 1px solid black;
      border-collapse: collapse;
      padding: 8px;
      font-size: 11px;
    }
    table {
      width: 100%;
      margin-bottom: 20px;
    }
    .assinaturas {
      display: flex;
      justify-content: space-around;
      margin-top: 40px;
    }
    .assinatura {
      text-align: center;
      width: 30%;
    }
    .assinatura div {
      border-top: 1px solid #000;
      margin-top: 60px;
    }
    .assinatura-centro {
      text-align: center;
      width: 100%;
      margin-top: 60px;
    }
    .assinatura-centro div {
      border-top: 1px solid #000;
      width: 50%;
      margin: 0 auto;
      margin-top: 60px;
    }
    .final {
      margin-top: 40px;
      font-size: 14px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div style="text-align: center;">
    <img alt="" src="http://sigeduca.seduc.mt.gov.br/geral/imagem/BRASAO.jpg" width="55" height="46">
  </div>

  <h2>Governo de Mato Grosso</h2>
  <h3>SECRETARIA DE ESTADO DE EDUCAÇÃO</h3>
  <h4>SAGR — Secretaria Adjunta de Gestão Regional</h4>
  <h4>SAGE — Secretaria Adjunta de Gestão Educacional</h4>

  <div class="titulo">ANEXO I</div>
  <div class="subtitulo">Plano de Recomposição da Aprendizagem e Compensação de Ausências</div>

  <div class="info">
    Unidade Escolar: <strong>${escola}</strong><br>
    Estudante: <strong>${nome}</strong> &nbsp;&nbsp; ano/série: <strong>${serie} - ${turma}</strong> &nbsp;&nbsp; Turno: <strong>${turno}</strong><br><br>
    Período de compensação da ausência (período que o estudante faltou):<br>
    Data de início: ___/___/______ até a data ___/___/______<br><br>
    Atividades Desenvolvidas:
  </div>

  <table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Componente Curricular</th>
        <th>Habilidade/Objeto de conhecimento em defasagem de aprendizagem diagnosticadas</th>
        <th>Atividade de recomposição realizada</th>
        <th>Observação</th>
      </tr>
    </thead>
    <tbody>
      <tr>
`;





    for (var i = 0; i < dataArray.materias.length; i++) {

        var t = '';
        if (dataArray.materias[i].length > 21) {
            t = dataArray.materias[i].substring(0, 21) + '...';
        } else {
            t = dataArray.materias[i];
        }
        tabelaHTML += `<tr>
        <td></td><td>${t}</td><td></td><td></td><td></td>
      </tr>`;


    }


    tabelaHTML += `</tbody>
  </table>

  <table>
    <tr>
      <th>AVALIAÇÃO (considerando o período de ausências)</th>
    </tr>
    <tr>
      <td>
        (  ) o estudante, neste período, realizou as atividades propostas, porém necessita de continuidade no trabalho com as habilidades indicadas;<br><br>
        (  ) o estudante, neste período, realizou as atividades propostas e consolidou as habilidades;<br><br>
        (  ) o estudante não realizou as atividades propostas.
      </td>
    </tr>
  </table>

  <span><strong>Validação:</strong></span>

  <div class="assinaturas">
    <div class="assinatura">
      <div></div>
      Professor Regente <br> Componente Curricular
    </div>
    <div class="assinatura">
      <div></div>
      Professor Regente <br> Componente Curricular
    </div>
    <div class="assinatura">
      <div></div>
      Professor Regente <br> Componente Curricular
    </div>
  </div>

  <div class="assinatura-centro">
    <div></div>
    Coordenador(a) Pedagógico(a)
  </div>

  <div class="final">
    Justificativa inserida no sistema SigEduca em ___/___/______ <br><br>
    Validado pelo Conselho de Classe em ___/___/______
  </div>

</body>
</html>
`;



        // Adicionar tabela ao conteúdo da nova janela
        novaJanela.document.write(tabelaHTML);

}


function removeTransf(dataArray){

    var stringOutput = '{';
    var notaB = '';
    var result;
    var tabelas =$('[id=content]');
    for (let k = 0; k < tabelas.length; k++) {
        if(tabelas[k].getElementsByTagName("table")[5].getElementsByTagName("span")[17].textContent.trim() == "TRANSFERIDO DA ESCOLA" || tabelas[k].getElementsByTagName("table")[5].getElementsByTagName("span")[17].textContent.trim() == "TRANSFERIDO DA TURMA"){
            console.log(tabelas[k]);
             // Remove a primeira div
            var primeiraDiv = tabelas[k];


            // Remove a próxima div (se existir)
            let proximaDiv = primeiraDiv.nextElementSibling;
            console.log(proximaDiv);
            proximaDiv.remove();
            if (proximaDiv && proximaDiv.tagName == 'div') {
                console.lgo('foi');
                //proximaDiv.remove();
            }

            // Remove o próximo <br> (se existir)
            let proximoElemento = primeiraDiv.nextElementSibling;
            console.log(proximoElemento);
            proximoElemento.remove();
            if (proximoElemento && proximoElemento.tagName == 'br') {
                //proximoElemento.remove();
                console.lgo('foi');
            }
            primeiraDiv.remove();
        }


    }

    alert("Fichas de alunos transferidos de turma e de escola removidos");
}


function gerarLista(dataArray) {
  // Abrir uma nova janela
  var windowFeatures = `width=${screen.width},height=${screen.height}`;
  var novaJanela = window.open('', '_blank', windowFeatures);

  var tabelaHTML = `
    <style type="text/css">
      thead { display: table-header-group; }
    </style>
  `;

  tabelaHTML += `<h3 style="text-align:center;">${dataArray.dadosTurma.turma} ${dataArray.dadosTurma.turno}</h3>`;
  tabelaHTML += `<table border="1">
    <thead>
      <tr>
        <th>Código</th><th>Nome</th><th>Situa.</th><th>Nascimento</th><th>Idade</th>
      </tr>
    </thead>
    <tbody>
  `;

  // Ordenar os alunos por nome
  const alunosOrdenados = Object.entries(dataArray.alunos)
    .sort((a, b) => a[1].dadosAluno.nome.localeCompare(b[1].dadosAluno.nome, 'pt', { sensitivity: 'base' }));

  // Gerar linhas da tabela
  alunosOrdenados.forEach(([cod, aluno]) => {
    tabelaHTML += `<tr>`;
    tabelaHTML += `<td>${cod}</td>`;
    tabelaHTML += `<td>${aluno.dadosAluno.nome}</td>`;
    tabelaHTML += `<td>${aluno.resultado}</td>`;
    tabelaHTML += `<td>${aluno.dadosAluno.nascimento}</td>`;

    let nascimento = aluno.dadosAluno.nascimento.trim();
    let hoje = new Date();
    let [diaNasc, mesNasc, anoNasc] = nascimento.split('/').map(Number);

    let idade = hoje.getFullYear() - anoNasc;
    if (
      hoje.getMonth() + 1 < mesNasc ||
      (hoje.getMonth() + 1 === mesNasc && hoje.getDate() < diaNasc)
    ) {
      idade--;
    }

    tabelaHTML += `<td>${idade}</td>`;
    tabelaHTML += `</tr>`;
  });

  tabelaHTML += `</tbody></table>`;

  // Exibir a tabela
  novaJanela.document.write(tabelaHTML);
}



(function() {

    'use strict';
    var infos = coletarDados();
    console.log('infos',infos);

    //criarMenu(infos);
    //MapaDeNotas(infos);

    // Cria o botão do menu
    var menuButton = document.createElement('div');
    menuButton.id = 'floatingMenuButton';
    menuButton.innerHTML = 'Analisar';
    document.body.appendChild(menuButton);

    // Cria o container do menu
    var menuContainer = document.createElement('div');
    menuContainer.id = 'floatingMenuContainer';
    menuContainer.style.display = 'none'; // Inicia escondido
    var subButton;

    var opcaos;var variva;

    //----------- cria opções

    // Mapa de notas ------------------------- -------------------------------------
    var tttt = document.createElement('div');
    tttt.textContent = 'Mapa de notas ⬇️';
    tttt.style.backgroundColor= '#242420';
    //tttt.style.Color= 'black';
    tttt.className = "menu-item";
    tttt.addEventListener('click', function() {
        //console.log('foi');
           if(optMapaNotas.style.display == 'none'){
               optMapaNotas.style.display = 'block';
               tttt.textContent = 'Mapa de notas ⬆️';
           }else{
               optMapaNotas.style.display = 'none';
               tttt.textContent = 'Mapa de notas ⬇️';
           }
        });
    menuContainer.appendChild(tttt);

    var optMapaNotas = document.createElement('div');
    optMapaNotas.style.display = 'none';


    opcaos = [ "Mapa de notas 1º Bimestre", "Mapa de notas 2º Bimestre", "Mapa de notas 3º Bimestre", "Mapa de notas 4º Bimestre", "Mapa de notas finais"];
     variva = [ "N1", "N2", "N3", "N4", "MF"];
    for (var i = 0; i < opcaos.length; i++) {
        (function(nome) {
            nome = opcaos[i];var vvv = variva[i];
        subButton = document.createElement('div');
        subButton.className = "menu-item";
        subButton.textContent = nome;
        subButton.addEventListener('click', function() {
            MapaDeNotas(infos,vvv,nome);
        });
        optMapaNotas.appendChild(subButton);
    })(i);
    }


    // Mapa de todas as notas ----
    subButton = document.createElement('div');
        subButton.className = "menu-item";
        subButton.textContent = 'Mapa de todas as notas';
        subButton.addEventListener('click', function() {
            MapaDeTodasNotas(infos);
        });
        optMapaNotas.appendChild(subButton);


    menuContainer.appendChild(optMapaNotas);

    menuContainer.appendChild(document.createElement('hr'));

// Alunos notas ------------------------- -------------------------------------
    var tttt2 = document.createElement('div');
    tttt2.textContent = 'Alunos sem lançamento de notas ⬇️';
    tttt2.style.backgroundColor= '#242420';
    tttt2.className = "menu-item";
     tttt2.addEventListener('click', function() {
        //console.log('foi');
           if(optSemNotas.style.display == 'none'){
               optSemNotas.style.display = 'block';
               tttt2.textContent = 'Alunos sem lançamento de notas ⬆️';
           }else{
               optSemNotas.style.display = 'none';
               tttt2.textContent = 'Alunos sem lançamento de notas ⬇️';
           }
        });
    menuContainer.appendChild(tttt2);


    var optSemNotas = document.createElement('div');
    optSemNotas.style.display = 'none';


    opcaos = [ "Sem notas até 1º Bimestre", "Sem notas até 2º Bimestre", "Sem notas até 3º Bimestre", "Sem notas até 4º Bimestre"];
    variva = [ "1", "2", "3", "4"];
    for (var j = 0; j < opcaos.length; j++) {
        (function(nome) {
            nome = opcaos[j];var vvv = variva[j];
            subButton = document.createElement('div');
            subButton.className = "menu-item";
            subButton.textContent = nome;
            subButton.addEventListener('click', function() {
                semNotas(vvv,infos);
                //console.log(vvv);
            });
            optSemNotas.appendChild(subButton);
        })(j);
    }


    menuContainer.appendChild(optSemNotas);

    menuContainer.appendChild(document.createElement('hr'));

    console.log(Object.keys(infos.alunos).length);
    var qtdeAlunos = Object.keys(infos.alunos).length;

    if (qtdeAlunos = 1){
// opções Secrertario ------------------------- -------------------------------------
    var tttt23 = document.createElement('div');
    tttt23.textContent = 'Migrar notas ⬇️';
    tttt23.style.backgroundColor= '#242420';
    tttt23.className = "menu-item";
     tttt23.addEventListener('click', function() {
        //console.log('foi');
           if(optMigrarNotas.style.display == 'none'){
              optMigrarNotas.style.display = 'block';
               tttt23.textContent = 'Migrar notas ⬆️';
           }else{
               optMigrarNotas.style.display = 'none';
               tttt23.textContent = 'Migrar notas ⬇️';
           }
        });
    menuContainer.appendChild(tttt23);


    var optMigrarNotas = document.createElement('div');
    optMigrarNotas.style.display = 'none';


    opcaos = [ "Copiar 1º Bimestre", "Copiar 2º Bimestre", "Copiar 3º Bimestre", "Copiar 4º Bimestre"];
    variva = [ "1", "2", "3", "4"];
    for (var k = 0; k < opcaos.length; k++) {
        (function(nome) {
            nome = opcaos[k];var vvv = variva[k];
            subButton = document.createElement('div');
            subButton.className = "menu-item";
            subButton.textContent = nome;
            subButton.addEventListener('click', function() {
                migrarNotas(vvv,infos);
                //console.log(vvv);
            });
            optMigrarNotas.appendChild(subButton);
        })(k);
    }


    menuContainer.appendChild(optMigrarNotas);
    menuContainer.appendChild(document.createElement('hr'));

    //----- plano de composição
const primeiraChave = Object.keys(infos.alunos)[0];
const nome = infos.alunos[primeiraChave].dadosAluno.nome;
console.log(nome); // Ana



    var tttt25 = document.createElement('div');
    tttt25.textContent = 'Gerar Plano de Recomposição ➡️';
    tttt25.style.backgroundColor= '#242420';
    tttt25.className = "menu-item";
    tttt25.addEventListener('click', function() {
        console.log('foi');
        gerarPCA(infos,nome);

    });
    menuContainer.appendChild(tttt25);

    menuContainer.appendChild(document.createElement('hr'));
    var tttt26 = document.createElement('div');
    tttt26.textContent = 'Remover fichas de alunos transferidos ➡️';
    tttt26.style.backgroundColor= '#242420';
    tttt26.className = "menu-item";
    tttt26.addEventListener('click', function() {
        console.log('foi');
        removeTransf(infos);
        menuContainer.style.display = 'none';
    });
    menuContainer.appendChild(tttt26);

    menuContainer.appendChild(document.createElement('hr'));
    var tttt27 = document.createElement('div');
    tttt27.textContent = 'Gerar lista de alunos por situação, idade e transf.';
    tttt27.style.backgroundColor= '#242420';
    tttt27.className = "menu-item";
    tttt27.addEventListener('click', function() {
        console.log('foi');
        gerarLista(infos);
        menuContainer.style.display = 'none';
    });
    menuContainer.appendChild(tttt27);


}



    document.body.appendChild(menuContainer);

    var style = document.createElement('style');
    style.innerHTML = '@media print { #floatingMenuButton { display: none !important; } }';
    document.head.appendChild(style);

    // Estilos CSS
    var styles = `
        #floatingMenuButton {
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: #3498db;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 1000;
        }
        #floatingMenuContainer {
            position: fixed;
            top: 40px;
            right: 10px;
            background-color: #ecf0f1;
            border: 1px solid #3498db;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            padding: 10px;
        }
        .menu-item {
            padding: 5px 0;
            color: #3498db;
            cursor: pointer;
        }
        .menu-item:hover {
            background-color: #3498db;
            color: white;
            cursor: pointer;
        }
    `;

    var styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Adiciona evento de clique no botão do menu
    menuButton.addEventListener('click', function() {
        if (menuContainer.style.display === 'none') {
            menuContainer.style.display = 'block';
        } else {
            menuContainer.style.display = 'none';
        }
    });





})();
