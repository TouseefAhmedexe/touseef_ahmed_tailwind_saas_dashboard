document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('table-body');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const paginationNav = document.getElementById('pagination');
    const activityList = document.getElementById('activity-list');

    if (activityList) {
        fetch('data/activities.json')
            .then(res => res.json())
            .then(activities => {
                activityList.innerHTML = '';
                activities.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'py-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0 flex items-start justify-between gap-4';
                    li.innerHTML = `
                        <div>
                            <p class="font-semibold text-sm text-slate-900 dark:text-white">${item.description}</p>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${item.user} (${item.role}) &bull; ${new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                        <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}">${item.status}</span>
                    `;
                    activityList.appendChild(li);
                });
            });
    }

    if (!tableBody) return;

    let records = [];
    let currentPage = 1;
    const pageSize = 4;

    fetch('data/transactions.json')
        .then(res => res.json())
        .then(data => {
            records = data;
            render();
        });

    function getFilteredRecords() {
        const query = searchInput.value.toLowerCase().trim();
        const status = statusFilter.value;

        return records.filter(item => {
            const matchesQuery = item.name.toLowerCase().includes(query) || item.client.toLowerCase().includes(query);
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
        pageItems.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50';

            let badgeClass = 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
            if (item.status === 'Completed') badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
            if (item.status === 'In Progress') badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            if (item.status === 'Pending') badgeClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';

            tr.innerHTML = `
                <td class="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">${item.id}</td>
                <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">${item.name}</td>
                <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">${item.client}</td>
                <td class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">${item.date}</td>
                <td class="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">${item.amount}</td>
                <td class="px-4 py-3 text-sm">
                    <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${badgeClass}">${item.status}</span>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        paginationNav.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = i;
            btn.className = `px-3 py-1 text-sm rounded-md border ${i === currentPage ? 'bg-brand-500 text-white border-brand-500' : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`;
            btn.addEventListener('click', () => {
                currentPage = i;
                render();
            });
            paginationNav.appendChild(btn);
        }
    }

    searchInput.addEventListener('input', () => { currentPage = 1; render(); });
    statusFilter.addEventListener('change', () => { currentPage = 1; render(); });
});