document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('billing-toggle');
    if (!toggle) return;

    const monthlyPrices = document.querySelectorAll('.price-monthly');
    const yearlyPrices = document.querySelectorAll('.price-yearly');

    toggle.addEventListener('change', () => {
        const isYearly = toggle.checked;
        monthlyPrices.forEach(el => el.classList.toggle('hidden', isYearly));
        yearlyPrices.forEach(el => el.classList.toggle('hidden', !isYearly));
    });
});