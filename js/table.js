document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('table-body');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const paginationNav = document.getElementById('pagination');
    const activityList = document.getElementById('activity-list');

    function createBadge(status) {
        const span = document.createElement('span');
        span.className = 'badge ';
        if (status === 'Completed') span.className += 'badge-success';
        else if (status === 'In Progress') span.className += 'badge-warning';
        else if (status === 'Pending') span.className += 'badge-info';
        else span.className += 'badge-secondary';
        span.textContent = status;
        return span;
    }

    if (activityList) {
        fetch('data/activities.json')
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(activities => {
                activityList.innerHTML = '';
                if (activities.length === 0) {
                    const emptyLi = document.createElement('li');
                    emptyLi.className = 'py-4 text-sm text-slate-500 text-center';
                    emptyLi.textContent = 'No recent activities found.';
                    activityList.appendChild(emptyLi);
                    return;
                }
                activities.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'py-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0 flex items-start justify-between gap-4';

                    const textDiv = document.createElement('div');
                    const titleP = document.createElement('p');
                    titleP.className = 'font-semibold text-sm text-slate-900 dark:text-white';
                    titleP.textContent = item.description;

                    const metaP = document.createElement('p');
                    metaP.className = 'text-xs text-slate-500 dark:text-slate-400 mt-0.5';
                    metaP.textContent = `${item.user} (${item.role}) • ${new Date(item.timestamp).toLocaleString()}`;

                    textDiv.appendChild(titleP);
                    textDiv.appendChild(metaP);

                    li.appendChild(textDiv);
                    li.appendChild(createBadge(item.status));
                    activityList.appendChild(li);
                });
            })
            .catch(() => {
                activityList.innerHTML = '';
                const errLi = document.createElement('li');
                errLi.className = 'py-4 text-sm text-rose-500 text-center';
                errLi.textContent = 'Failed to load activities.';
                activityList.appendChild(errLi);
            });
    }

    if (!tableBody) return;

    let records = [];
    let currentPage = 1;
    const pageSize = 4;

    fetch('data/transactions.json')
        .then(res => {
            if (!res.ok) throw new Error('Failed to load transaction data');
            return res.json();
        })
        .then(data => {
            records = data;
            updateDashboardStats(records);
            render();
        })
        .catch(() => {
            tableBody.innerHTML = '';
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 6;
            td.className = 'px-4 py-8 text-center text-sm text-rose-500';
            td.textContent = 'Error loading transactions. Please serve files over HTTP/Live Server.';
            tr.appendChild(td);
            tableBody.appendChild(tr);
        });

    function updateDashboardStats(data) {
        const totalElem = document.getElementById('stat-total');
        const activeElem = document.getElementById('stat-active');
        const completedElem = document.getElementById('stat-completed');
        const pendingElem = document.getElementById('stat-pending');

        if (!totalElem) return;

        const total = data.length;
        const active = data.filter(i => i.status === 'In Progress').length;
        const completed = data.filter(i => i.status === 'Completed').length;
        const pending = data.filter(i => i.status === 'Pending').length;

        totalElem.textContent = total;
        activeElem.textContent = active;
        completedElem.textContent = completed;
        pendingElem.textContent = pending;
    }

    function getFilteredRecords() {
        const query = searchInput.value.toLowerCase().trim();
        const status = statusFilter.value;

        return records.filter(item => {
            const matchesQuery = item.name.toLowerCase().includes(query) ||
                                 item.client.toLowerCase().includes(query) ||
                                 item.id.toLowerCase().includes(query) ||
                                 item.amount.toLowerCase().includes(query);
            const matchesStatus = status === 'all' || item.status.toLowerCase() === status.toLowerCase();
            return matchesQuery && matchesStatus;
        });
    }

    function render() {
        const filtered = getFilteredRecords();
        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const start = (currentPage - 1) * pageSize;
        const pageItems = filtered.slice(start, start + pageSize);

        tableBody.innerHTML = '';

        if (pageItems.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 6;
            td.className = 'px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400';
            td.textContent = 'No matching projects found.';
            tr.appendChild(td);
            tableBody.appendChild(tr);
        } else {
            pageItems.forEach(item => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50';

                const fields = [item.id, item.name, item.client, item.date, item.amount];
                fields.forEach((val, idx) => {
                    const td = document.createElement('td');
                    td.className = 'px-4 py-3 text-sm ' + (idx === 0 ? 'font-medium text-slate-900 dark:text-white' : idx === 4 ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300');
                    td.textContent = val;
                    tr.appendChild(td);
                });

                const statusTd = document.createElement('td');
                statusTd.className = 'px-4 py-3 text-sm';
                statusTd.appendChild(createBadge(item.status));
                tr.appendChild(statusTd);

                tableBody.appendChild(tr);
            });
        }

        renderPagination(totalPages, filtered.length);
    }

    function renderPagination(totalPages, totalCount) {
        paginationNav.innerHTML = '';
        if (totalPages <= 1 && totalCount === 0) return;

        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.textContent = 'Previous';
        prevBtn.disabled = currentPage === 1;
        prevBtn.className = 'px-3 py-1 text-sm rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800';
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                render();
            }
        });
        paginationNav.appendChild(prevBtn);

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = i;
            if (i === currentPage) {
                btn.setAttribute('aria-current', 'page');
                btn.className = 'px-3 py-1 text-sm rounded-md border bg-brand-500 text-white border-brand-500 font-bold';
            } else {
                btn.className = 'px-3 py-1 text-sm rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800';
            }
            btn.addEventListener('click', () => {
                currentPage = i;
                render();
            });
            paginationNav.appendChild(btn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.textContent = 'Next';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.className = 'px-3 py-1 text-sm rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800';
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                render();
            }
        });
        paginationNav.appendChild(nextBtn);
    }

    searchInput.addEventListener('input', () => { currentPage = 1; render(); });
    statusFilter.addEventListener('change', () => { currentPage = 1; render(); });
});