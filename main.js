// --- UTILITY FUNCTIONS ---
// Generic function to render a table with a form for adding new items
const createManagementSection = ({
    title,
    formFields,
    tableHeaders,
    data,
    dataItems,
    onAdd,
    onRemove
}) => {
    const formHtml = formFields.map(field => {
        if (field.type === 'select') {
            return `<div class="flex-1 min-w-[150px]"><label class="block text-sm font-medium text-gray-700">${field.label}</label><select id="${field.id}" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">${field.options.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('')}</select></div>`;
        }
        return `<div class="flex-1 min-w-[150px]"><label class="block text-sm font-medium text-gray-700">${field.label}</label><input type="${field.type}" id="${field.id}" placeholder="${field.placeholder}" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required></div>`;
    }).join('');

    const tableRowsHtml = data.map(item => `
        <tr class="hover:bg-gray-50">
            ${dataItems.map(di => `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${di.formatter ? di.formatter(item[di.key]) : item[di.key]}
                </td>
            `).join('')}
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="remove-btn text-red-600 hover:text-red-900" data-id="${item.id}">Remove</button>
            </td>
        </tr>
    `).join('');

    const container = document.createElement('div');
    container.innerHTML = `
        <h1 class="text-3xl font-bold text-gray-800 mb-6">${title}</h1>
        <div class="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Add New ${title.slice(7, -1)}</h2>
            <form id="add-${title.toLowerCase().replace(/\s+/g, '-')}-form" class="flex flex-wrap gap-4 items-end">
                ${formHtml}
                <button type="submit" class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Add</button>
            </form>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-md">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Existing ${title.slice(7)}</h2>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50"><tr>${tableHeaders.map(h => `<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${h}</th>`).join('')}<th scope="col" class="relative px-6 py-3"><span class="sr-only">Actions</span></th></tr></thead>
                    <tbody class="bg-white divide-y divide-gray-200">${tableRowsHtml}</tbody>
                </table>
            </div>
        </div>`;
    
    container.querySelector('form').addEventListener('submit', onAdd);
    container.querySelectorAll('.remove-btn').forEach(btn => btn.addEventListener('click', onRemove));
    
    return container;
};


// --- PANEL NAVIGATION ---
function setupPanelNavigation(role) {
    const links = document.querySelectorAll(`.${role}-link`);
    const sections = document.querySelectorAll(`#${role}-panel .panel-section`);
    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('bg-gray-700'));
            link.classList.add('bg-gray-700');
            const targetId = `${role}-${link.getAttribute('href').substring(1)}`;
            sections.forEach(sec => {
                if (sec.id === targetId) {
                    sec.classList.remove('hidden');
                } else {
                    sec.classList.add('hidden');
                }
            });
        });
    });
}

// --- LOGOUT LOGIC ---
document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        sessionStorage.removeItem('loggedInRole');
        window.location.href = 'index.html';
    });
});
