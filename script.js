// ========================================
// CONTROLE DE NOTAS FISCAIS
// ========================================

let notas = JSON.parse(localStorage.getItem("notasFiscais")) || [];

const statusDisponiveis = [
    "Pendente",
    "Em análise",
    "Aprovada",
    "Paga",
    "Cancelada"
];


// ========================================
// ELEMENTOS DA PÁGINA
// ========================================

const form = document.getElementById("formNF");
const listaNFs = document.getElementById("listaNFs");
const busca = document.getElementById("busca");
const filtroStatus = document.getElementById("filtroStatus");
const semResultados = document.getElementById("semResultados");


// ========================================
// SALVAR DADOS
// ========================================

function salvarDados() {
    localStorage.setItem("notasFiscais", JSON.stringify(notas));
}


// ========================================
// FORMATAR VALOR
// ========================================

function formatarValor(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


// ========================================
// FORMATAR DATA
// ========================================

function formatarData(data) {

    if (!data) {
        return "";
    }

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


// ========================================
// CLASSE DO STATUS
// ========================================

function classeStatus(status) {

    switch (status) {

        case "Pendente":
            return "status-pendente";

        case "Em análise":
            return "status-analise";

        case "Aprovada":
            return "status-aprovada";

        case "Paga":
            return "status-paga";

        case "Cancelada":
            return "status-cancelada";

        default:
            return "";
    }
}


// ========================================
// EXIBIR NOTAS
// ========================================

function exibirNotas() {

    const termo = busca.value.toLowerCase().trim();
    const statusSelecionado = filtroStatus.value;

    const notasFiltradas = notas.filter(nota => {

        const correspondeBusca =
            nota.numero.toLowerCase().includes(termo) ||
            nota.fornecedor.toLowerCase().includes(termo);

        const correspondeStatus =
            statusSelecionado === "Todos" ||
            nota.status === statusSelecionado;

        return correspondeBusca && correspondeStatus;
    });


    listaNFs.innerHTML = "";


    if (notasFiltradas.length === 0) {

        semResultados.style.display = "block";

    } else {

        semResultados.style.display = "none";

        notasFiltradas.forEach(nota => {

            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td><strong>${nota.numero}</strong></td>

                <td>${nota.fornecedor}</td>

                <td>${formatarValor(nota.valor)}</td>

                <td>${formatarData(nota.data)}</td>

                <td>${nota.observacao || "-"}</td>

                <td>
                    <select
                        class="status ${classeStatus(nota.status)}"
                        onchange="alterarStatus(${nota.id}, this.value)"
                    >
                        ${statusDisponiveis.map(status => `
                            <option
                                value="${status}"
                                ${status === nota.status ? "selected" : ""}
                            >
                                ${status}
                            </option>
                        `).join("")}
                    </select>
                </td>

                <td>
                    <button
                        class="btn-excluir"
                        onclick="excluirNota(${nota.id})"
                    >
                        Excluir
                    </button>
                </td>
            `;

            listaNFs.appendChild(linha);
        });
    }


    atualizarResumo();
}


// ========================================
// ADICIONAR NOTA
// ========================================

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const novaNota = {

        id: Date.now(),

        numero: document.getElementById("numero").value.trim(),

        fornecedor: document.getElementById("fornecedor").value.trim(),

        valor: Number(document.getElementById("valor").value),

        data: document.getElementById("data").value,

        observacao: document.getElementById("observacao").value.trim(),

        status: "Pendente"
    };


    notas.push(novaNota);

    salvarDados();

    form.reset();

    exibirNotas();
});


// ========================================
// ALTERAR STATUS
// ========================================

function alterarStatus(id, novoStatus) {

    const nota = notas.find(nota => nota.id === id);

    if (!nota) {
        return;
    }

    nota.status = novoStatus;

    salvarDados();

    exibirNotas();
}


// ========================================
// EXCLUIR NOTA
// ========================================

function excluirNota(id) {

    const nota = notas.find(nota => nota.id === id);

    if (!nota) {
        return;
    }

    const confirmar = confirm(
        `Deseja realmente excluir a NF ${nota.numero}?`
    );

    if (!confirmar) {
        return;
    }

    notas = notas.filter(nota => nota.id !== id);

    salvarDados();

    exibirNotas();
}


// ========================================
// ATUALIZAR RESUMO
// ========================================

function atualizarResumo() {

    const total = notas.length;

    const pendentes = notas.filter(
        nota => nota.status === "Pendente"
    ).length;

    const aprovadas = notas.filter(
        nota => nota.status === "Aprovada"
    ).length;

    const valorTotal = notas.reduce(
        (soma, nota) => soma + Number(nota.valor),
        0
    );


    document.getElementById("totalNFs").textContent = total;

    document.getElementById("totalPendentes").textContent = pendentes;

    document.getElementById("totalAprovadas").textContent = aprovadas;

    document.getElementById("valorTotal").textContent =
        formatarValor(valorTotal);
}


// ========================================
// FILTROS
// ========================================

busca.addEventListener("input", exibirNotas);

filtroStatus.addEventListener("change", exibirNotas);


// ========================================
// INICIALIZAÇÃO
// ========================================

exibirNotas();
