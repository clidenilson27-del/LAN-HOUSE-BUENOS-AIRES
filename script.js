document.addEventListener("DOMContentLoaded", () => {
    // --- ESTADOS DA APLICAÇÃO (LOCALSTORAGE) ---
    let clientes = JSON.parse(localStorage.getItem("lhab_clientes")) || [];
    let estoque = JSON.parse(localStorage.getItem("lhab_estoque")) || [];
    let servicos = JSON.parse(localStorage.getItem("lhab_servicos")) || [];

    // --- ELEMENTOS DOM ---
    const loginScreen = document.getElementById("login-screen");
    const appScreen = document.getElementById("app-screen");
    const formLogin = document.getElementById("form-login");
    const erroLogin = document.getElementById("erro-login");
    const btnSair = document.getElementById("btn-sair");

    const formCliente = document.getElementById("form-cliente");
    const formEstoque = document.getElementById("form-estoque");
    const formServico = document.getElementById("form-servico");

    const selectCliente = document.getElementById("select-cliente");
    const tabelaServicosBody = document.querySelector("#tabela-servicos tbody");
    const tabelaEstoqueBody = document.querySelector("#tabela-estoque tbody");

    const lblTotalServicos = document.getElementById("lbl-total-servicos");
    const lblTotalEstoque = document.getElementById("lbl-total-estoque");
    const lblTotalSobra = document.getElementById("lbl-total-sobra");

    // --- AUTENTICAÇÃO ---
    if (sessionStorage.getItem("lhab_autenticado") === "true") {
        exibirSistema();
    }

    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const senha = document.getElementById("senha").value;
        if (senha === "denilson27") {
            sessionStorage.setItem("lhab_autenticado", "true");
            erroLogin.textContent = "";
            exibirSistema();
        } else {
            erroLogin.textContent = "Senha incorreta! Tente novamente.";
        }
    });

    btnSair.addEventListener("click", () => {
        sessionStorage.removeItem("lhab_autenticado");
        appScreen.classList.add("hidden");
        loginScreen.classList.remove("hidden");
    });

    function exibirSistema() {
        loginScreen.classList.add("hidden");
        appScreen.classList.remove("hidden");
        atualizarTudo();
    }

    // --- CADASTRO DE CLIENTE ---
    formCliente.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = document.getElementById("nome-cliente").value.trim();
        const cpf = document.getElementById("cpf-cliente").value.trim();

        if (nome && cpf) {
            const novoCliente = { id: Date.now(), nome, cpf };
            clientes.push(novoCliente);
            salvarDados();
            formCliente.reset();
            atualizarClientesSelect();
        }
    });

    // --- CADASTRO DE ESTOQUE ---
    formEstoque.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = document.getElementById("nome-produto").value.trim();
        const valor = parseFloat(document.getElementById("valor-produto").value);

        if (nome && !isNaN(valor)) {
            const novoItem = { id: Date.now(), nome, valor };
            estoque.push(novoItem);
            salvarDados();
            formEstoque.reset();
            atualizarTabelaEstoque();
            atualizarFinanceiro();
        }
    });

    // --- REGISTRO DE SERVIÇO ---
    formServico.addEventListener("submit", (e) => {
        e.preventDefault();
        const nomeServico = document.getElementById("nome-servico").value.trim();
        const clienteId = document.getElementById("select-cliente").value;
        const valorServico = parseFloat(document.getElementById("valor-servico").value);
        const status = document.getElementById("status-pagamento").value;

        const clienteObj = clientes.find(c => c.id == clienteId);

        if (nomeServico && clienteObj && !isNaN(valorServico)) {
            const novoServico = {
                id: Date.now(),
                servico: nomeServico,
                clienteNome: clienteObj.nome,
                valor: valorServico,
                status: status
            };

            servicos.push(novoServico);
            salvarDados();
            formServico.reset();
            atualizarTabelaServicos();
            atualizarFinanceiro();
        }
    });

    // --- ATUALIZAÇÃO DA INTERFACE ---
    function atualizarTudo() {
        atualizarClientesSelect();
        atualizarTabelaEstoque();
        atualizarTabelaServicos();
        atualizarFinanceiro();
    }

    function atualizarClientesSelect() {
        selectCliente.innerHTML = '<option value="">Selecione o Cliente</option>';
        clientes.forEach(c => {
            const option = document.createElement("option");
            option.value = c.id;
            option.textContent = `${c.nome} (CPF: ${c.cpf})`;
            selectCliente.appendChild(option);
        });
    }

    function atualizarTabelaEstoque() {
        tabelaEstoqueBody.innerHTML = "";
        estoque.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.nome}</td>
                <td>R$ ${item.valor.toFixed(2).replace('.', ',')}</td>
            `;
            tabelaEstoqueBody.appendChild(tr);
        });
    }

    function atualizarTabelaServicos() {
        tabelaServicosBody.innerHTML = "";
        servicos.forEach(s => {
            const tr = document.createElement("tr");
            const classBadge = s.status === "Pago" ? "badge-pago" : "badge-pendente";
            tr.innerHTML = `
                <td>${s.servico}</td>
                <td>${s.clienteNome}</td>
                <td>R$ ${s.valor.toFixed(2).replace('.', ',')}</td>
                <td><span class="badge ${classBadge}">${s.status}</span></td>
                <td>
                    <button class="btn-acao btn-status" onclick="alternarStatusServico(${s.id})">Alternar Status</button>
                    <button class="btn-acao btn-excluir" onclick="excluirServico(${s.id})">Excluir</button>
                </td>
            `;
            tabelaServicosBody.appendChild(tr);
        });
    }

    function atualizarFinanceiro() {
        const totalServicos = servicos
            .filter(s => s.status === "Pago")
            .reduce((acc, s) => acc + s.valor, 0);

        const totalEstoque = estoque.reduce((acc, item) => acc + item.valor, 0);
        const sobra = totalServicos - totalEstoque;

        lblTotalServicos.textContent = `R$ ${totalServicos.toFixed(2).replace('.', ',')}`;
        lblTotalEstoque.textContent = `R$ ${totalEstoque.toFixed(2).replace('.', ',')}`;
        lblTotalSobra.textContent = `R$ ${sobra.toFixed(2).replace('.', ',')}`;
    }

    // --- AÇÕES GLOBAIS NA TABELA ---
    window.alternarStatusServico = function(id) {
        servicos = servicos.map(s => {
            if (s.id === id) {
                s.status = s.status === "Pago" ? "Pendente" : "Pago";
            }
            return s;
        });
        salvarDados();
        atualizarTabelaServicos();
        atualizarFinanceiro();
    };

    window.excluirServico = function(id) {
        if (confirm("Deseja realmente remover este registro de serviço?")) {
            servicos = servicos.filter(s => s.id !== id);
            salvarDados();
            atualizarTabelaServicos();
            atualizarFinanceiro();
        }
    };

    function salvarDados() {
        localStorage.setItem("lhab_clientes", JSON.stringify(clientes));
        localStorage.setItem("lhab_estoque", JSON.stringify(estoque));
        localStorage.setItem("lhab_servicos", JSON.stringify(servicos));
    }
});