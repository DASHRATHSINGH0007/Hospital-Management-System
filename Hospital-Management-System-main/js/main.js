// ==========================================
// HOSPITAL MANAGEMENT SYSTEM - MAIN UTILITIES & UI CORE
// ==========================================

// --- TOAST NOTIFICATION SYSTEM ---
function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('hms-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'hms-toast-container';
        toastContainer.className = 'fixed top-5 right-5 z-50 flex flex-col space-y-3 pointer-events-none';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto flex items-center px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 transform translate-y-[-10px] opacity-0';

    const colors = {
        success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        error: 'bg-rose-50 text-rose-800 border-rose-200',
        warning: 'bg-amber-50 text-amber-800 border-amber-200',
        info: 'bg-blue-50 text-blue-800 border-blue-200'
    };

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.classList.add(...(colors[type] || colors.info).split(' '));
    toast.innerHTML = `
        <span class="inline-flex items-center justify-center w-6 h-6 mr-3 text-xs font-bold rounded-full bg-white bg-opacity-70 shadow-sm">
            ${icons[type] || icons.info}
        </span>
        <span class="flex-1">${message}</span>
        <button class="ml-3 text-gray-400 hover:text-gray-600 focus:outline-none" onclick="this.parentElement.remove()">×</button>
    `;

    toastContainer.appendChild(toast);

    // Trigger animate-in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-[-10px]', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    });

    // Auto dismiss after 3.5s
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-[-10px]');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// --- MODAL SYSTEM ---
function showModal({ title, bodyHtml, confirmText = 'Confirm', confirmClass = 'bg-indigo-600 hover:bg-indigo-700', onConfirm }) {
    const existingModal = document.getElementById('hms-active-modal');
    if (existingModal) existingModal.remove();

    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'hms-active-modal';
    modalBackdrop.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 transition-opacity';

    modalBackdrop.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 transform transition-all overflow-hidden animate-fadeIn">
            <div class="flex justify-between items-center pb-3 border-b border-gray-100">
                <h3 class="text-xl font-bold text-gray-800">${title}</h3>
                <button class="modal-close text-gray-400 hover:text-gray-600 text-2xl font-semibold leading-none">&times;</button>
            </div>
            <div class="py-4 text-gray-600 max-h-[75vh] overflow-y-auto">
                ${bodyHtml}
            </div>
            <div class="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button type="button" class="modal-cancel px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 focus:outline-none">Cancel</button>
                <button type="button" class="modal-confirm px-5 py-2 rounded-lg text-white text-sm font-medium shadow-sm focus:outline-none ${confirmClass}">${confirmText}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modalBackdrop);

    const closeModal = () => modalBackdrop.remove();

    modalBackdrop.querySelector('.modal-close').addEventListener('click', closeModal);
    modalBackdrop.querySelector('.modal-cancel').addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
    });

    modalBackdrop.querySelector('.modal-confirm').addEventListener('click', () => {
        if (onConfirm) {
            const shouldClose = onConfirm();
            if (shouldClose !== false) closeModal();
        } else {
            closeModal();
        }
    });
}

function showConfirmDelete(itemLabel, onConfirm) {
    showModal({
        title: 'Confirm Deletion',
        bodyHtml: `<p>Are you sure you want to remove <strong>${itemLabel}</strong>? This action cannot be undone.</p>`,
        confirmText: 'Delete',
        confirmClass: 'bg-rose-600 hover:bg-rose-700',
        onConfirm: () => {
            onConfirm();
            return true;
        }
    });
}

