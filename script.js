/* ==========================================
   FLEXFLOW — Lógica do sistema
   Foco: prazos, processos e compliance LGPD
   ========================================== */

class FlexFlow {
    constructor() {
        this.processes = this.loadProcesses();
        this.lgpdItems = this.loadLgpd();
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupModals();
        this.setupForms();
        this.setupFilters();
        this.setupLgpd();
        this.setupAutomations();
        this.renderAll();
    }

    renderAll() {
        this.renderProcessTable();
        this.renderDashboard();
        this.renderLgpd();
        this.updateAlertCount();
    }

    /* ========== PERSISTÊNCIA ========== */
    loadProcesses() {
        try {
            const saved = JSON.parse(localStorage.getItem('flexflow_processes'));
            if (Array.isArray(saved) && saved.length) return saved;
        } catch (e) { /* dados corrompidos: cai no padrão */ }
        return this.getDefaultProcesses();
    }

    saveProcesses() {
        localStorage.setItem('flexflow_processes', JSON.stringify(this.processes));
    }

    loadLgpd() {
        try {
            const saved = JSON.parse(localStorage.getItem('flexflow_lgpd'));
            if (Array.isArray(saved) && saved.length) return saved;
        } catch (e) { /* idem */ }
        return [
            { texto: 'Nomear Encarregado de Dados (DPO)',   feito: true },
            { texto: 'Mapear fluxo de dados pessoais',        feito: true },
            { texto: 'Política de Privacidade atualizada',    feito: true },
            { texto: 'Termo de Consentimento revisado',       feito: false },
            { texto: 'Relatório de Impacto (RIPD) elaborado', feito: false },
            { texto: 'Treinamento LGPD da equipe',            feito: false }
        ];
    }

    saveLgpd() {
        localStorage.setItem('flexflow_lgpd', JSON.stringify(this.lgpdItems));
    }

    /* ========== DADOS DEMO ========== */
    getDefaultProcesses() {
        // Prazos relativos à data atual, para a demo nunca "envelhecer"
        const hoje = new Date();
        const emDias = (n) => {
            const d = new Date(hoje);
            d.setDate(d.getDate() + n);
            return d.toISOString().slice(0, 10);
        };
        return [
            { id: 1, numero: '0012345-67.2026.8.04.0001', cliente: 'Silva & Associados',  tipo: 'trabalhista', status: 'em_andamento', prioridade: 'alta',  prazo: emDias(2),   descricao: 'Ação trabalhista, verbas rescisórias' },
            { id: 2, numero: '0056789-01.2026.8.04.0001', cliente: 'Construtora Beta',     tipo: 'civil',       status: 'aguardando',   prioridade: 'media', prazo: emDias(4),   descricao: 'Ação de indenização por danos materiais' },
            { id: 3, numero: '0090123-45.2026.8.04.0001', cliente: 'Martins Advogados',    tipo: 'tributario',  status: 'em_andamento', prioridade: 'alta',  prazo: emDias(1),   descricao: 'Execução fiscal, ISSQN' },
            { id: 4, numero: '0034567-89.2026.8.04.0001', cliente: 'Saúde Total Ltda',     tipo: 'civil',       status: 'concluido',    prioridade: 'baixa', prazo: emDias(-12), descricao: 'Cobrança de honorários advocatícios' },
            { id: 5, numero: '0078901-23.2026.8.04.0001', cliente: 'Transportes Amazonas', tipo: 'empresarial', status: 'em_andamento', prioridade: 'media', prazo: emDias(9),   descricao: 'Revisão contratual de prestação de serviços' },
            { id: 6, numero: '0011223-44.2026.8.04.0001', cliente: 'Comércio União ME',    tipo: 'civil',       status: 'aguardando',   prioridade: 'baixa', prazo: emDias(16),  descricao: 'Defesa em ação de cobrança' }
        ];
    }

    /* ========== SEGURANÇA: escapa HTML antes de injetar ========== */
    esc(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /* ========== NAVEGAÇÃO ========== */
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const tabContents = document.querySelectorAll('.tab-content');
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('sidebarBackdrop');

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            backdrop?.classList.remove('show');
        };

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = item.dataset.tab;

                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                tabContents.forEach(tab => tab.classList.remove('active'));
                document.getElementById(`tab-${tabName}`)?.classList.add('active');

