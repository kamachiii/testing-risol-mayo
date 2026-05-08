function validateFile(file) {
    if (!file) return null;

    const allowTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowTypes.includes(file.mimetype)) {
        return "File harus berupa gambar (jpeg/png/webp)";
    }

    if (file.size > 2 * 1024 * 1024) {
        return "Ukuran file maksimal 2MB";
    }

    return null;
}

module.exports = validateFile;