// --- GENERIC MANAGEMENT SECTION BUILDER WITH SEARCH & EDIT ---
const createManagementSection = ({
    title,
    formFields = [],
    tableHeaders = [],
    data = [],
    dataItems = [],
    onAdd,
    onEdit,
    onRemove,
    actionButtons = [], // Optional extra action buttons e.g. [{ label: 'Dispense', handler: (id) => ... }]
    emptyMessage = 'No records found'
}) => {
    let filteredData = [...data];

    const container = document.createElement('div');
    container.className = 'view-section space-y-6';

    const render = () => {
        // Form Fields generation
        const formHtml = formFields.length > 0 ? `
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-bold text-gray-800 flex items-center">
                        <span class="mr-2 text-indigo-600">+</span> Add New ${title.replace(/Manage|Inventory|Details/gi, '').trim() || 'Item'}
                    </h2>
                </div>
                <form id="add-form-${title.replace(/\s+/g, '-').toLowerCase()}" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    ${formFields.map(field => {
                        if (field.type === 'select') {
                            return `
                                <div>
                                    <label class="block text-xs font-semibold uppercase text-gray-500 mb-1">${field.label}</label>
                                    <select id="${field.id}" class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" ${field.required !== false ? 'required' : ''}>
                                        <option value="" disabled selected>Select ${field.label}</option>
                                        ${field.options.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('')}
                                    </select>
                                </div>
                            `;
                        }
                        return `
                            <div>
                                <label class="block text-xs font-semibold uppercase text-gray-500 mb-1">${field.label}</label>
                                <input type="${field.type || 'text'}" id="${field.id}" placeholder="${field.placeholder || ''}" class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white" ${field.required !== false ? 'required' : ''}>
                            </div>
                        `;
                    }).join('')}
                    <div class="flex items-end">
                        <button type="submit" class="w-full px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm transition">
                            Add Record
                        </button>
                    </div>
                </form>
            </div>
        ` : '';

        // Table Rows generation
        const tableRowsHtml = filteredData.length > 0 ? filteredData.map(item => `
            <tr class="hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0">
                ${dataItems.map(di => `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        ${di.formatter ? di.formatter(item[di.key], item) : (item[di.key] ?? 'N/A')}
                    </td>
                `).join('')}
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    ${actionButtons.map(btn => `
                        <button class="custom-action-btn px-2.5 py-1 text-xs font-semibold rounded-md ${btn.colorClass || 'bg-blue-50 text-blue-600 hover:bg-blue-100'}" data-id="${item.id}" data-action="${btn.label}">
                            ${btn.label}
                        </button>
                    `).join('')}
                    ${onEdit ? `
                        <button class="edit-btn px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition" data-id="${item.id}">
                            Edit
                        </button>
                    ` : ''}
                    ${onRemove ? `
                        <button class="remove-btn px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition" data-id="${item.id}">
                            Remove
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('') : `
            <tr>
                <td colspan="${tableHeaders.length + 1}" class="px-6 py-10 text-center text-sm text-gray-400">
                    <p class="text-base font-medium">${emptyMessage}</p>
                    <p class="text-xs text-gray-400 mt-1">Try adjusting your search filter or add a new record above.</p>
                </td>
            </tr>
        `;

        container.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 tracking-tight">${title}</h1>
                    <p class="text-xs text-gray-500 mt-0.5">Total Records: <span class="font-semibold text-indigo-600">${filteredData.length}</span> of ${data.length}</p>
                </div>
                <div class="flex items-center space-x-3">
                    <div class="relative w-full md:w-64">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-sm">🔍</span>
                        <input type="text" class="search-input w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Search records...">
                    </div>
                </div>
            </div>

            ${formHtml}

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50/75">
                            <tr>
                                ${tableHeaders.map(h => `
                                    <th scope="col" class="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">${h}</th>
                                `).join('')}
                                <th scope="col" class="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 bg-white">
                            ${tableRowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Attach event listeners
        const form = container.querySelector('form');
        if (form && onAdd) {
            form.addEventListener('submit', onAdd);
        }

        const searchInput = container.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (!query) {
                    filteredData = [...data];
                } else {
                    filteredData = data.filter(item => {
                        return Object.values(item).some(val => 
                            String(val).toLowerCase().includes(query)
                        );
                    });
                }
                // Re-render table body only to maintain input focus
                const tbody = container.querySelector('tbody');
                const rowCountSpan = container.querySelector('.text-indigo-600');
                if (rowCountSpan) rowCountSpan.textContent = filteredData.length;

                tbody.innerHTML = filteredData.length > 0 ? filteredData.map(item => `
                    <tr class="hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0">
                        ${dataItems.map(di => `
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                ${di.formatter ? di.formatter(item[di.key], item) : (item[di.key] ?? 'N/A')}
                            </td>
                        `).join('')}
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            ${actionButtons.map(btn => `
                                <button class="custom-action-btn px-2.5 py-1 text-xs font-semibold rounded-md ${btn.colorClass || 'bg-blue-50 text-blue-600 hover:bg-blue-100'}" data-id="${item.id}" data-action="${btn.label}">
                                    ${btn.label}
                                </button>
                            `).join('')}
                            ${onEdit ? `
                                <button class="edit-btn px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition" data-id="${item.id}">
                                    Edit
                                </button>
                            ` : ''}
                            ${onRemove ? `
                                <button class="remove-btn px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition" data-id="${item.id}">
                                    Remove
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `).join('') : `
                    <tr>
                        <td colspan="${tableHeaders.length + 1}" class="px-6 py-10 text-center text-sm text-gray-400">
                            <p class="text-base font-medium">${emptyMessage}</p>
                            <p class="text-xs text-gray-400 mt-1">No matching results found for "${query}".</p>
                        </td>
                    </tr>
                `;

                // Re-bind buttons inside tbody
                bindRowButtons();
            });
        }

        bindRowButtons();
    };

    const bindRowButtons = () => {
        if (onRemove) {
            container.querySelectorAll('.remove-btn').forEach(btn => {
                btn.onclick = (e) => onRemove(e);
            });
        }
        if (onEdit) {
            container.querySelectorAll('.edit-btn').forEach(btn => {
                btn.onclick = (e) => onEdit(e);
            });
        }
        container.querySelectorAll('.custom-action-btn').forEach(btn => {
            btn.onclick = (e) => {
                const actionLabel = e.target.dataset.action;
                const itemId = e.target.dataset.id;
                const actionObj = actionButtons.find(b => b.label === actionLabel);
                if (actionObj && actionObj.handler) {
                    actionObj.handler(itemId);
                }
            };
        });
    };

    render();
    return container;
};

// --- PANEL NAVIGATION SYSTEM ---
function setupPanelNavigation(role) {
    const links = document.querySelectorAll(`.${role}-link`);
    const sections = document.querySelectorAll(`#${role}-panel .panel-section`);
    
    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            links.forEach(l => {
                l.classList.remove('bg-indigo-700', 'text-white', 'shadow-sm');
                l.classList.add('text-gray-300', 'hover:bg-gray-800');
            });
            link.classList.remove('text-gray-300', 'hover:bg-gray-800');
            link.classList.add('bg-indigo-700', 'text-white', 'shadow-sm');

            const targetSectionSuffix = link.getAttribute('href').substring(1);
            const targetId = `${role}-${targetSectionSuffix}`;
            
            sections.forEach(sec => {
                if (sec.id === targetId) {
                    sec.classList.remove('hidden');
                    sec.classList.add('animate-fadeIn');
                } else {
                    sec.classList.add('hidden');
                }
            });
        });
    });

    // Default activate first link if none active
    const activeLink = document.querySelector(`.${role}-link.bg-indigo-700`) || links[0];
    if (activeLink) {
        activeLink.click();
    }
}

// --- LOGOUT & SESSION RESET ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            sessionStorage.removeItem('loggedInRole');
            sessionStorage.removeItem('loggedInDoctorId');
            sessionStorage.removeItem('loggedInUser');
            window.location.href = 'index.html';
        });
    });
});
