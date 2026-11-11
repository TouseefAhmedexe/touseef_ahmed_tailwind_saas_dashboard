document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const notificationForm = document.getElementById('notification-form');
    const alertBox = document.getElementById('alert-message');
    const avatarInput = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('avatar-preview');

    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    function showAlert(message, isError = false) {
        if (!alertBox) return;
        alertBox.textContent = message;
        alertBox.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
        alertBox.classList.remove('hidden');
        setTimeout(() => alertBox.classList.add('hidden'), 4000);
    }

    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                    showAlert('Invalid file type. Please upload a JPG, PNG, WEBP, or GIF image.', true);
                    avatarInput.value = '';
                    return;
                }
                if (file.size > 2 * 1024 * 1024) {
                    showAlert('File size must be less than 2MB.', true);
                    avatarInput.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function (evt) {
                    avatarPreview.src = evt.target.result;
                    showAlert('Profile photo updated successfully.');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showAlert('Profile information saved successfully.');
        });
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const current = document.getElementById('current-password').value;
            const newPass = document.getElementById('new-password').value;
            const confirmPass = document.getElementById('confirm-password').value;

            if (newPass !== confirmPass) {
                showAlert('New passwords do not match.', true);
                return;
            }

            if (!current) {
                showAlert('Please enter your current password.', true);
                return;
            }

            showAlert('Password changed successfully.');
            passwordForm.reset();
        });
    }

    if (notificationForm) {
        notificationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showAlert('Notification preferences updated.');
        });
    }
});