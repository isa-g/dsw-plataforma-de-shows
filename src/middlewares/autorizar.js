module.exports = (rolesPermitidas = []) => {
  return (req, res, next) => {
    // req.usuarioRole deve ser definido pelo authMiddleware ao decodificar o token
    if (!req.usuarioRole || !rolesPermitidas.includes(req.usuarioRole)) {
      return res.status(403).json({ erro: 'Acesso negado: Perfil sem permissão para esta ação.' });
    }
    next();
  };
};