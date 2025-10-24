interface UserInfo {
  id: number
  name: string
  email: string
}

// Função para decodificar JWT (sem validação, apenas extração do payload)
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error)
    return null
  }
}

export function getInfoUser(): UserInfo | null {
  try {
    const token = localStorage.getItem('ideias-token')

    if (!token) {
      return null
    }

    const payload = decodeJWT(token)

    if (!payload) {
      return null
    }

    // Extrair dados do usuário do payload do JWT
    // Ajuste os campos conforme o que seu backend coloca no JWT
    return {
      id: payload.id || payload.sub || payload.userId,
      name: payload.name || payload.userName,
      email: payload.email
    }
  } catch (error) {
    console.error('Erro ao obter informações do usuário:', error)
    return null
  }
}