                this.currentTab = tabName;
                if (window.innerWidth <= 768) closeSidebar();
            });
        });

        menuToggle?.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            backdrop?.classList.toggle('show');
        });

        backdrop?.addEventListener('click', closeSidebar);
    }

    /* ========== MODAIS ========== */
    setupModals() {
        const modalForm = document.getElementById('modalProcesso');
        const modalView = document.getElementById('modalView');

        document.getElementById('btnNovoProcesso')?.addEventListener('click', () => this.openModal(modalForm));
        document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal(modalForm));
        document.getElementById('cancelModal')?.addEventListener('click', () => this.closeModal(modalForm));
        document.getElementById('closeView')?.addEventListener('click', () => this.closeModal(modalView));

        [modalForm, modalView].forEach(modal => {
            modal?.addEventListener('click', (e) => { if (e.target === modal) this.closeModal(modal); });
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modalForm);
                this.closeModal(modalView);
            }
        });
    }

    openModal(modal) { modal?.classList.add('open'); }
    closeModal(modal) { modal?.classList.remove('open'); }

    /* ========== FORMULÁRIO ========== */
    setupForms() {
        document.getElementById('processForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProcess();
        });
    }

    addProcess() {
        const numEl = document.getElementById('numProcesso');
        const cliEl = document.getElementById('cliente');
        const prazoEl = document.getElementById('prazo');
        const errEl = document.getElementById('formError');

        const numero = numEl.value.trim();
        const cliente = cliEl.value.trim();
        const prazo = prazoEl.value;

        [numEl, cliEl, prazoEl].forEach(el => el.classList.remove('field-error'));
        errEl.textContent = '';

        const faltando = [];
        if (!numero)  { numEl.classList.add('field-error');  faltando.push('Número'); }
        if (!cliente) { cliEl.classList.add('field-error');  faltando.push('Cliente'); }
        if (!prazo)   { prazoEl.classList.add('field-error'); faltando.push('Prazo'); }

        if (faltando.length) {
            errEl.textContent = `Preencha: ${faltando.join(', ')}.`;
            return;
        }

        this.processes.push({
            id: Date.now(),
            numero,
            cliente,
            tipo: document.getElementById('tipoAcao').value,
            status: document.getElementById('statusProcesso').value,
            prioridade: document.getElementById('prioridade').value,
            prazo,
            descricao: document.getElementById('descricao').value.trim()
        });

        this.saveProcesses();
        this.renderAll();
        this.closeModal(document.getElementById('modalProcesso'));
        document.getElementById('processForm').reset();
        this.showToast('Processo cadastrado com sucesso');
    }

    /* ========== TABELA ========== */
    renderProcessTable(filteredData = null) {
        const tbody = document.getElementById('processTableBody');
        if (!tbody) return;

        const data = filteredData || this.processes;

        if (!data.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2.5rem;color:var(--text-muted);">Nenhum processo encontrado</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(proc => {
            const dias = this.getDaysLeft(proc.prazo);
            const venc = (proc.status !== 'concluido' && dias <= 3);
            return `
            <tr>
                <td class="row-num">${this.esc(proc.numero)}</td>
                <td>${this.esc(proc.cliente)}</td>
                <td>${this.getTipoLabel(proc.tipo)}</td>
                <td>${this.getStatusBadge(proc.status)}</td>
                <td>${this.getPrioridadeBadge(proc.prioridade)}</td>
                <td class="deadline-cell ${venc ? 'deadline-urgent' : ''}">${this.formatDate(proc.prazo)}</td>
                <td style="white-space:nowrap;">
                    <button class="btn btn-sm btn-outline btn-icon" title="Ver detalhes" onclick="app.viewProcess(${proc.id})"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-sm btn-outline btn-icon" title="Excluir" onclick="app.deleteProcess(${proc.id})"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;
        }).join('');
    }

    viewProcess(id) {
        const proc = this.processes.find(p => p.id === id);
        if (!proc) return;
        const dias = this.getDaysLeft(proc.prazo);
        let prazoTxt = this.formatDate(proc.prazo);
        if (proc.status !== 'concluido') {
            if (dias < 0)      prazoTxt += ` (vencido há ${Math.abs(dias)} dia${Math.abs(dias) === 1 ? '' : 's'})`;
            else if (dias === 0) prazoTxt += ' (vence hoje)';
            else                 prazoTxt += ` (faltam ${dias} dia${dias === 1 ? '' : 's'})`;
        }

        document.getElementById('viewBody').innerHTML = `
            <div class="detail-list">
                <div class="detail-row"><span class="detail-label">Número</span><span class="detail-value">${this.esc(proc.numero)}</span></div>
                <div class="detail-row"><span class="detail-label">Cliente</span><span class="detail-value">${this.esc(proc.cliente)}</span></div>
                <div class="detail-row"><span class="detail-label">Tipo</span><span class="detail-value">${this.getTipoLabel(proc.tipo)}</span></div>
                <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${this.getStatusBadge(proc.status)}</span></div>
                <div class="detail-row"><span class="detail-label">Prioridade</span><span class="detail-value">${this.getPrioridadeBadge(proc.prioridade)}</span></div>
                <div class="detail-row"><span class="detail-label">Prazo</span><span class="detail-value ${proc.status !== 'concluido' && dias <= 3 ? 'text-danger' : ''}">${prazoTxt}</span></div>
                <div class="detail-row"><span class="detail-label">Descrição</span><span class="detail-value">${this.esc(proc.descricao) || '<span style="color:var(--text-muted)">Nenhuma</span>'}</span></div>
            </div>`;
        this.openModal(document.getElementById('modalView'));
    }

    deleteProcess(id) {
        if (!confirm('Tem certeza que deseja excluir este processo?')) return;
        this.processes = this.processes.filter(p => p.id !== id);
        this.saveProcesses();
        this.renderAll();
        this.applyCurrentFilters();
        this.showToast('Processo excluído');
    }

    /* ========== FILTROS ========== */
    setupFilters() {
        ['filterStatus', 'filterPriority', 'searchProcess'].forEach(idAttr => {
            const el = document.getElementById(idAttr);
            const evt = idAttr === 'searchProcess' ? 'input' : 'change';
            el?.addEventListener(evt, () => this.applyCurrentFilters());
        });
    }

    applyCurrentFilters() {
        const status = document.getElementById('filterStatus')?.value;
        const priority = document.getElementById('filterPriority')?.value;
        const search = document.getElementById('searchProcess')?.value.toLowerCase().trim();

        let filtered = [...this.processes];
        if (status)   filtered = filtered.filter(p => p.status === status);
        if (priority) filtered = filtered.filter(p => p.prioridade === priority);
        if (search)   filtered = filtered.filter(p =>
            p.numero.toLowerCase().includes(search) || p.cliente.toLowerCase().includes(search)
        );
        this.renderProcessTable(filtered);
    }

    /* ========== DASHBOARD (derivado dos dados reais) ========== */
    renderDashboard() {
        const ativos = this.processes.filter(p => p.status !== 'concluido');
        const concluidos = this.processes.filter(p => p.status === 'concluido');
        const urgentes = ativos.filter(p => this.getDaysLeft(p.prazo) <= 3);
        const aguardando = this.processes.filter(p => p.status === 'aguardando');
        const emAndamento = this.processes.filter(p => p.status === 'em_andamento');

        this.setText('statAtivos', ativos.length);
        this.setText('statUrgentes', urgentes.length);
        this.setText('statConcluidos', concluidos.length);
        this.setText('statLgpd', this.lgpdPercent() + '%');

        // Gráfico de barras proporcional ao maior valor
        const valores = {
            andamento: emAndamento.length,
            aguardando: aguardando.length,
            concluidos: concluidos.length,
            urgentes: urgentes.length
        };
        const max = Math.max(...Object.values(valores), 1);
        const maxH = 170;
        const setBar = (key, sel) => {
            const wrap = document.querySelector(sel);
            if (!wrap) return;
            wrap.querySelector('.bar-value').textContent = valores[key];
            wrap.querySelector('.bar').style.height = `${Math.round((valores[key] / max) * maxH) + 4}px`;
        };
        setBar('andamento', '#bar-andamento');
        setBar('aguardando', '#bar-aguardando');
        setBar('concluidos', '#bar-concluidos');
        setBar('urgentes', '#bar-urgentes');

        // Lista de alertas: processos não concluídos ordenados por prazo
        const alertList = document.getElementById('alertList');
        if (alertList) {
            const proximos = ativos
                .map(p => ({ ...p, dias: this.getDaysLeft(p.prazo) }))
                .filter(p => p.dias <= 7)
                .sort((a, b) => a.dias - b.dias)
                .slice(0, 4);

            if (!proximos.length) {
                alertList.innerHTML = `<div class="alert-empty">Nenhum prazo nos próximos 7 dias</div>`;
            } else {
                alertList.innerHTML = proximos.map(p => {
                    const urgente = p.dias <= 2;
                    let txt;
                    if (p.dias < 0)      txt = `Vencido há ${Math.abs(p.dias)} dia${Math.abs(p.dias) === 1 ? '' : 's'}`;
                    else if (p.dias === 0) txt = 'Vence hoje';
                    else if (p.dias === 1) txt = 'Vence amanhã';
                    else                   txt = `Vence em ${p.dias} dias`;
                    return `
                    <div class="alert-item ${urgente ? 'alert-urgent' : 'alert-moderate'}">
                        <strong>Processo ${this.esc(p.numero.split('-')[0] || p.numero)}</strong><br>
                        <small>Cliente: ${this.esc(p.cliente)}</small><br>
                        <small class="${urgente ? 'text-danger' : 'text-warning'}">${txt}</small>
                    </div>`;
                }).join('');
            }
        }

        const alertBadgeText = document.getElementById('alertHeaderBadge');
        if (alertBadgeText) alertBadgeText.textContent = `${urgentes.length} urgente${urgentes.length === 1 ? '' : 's'}`;
    }

    setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    updateAlertCount() {
        const badge = document.getElementById('alertCount');
        if (!badge) return;
        const urgentes = this.processes.filter(p =>
            p.status !== 'concluido' && this.getDaysLeft(p.prazo) <= 3
        );
        badge.textContent = urgentes.length;
        badge.style.display = urgentes.length === 0 ? 'none' : 'inline';
    }

    /* ========== LGPD ========== */
    setupLgpd() {
        const list = document.getElementById('lgpdChecklist');
        list?.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"]')) {
                const idx = Number(e.target.dataset.idx);
                if (!Number.isNaN(idx)) {
                    this.lgpdItems[idx].feito = e.target.checked;
                    this.saveLgpd();
                    this.renderLgpd();
                    this.setText('statLgpd', this.lgpdPercent() + '%');
                }
            }
        });
    }

    lgpdPercent() {
        if (!this.lgpdItems.length) return 0;
        const feitos = this.lgpdItems.filter(i => i.feito).length;
        return Math.round((feitos / this.lgpdItems.length) * 100);
    }

    renderLgpd() {
        const list = document.getElementById('lgpdChecklist');
        if (list) {
            list.innerHTML = this.lgpdItems.map((item, i) => `
                <label class="checklist-item ${item.feito ? 'completed' : ''}">
                    <input type="checkbox" data-idx="${i}" ${item.feito ? 'checked' : ''}>
                    <span class="checklist-text">${this.esc(item.texto)}</span>
                </label>`).join('');
        }

        const pct = this.lgpdPercent();
        const feitos = this.lgpdItems.filter(i => i.feito).length;

        const circle = document.getElementById('lgpdCircle');
        if (circle) circle.style.background = `conic-gradient(var(--teal) 0% ${pct}%, var(--line) ${pct}% 100%)`;
        this.setText('lgpdInner', pct + '%');
        this.setText('lgpdCount', `${feitos} de ${this.lgpdItems.length} itens concluídos`);

        const badge = document.getElementById('lgpdBadge');
        if (badge) badge.textContent = pct + '%';
    }

    /* ========== AUTOMAÇÕES (toggles funcionais) ========== */
    setupAutomations() {
        document.querySelectorAll('.automation-item .switch input').forEach(input => {
            input.addEventListener('change', () => {
                const nome = input.dataset.nome || 'Automação';
                this.showToast(`${nome}: ${input.checked ? 'ativada' : 'pausada'}`);
            });
        });
    }

    /* ========== UTILITÁRIOS ========== */
    getDaysLeft(prazo) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const deadline = new Date(prazo + 'T00:00:00');
        return Math.ceil((deadline - today) / 86400000);
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const [y, m, d] = dateString.split('-');
        return `${d}/${m}/${y}`;
    }

    getTipoLabel(t) {
        return { civil: 'Civil', criminal: 'Criminal', trabalhista: 'Trabalhista', tributario: 'Tributário', empresarial: 'Empresarial' }[t] || this.esc(t);
    }
    getStatusBadge(s) {
        return {
            em_andamento: '<span class="badge badge-info">Em Andamento</span>',
            aguardando: '<span class="badge badge-warning">Aguardando</span>',
            concluido: '<span class="badge badge-success">Concluído</span>',
            urgente: '<span class="badge badge-danger">Urgente</span>'
        }[s] || this.esc(s);
    }
    getPrioridadeBadge(p) {
        return {
            alta: '<span class="badge badge-danger">Alta</span>',
            media: '<span class="badge badge-warning">Média</span>',
            baixa: '<span class="badge badge-teal">Baixa</span>'
        }[p] || this.esc(p);
    }

    showToast(message) {
        document.querySelector('.toast')?.remove();
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas fa-check-circle"></i> ${this.esc(message)}`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity .3s';
            setTimeout(() => toast.remove(), 300);
        }, 2800);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new FlexFlow();
});
