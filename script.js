```javascript
// ======================================================
// CONTROLE DE DOCUMENTOS
// VERSÃO LOCAL
// ======================================================

let documentos = carregarDocumentos();

let configuracoes =
    JSON.parse(
        localStorage.getItem("configuracoesDocumentos")
    ) || {};


// ======================================================
// CARREGAR DOCUMENTOS
// ======================================================

function carregarDocumentos() {

    try {

        const dados =
            localStorage.getItem(
                "controleDocumentos"
            );

        if (!dados) {
            return [];
        }

        const lista = JSON.parse(dados);

        return Array.isArray(lista)
            ? lista
            : [];

    } catch (erro) {

        console.error(
            "Erro ao carregar documentos:",
            erro
        );

        return [];
    }
}


// ======================================================
// ELEMENTOS
// ======================================================

const form =
    document.getElementById(
        "formDocumento"
    );

const tabela =
    document.getElementById(
        "tabelaDocumentos"
    );

const semDocumentos =
    document.getElementById(
        "semDocumentos"
    );


// ======================================================
// SALVAR
// ======================================================

function salvar() {

    localStorage.setItem(
        "controleDocumentos",
        JSON.stringify(documentos)
    );
}


// ======================================================
// DATA DE HOJE
// ======================================================

function dataHoje() {

    const hoje = new Date();

    const ano =
        hoje.getFullYear();

    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            hoje.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


// ======================================================
// FORMATAR DATA
// ======================================================

function formatarData(data) {

    if (!data) {
        return "-";
    }

    const partes =
        String(data).split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


// ======================================================
// FORMATAR MOEDA
// ======================================================

function formatarMoeda(valor) {

    return Number(
        valor || 0
    ).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


// ======================================================
// CALCULAR DIAS
// ======================================================

function calcularDias(dataVencimento) {

    if (!dataVencimento) {
        return null;
    }

    const hoje = new Date();

    hoje.setHours(
        0, 0, 0, 0
    );


    const vencimento =
        new Date(
            `${dataVencimento}T00:00:00`
        );


    if (
        Number.isNaN(
            vencimento.getTime()
        )
    ) {

        return null;
    }


    const diferenca =
        vencimento.getTime() -
        hoje.getTime();


    return Math.ceil(
        diferenca /
        (1000 * 60 * 60 * 24)
    );
}


// ======================================================
// CLASSE DE STATUS
// ======================================================

function classeStatus(
    status,
    tipo
) {

    if (tipo === "aditivo") {

        return (
            status === "Não precisa" ||
            status === "Realizado"
        )
            ? "status-verde"
            : "status-vermelho";
    }


    if (tipo === "documento") {

        if (status === "Ativo") {
            return "status-verde";
        }

        if (
            status ===
            "Contestada/Recusada"
        ) {

            return "status-amarelo";
        }

        return "status-vermelho";
    }


    if (tipo === "validacao") {

        if (
            status === "Validado"
        ) {

            return "status-verde";
        }

        if (
            status === "Solicitado"
        ) {

            return "status-amarelo";
        }

        return "status-vermelho";
    }


    if (tipo === "baixa") {

        return status === "Baixada"
            ? "status-verde"
            : "status-vermelho";
    }


    return "";
}


// ======================================================
// SELECT DE STATUS
// ======================================================

function criarSelect(
    valor,
    opcoes,
    tipo,
    id,
    bloqueado = false
) {

    return `
        <select
            class="tabela-select ${classeStatus(
                valor,
                tipo
            )}"
            ${bloqueado ? "disabled" : ""}
            onchange="alterarStatus(
                ${id},
                '${tipo}',
                this.value
            )"
        >

            ${opcoes.map(
                opcao => `
                    <option
                        value="${opcao}"
                        ${valor === opcao
                            ? "selected"
                            : ""}
                    >
                        ${opcao}
                    </option>
                `
            ).join("")}

        </select>
    `;
}


// ======================================================
// ESCAPAR HTML
// Evita problemas quando houver caracteres especiais
// ======================================================

function escaparHTML(valor) {

    return String(
        valor ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// EXIBIR DOCUMENTOS
// ======================================================

function exibirDocumentos() {

    const filtros = {};


    document
        .querySelectorAll(
            "[data-filtro]"
        )
        .forEach(campo => {

            filtros[
                campo.dataset.filtro
            ] =
                campo.value
                    .toLowerCase()
                    .trim();
        });


    const lista =
        documentos.filter(
            documento => {

                for (
                    const campo
                    in filtros
                ) {

                    const filtro =
                        filtros[campo];


                    if (!filtro) {
                        continue;
                    }


                    // Filtro de vencimento
                    if (
                        campo ===
                        "vencimento"
                    ) {

                        const dias =
                            calcularDias(
                                documento
                                    .dataVencimento
                            );


                        if (
                            filtro ===
                            "proximo"
                        ) {

                            if (
                                dias === null ||
                                dias < 0 ||
                                dias > 7
                            ) {

                                return false;
                            }
                        }


                        if (
                            filtro ===
                            "vencido"
                        ) {

                            if (
                                dias === null ||
                                dias >= 0
                            ) {

                                return false;
                            }
                        }


                        continue;
                    }


                    const valor =
                        String(
                            documento[
                                campo
                            ] ?? ""
                        ).toLowerCase();


                    if (
                        !valor.includes(
                            filtro
                        )
                    ) {

                        return false;
                    }
                }


                return true;
            }
        );


    tabela.innerHTML = "";


    document.getElementById(
        "contadorResultados"
    ).textContent =
        `${lista.length} ${
            lista.length === 1
                ? "documento"
                : "documentos"
        }`;


    if (lista.length === 0) {

        semDocumentos.style.display =
            "block";

    } else {

        semDocumentos.style.display =
            "none";


        lista.forEach(
            documento => {

                const dias =
                    calcularDias(
                        documento
                            .dataVencimento
                    );


                let classeDias =
                    "dias-normal";


                if (
                    dias !== null &&
                    dias < 0
                ) {

                    classeDias =
                        "dias-vencido";

                } else if (
                    dias !== null &&
                    dias <= 7
                ) {

                    classeDias =
                        "dias-proximo";
                }


                const cancelado =
                    documento
                        .statusDocumento ===
                    "Cancelado";


                const linha =
                    document.createElement(
                        "tr"
                    );


                linha.innerHTML = `

                    <td>
                        ${escaparHTML(
                            documento
                                .tipoDocumento
                        )}
                    </td>


                    <td>
                        <input
                            class="tabela-input"
                            value="${escaparHTML(
                                documento.of
                            )}"
                            inputmode="numeric"
                            onchange="alterarCampo(
                                ${documento.id},
                                'of',
                                this.value
                            )"
                        >
                    </td>


                    <td>
                        <input
                            class="tabela-input"
                            value="${escaparHTML(
                                documento.ri
                            )}"
                            inputmode="numeric"
                            onchange="alterarCampo(
                                ${documento.id},
                                'ri',
                                this.value
                            )"
                        >
                    </td>


                    <td>
                        <input
                            class="tabela-input"
                            value="${escaparHTML(
                                documento.obra
                            )}"
                            inputmode="numeric"
                            onchange="alterarCampo(
                                ${documento.id},
                                'obra',
                                this.value
                            )"
                        >
                    </td>


                    <td>
                        <input
                            class="tabela-input"
                            value="${escaparHTML(
                                documento
                                    .numeroDocumento
                            )}"
                            onchange="alterarCampo(
                                ${documento.id},
                                'numeroDocumento',
                                this.value
                            )"
                        >
                    </td>


                    <td>
                        <input
                            class="tabela-input"
                            value="${escaparHTML(
                                documento
                                    .fornecedor
                            )}"
                            onchange="alterarCampo(
                                ${documento.id},
                                'fornecedor',
                                this.value
                            )"
                        >
                    </td>


                    <td>
                        <input
                            class="tabela-input"
                            value="${escaparHTML(
                                documento.cnpj
                            )}"
                            onchange="alterarCampo(
                                ${documento.id},
                                'cnpj',
                                this.value
                            )"
                        >
                    </td>


                    <td>
                        ${formatarData(
                            documento
                                .dataEmissao
                        )}
                    </td>


                    <td>
                        ${formatarData(
                            documento
                                .dataVencimento
                        )}
                    </td>


                    <td>
                        ${formatarData(
                            documento
                                .dataRecebimento
                        )}
                    </td>


                    <td class="${classeDias}">

                        ${
                            dias === null
                                ? "-"
                                : dias < 0
                                    ? `${Math.abs(
                                        dias
                                    )} dia(s) atrasado`
                                    : `${dias} dia(s)`
                        }

                    </td>


                    <td>
                        ${formatarMoeda(
                            documento.valor
                        )}
                    </td>


                    <td>

                        ${criarSelect(
                            documento.aditivo,
                            [
                                "Não precisa",
                                "Pendente",
                                "Realizado"
                            ],
                            "aditivo",
                            documento.id,
                            cancelado
                        )}

                    </td>


                    <td>

                        ${criarSelect(
                            documento.statusDocumento,
                            [
                                "Ativo",
                                "Cancelado",
                                "Contestada/Recusada"
                            ],
                            "documento",
                            documento.id
                        )}

                    </td>


                    <td>

                        ${criarSelect(
                            documento.validacao,
                            [
                                "Validado",
                                "Solicitado",
                                "Pendente"
                            ],
                            "validacao",
                            documento.id,
                            cancelado
                        )}

                    </td>


                    <td>

                        ${criarSelect(
                            documento.statusBaixa,
                            [
                                "Pendente",
                                "Baixada"
                            ],
                            "baixa",
                            documento.id,
                            cancelado
                        )}

                    </td>


                    <td>

                        <input
                            class="tabela-input"
                            value="${escaparHTML(
                                documento.tratativa
                            )}"
                            placeholder="Tratativa..."
                            onchange="alterarCampo(
                                ${documento.id},
                                'tratativa',
                                this.value
                            )"
                        >

                    </td>


                    <td>

                        <button
                            class="btn-excluir"
                            onclick="excluirDocumento(
                                ${documento.id}
                            )"
                        >
                            Excluir
                        </button>

                    </td>

                `;


                tabela.appendChild(
                    linha
                );
            }
        );
    }


    atualizarDashboard();
}


// ======================================================
// ADICIONAR DOCUMENTO
// ======================================================

form.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const ri =
            document
                .getElementById("ri")
                .value
                .replace(/\D/g, "");


        const novoDocumento = {

            id:
                Date.now() +
                Math.floor(
                    Math.random() * 1000
                ),

            tipoDocumento:
                document
                    .getElementById(
                        "tipoDocumento"
                    )
                    .value,

            of:
                document
                    .getElementById("of")
                    .value
                    .replace(/\D/g, ""),

            ri: ri,

            obra:
                document
                    .getElementById("obra")
                    .value
                    .replace(/\D/g, ""),

            numeroDocumento:
                document
                    .getElementById(
                        "numeroDocumento"
                    )
                    .value
                    .trim(),

            fornecedor:
                document
                    .getElementById(
                        "fornecedor"
                    )
                    .value
                    .trim(),

            cnpj:
                document
                    .getElementById(
                        "cnpj"
                    )
                    .value
                    .trim(),

            dataEmissao:
                document
                    .getElementById(
                        "dataEmissao"
                    )
                    .value,

            dataVencimento:
                document
                    .getElementById(
                        "dataVencimento"
                    )
                    .value,

            dataRecebimento:
                dataHoje(),

            valor:
                Number(
                    document
                        .getElementById(
                            "valor"
                        )
                        .value || 0
                ),

            aditivo:
                "Não precisa",

            statusDocumento:
                "Ativo",

            validacao:
                "Pendente",

            statusBaixa:
                ri
                    ? "Baixada"
                    : "Pendente",

            tratativa:
                document
                    .getElementById(
                        "tratativa"
                    )
                    .value
                    .trim()
        };


        documentos.push(
            novoDocumento
        );


        salvar();


        form.reset();


        exibirDocumentos();


        alert(
            "Documento adicionado com sucesso."
        );
    }
);


// ======================================================
// ALTERAR CAMPO
// ======================================================

function alterarCampo(
    id,
    campo,
    valor
) {

    const documento =
        documentos.find(
            item => item.id === id
        );


    if (!documento) {
        return;
    }


    if (
        campo === "of" ||
        campo === "ri" ||
        campo === "obra"
    ) {

        valor =
            valor.replace(
                /\D/g,
                ""
            );
    }


    documento[campo] =
        valor;


    // RI preenchido = Baixada
    if (
        campo === "ri" &&
        valor.trim() !== ""
    ) {

        documento.statusBaixa =
            "Baixada";
    }


    salvar();

    exibirDocumentos();
}


// ======================================================
// ALTERAR STATUS
// ======================================================

function alterarStatus(
    id,
    tipo,
    valor
) {

    const documento =
        documentos.find(
            item => item.id === id
        );


    if (!documento) {
        return;
    }


    if (
        tipo === "aditivo"
    ) {

        documento.aditivo =
            valor;
    }


    if (
        tipo === "documento"
    ) {

        documento.statusDocumento =
            valor;


        if (
            valor === "Cancelado"
        ) {

            documento.aditivo =
                "";

            documento.validacao =
                "";

            documento.statusBaixa =
                "";
        }


        if (
            valor !== "Cancelado"
        ) {

            if (
                !documento.aditivo
            ) {

                documento.aditivo =
                    "Não precisa";
            }


            if (
                !documento.validacao
            ) {

                documento.validacao =
                    "Pendente";
            }


            if (
                !documento.statusBaixa
            ) {

                documento.statusBaixa =
                    documento.ri
                        ? "Baixada"
                        : "Pendente";
            }
        }
    }


    if (
        tipo === "validacao"
    ) {

        documento.validacao =
            valor;
    }


    if (
        tipo === "baixa"
    ) {

        documento.statusBaixa =
            valor;
    }


    salvar();

    exibirDocumentos();
}


// ======================================================
// EXCLUIR
// ======================================================

function excluirDocumento(id) {

    const documento =
        documentos.find(
            item => item.id === id
        );


    if (!documento) {
        return;
    }


    const confirmar =
        confirm(
            `Deseja excluir o documento ${documento.numeroDocumento}?`
        );


    if (!confirmar) {
        return;
    }


    documentos =
        documentos.filter(
            item => item.id !== id
        );


    salvar();

    exibirDocumentos();
}


// ======================================================
// DASHBOARD
// ======================================================

function atualizarDashboard() {

    const total =
        documentos.length;


    const aditivosPendentes =
        documentos.filter(
            d =>
                d.aditivo ===
                "Pendente"
        ).length;


    const aditivosRealizados =
        documentos.filter(
            d =>
                d.aditivo ===
                "Realizado"
        ).length;


    const validacoesPendentes =
        documentos.filter(
            d =>
                d.validacao ===
                "Pendente"
        ).length;


    const proximos =
        documentos.filter(
            d => {

                const dias =
                    calcularDias(
                        d.dataVencimento
                    );

                return (
                    dias !== null &&
                    dias >= 0 &&
                    dias <= 7
                );
            }
        ).length;


    const vencidos =
        documentos.filter(
            d => {

                const dias =
                    calcularDias(
                        d.dataVencimento
                    );

                return (
                    dias !== null &&
                    dias < 0
                );
            }
        ).length;


    document.getElementById(
        "totalDocumentos"
    ).textContent =
        total;


    document.getElementById(
        "totalAditivosPendentes"
    ).textContent =
        aditivosPendentes;


    document.getElementById(
        "totalAditivosRealizados"
    ).textContent =
        aditivosRealizados;


    document.getElementById(
        "totalValidacoesPendentes"
    ).textContent =
        validacoesPendentes;


    document.getElementById(
        "totalProximosVencimento"
    ).textContent =
        proximos;


    document.getElementById(
        "totalVencidos"
    ).textContent =
        vencidos;
}


// ======================================================
// FILTROS
// ======================================================

document
    .querySelectorAll(
        "[data-filtro]"
    )
    .forEach(campo => {

        campo.addEventListener(
            "input",
            exibirDocumentos
        );

        campo.addEventListener(
            "change",
            exibirDocumentos
        );
    });


function limparFiltros() {

    document
        .querySelectorAll(
            "[data-filtro]"
        )
        .forEach(
            campo => {
                campo.value = "";
            }
        );


    exibirDocumentos();
}


// ======================================================
// MODELO EXCEL
// ======================================================

function baixarModeloExcel() {

    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "A biblioteca do Excel ainda não carregou. Atualize a página e tente novamente."
        );

        return;
    }


    const dados = [

        {
            "Tipo de Documento": "NFE",
            "OF": "12345",
            "RI": "",
            "Obra": "100",
            "Número do documento": "98765",
            "Fornecedor": "Fornecedor Exemplo",
            "CNPJ do fornecedor": "00.000.000/0001-00",
            "Data da emissão": "17/09/2026",
            "Data do vencimento": "17/10/2026",
            "Valor da nota": 1500
        }

    ];


    const planilha =
        XLSX.utils.json_to_sheet(
            dados
        );


    const livro =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        livro,
        planilha,
        "Documentos"
    );


    XLSX.writeFile(
        livro,
        "modelo_importacao_documentos.xlsx"
    );
}


// ======================================================
// IMPORTAR EXCEL
// ======================================================

function importarExcel(event) {

    const arquivo =
        event.target.files[0];


    if (!arquivo) {
        return;
    }


    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "A biblioteca do Excel não carregou. Atualize a página e tente novamente."
        );

        return;
    }


    const leitor =
        new FileReader();


    leitor.onload =
        function(e) {

            try {

                const dados =
                    new Uint8Array(
                        e.target.result
                    );


                const livro =
                    XLSX.read(
                        dados,
                        {
                            type: "array"
                        }
                    );


                const nomeAba =
                    livro.SheetNames[0];


                const aba =
                    livro.Sheets[
                        nomeAba
                    ];


                const linhas =
                    XLSX.utils.sheet_to_json(
                        aba,
                        {
                            defval: ""
                        }
                    );


                if (
                    linhas.length === 0
                ) {

                    alert(
                        "A planilha está vazia."
                    );

                    return;
                }


                let adicionados = 0;


                linhas.forEach(
                    linha => {

                        const tipo =
                            String(
                                linha[
                                    "Tipo de Documento"
                                ] || ""
                            ).trim();


                        const numero =
                            String(
                                linha[
                                    "Número do documento"
                                ] || ""
                            ).trim();


                        const fornecedor =
                            String(
                                linha[
                                    "Fornecedor"
                                ] || ""
                            ).trim();


                        // Ignora linhas vazias/incompletas
                        if (
                            !tipo ||
                            !numero ||
                            !fornecedor
                        ) {

                            return;
                        }


                        const ri =
                            String(
                                linha["RI"] || ""
                            )
                            .replace(
                                /\D/g,
                                ""
                            );


                        const novo =
                            {

                                id:
                                    Date.now() +
                                    Math.floor(
                                        Math.random() *
                                        1000000
                                    ),

                                tipoDocumento:
                                    tipo.toUpperCase(),

                                of:
                                    String(
                                        linha["OF"] ||
                                        ""
                                    )
                                    .replace(
                                        /\D/g,
                                        ""
                                    ),

                                ri: ri,

                                obra:
                                    String(
                                        linha["Obra"] ||
                                        ""
                                    )
                                    .replace(
                                        /\D/g,
                                        ""
                                    ),

                                numeroDocumento:
                                    numero,

                                fornecedor:
                                    fornecedor,

                                cnpj:
                                    String(
                                        linha[
                                            "CNPJ do fornecedor"
                                        ] || ""
                                    ),

                                dataEmissao:
                                    converterDataExcel(
                                        linha[
                                            "Data da emissão"
                                        ]
                                    ),

                                dataVencimento:
                                    converterDataExcel(
                                        linha[
                                            "Data do vencimento"
                                        ]
                                    ),

                                dataRecebimento:
                                    dataHoje(),

                                valor:
                                    converterValor(
                                        linha[
                                            "Valor da nota"
                                        ]
                                    ),

                                aditivo:
                                    "Não precisa",

                                statusDocumento:
                                    "Ativo",

                                validacao:
                                    "Pendente",

                                statusBaixa:
                                    ri
                                        ? "Baixada"
                                        : "Pendente",

                                tratativa:
                                    ""
                            };


                        documentos.push(
                            novo
                        );


                        adicionados++;
                    }
                );


                salvar();

                exibirDocumentos();


                alert(
                    `${adicionados} documento(s) importado(s) com sucesso.`
                );


            } catch (erro) {

                console.error(
                    "Erro ao importar:",
                    erro
                );


                alert(
                    "Não foi possível ler a planilha. Baixe o modelo e confira os nomes das colunas."
                );
            }


            event.target.value = "";
        };


    leitor.readAsArrayBuffer(
        arquivo
    );
}


// ======================================================
// CONVERTER VALOR
// ======================================================

function converterValor(valor) {

    if (
        typeof valor ===
        "number"
    ) {

        return valor;
    }


    if (!valor) {
        return 0;
    }


    let texto =
        String(valor)
            .trim();


    // Exemplo: R$ 1.500,50
    texto =
        texto
            .replace(
                /R\$/gi,
                ""
            )
            .trim();


    if (
        texto.includes(",")
    ) {

        texto =
            texto
                .replace(
                    /\./g,
                    ""
                )
                .replace(
                    ",",
                    "."
                );
    }


    const numero =
        Number(texto);


    return Number.isNaN(
        numero
    )
        ? 0
        : numero;
}


// ======================================================
// CONVERTER DATA DO EXCEL
// ======================================================

function converterDataExcel(
    valor
) {

    if (!valor) {
        return "";
    }


    if (
        typeof valor ===
        "number"
    ) {

        const data =
            XLSX.SSF.parse_date_code(
                valor
            );


        if (!data) {
            return "";
        }


        return `${data.y}-${String(
            data.m
        ).padStart(2, "0")}-${String(
            data.d
        ).padStart(2, "0")}`;
    }


    const texto =
        String(valor).trim();


    if (
        texto.includes("/")
    ) {

        const partes =
            texto.split("/");


        if (
            partes.length === 3
        ) {

            let dia =
                partes[0];

            let mes =
                partes[1];

            let ano =
                partes[2];


            if (
                ano.length === 2
            ) {

                ano =
                    "20" + ano;
            }


            return `${ano}-${String(
                mes
            ).padStart(2, "0")}-${String(
                dia
            ).padStart(2, "0")}`;
        }
    }


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            texto
        )
    ) {

        return texto;
    }


    return "";
}


// ======================================================
// EXPORTAR EXCEL
// ======================================================

function exportarExcel() {

    if (
        documentos.length === 0
    ) {

        alert(
            "Não existem documentos para exportar."
        );

        return;
    }


    const dados =
        documentos.map(
            documento => ({

                "Tipo de Documento":
                    documento.tipoDocumento,

                "OF":
                    documento.of,

                "RI":
                    documento.ri,

                "Obra":
                    documento.obra,

                "Número do documento":
                    documento.numeroDocumento,

                "Fornecedor":
                    documento.fornecedor,

                "CNPJ do fornecedor":
                    documento.cnpj,

                "Data da emissão":
                    documento.dataEmissao,

                "Data do vencimento":
                    documento.dataVencimento,

                "Data do recebimento":
                    documento.dataRecebimento,

                "Dias para vencer":
                    calcularDias(
                        documento
                            .dataVencimento
                    ),

                "Valor da nota":
                    documento.valor,

                "Aditivo":
                    documento.aditivo,

                "Status do Documento":
                    documento.statusDocumento,

                "Validação":
                    documento.validacao,

                "Status da baixa":
                    documento.statusBaixa,

                "Tratativa":
                    documento.tratativa

            })
        );


    const planilha =
        XLSX.utils.json_to_sheet(
            dados
        );


    const livro =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        livro,
        planilha,
        "Documentos"
    );


    XLSX.writeFile(
        livro,
        `controle_documentos_${dataHoje()}.xlsx`
    );
}


// ======================================================
// BACKUP
// ======================================================

function fazerBackup() {

    const backup = {

        dataBackup:
            new Date().toISOString(),

        documentos:
            documentos,

        configuracoes:
            configuracoes
    };


    const arquivo =
        new Blob(
            [
                JSON.stringify(
                    backup,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            arquivo
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;


    link.download =
        `backup_documentos_${dataHoje()}.json`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );
}


// ======================================================
// RESTAURAR BACKUP
// ======================================================

function restaurarBackup(
    event
) {

    const arquivo =
        event.target.files[0];


    if (!arquivo) {
        return;
    }


    const leitor =
        new FileReader();


    leitor.onload =
        function(e) {

            try {

                const backup =
                    JSON.parse(
                        e.target.result
                    );


                if (
                    !backup.documentos ||
                    !Array.isArray(
                        backup.documentos
                    )
                ) {

                    throw new Error(
                        "Backup inválido"
                    );
                }


                const confirmar =
                    confirm(
                        "Restaurar este backup substituirá os dados atuais. Deseja continuar?"
                    );


                if (!confirmar) {
                    return;
                }


                documentos =
                    backup.documentos;


                configuracoes =
                    backup.configuracoes ||
                    {};


                salvar();


                localStorage.setItem(
                    "configuracoesDocumentos",
                    JSON.stringify(
                        configuracoes
                    )
                );


                carregarLogo();

                exibirDocumentos();


                alert(
                    "Backup restaurado com sucesso."
                );


            } catch (erro) {

                console.error(
                    erro
                );


                alert(
                    "Arquivo de backup inválido."
                );
            }


            event.target.value = "";
        };


    leitor.readAsText(
        arquivo
    );
}


// ======================================================
// LOGO
// ======================================================

function abrirConfiguracoes() {

    document.getElementById(
        "modalConfiguracoes"
    ).style.display =
        "flex";
}


function fecharConfiguracoes() {

    document.getElementById(
        "modalConfiguracoes"
    ).style.display =
        "none";
}


function salvarLogo() {

    const arquivo =
        document.getElementById(
            "arquivoLogo"
        ).files[0];


    if (!arquivo) {

        alert(
            "Selecione uma imagem."
        );

        return;
    }


    const leitor =
        new FileReader();


    leitor.onload =
        function(e) {

            configuracoes.logo =
                e.target.result;


            localStorage.setItem(
                "configuracoesDocumentos",
                JSON.stringify(
                    configuracoes
                )
            );


            carregarLogo();


            fecharConfiguracoes();


            alert(
                "Logo salvo com sucesso."
            );
        };


    leitor.readAsDataURL(
        arquivo
    );
}


function carregarLogo() {

    const container =
        document.getElementById(
            "logoContainer"
        );


    if (
        configuracoes.logo
    ) {

        container.innerHTML =
            `<img
                src="${configuracoes.logo}"
                alt="Logo da empresa"
            >`;

    } else {

        container.innerHTML =
            "<span>LOGO</span>";
    }
}


function removerLogo() {

    configuracoes.logo =
        "";


    localStorage.setItem(
        "configuracoesDocumentos",
        JSON.stringify(
            configuracoes
        )
    );


    carregarLogo();
}


// ======================================================
// INICIALIZAÇÃO
// ======================================================

carregarLogo();

exibirDocumentos();
```
