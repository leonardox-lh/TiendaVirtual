export function validatePrecio(value) {
    const valid = /^\d*\.?\d{0,2}$/.test(value)
    return valid ? parseFloat(value || 0) : null
}

export function validateStock(value) {
    const parsed = parseInt(value)
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : null
}